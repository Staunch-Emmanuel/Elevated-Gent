import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "firebase-admin";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization token");
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const decoded = await adminAuth.verifyIdToken(token);

    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (!session) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 }
      );
    }

    const sessionEmail =
      session.customer_details?.email ||
      (typeof session.metadata?.appEmail === "string"
        ? session.metadata.appEmail
        : null);

    if (
      sessionEmail &&
      decoded.email &&
      sessionEmail.toLowerCase() !== decoded.email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Checkout session does not belong to the signed-in user" },
        { status: 403 }
      );
    }

    const subscriptionStatus =
      session.payment_status === "paid" || session.status === "complete"
        ? "active"
        : "inactive";

    await adminDb.collection("users").doc(decoded.uid).set(
      {
        email: decoded.email ?? sessionEmail ?? undefined,
        role: "subscriber",
        subscriptionStatus,
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

    return NextResponse.json({
      success: true,
      subscriptionStatus,
    });
  } catch (error: any) {
    console.error("CONFIRM SESSION ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Unable to confirm session" },
      { status: 500 }
    );
  }
}