
---
trigger: always_on
description: Control file creation, dependency installation and project growth.
---

# File and Dependency Control

## File Creation
- Do not create files unless necessary.
- Prefer modifying existing files when appropriate.
- Do not create one-file folders without a clear reason.
- Avoid redundant index.ts barrel files.
- Do not create duplicate configuration files.
- Keep naming consistent with existing conventions.

## Dependencies
- Inspect package.json before installing anything.
- Check whether an existing dependency provides the functionality.
- Prefer native APIs and existing project utilities.
- Explain the reason before adding a dependency.
- Never install multiple libraries for the same responsibility.

## Code Size
- Keep components and services focused.
- Split files when responsibilities become unrelated.
- Do not split files merely to meet an arbitrary line limit.
- Avoid deeply nested folder structures.

## Cleanup
- Remove unused imports.
- Remove dead code introduced by the current task.
- Do not leave temporary files.
- Do not remove existing code without verifying its usage.
