import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/auth/email/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = adminDb;

  try {
    switch (event.type) {
      // ✅ SUBSCRIPTION CREATED
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email = session.customer_details?.email;
        if (!email) break;

        await db.collection("stripeCheckoutSessions").doc(session.id).set({
          email,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          subscriptionStatus: "active",
          createdAt: StripeTimestamp(),
        });

        await sendEmail({
          to: email,
          subject: "Your Elevated Gentleman subscription is active",
          html: `
            <h2>Welcome 🎉</h2>
            <p>Your subscription to <strong>Elevated Gentleman</strong> is now active.</p>
            <p>You can log in anytime to access premium content.</p>
          `,
        });

        break;
      }

      // 🟠 PAYMENT FAILED
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const usersSnap = await db
          .collection("users")
          .where("stripeCustomerId", "==", invoice.customer)
          .get();

        for (const doc of usersSnap.docs) {
          await doc.ref.update({
            subscriptionStatus: "past_due",
            lastPaymentFailedAt: StripeTimestamp(),
          });

          await sendEmail({
            to: doc.data().email,
            subject: "Payment failed – action required",
            html: `
              <p>We couldn’t process your latest subscription payment.</p>
              <p>Please update your payment method to avoid losing access.</p>
            `,
          });
        }

        break;
      }

      // 🔴 SUBSCRIPTION CANCELLED
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const usersSnap = await db
          .collection("users")
          .where("stripeSubscriptionId", "==", subscription.id)
          .get();

        for (const doc of usersSnap.docs) {
          await doc.ref.update({
            subscriptionStatus: "inactive",
            subscriptionCancelledAt: StripeTimestamp(),
          });

          await sendEmail({
            to: doc.data().email,
            subject: "Subscription cancelled",
            html: `
              <p>Your Elevated Gentleman subscription has been cancelled.</p>
              <p>You’ll retain access until the end of the billing period.</p>
            `,
          });
        }

        break;
      }

      // 🟢 RENEWAL SUCCEEDED
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        const usersSnap = await db
          .collection("users")
          .where("stripeCustomerId", "==", invoice.customer)
          .get();

        for (const doc of usersSnap.docs) {
          await doc.ref.update({
            subscriptionStatus: "active",
            lastPaymentAt: StripeTimestamp(),
          });
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function StripeTimestamp() {
  // Firestore server timestamp without importing firebase-admin here
  // (adminDb comes from the initialized Admin SDK module)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firestoreAny = (adminDb as any);
  return firestoreAny.constructor.FieldValue.serverTimestamp();
}
