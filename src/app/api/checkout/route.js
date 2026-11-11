import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderToTelegram, telegramConfigured } from "@/lib/telegram";
import { readReceiptFile, saveReceiptFile, validateReceipt } from "@/lib/receipts";

export async function POST(request) {
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const comment = String(form.get("comment") || "").trim();
  const itemsRaw = String(form.get("items") || "[]");
  const receipt = form.get("receipt");

  if (name.length < 2 || phone.length < 7) {
    return NextResponse.json({ ok: false, error: "invalid_contact" }, { status: 400 });
  }
  const receiptError = validateReceipt(receipt);
  if (receiptError) {
    return NextResponse.json({ ok: false, error: receiptError }, { status: 400 });
  }

  let items;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_items" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "empty_cart" }, { status: 400 });
  }

  const lines = items.map((item) => {
    const qty = Number(item.qty) || 1;
    const price = Number(item.priceUzs) || 0;
    const title = item.nameRu || item.nameUz || item.slug || "позиция";
    return { title, qty, price, sum: qty * price };
  });
  const totalUzs = lines.reduce((sum, line) => sum + line.sum, 0);

  const caption = [
    "Новый заказ — Медный стенд",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    comment ? `Комментарий: ${comment}` : null,
    "",
    ...lines.map((line) => `${line.title} × ${line.qty} — ${line.sum} сум`),
    "",
    `Итого: ${totalUzs} сум`,
  ]
    .filter((row) => row !== null)
    .join("\n");

  const stored = await saveReceiptFile(receipt);
  let telegram = { ok: false, reason: "not_configured" };
  if (telegramConfigured()) {
    const bytes = await readReceiptFile(stored.filename);
    const file = new File([bytes], stored.originalName, { type: stored.mime });
    telegram = await sendOrderToTelegram({
      caption,
      file,
      mime: stored.mime,
      originalName: stored.originalName,
    });
  }

  await prisma.order.create({
    data: {
      name,
      phone,
      comment,
      items: JSON.stringify(lines),
      totalUzs,
      telegramOk: telegram.ok,
      receiptFile: stored.filename,
      receiptMime: stored.mime,
      receiptName: stored.originalName,
    },
  });

  return NextResponse.json({
    ok: true,
    telegram: telegram.ok,
  });
}
