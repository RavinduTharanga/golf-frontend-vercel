import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

export async function POST() {
  const debug = {
    STRIPE_SECRET_KEY_present: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_SECRET_KEY_prefix: (process.env.STRIPE_SECRET_KEY || "").slice(0, 8),
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID || "(not set)",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "(not set)",
  };

  try {
    const session = await getServerSession(authOptions);
    debug.hasSession = !!session;
    debug.userEmail = session?.user?.email || null;

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Not logged in.", debug });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: session.user.email,
      client_reference_id: session.user.email,
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ success: true, url: checkoutSession.url, debug });
  } catch (err) {
    return NextResponse.json({
      success: false,
      errorType: err?.type || null,
      errorMessage: err?.message || String(err),
      debug,
    });
  }
}