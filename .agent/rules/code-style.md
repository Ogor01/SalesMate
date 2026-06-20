---
trigger: always_on
---

# CODE_STYLE.md — SalesMate AI

This document defines the coding standards for SalesMate AI. It complements `AGENTS.md` (product rules, golden rules, folder structure) and `ARCHITECTURE.md` (system design). Where those files describe _what_ to build, this file describes _how the code should look and behave_ — so output stays consistent regardless of which agent or developer writes it.

---

## 1. Language & Tooling

- **Language:** TypeScript everywhere (frontend, API routes, services). No plain `.js` files in application code.
- **Strict mode:** `tsconfig.json` should have `"strict": true`. Avoid `any` — use `unknown` + narrowing, or proper types/interfaces.
- **Linting/Formatting:** ESLint + Prettier. Code must be lint-clean and Prettier-formatted before being considered done. Don't hand-tune formatting that conflicts with Prettier defaults.
- **Package manager:** pick one (npm, pnpm, or yarn) and stick with it across the project — don't mix lockfiles.

---

## 2. Naming Conventions

| Thing                                         | Convention                                                | Example                                      |
| --------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| Files (components)                            | PascalCase                                                | `ProductCard.tsx`                            |
| Files (non-component: services, utils, hooks) | camelCase                                                 | `buildContext.ts`, `useLeads.ts`             |
| Folders                                       | kebab-case                                                | `knowledge-base/`, `whatsapp/`               |
| React components                              | PascalCase                                                | `ConversationList`, `LeadStatusBadge`        |
| Functions / variables                         | camelCase                                                 | `getLeadsByUser`, `aiConfidenceScore`        |
| Types / interfaces                            | PascalCase                                                | `Lead`, `ConversationMessage`                |
| Enums / constants                             | UPPER_SNAKE_CASE for constants, PascalCase for enum names | `AI_CONFIDENCE_THRESHOLD`, `enum LeadStatus` |
| Database columns (Prisma)                     | snake_case via `@map`, camelCase in the generated client  | `user_id` ↔ `userId`                         |
| API routes                                    | kebab-case, RESTful nouns                                 | `/api/products`, `/api/whatsapp/webhook`     |

Avoid abbreviations unless they're industry-standard (`id`, `url`, `faq`). Prefer `customerPhone` over `custPh`.

---

## 3. File & Component Structure

- One component per file. Co-locate small, component-specific helper functions in the same file; extract to `lib/` or `services/` once reused elsewhere.
- Follow the folder structure defined in `AGENTS.md` Section 4 — don't introduce new top-level folders without flagging it.
- Order within a file: imports → types/interfaces → constants → component/function definitions → default export.
- Prefer named exports for utilities/services; default export only for page components and React components that map 1:1 to a file.

```ts
// services/leads/extractIntent.ts

import { Conversation, Lead } from "@/types";
import { db } from "@/lib/db";

interface ExtractedIntent {
  customerName?: string;
  phoneNumber?: string;
  productInterest?: string;
}

export async function extractIntent(
  conversation: Conversation,
): Promise<ExtractedIntent> {
  // ...
}
```

---

## 4. React / Frontend Conventions

- **Functional components only**, using hooks. No class components.
- Keep components small and focused; if a component exceeds ~150 lines or mixes multiple concerns (data fetching + complex UI + business logic), split it.
- **Data fetching:** use server components / route handlers for initial data where possible (Next.js App Router). Client-side fetching (`useEffect` + fetch, or a data-fetching library) only where interactivity requires it.
- **Styling:** follow whatever utility/styling approach is established in `frontend-design` guidance for this project (e.g. Tailwind). Don't mix multiple styling systems (no CSS Modules + styled-components + Tailwind all in one project).
- **Forms:** validate on both client (UX) and server (security) — never trust client-side validation alone, especially for vendor-submitted product/FAQ content.
- **Loading & error states:** every data-fetching component must explicitly handle loading and error states — no silent blank screens.

---

## 5. API Routes / Backend Conventions

- **RESTful resource naming:** `/api/products`, `/api/products/[id]`, `/api/leads`, `/api/conversations/[id]`, etc.
- **Every handler must:**
  1. Verify the session (Auth.js) — reject with `401` if absent
  2. Scope all DB queries by the session's `user_id` (Golden Rule — see `AGENTS.md` Section 2)
  3. Validate input (e.g. with `zod`) before touching the database
  4. Return consistent JSON shapes (see below)
- **Response shape (success):**
  ```json
  { "data": { ... } }
  ```
