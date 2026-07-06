import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// Mock the auth module before importing withAuth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { withAuth } from "./api-auth";

function mockRequest(url = "http://localhost:3000/api/test"): Request {
  return new Request(url);
}

describe("withAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const handler = withAuth(async ({ userId }) => {
      return NextResponse.json({ userId });
    });

    const response = await handler(mockRequest());
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 when session has no user id", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: "Test", email: "test@test.com" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const handler = withAuth(async ({ userId }) => {
      return NextResponse.json({ userId });
    });

    const response = await handler(mockRequest());
    expect(response.status).toBe(401);
  });

  it("calls the handler with userId when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", name: "Test", email: "test@test.com" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const handler = withAuth(async ({ userId }, req) => {
      return NextResponse.json({ userId, url: req.url });
    });

    const response = await handler(mockRequest("http://localhost:3000/api/products"));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.userId).toBe("user-123");
    expect(body.url).toContain("/api/products");
  });

  it("returns 500 when the handler throws an error", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const handler = withAuth(async () => {
      throw new Error("Something went wrong");
    });

    const response = await handler(mockRequest());
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.message).toBe("Internal server error");
  });
});
