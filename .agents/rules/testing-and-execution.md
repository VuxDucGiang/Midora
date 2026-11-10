---
trigger: always_on
description: Rules for running dev servers, linting, and testing.
---

# Testing and Execution Rules

## Dev Server Execution
- Never automatically run `npm run dev` or start development servers in the background unless explicitly requested by the user.
- The user will start and manage the local development server and perform manual testing themselves.

## Verification
- After making code changes, only verify that there are no lint or syntax errors (e.g., using `npm run lint`).
- Avoid running unnecessary full production builds (`npm run build`) or background dev servers unless requested.

