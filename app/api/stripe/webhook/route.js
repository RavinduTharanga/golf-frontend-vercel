import { NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text(); // raw text required for signature verification
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = session.client_reference_id || session.customer_email;
        if (email) {
          await upsertSubscription(email, {
            status: "active",
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        if (customer?.email) {
          await upsertSubscription(customer.email, {
            status: sub.status === "active" ? "active" : sub.status,
            stripeCustomerId: sub.customer,
            stripeSubscriptionId: sub.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        if (customer?.email) {
          await upsertSubscription(customer.email, {
            status: "canceled",
            stripeCustomerId: sub.customer,
            stripeSubscriptionId: sub.id,
          });
        }
        break;
      }

      default:
        // Other event types are ignored -- Stripe sends many we don't care about.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}