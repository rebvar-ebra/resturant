# Manager Dashboard Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the marketing-first root page with a bilingual, data-backed operations dashboard for a restaurant manager while preserving the public menu and moving the marketing page to `/about`.

**Architecture:** The NestJS API exposes the existing Catalog, Ordering, and Kitchen controllers through explicit feature modules. A server-only Next.js operations client resolves the dev user's first authorized tenant and location, fetches operational snapshots, and converts them into a small dashboard view model. The UI never invents operational data: missing auth, API, tenant, or location state is shown explicitly.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS 3, NestJS 10, Prisma 5, Vitest, Playwright smoke testing.

**Spec:** `RestaurantOS.md` sections 1, 3.1, 4.2, 5, 7.5, 13, 16.2, 19 and 20; repository rules in `AGENTS.md`.

## Global Constraints

- Cross-module imports use only `packages/modules/<name>/public.ts`.
- Every tenant-owned query remains inside `PrismaService.withTenantTransaction(ctx, fn)`.
- State mutation and outbox append remain in one transaction; the dashboard adds no mutation.
- Money remains integer minor units represented as `bigint` or decimal strings, never floating point.
- The dashboard must support Persian RTL and German LTR, keyboard navigation, touch targets of at least 44px, and an explicit disconnected state.
- Private dashboard fetches use `cache: "no-store"`; no tenant response may enter shared public cache.
- No fabricated sales, order, kitchen, or availability values are shown when the API is unavailable.

## Review Focus

- API unavailable or malformed: Task 2 tests must produce an explicit `disconnected` result rather than zero-valued fake metrics.
- Authenticated user with no membership or location: Task 2 tests must produce a distinct onboarding state.
- Tenant isolation: Task 4 reruns the real PostgreSQL isolation suite and verifies dashboard calls use only the selected membership tenant.
- Money precision: Task 2 tests totals above `Number.MAX_SAFE_INTEGER` using integer minor units.
- Locale and direction: Task 3 browser checks must switch Persian/German and verify both copy and `dir`.

---

### Task 1: Activate Operational API Modules and Repair Outbox Persistence

**Files:**
- Create: `apps/api/src/catalog/catalog.module.ts`
- Create: `apps/api/src/ordering/ordering.module.ts`
- Create: `apps/api/src/kitchen/kitchen.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/package.json`
- Modify: `packages/outbox/src/index.ts`
- Test: `packages/outbox/src/index.test.ts`

**Interfaces:**
- Consumes: existing public exports from `@restaurantos/catalog`, `@restaurantos/ordering`, `@restaurantos/kitchen`, and `@restaurantos/outbox`.
- Produces: active `/v1/tenants/:tenantId/menu`, order-list, KDS snapshot, and public-menu routes; `createOutboxRecord(event, eventId)` that maps metadata to Prisma columns.

- [ ] **Step 1: Write the failing outbox mapping tests**

Test that `createOutboxRecord` writes `locationId` and a non-empty `correlationId` as envelope columns, keeps the business payload unchanged, and falls back to `eventId` when no request correlation is supplied.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm --filter @restaurantos/outbox test -- src/index.test.ts`

Expected: FAIL because `createOutboxRecord` does not exist.

- [ ] **Step 3: Implement the minimal outbox mapping fix**

Add `createOutboxRecord(event: OutboxEventInput, eventId: Uuid)` and have `PrismaOutboxWriter.append` pass its output to Prisma. Metadata must not be duplicated into `payload`.

- [ ] **Step 4: Register feature modules**

Each feature module imports `IdentityModule` and declares only its own HTTP controller. Import the three modules from `AppModule.forRoot` and declare the corresponding workspace dependencies in `apps/api/package.json`.

- [ ] **Step 5: Verify and commit**

Run: `pnpm install && pnpm --filter @restaurantos/outbox test && pnpm --filter @restaurantos/api typecheck && pnpm --filter @restaurantos/outbox typecheck`

Commit: `fix(api): activate operational routes and outbox envelope`

### Task 2: Build the Server-Only Operations Snapshot

**Files:**
- Create: `apps/web/lib/operations.ts`
- Create: `apps/web/lib/operations.test.ts`
- Create: `apps/web/lib/operations.server.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `GET /v1/me`, locations, management menu, orders, and KDS snapshot endpoints.
- Produces: `loadOperationsSnapshot(): Promise<OperationsState>` where the union is `ready | needs_setup | disconnected`, and `summarizeOperations(input): OperationsSummary` uses minor-unit strings.

