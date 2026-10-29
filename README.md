# RestaurantOS

SaaS عملیاتی برای هماهنگ‌کردن سفارش، آشپزخانه، فروش و موجودی رستوران — بر اساس سند `RestaurantOS.md` (نسخه 1.0).

**معماری:** Modular Monolith — یک NestJS API، یک Worker، یک PostgreSQL (با RLS)، Redis/BullMQ برای Jobها، Next.js برای وب.

## وضعیت فعلی

| Slice | وضعیت |
|---|---|
| Foundation (workspace, CI-ready layout, Docker) | ✅ |
| Tenant Slice (Tenant/Location/Membership + RLS + TenantContext) | ✅ |
| Outbox Relay (Worker, SKIP LOCKED, At-least-once) | ✅ مکانیک پایه |
| Catalog Slice | ⬜ بعدی |
| Order Slice | ⬜ |
| Kitchen Slice (KDS + SSE) | ⬜ |
| Payment Slice (Stripe Sandbox + Webhook Inbox) | ⬜ |
| Reporting Slice | ⬜ |
| Web App (Next.js) | 🟡 صفحه معرفی + منوی عمومی QR + سبد محلی |

## اجرای محلی

پیش‌نیاز: Node 22+، pnpm 9+، Docker.

```bash
cp .env.example .env
docker compose up -d postgres redis minio
pnpm install
pnpm db:generate
pnpm db:migrate          # اولین اجرا migration اولیه را می‌سازد
pnpm db:seed             # خروجی: x-user-id, tenantId, locationId تستی

pnpm dev:api             # http://localhost:3001/v1/health
pnpm dev:worker          # outbox relay
pnpm dev:web             # http://localhost:3000
```

### تست سریع Tenant Slice

```bash
# با مقادیر خروجی seed:
curl -s http://localhost:3001/v1/me -H "x-user-id: <USER_ID>" | jq

curl -s "http://localhost:3001/v1/tenants/<TENANT_ID>/locations" \
  -H "x-user-id: <USER_ID>" | jq

curl -s -X POST "http://localhost:3001/v1/tenants/<TENANT_ID>/locations" \
  -H "content-type: application/json" -H "x-user-id: <USER_ID>" \
  -d '{"name":"Westend"}' | jq
```

> **احراز هویت در محیط dev:** هدر `x-user-id` موقت است تا Tenant Slice قبل از اتصال OIDC قابل تمرین باشد. جایگزینی با OIDC در کد (`session.guard.ts`) مشخص شده است.

## قواعد مرزبندی (الزامی — spec §4.2)

1. هر ماژول در `packages/modules/<name>` صاحب جداول خودش است؛ دسترسی متقابل فقط از طریق Application Service یا Event.
2. `public.ts` تنها نقطه ورود مجاز هر ماژول است.
3. Shared Kernel فقط Money، ID، Clock، TenantContext و Event Envelope دارد.
4. تغییر state + Outbox در یک Transaction واحد؛ تماس شبکه داخل Transaction طولانی ممنوع.
5. همه Queryهای tenant-owned فقط داخل `withTenantTransaction`.
6. پول همیشه `bigint` minor units + `char(3)` currency؛ هرگز float.

## ساختار

دقیقاً مطابق بخش ۱۷ سند: `apps/{web,api,worker}`، `packages/modules/*` (لایه‌های domain/application/infrastructure/presentation + `public.ts`)، `packages/{shared-kernel,contracts,ui,config}`، `database/{prisma,migrations,seeds}`، `tests/*`، `docs/adr`.

## مستندات

- `RestaurantOS.md` — سند مرجع محصول و معماری
- `docs/adr/0001-tenant-isolation.md` — تصمیم ایزولیشن Tenant
