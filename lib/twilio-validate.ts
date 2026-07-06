import crypto from "crypto";

export function isValidTwilioRequest(
  url: string,
  params: Record<string, string>,
  signature: string | null,
  authToken: string
): boolean {
  if (!signature || !authToken) return false;

  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map((key) => key + params[key]).join("");

  const payload = url + queryString;

  const expectedSignature = crypto
    .createHmac("sha1", authToken)
    .update(payload)
    .digest("base64");

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
