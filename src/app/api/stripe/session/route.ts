import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const email =
      session.customer_details?.email ||
      (typeof session.customer_email === "string" ? session.customer_email : null)

    const paid = session.payment_status === "paid"

    return NextResponse.json({ email, paid })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to retrieve session" },
      { status: 500 }
    )
  }
}
