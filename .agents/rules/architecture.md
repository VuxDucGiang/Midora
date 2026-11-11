
---
trigger: always_on
description: Enforce the established MIDORA system design, backend/frontend architecture, domain invariants, and folder structure.
---

# MIDORA System Design & Architecture Rules

## 1. Core Principle & System Overview
The existing project architecture and Flyway migrations (`src/main/resources/db/migration/`) are the single source of truth.
**MIDORA** is a B2B2C Personalized 3D Virtual Try-On Marketplace for Secondhand & Vintage Fashion, structured as a multi-project workspace:
- **`midora-frontend/`**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4.
- **`midora-backend/`**: Spring Boot 4 (Java 21), Spring Data JPA (Hibernate / MySQL 8.x), Flyway Migration, Spring Security (JWT), Jakarta Validation, Lombok.
- **`documents/`**: Project proposal and system design artifacts.

---

## 2. Core System Design & Domain Invariants
All backend and frontend code must strictly uphold these domain invariants:

1. **1-SKU Unique Vintage Inventory (`products`)**:
   - Secondhand/vintage items are one-of-a-kind (`is_unique = true`, 1 SKU = 1 physical item).
   - Must enforce **Optimistic Locking** (`@Version` on `products.version`) during reservation and checkout to prevent race-condition overselling.
   - Product lifecycle follows strict state transitions: `AVAILABLE` -> `RESERVED` -> `SOLD`. Only `AVAILABLE` items can be added to an order.
2. **Centimeter-Level Sizing & 3D Virtual Try-On Engine (`body_profiles`, `product_measurements`, `try_on_sessions`)**:
   - Sizing never relies on generic S/M/L labels alone; it compares user body metrics (`height_cm`, `weight_kg`, `chest_cm`, `waist_cm`, `hips_cm`, `shoulder_width_cm`, `avatar_customization_params`) against garment flat/circumference measurements (`chest_width_cm`, `shoulder_width_cm`, `waist_width_cm`, `hip_width_cm`, `fabric_stretch`).
   - Try-On evaluation produces a quantitative `fit_score` (0.0–100.0) and per-region `fit_prediction_json` heatmap data (e.g., tight, optimal fit, relaxed/oversized) persisted in `try_on_sessions`.
3. **B2B2C Multi-Role Marketplace (`users`, `stores`, `categories`, `orders`, `order_items`)**:
   - Strict role separation: `ROLE_CUSTOMER` (body profiles, try-on, orders), `ROLE_STORE_OWNER` (store management, product & measurement listing, order fulfillment), and `ROLE_ADMIN` (platform oversight).
   - Store owners may only mutate products and measurements belonging to their own `store_id`.

---

## 3. Backend Architecture (`midora-backend/`)

### Package Structure (`com.midora`)
Keep all Java source files under `src/main/java/com/midora` following a clean layered/modular structure:
- `config/`: Security, CORS, Jackson, OpenAPI, and application configuration beans.
- `common/`:
  - `dto/`: Standardized wrappers (`ApiResponse<T>`, `PageResponse<T>`).
  - `exception/`: `GlobalExceptionHandler` (`@RestControllerAdvice`), `BusinessException`, `ErrorCode`.
  - `util/`: Shared stateless helper utilities.
- `security/`: JWT filters, token providers, `UserDetailsService`, and security context helpers.
- Domain/Layered packages (`controller/`, `service/`, `repository/`, `entity/`, `dto/request/`, `dto/response/`, `mapper/`):
  - Group either by domain module (e.g., `product`, `tryon`, `user`, `store`, `order`) or by standard layer, keeping naming consistent across the codebase.

### Backend Layer Dependency & Coding Rules
- **Unidirectional Flow**: `Controller` -> `Service` -> `Repository` -> `Entity`. Lower layers must never import from higher layers.
- **Controller Layer (`@RestController`)**:
  - Base context path is `/api/v1` (configured in `application.properties`). Use plural RESTful nouns (`/products`, `/stores`, `/body-profiles`, `/try-on-sessions`, `/orders`, `/auth`).
  - Validate all incoming payloads with `@Valid` / Jakarta Validation annotations (`@NotNull`, `@NotBlank`, `@Positive`, `@Min`, `@Max`).
  - Keep controllers thin: no business logic or direct `Repository` injection.
  - **Never expose JPA `@Entity` objects in API responses or accept them directly as `@RequestBody`.** Always map between Entities and Request/Response DTOs (preferably Java `record`s or immutable DTO classes).
