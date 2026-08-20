import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      // Ties this checkout to the logged-in user's email so the webhook
      // knows whose subscription record to update.
      customer_email: session.user.email,
      client_reference_id: session.user.email,
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}