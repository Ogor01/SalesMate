import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

function getResendClient(): Resend | null {
  if (!resendApiKey || resendApiKey === "re_..." || resendApiKey.startsWith("dummy")) {
    return null;
  }
  return new Resend(resendApiKey);
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string,
  businessName?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();

  if (!client) {
    console.log(`[EMAIL MOCK] Password reset link for ${toEmail}: ${resetLink}`);
    return { success: true };
  }

  try {
    await client.emails.send({
      from: "SalesMate <noreply@salesmate.app>",
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
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    console.error("[EMAIL ERROR]", message);
    return { success: false, error: message };
  }
}
