
---
trigger: always_on
description: Enforce the established project architecture and folder structure.
---

# Architecture Rules

## Core Principle
The existing project architecture is the source of truth.

## Folder Structure
- Follow the approved project folder structure.
- Do not create new top-level directories without approval.
- Place files in their appropriate feature modules.
- Keep route files inside src/app.
- Keep shared components inside src/components.
- Keep feature-specific components inside src/features/{feature}/components.

## Dependency Rules
- app can import from features, components, hooks and lib.
- features can import from shared components, hooks and lib.
- shared components must not import from features.
- features must not depend on unrelated features.
- Avoid circular dependencies.

## Modification Restrictions
- Never reorganize the project without explicit approval.
- Never move or rename existing files without approval.
- Never delete existing components without checking their usages.
- Never duplicate an existing utility or component.
- Do not introduce a new architectural pattern without justification.

## Before Creating Files
1. Inspect the existing directory.
2. Search for similar components and functions.
3. Determine whether an existing implementation can be reused.
4. Select the correct location.
5. Explain why a new file is necessary.

## Architecture Changes
Any proposed architecture change must include:
- Reason for the change.
- Expected benefits.
- Affected files.
- Migration impact.
- Backward compatibility considerations.

Wait for approval before applying structural changes.
