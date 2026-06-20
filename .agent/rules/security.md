---
trigger: always_on
---

# Security Rules

## Core Principle

All data is tenant-isolated and must remain private per business.

---

## Authentication

- Use Clerk for authentication
- Never handle raw passwords manually
- Enforce session validation on all requests

---

## Authorization

Every request must:

- Validate user identity
- Validate business ownership
- Enforce business_id filtering

---

## Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all communication
- Never expose API keys in frontend

---

## WhatsApp Security

- Verify webhook signatures
- Reject unauthorized webhook calls
- Validate message origin

---

## AI Safety Rules

AI must:

- Never invent product data
- Only use catalog + FAQ sources
- Escalate uncertain cases

---

## Logging Restrictions

Do not log:

- API keys
- Clerk tokens
- WhatsApp credentials
- Personal customer identifiers beyond phone numbers (if necessary)

---

## Multi-Tenancy Isolation

Strict rules:

- Every query must include business_id
- No cross-business data queries allowed
- AI context must be scoped per business