- **Service Layer (`@Service`)**:
  - Encapsulate all business rules, Fit Score algorithms, ownership checks, and state transitions.
  - Annotate read operations with `@Transactional(readOnly = true)` and write/mutation operations with `@Transactional`.
  - Explicitly catch or translate `ObjectOptimisticLockingFailureException` when two buyers attempt to checkout the same 1-SKU product simultaneously, returning `409 Conflict`.
- **Repository & Entity Layer (`@Repository`, `@Entity`)**:
  - Entities must match the Flyway migration schema (`src/main/resources/db/migration/*.sql`) table/column definitions and constraints accurately (`spring.jpa.hibernate.ddl-auto=validate`).
  - Any database schema or seed change must be introduced via a new versioned Flyway migration script (`V<next>__<description>.sql`), never by editing previously applied migration files or relying on `ddl-auto=update`.
  - Never use Lombok `@Data` on JPA `@Entity` classes; use `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` to prevent `equals`/`hashCode`/`toString` infinite loops and unintended lazy-loading queries.
  - Default all `@ManyToOne` and `@OneToMany` associations to `FetchType.LAZY`. Prevent N+1 queries using `@EntityGraph` or `JOIN FETCH` JPQL queries (`spring.jpa.open-in-view` is `false`).

---

## 4. Frontend Architecture (`midora-frontend/`)

### Folder Structure (`src/`)
- `src/app/`: Next.js App Router routes, layouts, and route-level boundaries (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Keep route files thin and declarative.
- `src/features/{feature}/`: Domain-specific modules (`try-on`, `catalog`, `avatar`, `store`, `checkout`, `auth`), each containing its own scoped `components/`, `hooks/`, `services/`, and `types.ts` as needed.
- `src/components/`: Shared UI and layout components (`layout/`, `home/`, `ui/`).
- `src/hooks/`: Reusable cross-feature custom React hooks.
- `src/lib/`: Centralized HTTP client (`apiClient`), environment config, and pure utility functions.
- `src/types/`: Shared TypeScript interfaces, API response wrappers, and domain enums.
- `src/data/`: Static content, fallback/demo datasets, and presentation constants.

### Frontend Dependency & Component Rules
- **Import Hierarchy**:
  - `app` -> `features`, `components`, `hooks`, `lib`, `types`, `data`.
  - `features` -> shared `components`, `hooks`, `lib`, `types`, `data`.
  - Shared `components` must **not** import from `features`.
  - Features must **not** depend on internal implementation files of unrelated features.
  - Avoid circular dependencies.
- **Next.js 16 & React 19 Conventions**:
  - Default to React Server Components (RSC). Add `"use client"` only at the lowest leaf component boundary that requires browser APIs, state (`useState`, `useReducer`), effects, or interactive 3D/try-on controls.
  - Centralize all backend `/api/v1` calls inside typed service modules (`src/lib/` or `src/features/{feature}/services/`). Never scatter raw `fetch()` calls with hardcoded URLs inside presentational components.

---

## 5. Frontend–Backend Integration Contract
- **Strict Type Parity**: Frontend TypeScript interfaces must mirror Backend DTOs and Flyway schema enums (`ConditionGrade`, `ProductStatus`, `FabricStretch`, `TryOnStatus`, `OrderStatus`, `UserRole`).
- **Standardized Envelope & Error Handling**:
  - Consume standardized JSON responses from `/api/v1`.
  - Gracefully handle `400 Bad Request` (field validation errors), `401/403` (auth/role boundaries), `404 Not Found`, and `409 Conflict` (when a unique vintage item was just purchased by another user).

---

## 6. Modification Restrictions & Change Governance

### Modification Restrictions
- Never reorganize the project or create new top-level directories without explicit approval.
- Never move or rename existing files without approval.
- Never delete existing components, entities, or endpoints without checking all usages across frontend and backend.
- Never duplicate an existing utility, service, DTO, or component.
- Do not introduce a new architectural pattern without justification.

### Before Creating Files
1. Inspect the existing directory structure in `midora-frontend` or `midora-backend`.
2. Search for similar components, services, entities, or functions.
3. Determine whether an existing implementation can be reused or extended.
4. Select the correct module/package location according to Sections 3 and 4.
5. Explain why a new file is necessary.

### Architecture Changes
Any proposed architecture or schema change must include:
- Reason for the change.
- Expected benefits.
- Affected files across backend and frontend.
- Database migration & backward compatibility impact.

Wait for approval before applying structural changes.