- [ ] **Step 1: Write failing state and summary tests**

Cover a ready snapshot, no membership, no location, malformed response, disconnected fetch, order counts by status, unavailable product count, active kitchen tickets, and a gross-minor total larger than `Number.MAX_SAFE_INTEGER`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm --filter @restaurantos/web test -- lib/operations.test.ts`

Expected: FAIL because the operations module does not exist.

- [ ] **Step 3: Implement pure parsers and summary calculation**

Keep all monetary arithmetic in `bigint`. Return stable typed states rather than throwing API errors into the page.

- [ ] **Step 4: Implement the server-only API client**

Read `RESTAURANTOS_DEV_USER_ID` only on the server, send it as `x-user-id` in development, select only a tenant returned by `/me`, select its first authorized location, and use `cache: "no-store"` on every private request.

- [ ] **Step 5: Verify and commit**

Run: `pnpm --filter @restaurantos/web test && pnpm --filter @restaurantos/web typecheck`

Commit: `feat(web): add tenant-safe operations snapshot`

### Task 3: Replace the Root Page with the Manager Operations Console

**Files:**
- Create: `apps/web/app/about/page.tsx`
- Create: `apps/web/components/operations/operations-shell.tsx`
- Create: `apps/web/components/operations/stat-card.tsx`
- Create: `apps/web/components/operations/order-queue.tsx`
- Create: `apps/web/components/operations/setup-state.tsx`
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/lib/i18n.ts`
- Test: `apps/web/components/operations/operations-shell.test.tsx`

**Interfaces:**
- Consumes: `OperationsState` and the existing `LanguageSwitcher`.
- Produces: `/` as the manager dashboard and `/about` as the preserved public marketing page.

- [ ] **Step 1: Add failing dashboard rendering tests**

Use `react-dom/server` against the real component. Assert that both locales render a named navigation landmark and the four supplied metrics; assert that `disconnected` renders recovery guidance and does not render zero-valued metric cards.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm --filter @restaurantos/web test -- components/operations/operations-shell.test.tsx`

Expected: FAIL because the operations shell does not exist.

- [ ] **Step 3: Preserve the current marketing page at `/about`**

Move its server component without changing the public-menu route or locale cookie behavior.

- [ ] **Step 4: Implement the operational shell**

Render branch context, four evidence-backed metrics, a recent-order queue, quick navigation to Menu/Orders/Kitchen, and an explicit last-sync/disconnected indicator. On `needs_setup` or `disconnected`, render only truthful recovery guidance.

- [ ] **Step 5: Verify accessibility and responsive layout**

Keyboard focus must reach language, navigation, and quick actions in logical order; mobile layout must keep all actions at least 44px and avoid horizontal overflow.

- [ ] **Step 6: Verify and commit**

Run: `pnpm --filter @restaurantos/web test && pnpm --filter @restaurantos/web lint && pnpm --filter @restaurantos/web typecheck && pnpm --filter @restaurantos/web build`

Commit: `feat(web): add bilingual manager operations dashboard`

### Task 4: Real-Stack Verification, Documentation, and Merge

**Files:**
- Modify: `README.md`
- Modify: `progress.md`

**Interfaces:**
- Consumes: completed API modules and dashboard.
- Produces: reproducible local run instructions and a verified merge commit.

- [ ] **Step 1: Start the real local dependencies and seed**

Run: `docker compose up -d postgres redis minio && pnpm db:generate && pnpm db:migrate && pnpm db:seed`

Set the printed synthetic user ID as `RESTAURANTOS_DEV_USER_ID` for the local web process; do not commit it.

- [ ] **Step 2: Verify the API boundary**

Run health, `/v1/me`, locations, menu, orders, and KDS curl requests with the synthetic `x-user-id`. Expected: 2xx with tenant-scoped data; unauthorized and foreign-tenant probes return no data.

- [ ] **Step 3: Run the full automated checks**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`

Expected: zero failures. Also run the real PostgreSQL tenant isolation suite.

- [ ] **Step 4: Run browser smoke tests**

Verify Persian RTL and German LTR, dashboard ready state, disconnected state, mobile width, no console errors, and that `/r/demo-mitte` remains reachable.

- [ ] **Step 5: Update documentation and commit**

Commit: `docs: document manager dashboard workflow`

- [ ] **Step 6: Merge only after green verification**

Push `codex/manager-dashboard`, merge it into `chatbox/catalog-slice` with `--no-ff`, rerun web tests plus workspace typecheck on the merged branch, and push the target branch. Do not delete the feature branch until the merge verification is green.
