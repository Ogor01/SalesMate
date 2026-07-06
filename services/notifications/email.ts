import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

function getResendClient(): Resend | null {
  if (!resendApiKey || resendApiKey === "re_..." || resendApiKey.startsWith("dummy")) {
    return null;
  }
  return new Resend(resendApiKey);
}

function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();

  if (!client) {
    console.log(`[EMAIL MOCK] To: ${opts.to} | Subject: ${opts.subject}`);
    return Promise.resolve({ success: true });
  }

  return client.emails
    .send({
      from: "SalesMate <noreply@salesmate.app>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    .then(() => ({ success: true }))
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Failed to send email";
      console.error("[EMAIL ERROR]", message);
      return { success: false, error: message };
    });
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string,
  businessName?: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: toEmail,
    subject: "Reset your SalesMate password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">SalesMate AI</h2>
        <p>Hi${businessName ? ` from <strong>${businessName}</strong>` : ""},</p>
        <p>We received a request to reset your SalesMate password. Click the button below to set a new one:</p>
        <a href="${resetLink}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendEscalationNotification(
  toEmail: string,
  businessName: string,
  customerPhone: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: toEmail,
    subject: `⚠️ Customer escalation needed — ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">SalesMate AI</h2>
        <p><strong>${businessName}</strong>, a customer conversation needs your attention.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Customer</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${customerPhone}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Reason</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${reason}</td></tr>
        </table>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/conversations" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Open Conversations
        </a>
      </div>
    `,
  });
}

export async function sendWhatsAppDisconnectedNotification(
  toEmail: string,
  businessName: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: toEmail,
    subject: `🚫 WhatsApp disconnected — ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #dc2626;">SalesMate AI</h2>
        <p><strong>${businessName}</strong>, your WhatsApp connection has been disconnected.</p>
        <p>Your AI agent has been paused. Customers messaging your WhatsApp number will not receive automated replies until you reconnect.</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/settings" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Reconnect WhatsApp
        </a>
      </div>
    `,
  });
}

export async function sendNewLeadNotification(
  toEmail: string,
  businessName: string,
  customerName: string | null,
  phoneNumber: string,
  productInterest: string | null
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: toEmail,
    subject: `🆕 New lead captured — ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">SalesMate AI</h2>
        <p><strong>${businessName}</strong>, a new lead has been captured from WhatsApp.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${customerName || "Not provided"}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${phoneNumber}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Interest</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${productInterest || "Not specified"}</td></tr>
        </table>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/leads" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          View Leads
        </a>
      </div>
    `,
  });
}
