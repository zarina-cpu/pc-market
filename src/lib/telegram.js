import { receiptKind } from "./receipts";

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

async function sendTelegramText(caption) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: caption.slice(0, 4000) }),
  });
  const json = await res.json();
  if (!json.ok) {
    console.error("[telegram] sendMessage:", json.description || res.status);
  }
  return json.ok;
}

export async function sendOrderToTelegram({ caption, file, mime, originalName }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { ok: false, reason: "not_configured" };
  }

  if (!file) {
    const ok = await sendTelegramText(caption);
    return ok ? { ok: true } : { ok: false, reason: "telegram_error" };
  }

  const photoCaption = caption.slice(0, 1024);
  const rest = caption.length > 1024 ? caption.slice(1024) : "";
  const kind = receiptKind(mime, originalName);
  const filename = originalName || (kind === "pdf" ? "receipt.pdf" : "receipt.jpg");
  const endpoint = kind === "pdf" ? "sendDocument" : "sendPhoto";
  const field = kind === "pdf" ? "document" : "photo";

  const body = new FormData();
  body.append("chat_id", chatId);
  body.append("caption", photoCaption);
  body.append(field, file, filename);

  const res = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
    method: "POST",
    body,
  });
  const json = await res.json();
  if (!json.ok && kind !== "pdf") {
    const fallback = new FormData();
    fallback.append("chat_id", chatId);
    fallback.append("caption", photoCaption);
    fallback.append("document", file, filename);
    const docRes = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: fallback,
    });
    const docJson = await docRes.json();
    if (!docJson.ok) {
      return { ok: false, reason: docJson.description || json.description || "telegram_error" };
    }
  } else if (!json.ok) {
    return { ok: false, reason: json.description || "telegram_error" };
  }

  if (rest) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: rest.slice(0, 4000) }),
    });
  }

  return { ok: true };
}
