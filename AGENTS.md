# AGENTS.md — SalesMate AI

This file gives AI coding agents (Antigravity, etc.) the context needed to build, extend, and modify this codebase consistently. Read this before generating code, scaffolding features, or making architectural decisions.

---

## 1. Product Summary

**SalesMate AI** is an AI-powered WhatsApp sales agent for fashion vendors (Instagram/TikTok sellers, boutique owners, online clothing brands).

It lets a vendor:

1. Upload a product catalog
2. Add business info (delivery, payment, returns, FAQs)
3. Connect their WhatsApp Business account
4. Let an AI agent automatically answer customer questions, recommend products, capture leads, and escalate to a human when needed

**Core value prop:** Turn WhatsApp DMs into sales with a 24/7 AI sales rep.

**Primary users:** Non-technical, mobile-first fashion sellers with high volumes of repetitive customer inquiries.

---

## 2. Golden Rules (Non-Negotiable)

These rules override convenience or shortcuts. Any generated code that violates these should be considered incorrect, even if it "works."

1. **Multi-tenancy is sacred.** Every Product, FAQ, Conversation, and Lead belongs to a `user_id` (vendor). Every query MUST be scoped to the authenticated vendor. Never write a query that could return another vendor's data.
2. **The AI never invents facts.** Prices, stock, delivery times, and policies must come only from the vendor's own data (Product / FAQ / business profile tables). If the data isn't there, the AI says it doesn't know and/or escalates — it does not guess.
3. **Low confidence = escalate, not bluff.** If `ai_confidence_score` falls below the configured threshold, the system must flag the conversation for human handoff rather than let the AI keep responding.
4. **No hardcoded secrets or provider keys.** All credentials (DB, WhatsApp API, AI provider, Auth.js secrets) live in environment variables, never in source.
5. **Conversation history is append-only.** Never mutate or delete past messages in `conversation_history` — only append. This data feeds analytics and audit/compliance needs.
6. **Don't change the agreed stack without flagging it.** Auth = Auth.js (NextAuth v5). DB = PostgreSQL. If a task seems to require a different tool (e.g. a different ORM, a different auth flow), surface that as a question/assumption rather than silently swapping it in.
7. **Schema changes go through migrations.** Never hand-edit the database or bypass the ORM's migration system.
8. **Keep the AI layer swappable.** All calls to the LLM provider go through a single adapter/service. No direct provider SDK calls scattered through feature code.
9. **Don't build the AI Follow-Up Agent (or other "Out of Scope" items) unless explicitly asked** — see Section 14.

---

## 3. Tech Stack (MVP)

| Layer                | Choice                                               | Notes                                                                                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend             | React / Next.js                                      | Vendor-facing dashboard                                                                                                                                                                                                                     |
| Backend              | Node.js (within Next.js API routes / route handlers) | API + business logic                                                                                                                                                                                                                        |
| Database             | PostgreSQL                                           | Relational, matches schema below                                                                                                                                                                                                            |
| ORM                  | Prisma (recommended)                                 | Pairs naturally with Next.js + Postgres; agents may propose alternatives but should flag the change                                                                                                                                         |
| WhatsApp Integration | WhatsApp Business API                                | Inbound/outbound messaging                                                                                                                                                                                                                  |
| AI / LLM             | TBD — confirm provider before scaffolding AI logic   | PRD lists Deepseek; verify before implementing                                                                                                                                                                                              |
| Authentication       | Auth.js (NextAuth v5)                                | PRD lists "Flutterwave" for auth, but Flutterwave is a **payments** provider, not auth. Use Auth.js (NextAuth v5) for login/sessions in v1, and reserve Flutterwave (or similar) strictly for payment processing if/when payments are added |
| Hosting              | Vercel                                               |                                                                                                                                                                                                                                             |

**Agent instruction:** Auth is settled — use Auth.js (NextAuth v5) for all login/session/account work, don't reach for Supabase Auth, Auth0, or custom JWT instead. The AI/LLM provider is still TBD; if it's ambiguous or not yet configured in `.env` / config files, do not silently assume — flag it or use a placeholder/adapter pattern so it can be swapped easily.

---

## 4. Folder Structure

Recommended structure for a Next.js (App Router) project. Agents should follow this layout so feature ownership stays clear and the AI/WhatsApp layers stay isolated and swappable.

