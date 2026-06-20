# Database Migration Runner Skill

## Purpose

Manage PostgreSQL schema changes safely.

---

## Input

- Migration name
- Table changes
- Field definitions

---

## Output

- SQL migration file
- Rollback script

---

## Rules

- Never delete production columns without backup plan
- Always include business_id in tenant tables
- Use snake_case for database fields
- Ensure idempotent migrations

---

## Required Checks

- Migration can run multiple times safely
- No breaking schema changes without versioning