- **Response shape (error):**
  ```json
  {
    "error": {
      "message": "Human-readable message",
      "code": "OPTIONAL_MACHINE_CODE"
    }
  }
  ```
- **HTTP status codes:** use them correctly — `200` success, `201` created, `400` validation error, `401` unauthenticated, `403` forbidden (e.g. accessing another vendor's data), `404` not found, `500` unexpected server error.
- **The WhatsApp webhook (`/api/whatsapp/webhook`) is the one exception** to "every handler requires a session" — it's authenticated via WhatsApp's own signature/verification scheme instead. Document this exception inline in the file.

---

## 6. Service Layer Conventions

- Services in `services/` contain business logic and external integrations — they should be callable from API routes (and, where relevant, from scheduled jobs) without depending on `req`/`res` objects.
- Each service function should:
  - Take plain data/parameters in, return plain data/types out (no framework-specific objects)
  - Throw typed errors (custom error classes, e.g. `class LowConfidenceError extends Error`) rather than returning ambiguous `null`/`false` for failure cases that matter
- **AI provider isolation:** all LLM calls go through `services/ai/provider.ts`. No other file should import an LLM SDK directly.
- **WhatsApp isolation:** all WhatsApp Business API calls go through `services/whatsapp/client.ts`. No other file should call the WhatsApp API directly.

---

## 7. Database / Prisma Conventions

- `prisma/schema.prisma` is the single source of truth — generate types from it, don't hand-write duplicate DB types.
- Every tenant-owned model includes a `userId` field with an index, and every query against it includes a `where: { userId }` (or equivalent) clause.
- Use Prisma transactions (`prisma.$transaction`) for multi-step writes that must succeed or fail together (e.g. updating a `Conversation` and creating/updating a `Lead` from the same AI turn).
- Migrations are generated via Prisma Migrate — never edit the database schema by hand.
- Seed data (for local dev) lives in `prisma/seed.ts` and must not include real customer data.

---

## 8. Error Handling & Logging

- Never swallow errors silently. At minimum, log with enough context to debug (vendor `userId`, conversation `id`, etc. — but never log full customer PII unredacted).
- User-facing errors (dashboard) should be friendly and actionable, not raw stack traces or DB error messages.
- For the AI/WhatsApp pipeline specifically:
  - If the LLM call fails, do not leave the customer without a response — fall back to a generic "we'll get back to you" message and trigger human handoff.
  - If the WhatsApp send fails, log it and surface a dashboard alert; don't retry indefinitely (Golden Rule — see `AGENTS.md` Section 2).

---

## 9. Comments & Documentation

- Code should be self-explanatory through naming where possible; comments explain **why**, not **what**.
- Any deviation from the agreed stack, schema, or conventions in this file or `AGENTS.md` must be called out in a comment (e.g. `// NOTE: deviates from AGENTS.md Section 5 because...`) so it's easy to find during review.
- Exported functions in `services/` should have a short JSDoc/TSDoc comment describing purpose, parameters, and return value — especially for anything touching AI context-building, confidence scoring, or lead extraction, since these encode business rules.

---

## 10. Testing

- **Unit tests** for service-layer logic, especially:
  - `buildContext.ts` (correct vendor data is included/excluded)
  - `confidence.ts` (threshold logic)
  - `extractIntent.ts` (intent/lead extraction from sample conversations)
- **Integration tests** for API routes covering: auth rejection, cross-tenant access rejection (vendor A can't read vendor B's data), and basic CRUD happy paths.
- Mock external services (LLM provider, WhatsApp API) in tests — never call real external APIs from the test suite.
- Test files live alongside the code they test (`*.test.ts`) or in a parallel `__tests__/` structure — pick one convention and apply it consistently.

---

## 11. Git & Commit Conventions

- **Branch naming:** `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
- **Commit messages:** follow Conventional Commits style:
  - `feat: add product catalog CRUD`
  - `fix: scope lead queries by userId`
  - `chore: update prisma schema for stock field`
  - `docs: update AGENTS.md with confidence threshold rule`
- Keep commits focused — one logical change per commit. Avoid mixing schema migrations with unrelated UI changes.

---

## 12. Environment & Config

- All configuration/secrets via `process.env`, typed and validated at startup (e.g. with `zod`) so missing env vars fail fast and clearly.
- `.env.example` must be kept up to date with every required variable (with placeholder values, never real secrets).
- Feature flags or provider toggles (e.g. swapping the LLM provider) should be driven by env vars + the adapter pattern in `services/ai/provider.ts`, not by code branches scattered across the app.
