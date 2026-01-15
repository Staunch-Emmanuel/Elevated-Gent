import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { session_id, password } = await req.json();

    if (!session_id || !password) {
      return NextResponse.json(
        { error: "Missing session_id or password" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      null;

    if (!email) {
      return NextResponse.json(
        { error: "No email found on Stripe session" },
        { status: 400 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not confirmed" },
        { status: 402 }
      );
    }

    // Create or fetch Firebase Auth user
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch {
      userRecord = await adminAuth.createUser({
        email,
        password,
      });
    }

    // Persist access in Firestore
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set(
        {
          email,
          access: true,
          createdAt: new Date(),
        },
        { merge: true }
      );

    return NextResponse.json({
      ok: true,
      email,
      uid: userRecord.uid,
    });
  } catch (err) {
    console.error("Claim error:", err);
    return NextResponse.json(
      { error: "Claim failed" },
      { status: 500 }
    );
  }
}
