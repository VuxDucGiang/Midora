---
trigger: always_on
description: Rules for running dev servers, linting, compilation checks, and testing across frontend and backend.
---

# Testing and Execution Rules

## Dev Server Execution
- Never automatically run `npm run dev` or `./mvnw spring-boot:run` to start development servers in the background unless explicitly requested by the user.
- The user will start and manage the local frontend and backend development servers and perform manual testing themselves.

## Verification
- **Frontend (`midora-frontend/`)**: After making frontend code changes, verify that there are no lint or TypeScript syntax errors using `npm run lint` (or `npx tsc --noEmit`). Avoid running unnecessary full production builds (`npm run build`) unless requested.
- **Backend (`midora-backend/`)**: After making backend code changes, verify compilation using `./mvnw test-compile` (or `./mvnw test` when unit tests are modified/requested). Do not start the Spring Boot server or require a live MySQL instance just to verify syntax.

