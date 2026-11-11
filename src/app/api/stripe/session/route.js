import { NextResponse } from "next/server";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export async function GET(request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "missing_session" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return NextResponse.json({
    ok: true,
    paid: session.payment_status === "paid",
    status: session.payment_status,
  });
}
