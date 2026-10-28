# ADR-0001: Tenant Isolation via Shared Schema + RLS

- **Status:** Accepted
- **Date:** 2026-10-28
- **Spec:** RestaurantOS.md §7.5, §13

## Context

Multi-tenant SaaS with a small team. Options: dedicated DB per tenant,
schema-per-tenant, or shared schema with `tenant_id`.

## Decision

Shared database / shared schema with:

1. Composite primary keys `(tenant_id, id)` on every tenant-owned table —
   cross-tenant FKs are structurally impossible.
2. `ENABLE` + `FORCE ROW LEVEL SECURITY` with a policy bound to the
   transaction-local setting `app.tenant_id`.
3. All application queries run inside `withTenantTransaction(ctx, fn)`, which
   sets `app.tenant_id` via `set_config(..., true)` (transaction-local, safe
   on pooled connections).
4. Separate PostgreSQL roles: `restaurant_migration` owns objects;
   `restaurant_app` (runtime) has DML only and no RLS bypass.
5. The tenant id from a URL is only a *selector*; an
   `AuthorizedTenantContext` is built only after membership verification.

## Consequences

- RLS is a defense-in-depth layer, not the only control: authorization and
  location scoping still happen in application code.
- The outbox relay and reporting rebuilds are cross-tenant by design and use
  `withSystemTransaction` — every call site is reviewed and logged.
- A compromised app server can set any tenant context (spec §7.5); RLS does
  not mitigate that — it limits blast radius of bugs and accidents.
- Dedicated deployments remain possible for Enterprise contracts later.

## Alternatives rejected

- Schema-per-tenant: migration fan-out and pool complexity for 10→N tenants.
- Dedicated DB per tenant from day one: operational cost without a paying
  Enterprise requirement yet.