```
salesmate-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/            # Overview / analytics
│   │   ├── products/             # Product catalog CRUD
│   │   ├── knowledge-base/       # FAQs, delivery, payment, return policy
│   │   ├── conversations/        # Inbox / human handoff UI
│   │   ├── leads/                # Lead list & status
│   │   └── settings/             # Business profile, WhatsApp connection
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth.js route handler
│   │   ├── whatsapp/
│   │   │   └── webhook/          # Inbound WhatsApp webhook endpoint
│   │   ├── products/
│   │   ├── faqs/
│   │   ├── leads/
│   │   └── conversations/
│   └── layout.tsx / page.tsx
│
├── components/                   # Shared UI components
│   ├── ui/                        # Buttons, inputs, cards, etc.
│   ├── dashboard/
│   └── conversations/
│
├── lib/
│   ├── db.ts                      # Prisma client instance
│   ├── auth.ts                    # Auth.js config
│   └── constants.ts               # AI confidence threshold, lead statuses, etc.
│
├── services/
│   ├── ai/
│   │   ├── provider.ts            # LLM provider adapter (swappable)
│   │   ├── buildContext.ts        # Assembles product/FAQ/business context for prompts
│   │   └── confidence.ts          # Confidence scoring logic
│   ├── whatsapp/
│   │   ├── client.ts              # WhatsApp Business API adapter
│   │   └── messageHandler.ts      # Inbound message → AI → outbound response flow
│   ├── leads/
│   │   └── extractIntent.ts       # Lead/intent extraction from conversations
│   └── notifications/
│       ├── dispatcher.ts          # Central event dispatcher
│       ├── email.ts
│       └── whatsapp.ts
│
├── prisma/
│   ├── schema.prisma              # Source of truth for data models
│   └── migrations/
│
├── types/                         # Shared TypeScript types/interfaces
│
└── .env.example
```

**Agent instruction:** New features should slot into this structure rather than creating new top-level folders. If a feature doesn't fit cleanly, flag it instead of inventing a new convention.

---

## 5. Data Models

These are the source of truth for the Prisma schema, TypeScript types, and API contracts. Use consistent naming (snake_case for DB columns via Prisma `@map`, camelCase in app code).

### User

| Field           | Type        | Notes                                                                                 |
| --------------- | ----------- | ------------------------------------------------------------------------------------- |
| `id`            | UUID / cuid | Primary key                                                                           |
| `full_name`     | string      |                                                                                       |
| `email`         | string      | Unique                                                                                |
| `business_name` | string      |                                                                                       |
| `password_hash` | string      | Only used if credentials provider is enabled in Auth.js; nullable if using OAuth-only |
| `created_at`    | datetime    |                                                                                       |

### Product

| Field           | Type        | Notes                                                          |
| --------------- | ----------- | -------------------------------------------------------------- |
| `id`            | UUID / cuid | Primary key                                                    |
| `user_id`       | UUID        | FK → User, **required on every query**                         |
| `product_name`  | string      |                                                                |
| `description`   | text        |                                                                |
| `price`         | decimal     | Store as decimal/integer (kobo) to avoid float rounding issues |
| `image_url`     | string      |                                                                |
| `color_options` | string[]    |                                                                |
| `size_options`  | string[]    |                                                                |
| `created_at`    | datetime    |                                                                |

### FAQ

| Field      | Type        | Notes       |
| ---------- | ----------- | ----------- |
| `id`       | UUID / cuid | Primary key |
| `user_id`  | UUID        | FK → User   |
| `question` | text        |             |
| `answer`   | text        |             |

### Lead

| Field              | Type        | Notes                                                                                            |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------ |
| `id`               | UUID / cuid | Primary key                                                                                      |
| `user_id`          | UUID        | FK → User (implicit via conversation, but should be denormalized onto Lead for query simplicity) |
| `customer_name`    | string      | Nullable — may not be captured yet                                                               |
| `phone_number`     | string      |                                                                                                  |
| `product_interest` | string      | Free text or FK → Product if matched                                                             |
| `lead_status`      | enum        | e.g. `new`, `contacted`, `qualified`, `converted`, `lost` — define as a shared enum/constant     |
| `created_at`       | datetime    |                                                                                                  |

### Conversation

| Field                  | Type        | Notes                                               |
| ---------------------- | ----------- | --------------------------------------------------- |
| `id`                   | UUID / cuid | Primary key                                         |
| `user_id`              | UUID        | FK → User                                           |
| `customer_phone`       | string      |                                                     |
| `conversation_history` | JSON        | Append-only array of `{ role, content, timestamp }` |
| `ai_confidence_score`  | float (0–1) | Updated per AI response                             |
| `created_at`           | datetime    |                                                     |

### Example TypeScript shape

```ts
type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface Conversation {
  id: string;
  userId: string;
  customerPhone: string;
  conversationHistory: {
    role: "customer" | "ai" | "vendor";
    content: string;
    timestamp: string;
  }[];
  aiConfidenceScore: number; // 0–1
  createdAt: string;
}
```

**Agent instruction:** When adding new fields, update `prisma/schema.prisma`, the corresponding TypeScript types in `types/`, and any API validation schemas together — don't let these drift out of sync.

---

## 6. Core Features (build order priority)

1. **User Account System** — sign up/login (Auth.js), dashboard access, business profile management
2. **Product Catalog Setup** — CRUD for products (name, price, description, images, colors, sizes)
3. **AI Knowledge Base** — vendor inputs delivery info, payment methods, return policy, FAQs; this feeds the AI's context/prompt
4. **WhatsApp AI Agent** — core chat loop: receive message → build context (products + FAQs + business info) → generate response → send via WhatsApp API
5. **Lead Capture** — AI extracts customer name, phone, product interest, and purchase intent from conversations and writes to `Lead` table
6. **Human Handoff** — when `ai_confidence_score` is below threshold, notify vendor and allow manual takeover of the conversation thread
7. **Analytics Dashboard** — aggregate views: total conversations, leads generated, conversion rate, top FAQs, AI performance metrics

