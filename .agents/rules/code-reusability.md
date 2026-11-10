
---
trigger: always_on
description: Enforce code reuse, DRY principles and reusable React component design.
---

# Code Reusability Standards

## Before Writing Code
- Search the codebase for existing implementations.
- Reuse existing components, hooks, services and utilities.
- Extend existing implementations when appropriate.
- Do not create duplicate functionality.

## React Components
- Keep components focused on one responsibility.
- Separate business logic from presentation.
- Extract reusable UI patterns.
- Use composition instead of excessive boolean props.
- Avoid unnecessary abstractions.
- Prefer explicit and strongly typed props.

## Shared Components
A component belongs in shared components when:
- It is used by multiple features.
- Its responsibility is generic.
- It does not depend on a specific business feature.

Feature-specific components must remain inside their feature module.

## Hooks
- Extract reusable stateful logic into custom hooks.
- Do not create hooks that merely wrap one trivial expression.
- Avoid duplicating the same state management logic.

## Utilities
- Keep pure functions in appropriate utility modules.
- Do not duplicate formatting, validation or transformation logic.
- Reuse existing constants.

## Prohibited Practices
- Copy-paste components with minor visual differences.
- Multiple implementations of the same business rule.
- Unnecessary wrapper components.
- Over-generalized components with dozens of props.
- Premature abstractions.
