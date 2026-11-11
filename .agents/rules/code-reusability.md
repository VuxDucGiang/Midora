
---
trigger: always_on
description: Enforce code reuse, DRY principles, clean Spring Boot services, and reusable React component design.
---

# Code Reusability Standards

## Before Writing Code
- Search both `midora-frontend` and `midora-backend` for existing implementations.
- Reuse existing components, hooks, services, repositories, DTOs, mappers, and utilities.
- Extend existing implementations when appropriate.
- Do not create duplicate functionality.

## Frontend: React Components & Hooks
- Keep components focused on one responsibility.
- Separate business/API logic from presentation.
- Extract reusable UI patterns into `src/components/`.
- Use composition instead of excessive boolean props.
- Prefer explicit and strongly typed TypeScript props.
- Extract reusable stateful logic into custom hooks; do not create hooks that merely wrap one trivial expression.
- Feature-specific components must remain inside their feature module (`src/features/{feature}/`).

## Backend: Spring Boot Services, DTOs & Mappers
- Centralize domain calculations (such as 3D Fit Score calculation, garment measurement comparison, and 1-SKU availability checks) in dedicated `@Service` or domain helper classes — never duplicate business rules across multiple controllers or services.
- Reuse standardized response wrappers (`ApiResponse<T>`, `PageResponse<T>`) and centralized exception handling (`GlobalExceptionHandler`).
- Keep entity-to-DTO mapping logic in dedicated mapper methods/classes rather than duplicating field-by-field mapping across controllers and services.
- Extract reusable query predicates or specifications in repositories rather than filtering large collections in memory.

## Utilities & Constants
- Keep pure functions in appropriate utility modules (`src/lib/` on frontend, `com.midora.common.util` on backend).
- Do not duplicate formatting, measurement conversion, validation, or transformation logic.
- Reuse existing enums and constants.

## Prohibited Practices
- Copy-paste components or service methods with minor differences.
- Multiple implementations of the same business rule (e.g., calculating Fit Score differently in frontend vs. backend).
- Unnecessary wrapper components or pass-through classes.
- Over-generalized components with dozens of props.
- Premature abstractions.
