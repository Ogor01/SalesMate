---
trigger: always_on
---

# Design System Rules

## Source of Truth

The project's imported Figma design system and design tokens are the source of truth.

---

## Mandatory Usage

Use existing:

- Color tokens
- Typography tokens
- Spacing tokens
- Border radius tokens
- Shadow tokens
- Component tokens

---

## UI Consistency

Always reuse existing components before creating new ones.

Maintain consistency across:

- Forms
- Tables
- Cards
- Modals
- Navigation
- Dashboard layouts

---

## Responsive Design

Follow responsive patterns already defined in the imported Figma designs, even if they are not responsive, just use the ui as inspiration and make sure to make it responsive. Remember mobile first!

Do not introduce new layout systems.

---

## Component Creation Rules

Before creating a new component:

1. Search existing components
2. Reuse existing variants
3. Extend existing components if needed
4. Create new component only if no match exists

---

## Styling Rules

Never hardcode:

- Colors
- Font sizes
- Spacing
- Border radius

Always use design tokens.

---

## Accessibility

- Ensure readable contrast
- Maintain keyboard navigation
- Ensure proper ARIA labeling
