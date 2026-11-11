import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCartItems } from "@/lib/checkoutItems";
import { appBaseUrl, getStripe, stripeConfigured } from "@/lib/stripe";

export async function POST(request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ ok: false, error: "stripe_not_configured" }, { status: 503 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const comment = String(body.comment || "").trim();
  const locale = body.locale === "uz" ? "uz" : "ru";

  if (name.length < 2 || phone.length < 7) {
    return NextResponse.json({ ok: false, error: "invalid_contact" }, { status: 400 });
  }

  const { error, lines, totalUzs } = parseCartItems(body.items);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      name,
      phone,
      comment,
      items: JSON.stringify(lines),
      totalUzs,
      paymentProvider: "stripe",
      paymentStatus: "pending",
      telegramOk: false,
    },
  });

  const base = appBaseUrl();
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    customer_email: undefined,
    line_items: lines.map((line) => ({
      quantity: line.qty,
      price_data: {
        currency: "uzs",
        unit_amount: line.price,
        product_data: {
          name: line.title.slice(0, 120),
        },
      },
    })),
    success_url: `${base}/${locale}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/${locale}/cart?stripe=cancel`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ ok: true, url: session.url });
}
