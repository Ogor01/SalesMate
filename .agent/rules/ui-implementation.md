---
trigger: always_on
---

# UI Implementation Rules

## Source Design System

UI must follow the imported Figma design system.

Design tokens are the only valid styling source.

---

## Core UI Principle

Reuse before creating.

---

## Component Usage Rules

Before building UI:

- Check existing components
- Use existing variants
- Extend instead of recreating

---

## Layout Rules

Maintain consistency across:

- Dashboard layout
- Inbox layout
- Product catalog layout
- Settings pages

Do not introduce alternative layout systems.

---

## Form Rules

All forms must:

- Use existing input components
- Validate using shared validation logic
- Follow consistent spacing tokens

---

## Table Rules

All tables must:

- Use shared table component
- Maintain consistent column spacing
- Support empty states

---

## Modal Rules

All modals must:

- Use base modal component
- Follow same animation behavior
- Use design system spacing and typography

---

## Styling Rules

Never hardcode:

- Colors
- Spacing
- Typography
- Shadows
- Radius

Always use tokens from Figma export.

---

## Empty States

Every screen must define:

- Loading state
- Empty state
- Error state

---

## Accessibility Rules

- Maintain readable contrast ratios
- Ensure keyboard navigation
- Ensure proper ARIA labeling
