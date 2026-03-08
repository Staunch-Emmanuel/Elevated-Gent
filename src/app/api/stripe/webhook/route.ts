import { NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "firebase-admin";
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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const uid =
          typeof session.metadata?.appUid === "string"
            ? session.metadata.appUid
            : typeof session.client_reference_id === "string"
              ? session.client_reference_id
              : null;

        const email =
          session.customer_details?.email ||
          (typeof session.metadata?.appEmail === "string"
            ? session.metadata.appEmail
            : null);

        if (uid) {
          await db.collection("users").doc(uid).set(
            {
              email: email ?? undefined,
              role: "subscriber",
              subscriptionStatus: "active",
              stripeCustomerId:
                typeof session.customer === "string" ? session.customer : null,
              stripeSubscriptionId:
                typeof session.subscription === "string"
                  ? session.subscription
                  : null,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              subscriptionLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        await db.collection("stripeCheckoutSessions").doc(session.id).set(
          {
            uid,
            email,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : null,
            subscriptionStatus: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        if (email) {
          await sendEmail({
            to: email,
            subject: "Your Elevated Gentleman subscription is active",
            html: `
              <h2>Welcome 🎉</h2>
              <p>Your subscription to <strong>Elevated Gentleman</strong> is now active.</p>
              <p>You can log in anytime to access premium content.</p>
            `,
          });
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const usersSnap = await db
          .collection("users")
          .where("stripeCustomerId", "==", invoice.customer)
          .get();

        for (const doc of usersSnap.docs) {
          await doc.ref.update({
            subscriptionStatus: "past_due",
            lastPaymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          const userEmail = doc.data().email;
          if (userEmail) {
            await sendEmail({
              to: userEmail,
              subject: "Payment failed – action required",
              html: `
                <p>We couldn’t process your latest subscription payment.</p>
                <p>Please update your payment method to avoid losing access.</p>
              `,
            });
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const usersSnap = await db
          .collection("users")
          .where("stripeSubscriptionId", "==", subscription.id)
          .get();

        for (const doc of usersSnap.docs) {
          await doc.ref.update({
            subscriptionStatus: "inactive",
            subscriptionCancelledAt:
              admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          const userEmail = doc.data().email;
          if (userEmail) {
            await sendEmail({
              to: userEmail,
              subject: "Subscription cancelled",
              html: `
                <p>Your Elevated Gentleman subscription has been cancelled.</p>
                <p>You’ll retain access until the end of the billing period.</p>
              `,
            });
          }
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        const usersSnap = await db
          .collection("users")
          .where("stripeCustomerId", "==", invoice.customer)
          .get();

        for (const doc of usersSnap.docs) {
          await doc.ref.update({
            subscriptionStatus: "active",
            lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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