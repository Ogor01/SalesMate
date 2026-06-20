---
trigger: always_on
---

# Architecture Rules

## System Overview

SalesMate AI is a multi-tenant SaaS system with three core layers:

1. Frontend Dashboard (Next.js)
2. Backend API (Node.js + Express)
3. AI + Messaging Layer (OpenAI + WhatsApp Cloud API)

---

## Core Services

### API Layer

- Handles authentication (Clerk)
- Manages CRUD operations for:
  - Business
  - Products
  - FAQs
  - Leads
  - Conversations

---

### AI Engine

The AI engine:

- Receives WhatsApp messages via webhook
- Loads conversation context
- Queries product catalog + FAQs
- Returns structured response:
  - message
  - confidence_score
  - action_type (respond | escalate | capture_lead)

---

### Messaging Layer

- WhatsApp Cloud API handles:
  - inbound messages
  - outbound responses
- Webhook is the single entry point for messages

---

## Database Architecture

PostgreSQL is structured as:

- users
- businesses
- products
- faqs
- leads
- conversations
- messages

All tables include:

- business_id (tenant isolation)

---

## AI Decision Flow

1. Receive message
2. Load conversation history
3. Retrieve business context
4. Query product catalog
5. Query FAQ knowledge base
6. Generate response
7. Return structured output
8. Execute action (respond/escalate/capture)

---

## Flutterwave Integration

- Payment handled externally
- System only stores:
  - payment status
  - transaction reference
  - subscription state

No direct payment logic in core API layer

---

## Scaling Rules

- Stateless backend services
- Horizontal scaling ready design
- No session-dependent logic on server
