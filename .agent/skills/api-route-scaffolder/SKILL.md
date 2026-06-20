# API Route Scaffolder Skill

## Purpose

Generate backend Express routes for SalesMate AI.

---

## Input

- Route name
- HTTP method
- Resource type
- Required fields

---

## Output

- Express route file
- Controller function
- Service function
- Validation rules

---

## Rules

- Always enforce business_id isolation
- Use structured error format
- Keep controllers thin
- Keep business logic in services

---

## Standard Response Format

{
  "success": true,
  "data": {}
}

---

## Error Format

{
  "error": true,
  "message": "",
  "code": ""
}