---

## 7. User Flows

**Vendor flow:** Sign up → Create business profile → Upload products → Add business info → Connect WhatsApp → Activate AI agent

**Customer flow:** Send WhatsApp message → AI answers → AI recommends product → AI captures intent → Customer purchases or requests human

---

## 8. System Behavior Rules

- AI must respond within seconds (design for low-latency inference + async message handling)
- AI responses must be grounded in vendor-provided data (products, FAQs, business info) — avoid hallucinated claims about price, stock, or policy
- Every conversation is persisted with full history and a running `ai_confidence_score`
- Low-confidence responses trigger escalation, not a guess
- Customer intent/lead data should be extracted automatically, not require manual tagging
- Product/FAQ updates from the vendor should be reflected in AI responses without redeployment (i.e. AI context is built dynamically from the DB, not hardcoded)

---

## 9. Product Rules (Business Logic)

These are concrete rules derived from the PRD that should be enforced in code, not just documentation:

- **Confidence threshold:** Define `AI_CONFIDENCE_THRESHOLD` as a single constant in `lib/constants.ts`. Any response scoring below this triggers human handoff. Do not hardcode the threshold value in multiple places.
- **Lead creation:** A `Lead` record is created/updated as soon as the AI captures a customer's name, phone number, or product interest — it doesn't wait for an explicit "purchase" event.
- **Unavailable size/color:** If a customer asks for a size/color not in `size_options`/`color_options`, the AI must say it's unavailable and suggest the closest available alternative from the same product — never confirm availability it can't verify.
- **Out of stock products:** Products should support a stock/availability flag (even if not in the original schema, agents should propose adding one) so the AI doesn't recommend or confirm orders for unavailable items.
- **WhatsApp disconnection:** If the vendor's WhatsApp connection drops, the AI agent must stop attempting to send messages for that vendor and surface a dashboard alert — it should not silently fail or retry indefinitely.
- **Pricing:** Display currency consistently (NGN by default, per the Nigerian market focus in the PRD). Store prices as integers (smallest currency unit) to avoid floating-point errors.
- **Conversation ownership:** A conversation belongs to exactly one vendor (`user_id`) and one customer phone number — there is no cross-vendor conversation merging.

---

## 10. Notification Logic

**Triggers:** new lead generated, human intervention required, new product inquiry, high purchase intent detected

**Channels:** dashboard alerts, email, WhatsApp notifications

When implementing, design notifications as a decoupled service/event system (e.g. emit events on lead creation, low-confidence detection, etc.) so channels can be added/removed independently.

---

## 11. Edge Cases to Handle

- Missing product information (AI should not fabricate details)
- Customer requests unavailable size/color (AI should check `size_options`/`color_options` and respond accordingly, suggest alternatives)
- AI confidence below threshold → escalate
- Product out of stock
- Vendor disconnects WhatsApp (agent should detect and pause/alert rather than fail silently)

---

## 12. Security & Compliance

- Encrypt sensitive user data at rest and in transit
- Use Auth.js (NextAuth v5) with hashed passwords if using a credentials provider (`password_hash` implies bcrypt/argon2 — never store plaintext)
- Implement role-based access control (vendor vs. future team members/staff)
- All API endpoints must use secure communication (HTTPS) and proper auth middleware/session checks
- Follow general data privacy best practices (especially for customer phone numbers and conversation history)

---

## 13. Out of Scope for MVP (do not build unless asked)

- **AI Follow-Up Agent**: A future feature to automatically re-engage customers who inquired but didn't purchase. Flagged in the PRD as a high-value differentiator for a later phase. Agents should avoid building this into the MVP but can leave extension points (e.g. conversation/lead status fields) that would make it easy to add later.

---

## 14. Coding Conventions for Agents

- Keep AI prompt-construction logic isolated in its own module/service (e.g. `services/ai/buildContext.ts`) so the LLM provider can be swapped without touching business logic
- Keep WhatsApp API integration behind an adapter/interface, not scattered across the codebase
- Use environment variables for all provider keys/config (DB, AI provider, WhatsApp API, auth, hosting) — never hardcode credentials
- Favor small, composable services over monolithic route handlers, especially around the AI conversation loop, lead extraction, and notifications
- Write database migrations for any schema changes rather than editing tables directly
- When uncertain about the AI model/provider choice, check existing config/`.env.example` first; if none exists, implement with a clearly named placeholder/adapter and note the assumption in a comment

---

## 15. KPIs the Product Must Be Able to Report On

Ensure data models and analytics queries can support:

- Number of connected businesses
- Number of AI-handled conversations
- Lead generation rate
- Conversion rate
- Average response time
- Human handoff rate
- Monthly active vendors
