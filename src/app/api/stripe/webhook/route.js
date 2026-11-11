import { NextResponse } from "next/server";
import { orderCaption } from "@/lib/checkoutItems";
import { prisma } from "@/lib/prisma";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { sendOrderToTelegram, telegramConfigured } from "@/lib/telegram";

export const runtime = "nodejs";

async function fulfillOrder(orderId, stripeSessionId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (order.paymentStatus === "paid") return;

  const lines = JSON.parse(order.items || "[]");
  const caption = orderCaption({
    name: order.name,
    phone: order.phone,
    comment: order.comment,
    lines,
    totalUzs: order.totalUzs,
    paidVia: "stripe",
  });

  let telegram = { ok: false };
  if (telegramConfigured()) {
    telegram = await sendOrderToTelegram({ caption });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "paid",
      stripeSessionId: stripeSessionId || order.stripeSessionId,
      telegramOk: telegram.ok,
    },
  });
}

export async function POST(request) {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const stripe = getStripe();
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    if (orderId && session.payment_status === "paid") {
      await fulfillOrder(orderId, session.id);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId, paymentStatus: "pending" },
        data: { paymentStatus: "cancelled" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
