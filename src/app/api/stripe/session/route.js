import { NextResponse } from "next/server";
import { fulfillStripeOrder } from "@/lib/fulfillStripeOrder";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

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
  const paid = session.payment_status === "paid";
  const orderId = session.metadata?.orderId || session.client_reference_id;

  if (paid && orderId) {
    await fulfillStripeOrder(orderId, session.id);
  }

  return NextResponse.json({
    ok: true,
    paid,
    status: session.payment_status,
  });
}
