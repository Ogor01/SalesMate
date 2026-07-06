import { db } from "@/lib/db";

interface HealthCheckResult {
  configId: string;
  userId: string;
  twilioPhoneNumber: string;
  connected: boolean;
  healthy: boolean;
  error?: string;
}

/**
 * Tests a single WhatsApp config by calling Twilio's Account resource
 * (a lightweight authenticated request that validates credentials).
 */
async function testTwilioCredentials(
  accountSid: string,
  authToken: string
): Promise<{ ok: boolean; error?: string }> {
  const encoded = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      { headers: { Authorization: `Basic ${encoded}` } }
    );

    if (res.ok) return { ok: true };
    const data = await res.json();
    return { ok: false, error: data.message || `HTTP ${res.status}` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Runs a health check on all WhatsApp configs.
 * Marks disconnected configs and returns results.
 */
export async function runAllHealthChecks(): Promise<HealthCheckResult[]> {
  const configs = await db.whatsAppConfig.findMany({
    select: {
      id: true,
      userId: true,
      twilioPhoneNumber: true,
      connected: true,
      accountSid: true,
      authToken: true,
    },
  });

  const results: HealthCheckResult[] = [];

  for (const config of configs) {
    const test = await testTwilioCredentials(config.accountSid, config.authToken);

    const healthy = test.ok && config.connected;
    const changed = config.connected !== test.ok;

    if (changed) {
      await db.whatsAppConfig.update({
        where: { id: config.id },
        data: { connected: test.ok },
      });
    }

    results.push({
      configId: config.id,
      userId: config.userId,
      twilioPhoneNumber: config.twilioPhoneNumber,
      connected: config.connected,
      healthy: test.ok,
      error: test.error,
    });
  }

  return results;
}

/**
 * Runs a health check for a single vendor by userId.
 */
export async function runVendorHealthCheck(
  userId: string
): Promise<HealthCheckResult | null> {
  const config = await db.whatsAppConfig.findUnique({
    where: { userId },
  });

  if (!config) return null;

  const test = await testTwilioCredentials(config.accountSid, config.authToken);
  const changed = config.connected !== test.ok;

  if (changed) {
    await db.whatsAppConfig.update({
      where: { id: config.id },
      data: { connected: test.ok },
    });
  }

  return {
    configId: config.id,
    userId: config.userId,
    twilioPhoneNumber: config.twilioPhoneNumber,
    connected: config.connected,
    healthy: test.ok,
    error: test.error,
  };
}
