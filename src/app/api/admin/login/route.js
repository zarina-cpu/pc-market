import { NextResponse } from "next/server";
import {
  checkPassword,
  passwordConfigured,
  setAdminSession,
} from "@/lib/adminAuth";

export async function POST(request) {
  if (!passwordConfigured()) {
    return NextResponse.json({ ok: false, error: "no_password" }, { status: 503 });
  }
  const body = await request.json();
  if (!checkPassword(body.password || "")) {
    return NextResponse.json({ ok: false, error: "bad_password" }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
