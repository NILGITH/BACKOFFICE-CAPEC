import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { to, subject, html, text } = req.body;

    console.log("Tentative d'envoi d'email:", {
      to,
      subject,
      from: "CAPEC <noreply@resend.dev>",
      timestamp: new Date().toISOString(),
    });

    const data = await resend.emails.send({
      from: "CAPEC <noreply@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
      text: text,
    });

    console.log("Email envoyé avec succès:", data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erreur détaillée lors de l'envoi d'email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
