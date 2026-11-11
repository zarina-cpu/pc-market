import { NextResponse } from "next/server";
import { telegramConfigured } from "@/lib/telegram";

export async function GET() {
  return NextResponse.json({ configured: telegramConfigured() });
}
