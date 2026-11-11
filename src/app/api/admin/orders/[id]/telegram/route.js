import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/adminAuth";
import { orderCaption } from "@/lib/checkoutItems";
import { prisma } from "@/lib/prisma";
import { sendOrderToTelegram, telegramConfigured } from "@/lib/telegram";

export async function POST(request, { params }) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!telegramConfigured()) {
    return NextResponse.json({ ok: false, error: "telegram_not_configured" }, { status: 503 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const lines = JSON.parse(order.items || "[]");
  const caption = orderCaption({
    name: order.name,
    phone: order.phone,
    comment: order.comment,
    lines,
    totalUzs: order.totalUzs,
    paidVia: order.paymentProvider === "stripe" ? "stripe" : undefined,
  });

  const telegram = await sendOrderToTelegram({ caption });
  if (telegram.ok) {
    await prisma.order.update({
      where: { id: order.id },
      data: { telegramOk: true },
    });
  }

  return NextResponse.json({
    ok: telegram.ok,
    error: telegram.ok ? null : telegram.reason || "telegram_error",
  });
}
