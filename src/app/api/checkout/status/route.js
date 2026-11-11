import { NextResponse } from "next/server";
import { stripeConfigured } from "@/lib/stripe";
import { telegramConfigured } from "@/lib/telegram";

export async function GET() {
  return NextResponse.json({
    configured: telegramConfigured(),
    stripe: stripeConfigured(),
  });
}
