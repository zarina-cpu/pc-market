export function parseCartItems(itemsRaw) {
  let items;
  try {
    items = typeof itemsRaw === "string" ? JSON.parse(itemsRaw) : itemsRaw;
  } catch {
    return { error: "invalid_items", lines: null, totalUzs: 0 };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "empty_cart", lines: null, totalUzs: 0 };
  }

  const lines = items.map((item) => {
    const qty = Math.max(1, Math.min(99, Number(item.qty) || 1));
    const price = Math.max(0, Number(item.priceUzs) || 0);
    const title = String(item.nameRu || item.nameUz || item.slug || "позиция");
    return { title, qty, price, sum: qty * price };
  });
  const totalUzs = lines.reduce((sum, line) => sum + line.sum, 0);
  if (totalUzs < 1000) {
    return { error: "empty_cart", lines: null, totalUzs: 0 };
  }
  return { error: null, lines, totalUzs };
}

export function orderCaption({ name, phone, comment, lines, totalUzs, paidVia }) {
  const payLine =
    paidVia === "stripe" ? "Оплата: Stripe (карта), подтверждено" : "Оплата: чек перевода";
  return [
    "Новый заказ — Медный стенд",
    payLine,
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
}
