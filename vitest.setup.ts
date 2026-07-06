import { beforeAll } from "vitest";

// Set test environment variables before any tests run
beforeAll(() => {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/salesmate_test";
  process.env.AI_PROVIDER_API_KEY = "dummy_ai_key";
  process.env.NEXTAUTH_SECRET = "test-secret-key";
});
