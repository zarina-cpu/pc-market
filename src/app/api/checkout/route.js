import { NextResponse } from "next/server";
import { orderCaption, parseCartItems } from "@/lib/checkoutItems";
import { prisma } from "@/lib/prisma";
import { readReceiptFile, saveReceiptFile, validateReceipt } from "@/lib/receipts";
import { sendOrderToTelegram, telegramConfigured } from "@/lib/telegram";

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

  const { error, lines, totalUzs } = parseCartItems(itemsRaw);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  const caption = orderCaption({
    name,
    phone,
    comment,
    lines,
    totalUzs,
    paidVia: "manual",
  });

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
      paymentProvider: "manual",
      paymentStatus: "paid",
    },
  });

  return NextResponse.json({
    ok: true,
    telegram: telegram.ok,
  });
}
