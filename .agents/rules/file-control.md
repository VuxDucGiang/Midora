
---
trigger: always_on
description: Control file creation, Maven/NPM dependency installation, and project growth across backend and frontend.
---

# File and Dependency Control

## File Creation
- Do not create files unless necessary.
- Prefer modifying existing files when appropriate.
- Do not create one-file folders or packages without a clear architectural reason.
- Avoid redundant `index.ts` barrel files in frontend modules.
- Do not create duplicate configuration files (`application.properties`, `next.config.ts`, etc.).
- Keep naming consistent with existing conventions:
  - **Frontend**: `PascalCase.tsx` for React components, `camelCase.ts` for hooks (`use*.ts`), utilities, and data/service modules.
  - **Backend**: `PascalCase.java` with clear suffixes (`*Controller`, `*Service`, `*ServiceImpl`, `*Repository`, `*Request`, `*Response`, `*Mapper`, `*Exception`).

## Dependencies (`package.json` & `pom.xml`)
- Inspect `midora-frontend/package.json` or `midora-backend/pom.xml` before installing or adding anything.
- Check whether an existing dependency (Spring Boot starters, Jakarta Validation, Lombok, Lucide React, Tailwind CSS, Next.js built-ins) already provides the functionality.
- Prefer native Java 21 / Web APIs and existing project utilities.
- Explain the reason and ask for confirmation before adding any new NPM package or Maven dependency.
- Never install multiple libraries for the same responsibility.

## Code Size
- Keep components, controllers, and services focused on a single cohesive domain responsibility.
- Split files when responsibilities become unrelated.
- Do not split files merely to meet an arbitrary line limit.
- Avoid deeply nested folder or package structures.

## Cleanup
- Remove unused imports in both TypeScript and Java files.
- Remove dead code introduced by the current task.
- Do not leave temporary files in the repository.
- Do not remove existing code without verifying its usage across the workspace.
