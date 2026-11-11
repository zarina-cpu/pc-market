import { orderCaption } from "@/lib/checkoutItems";
import { prisma } from "@/lib/prisma";
import { sendOrderToTelegram, telegramConfigured } from "@/lib/telegram";

/**
 * Помечает Stripe-заказ оплаченным и шлёт в Telegram.
 * Повторяет отправку, если заказ уже paid, но telegramOk был false.
 */
export async function fulfillStripeOrder(orderId, stripeSessionId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: false, reason: "no_order" };
  }

  if (order.paymentStatus === "paid" && order.telegramOk) {
    return { ok: true, skipped: true };
  }

  const lines = JSON.parse(order.items || "[]");
  const caption = orderCaption({
    name: order.name,
    phone: order.phone,
    comment: order.comment,
    lines,
    totalUzs: order.totalUzs,
    paidVia: "stripe",
  });

  let telegram = { ok: order.telegramOk };
  if (!order.telegramOk && telegramConfigured()) {
    telegram = await sendOrderToTelegram({ caption });
    if (!telegram.ok) {
      console.error("[telegram] stripe fulfill failed", orderId, telegram.reason || "unknown");
    }
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "paid",
      stripeSessionId: stripeSessionId || order.stripeSessionId,
      telegramOk: Boolean(telegram.ok),
    },
  });

  return { ok: true, telegram: Boolean(telegram.ok) };
}
