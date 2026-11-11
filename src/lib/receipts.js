import { randomBytes } from "crypto";
import { filesClient, storageConfigured } from "./storage";

const MAX_BYTES = 8 * 1024 * 1024;

const TYPES = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

export function receiptKind(mime, filename = "") {
  const name = filename.toLowerCase();
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    mime === "image/jpeg" ||
    mime === "image/jpg" ||
    mime === "image/png" ||
    mime === "image/webp" ||
    /\.(jpe?g|png|webp)$/.test(name)
  ) {
    return "image";
  }
  return null;
}

export function normalizeMime(file) {
  const name = (file.name || "").toLowerCase();
  if (file.type && TYPES[file.type]) return file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return file.type || "";
}

export function validateReceipt(file) {
  if (!(file instanceof File) || file.size < 20) return "need_receipt";
  if (file.size > MAX_BYTES) return "bad_receipt";
  const mime = normalizeMime(file);
  if (!receiptKind(mime, file.name)) return "bad_receipt";
  return null;
}

function safeKey(key) {
  if (!key || key.includes("..") || key.startsWith("/")) return null;
  return key;
}

export async function saveReceiptFile(file) {
  if (!storageConfigured()) {
    throw new Error("Neon Object Storage is not configured");
  }
  const mime = normalizeMime(file);
  const ext = TYPES[mime] || (receiptKind(mime, file.name) === "pdf" ? ".pdf" : ".jpg");
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const key = `orders/${filename}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await filesClient().upload(key, bytes, { contentType: mime });
  return {
    filename: key,
    mime,
    originalName: file.name || `receipt${ext}`,
    kind: receiptKind(mime, file.name),
  };
}

export async function readReceiptFile(filename) {
  const key = safeKey(filename);
  if (!key || !storageConfigured()) return null;
  try {
    const file = await filesClient().download(key);
    return Buffer.from(await file.arrayBuffer());
  } catch {
    return null;
  }
}
