// src/lib/email/sendEmail.ts

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return;
  }

  await resend.emails.send({
    from: "Elevated Gentleman <noreply@theelevatedgentleman.com>",
    to,
    subject,
    html,
  });
}
