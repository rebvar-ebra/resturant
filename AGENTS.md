# RestaurantOS — Agent & Developer Guidelines

Source of truth: `RestaurantOS.md` (Persian spec, v1.0). When in doubt, follow the spec.

## Non-negotiables

1. **Module boundaries** (spec §4.2): cross-module imports only via `packages/modules/<name>/public.ts`. Never import another module's `domain/`, `application/`, `infrastructure/` or `presentation/` paths directly.
2. **Tenant isolation** (spec §7.5, §13): every query on tenant-owned tables runs inside `PrismaService.withTenantTransaction(ctx, fn)`. `withSystemTransaction` is for outbox relay / cross-tenant jobs only and must be justified in review.
3. **Atomicity** (spec §4.2.4): state change + `outbox_events` insert in ONE transaction. No network calls inside long transactions.
4. **Money** (spec §8.3, §16.1): `bigint` minor units + ISO currency, never float. Tax split via shared-kernel `splitGrossInclusive` (gross-inclusive, half-up rounding).
5. **IDs** generated in application code (`shared-kernel/id.ts`), never DB-side.
6. **Events** (spec §6.2): past-tense `type.v1` names, minimal payload (no PII/secrets), consumers dedupe via `consumer_inbox`.
7. **Errors** (spec §16.1): stable model `{ error: { code, message, requestId, details? } }`; forbidden tenant data returns 404, never leak existence.
8. **Config** fails fast at startup (`@restaurantos/config`); no secrets in frontend namespaces or in git.

## Commands

```bash
pnpm install
docker compose up -d postgres redis minio
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev:api        # :3001
pnpm dev:worker
pnpm typecheck      # whole workspace
```

## Stack (spec §5)

NestJS 10 · Prisma 5 · PostgreSQL 16 (RLS) · Redis 7/BullMQ · Next.js + Tailwind · pnpm workspace · TypeScript strict.

## Testing (spec §19)

Vitest for domain/application, real PostgreSQL for isolation tests (a query without tenant context MUST return zero rows), Playwright for user flows later.

## Current phase

Foundation + Tenant Slice done. Next: Catalog Slice (Product → Modifier → Publish → Public Menu), then Order Slice. See README status table.
