import { readFileSync } from "fs";

const env = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const text = line.trim();
  if (!text || text.startsWith("#")) continue;
  const i = text.indexOf("=");
  env[text.slice(0, i)] = text.slice(i + 1).replace(/^"|"$/g, "");
}

const token = env.TELEGRAM_BOT_TOKEN;
const chat = env.TELEGRAM_CHAT_ID;
const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());

const me = await api("getMe");
console.log("bot_ok", Boolean(me.ok));

const msg = await api("sendMessage", {
  chat_id: chat,
  text: "Медный стенд: бот подключён. Чеки с сайта будут приходить сюда.",
});
console.log("chat_ok", Boolean(msg.ok));
if (!msg.ok) console.log("chat_error", msg.description || "unknown");

const updates = await api("getUpdates");
const chats = new Set();
for (const item of updates.result || []) {
  const from =
    item.message?.chat?.id ??
    item.edited_message?.chat?.id ??
    item.my_chat_member?.chat?.id;
  if (from != null) chats.add(String(from));
}
console.log("seen_chats", [...chats].join(",") || "none");
console.log("env_matches_seen", chats.has(String(chat)));
