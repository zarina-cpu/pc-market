import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "pc_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_PASSWORD || "";
}

export function adminPath() {
  const value = (process.env.ADMIN_PATH || "stand-kassa").replace(/^\/+|\/+$/g, "");
  if (value === "ru" || value === "uz" || value === "api") return "stand-kassa";
  return value;
}

export function passwordConfigured() {
  return Boolean(secret());
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeSessionValue() {
  const payload = `admin.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value) {
  if (!value || !secret()) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const given = parts[2];
  const expected = sign(payload);
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const exp = Number(parts[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

export function checkPassword(input) {
  const expected = secret();
  if (!expected || typeof input !== "string") return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function readAdminSession() {
  const store = await cookies();
  return verifySessionValue(store.get(COOKIE)?.value);
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE, makeSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
