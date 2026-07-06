import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { isValidTwilioRequest } from "./twilio-validate";

describe("isValidTwilioRequest", () => {
  const authToken = "test_auth_token_12345";
  const url = "https://example.com/api/whatsapp/webhook";
  const params = { From: "+1234567890", Body: "Hello", To: "+14155238886" };

  it("returns false when signature is null", () => {
    expect(isValidTwilioRequest(url, params, null, authToken)).toBe(false);
  });

  it("returns false when authToken is empty", () => {
    expect(isValidTwilioRequest(url, params, "some_signature", "")).toBe(false);
  });

  it("returns false when the signature does not match", () => {
    // A wrong signature should not validate
    const wrongSignature = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    expect(isValidTwilioRequest(url, params, wrongSignature, authToken)).toBe(
      false
    );
  });

  it("generates the same signature Twilio would for a given payload", () => {
    // We compute what we expect the signature to be
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys.map((key) => key + params[key as keyof typeof params]).join("");
    const payload = url + queryString;

    const expectedSignature = crypto
      .createHmac("sha1", authToken)
      .update(payload)
      .digest("base64");

    expect(isValidTwilioRequest(url, params, expectedSignature, authToken)).toBe(
      true
    );
  });

  it("treats empty params correctly", () => {
    const emptyParams = {};
    const sortedKeys = Object.keys(emptyParams).sort();
    const queryString = sortedKeys.map((key) => key + (emptyParams as any)[key]).join("");
    const payload = url + queryString;

    const expectedSignature = crypto
      .createHmac("sha1", authToken)
      .update(payload)
      .digest("base64");

    expect(
      isValidTwilioRequest(url, emptyParams, expectedSignature, authToken)
    ).toBe(true);
  });
});
