# RestaurantOS
## سند جامع محصول، کسب‌وکار و معماری SaaS مدیریت رستوران

- **نسخه:** 1.0 — طرح بازسازی‌شده و توسعه‌یافته برای اجرا
- **تاریخ تدوین و بررسی منابع:** 2026-10-28
- **زبان:** فارسی با نام‌های فنی English
- **بازار مفروض شروع:** رستوران‌های مستقل و گروه‌های کوچک چندشعبه‌ای در آلمان؛ توسعه بعدی به بازارهای دیگر
- **مخاطب:** بنیان‌گذار، Product Manager، تیم Engineering، شریک POS و مشاور مالیاتی
- **وضعیت:** مشخصات پیشنهادی؛ تصمیم‌های تجاری، تأمین‌کنندگان و ظرفیت‌ها باید در پایلوت تأیید شوند.

> **شفافیت درباره منبع:** گفت‌وگوی مرجع «ایده های کارآفرینی برتر» با شناسه `6ae130f3-0fec-83ed-9f51-2e9e468eb58c` بازیابی شد، اما پاسخ‌های معماری قبلی فقط به شکل ارجاع داخلی `chatgpt-content-reference` برگشتند و متن آن‌ها قابل خواندن نبود. بنابراین این فایل بازنویسی لفظ‌به‌لفظ یا تضمین حفظ تصمیم‌های قبلی نیست؛ طرحی کامل است که بر اساس تمام سرفصل‌های درخواست‌شده بازسازی و گسترش یافته است. انتخاب‌های جدید با عنوان «پیشنهاد» یا «فرض» بیان شده‌اند.

> **نحوه استفاده:** بخش‌های محصول و MVP مبنای تصمیم کسب‌وکار هستند؛ بخش‌های Domain، Schema و API مبنای طراحی پیاده‌سازی‌اند. نمونه‌های کد آموزشی‌اند و جای Application کامل، Migration تولیدی یا تأیید انطباق قانونی را نمی‌گیرند. برای دیدن نمودارها، فایل را در Markdown Viewer دارای پشتیبانی Mermaid باز کنید.

## فهرست

1. [چشم‌انداز و ارزش محصول](#vision)
2. [مشتری، بازار و اعتبارسنجی](#market)
3. [ماژول‌ها و اولویت‌ها](#modules)
4. [معماری Modular Monolith](#architecture)
5. [Technology Stack](#stack)
6. [Domain Boundaries و رویدادها](#domains)
7. [Database و Schema](#database)
8. [جریان سفارش، پرداخت و آشپزخانه](#workflow)
9. [Integrations و سخت‌افزار](#integrations)
10. [Inventory و خرید](#inventory)
11. [Analytics و شاخص‌ها](#analytics)
12. [AI و اتوماسیون](#ai)
13. [Multi-tenancy و کنترل دسترسی](#tenancy)
14. [Security و Privacy](#security)
15. [GDPR و الزامات POS آلمان](#compliance)
16. [API و قراردادها](#api)
17. [Repository و استاندارد توسعه](#repository)
18. [DevOps، بازیابی و عملیات](#devops)
19. [کیفیت و معیار پذیرش](#quality)
20. [MVP Roadmap](#roadmap)
21. [Pricing و مدل مالی](#pricing)
22. [ریسک‌ها و تصمیم‌های باز](#risks)
23. [گام‌های اجرایی](#implementation)
24. [منابع و واژه‌نامه](#references)

<a id="vision"></a>
## 1. چشم‌انداز و ارزش محصول

**RestaurantOS یک SaaS عملیاتی برای هماهنگ‌کردن سفارش، آشپزخانه، فروش و موجودی رستوران است.** هدف این است که مدیر در یک نمای قابل اعتماد بداند چه سفارشی وارد شده، چه چیزی باید آماده شود، چه مبلغی تسویه شده و کدام ماده اولیه رو به اتمام است.

مسئله اصلی، پراکندگی داده بین صندوق، تلفن، کانال سفارش آنلاین، فایل موجودی و گزارش حسابدار است. پیامد آن ورود تکراری سفارش، اشتباه آشپزخانه، عدم تطبیق پول، دورریز و تصمیم‌گیری با گزارش دیرهنگام است. محصول باید این اتلاف‌ها را با اندازه‌گیری قبل و بعد کاهش دهد.

### 1.1 پیشنهاد ارزش

| نقش | کار اصلی | ارزش قابل سنجش |
|---|---|---|
| Owner | دیدن فروش و سود تقریبی | گزارش روزانه روشن و تطبیق پرداخت |
| Manager | اداره شیفت و منو | تغییر دسترس‌پذیری و رسیدگی به استثناها |
| Cashier / Waiter | ثبت و پیگیری سفارش | ورود سریع و اصلاح کنترل‌شده |
| Kitchen | آماده‌سازی به ترتیب | KDS با وضعیت و زمان انتظار |
| Inventory Manager | کنترل مواد | مصرف نظری، شمارش و ثبت ضایعات |
| Customer | سفارش و پرداخت | منوی واضح، قیمت نهایی و وضعیت سفارش |
| Accountant | دریافت داده معتبر | خروجی نسخه‌دار و قابل ردیابی |

### 1.2 وعده نسخه اول

«یک صف سفارش قابل اعتماد، وضعیت مشترک آشپزخانه و سالن، و گزارش فروش تطبیق‌پذیر برای هر شعبه.»

تمایز پیشنهادی، راه‌اندازی ساده، چندزبانه‌بودن، اتصال عملی به POS موجود و شفافیت عملیات است. وجود تقاضا برای این تمایز هنوز فرضیه است؛ ادعای برتری نسبت به رقبا بدون مقایسه میدانی نمی‌شود.

### 1.3 محدوده محصول

- سفارش حضوری، QR، Pickup و در مراحل بعد Delivery.
- منو، دسته، Modifier، Allergen، ساعات فروش و موجودبودن.
- KDS، صف کار، چاپ با Adapter و گزارش خطای تحویل.
- پرداخت از طریق PSP و اتصال به POS؛ تفکیک وضعیت مالی از وضعیت آماده‌سازی.
- موجودی مبتنی بر Recipe و گزارش عملیاتی.
- اشتراک SaaS، شعبه‌ها، کاربران و دسترسی‌ها.

موارد خارج از MVP: ساخت PSP، نگهداری پول مشتری، Payroll کامل، Marketplace عمومی، Fleet Management، ERP جامع، معماری Microservices و مدل AI اختصاصی. صندوق مستقل آلمان یک پروژه محصول و انطباق جداگانه است.

<a id="market"></a>
## 2. مشتری، بازار و اعتبارسنجی

### 2.1 Ideal Customer Profile

**فرض شروع:** رستوران، Café یا Takeaway دارای 1 تا 5 شعبه، منوی نسبتاً ثابت و مدیر درگیر عملیات روزانه. شعبه‌ای با POS دارای API و اینترنت پایدار، پایلوت کم‌ریسک‌تری است. کسب‌وکار بسیار بزرگ با ERP و رستوران فاقد زیرساخت دیجیتال، مشتری اول مناسبی نیستند.

مقیاس فرضی برای طراحی پایلوت: 10 Tenant، هرکدام حداکثر 5 شعبه، حدود 300 سفارش روزانه به‌ازای شعبه و Burst حدود 10 ثبت سفارش در ثانیه در کل محیط. این اعداد پیش‌بینی فروش یا Benchmark نیستند؛ Load Test باید آن‌ها را اعتبارسنجی کند.

### 2.2 تحقیق اولیه

1. مصاحبه با 10 مدیر و مشاهده حداقل دو شیفت واقعی.
2. استخراج سه مشکل پرتکرار با هزینه زمانی یا مالی قابل اندازه‌گیری.
3. ثبت POS فعلی، قرارداد، هزینه، نوع رسید و امکان دسترسی API.
4. بررسی پنج رقیب در بازار هدف از نظر قیمت روز، Offline، TSE، Integrations و هزینه مهاجرت؛ پیش از تصمیم خرید یا ادعای بازار دوباره تحقیق شود.
5. گرفتن تعهد پایلوت از سه مشتری با مسئول مشخص، زمان نصب و معیار موفقیت.
6. اجرای پایلوت ابتدا برای یک شعبه با مسیر بازگشت به عملیات قبلی.

### 2.3 معیار موفقیت تجاری پیشنهادی

| شاخص | تعریف | هدف پایلوت پیشنهادی |
|---|---|---|
| Activation | نخستین منو و سفارش موفق | حداکثر 48 ساعت پس از آماده‌شدن داده و اتصال |
| Adoption | سفارش‌های مجاز عبوری از سیستم | بیش از 80% در کانال پایلوت |
| Order accuracy | سفارش بدون اصلاح ناشی از ورود اشتباه | اندازه‌گیری نسبت به Baseline دو هفته قبل |
| Reconciliation | پرداخت‌های بدون اختلاف توضیح‌نداده | 100% در بستن روز پایلوت |
| Willingness to pay | پذیرش قرارداد پس از آزمایش | دست‌کم دو مشتری از سه پایلوت |
| Support burden | زمان پشتیبانی برای هر شعبه | روند کاهشی هفته‌به‌هفته |

اهداف فوق معیار تصمیم داخلی‌اند؛ نتیجه تضمین‌شده نیستند. اگر اتصال به POS هزینه بسیار زیادی دارد، محدودکردن تعداد POSهای پشتیبانی‌شده از افزودن Feature جدید مهم‌تر است.

<a id="modules"></a>
## 3. ماژول‌ها و اولویت‌ها

**P0:** لازم برای پایلوت عملیاتی. **P1:** پس از پایلوت پایدار. **P2:** پس از اثبات تقاضا.

| Module | مسئولیت و خروجی | اولویت |
|---|---|---|
| Identity & Access | Login، Membership، RBAC، Device Session | P0 |
| Tenants & Locations | رستوران، شعبه، Timezone، تنظیمات | P0 |
| Menu & Catalog | دسته، محصول، قیمت، Modifier، Allergen | P0 |
| Ordering | ثبت سفارش، Snapshot قیمت، اصلاح و لغو | P0 |
| Kitchen / KDS | Ticket، ایستگاه، آماده‌سازی و تحویل | P0 |
| Payments | PSP، Cash از مسیر مجاز POS، Refund و تطبیق | P0 محدود |
| Fiscal Bridge | اتصال به مسیر مالیاتی POS منتخب | P0 برای استفاده مالی واقعی |
| Reporting | فروش روزانه و اختلاف پرداخت | P0 |
| SaaS Billing | Subscription و Entitlement | P0 ساده؛ حتی با عملیات دستی اولیه |
| Inventory | Recipe، Movement، Waste و Stocktake | P1 |
| Purchasing | Supplier، Purchase Order، Goods Receipt | P1 |
| Reservations | ظرفیت میز، رزرو و No-show | P1 |
| CRM & Loyalty | مشتری اختیاری، امتیاز و رضایت بازاریابی | P1 |
| Delivery Channels | دریافت و همگام‌سازی یک Aggregator منتخب | P1 |
| Multi-location | منوی مرکزی، Override شعبه، گزارش مقایسه‌ای | مدل داده P0، امکانات کامل P1 |
| Workforce | شیفت و حضور بدون Payroll کامل | P2 |
| AI Assistant | خلاصه، پیش‌بینی و پیشنهاد | P2؛ آزمایش محدود پس از داده معتبر |

### 3.1 تجربه‌های اصلی

- **مدیر:** ساخت شعبه ← Import منو ← اتصال POS ← دعوت کارکنان ← سفارش آزمایشی ← شروع شیفت.
- **مشتری QR:** ورود به شعبه معتبر ← منو ← انتخاب Modifier ← قیمت نهایی ← ثبت ← پرداخت طبق Policy ← وضعیت.
- **آشپزخانه:** Ticket جدید ← تأیید ← Preparing ← Ready؛ سفارش حذف‌شده همچنان با سابقه اصلاح دیده شود.
- **صندوقدار:** مشاهده مانده ← ثبت پرداخت مجاز ← تطبیق ← ارائه رسید مالیاتی از مسیر تأییدشده.
- **پایان روز:** رفع اختلاف ← ثبت شمارش Cash در صورت کاربرد ← Export ← قفل دوره یا ثبت اصلاحیه.

رابط کاربری باید Touch-friendly، چندزبانه، مناسب نور آشپزخانه، قابل کار با Keyboard و دارای نمایش صریح قطع اتصال باشد. Allergen تأییدشده و قیمت نهایی باید پیش از ثبت سفارش قابل مشاهده باشند.

<a id="architecture"></a>
## 4. معماری Modular Monolith

### 4.1 تصمیم اصلی

یک Backend با ماژول‌های مستقل منطقی، یک PostgreSQL و دو Process اجرایی `api` و `worker` پیشنهاد می‌شود. API و Worker از یک Codebase و یک Release استفاده می‌کنند. استقلال Process به معنای Microservice نیست.

این انتخاب برای تیم کوچک، Transactionهای ساده‌تر، Debugging روشن و هزینه عملیاتی کمتر مناسب است. مرز ماژول‌ها از ابتدا حفظ می‌شود تا در صورت نیاز واقعی، بخش‌هایی مانند Integration Ingestion یا Analytics جدا شوند.

```mermaid
flowchart TB
    Guest[Customer QR Web] --> Edge[HTTPS / CDN / Rate Limit]
    Staff[Staff Web / KDS] --> Edge
    Admin[Owner Dashboard] --> Edge
    Edge --> API[RestaurantOS API]
    subgraph App[Modular Monolith - shared release]
        API --> Auth[Identity and Tenancy]
        API --> Menu[Catalog]
        API --> Orders[Ordering]
        API --> Pay[Payments]
        API --> Kitchen[Kitchen]
        API --> Stock[Inventory]
        API --> Reports[Reporting]
        Worker[Background Worker]
    end
    API --> PG[(PostgreSQL + Outbox)]
    PG --> Worker
    Worker --> Redis[(Redis / Job Queue)]
    Worker --> Providers[POS / PSP / Messaging]
    Providers --> Hooks[Signed Webhook Ingress]
    Hooks --> API
    Worker --> Object[(Private Object Storage)]
    Worker --> Live[SSE Delivery]
    Live --> Staff
```

### 4.2 قواعد مرزبندی

1. هر ماژول Owner جداول و قواعد خودش است؛ ماژول دیگر از Application Service یا قرارداد Event استفاده می‌کند.
2. Repository ماژول دیگر Import نمی‌شود. Shared Kernel فقط Money، ID، Clock، TenantContext و Event Envelope دارد.
3. عملیات حیاتی در یک PostgreSQL Transaction اجرا می‌شوند؛ تماس شبکه داخل Transaction طولانی انجام نمی‌شود.
4. برای اثر جانبی بیرونی، تغییر محلی و Outbox در یک Commit ثبت می‌شوند.
5. Reporting از Read Model استفاده می‌کند و منبع تغییر سفارش نیست.
6. قواعد Domain در Controller، UI یا Queue Handler تکرار نمی‌شوند.
7. رویداد ثبت‌شده Fact گذشته است؛ درخواست انجام کار Command است و ممکن است رد شود.

### 4.3 استخراج احتمالی Microservice

فقط در صورت شواهدی مانند تیم مستقل، نیاز مقیاس متفاوت، Failure Isolation ضروری یا محدودیت Contractual اقدام شود. ابتدا Query، Index، Pool، Job و ظرفیت Database بررسی شوند. Kafka و Kubernetes برای MVP پیش‌فرض نیستند.

<a id="stack"></a>
## 5. Technology Stack پیشنهادی

| لایه | انتخاب | دلیل و قید |
|---|---|---|
| Frontend | React + Next.js + TypeScript | Dashboard و Customer Web؛ انتخاب Rendering برای هر مسیر |
| UI | Tailwind CSS + Accessible Components | طراحی ساده، سازگار و قابل استفاده با لمس |
| Backend | Node.js LTS + NestJS | ماژول‌بندی، Validation، OpenAPI و DI |
| Database | PostgreSQL | Transaction، Constraint، JSONB محدود و RLS |
| Data Access | Prisma + SQL Migration بازبینی‌شده | سرعت توسعه؛ SQL مستقیم برای Lock و RLS در صورت نیاز |
| Jobs | BullMQ + Redis | Retry و Jobهای غیرهمزمان؛ Outbox در PostgreSQL منبع دوام است |
| Realtime | SSE + REST Commands | وضعیت KDS یک‌طرفه؛ WebSocket فقط با نیاز دوطرفه واقعی |
| Files | S3-compatible Private Storage در EU | رسید، Export و مستندات با URL کوتاه‌عمر |
| Auth | OIDC Provider یا پیاده‌سازی با کتابخانه معتبر | MFA مدیر، Rotation و Session Revocation |
| Payments | PSP منتخب مانند Stripe | Hosted Checkout / Elements؛ قابلیت کشور و قرارداد تأیید شود |
| Observability | OpenTelemetry + Metrics + Error Tracking | Trace سفارش تا Integration با حذف PII |
| Packaging | Docker + pnpm Workspace | ساخت تکرارپذیر و مشترکات محدود |
| Delivery | CI Pipeline + Managed Container Runtime | محیط EU و Managed PostgreSQL برای شروع |
| Testing | Vitest/Jest، PostgreSQL واقعی، Playwright | Domain، Isolation، Integration و جریان کاربر |

**Version Policy:** نسخه پشتیبانی‌شده و سازگار هنگام شروع انتخاب، در Lockfile و Image Digest ثبت و در CI آزمایش شود. این سند ادعای «آخرین نسخه» برای Frameworkها ندارد. توسعه، Staging و Production نسخه Major یکسان Database داشته باشند.

Secrets فقط Server-side هستند. Cache مسیرهای خصوصی باید با Tenant و Location تفکیک شود؛ Cache عمومی Next.js نباید پاسخ خصوصی مشترک بسازد.

<a id="domains"></a>
## 6. Domain Boundaries و رویدادها

### 6.1 Bounded Contextها

| Context | Aggregate / داده تحت مالکیت | قواعد مهم |
|---|---|---|
| Identity | User، Membership، Role، Device | دسترسی در Tenant و Location معتبر |
| Organization | Tenant، Location، Business Settings | Timezone و Currency مشخص |
| Catalog | MenuVersion، Product، ModifierGroup | قیمت و Allergen نسخه‌دار |
| Ordering | Order، OrderItem، Adjustment | Snapshot و انتقال وضعیت مجاز |
| Kitchen | KitchenTicket، Station، TicketItem | Dispatch یکتا و نمایش اصلاحات |
| Payments | PaymentAttempt، Allocation، Refund | ثبت دوباره ممنوع، تطبیق با PSP |
| Fiscal | FiscalTransaction، Receipt، Correction | سابقه غیرقابل بازنویسی و Adapter |
| Inventory | Ingredient، Recipe، StockMovement | Ledger قابل حسابرسی |
| Purchasing | Supplier، PurchaseOrder، Receipt | فقط دریافت کالا موجودی را زیاد می‌کند |
| Customers | CustomerProfile، Consent، LoyaltyLedger | مهمان بدون اجبار به حساب |
| Reporting | SalesProjection، DailyRollup | Projection بازسازی‌پذیر |
| Billing | Subscription، Plan، Entitlement | از پرداخت غذای رستوران جداست |
| Integrations | Connector، Inbox، Mapping، SyncCursor | محدودسازی Rate و Idempotency |

### 6.2 رویدادها و مصرف‌کنندگان

| Event | Producer | Consumer / اثر |
|---|---|---|
| `menu.published.v1` | Catalog | Cache و همگام‌سازی کانال |
| `order.placed.v1` | Ordering | Notification و Projection؛ Dispatch طبق Policy |
| `order.accepted.v1` | Ordering | رزرو موجودی و ساخت KDS Ticket |
| `order.item_preparation_started.v1` | Kitchen | مصرف مواد طبق Recipe Snapshot |
| `order.ready.v1` | Kitchen | اعلان به سالن یا مشتری |
| `order.cancelled.v1` | Ordering | آزادکردن رزرو؛ بررسی Waste و Refund |
| `payment.succeeded.v1` | Payments | Allocation، تطبیق و بررسی پذیرش سفارش Prepaid |
| `refund.succeeded.v1` | Payments | Ledger مالی و Projection |
| `fiscal.receipt_issued.v1` | Fiscal | ارائه رسید و Archive |
| `inventory.adjusted.v1` | Inventory | Alert و Projection |
| `subscription.entitlement_changed.v1` | Billing | کنترل Featureهای غیرحیاتی |

اطلاعات Event حداقل باشد؛ Email، شماره کارت و متن حساس در Event عمومی قرار نگیرد. Payloadهای قدیمی بدون تغییر معنی پردازش شوند. تغییر ناسازگار نیازمند نسخه جدید است.

```json
{
  "eventId": "c88f99ad-9396-4a9d-8c8e-89f50770699b",
  "eventType": "order.accepted.v1",
  "tenantId": "10000000-0000-4000-8000-000000000001",
  "locationId": "20000000-0000-4000-8000-000000000001",
  "aggregateId": "30000000-0000-4000-8000-000000000001",
  "aggregateVersion": 3,
  "occurredAt": "2026-10-28T11:30:00Z",
  "correlationId": "req-8d09",
  "payload": { "orderId": "30000000-0000-4000-8000-000000000001" }
}
```

### 6.3 Outbox / Inbox

```mermaid
sequenceDiagram
    participant A as API
    participant D as PostgreSQL
    participant W as Outbox Worker
    participant C as Consumer
    A->>D: BEGIN: Order change + Outbox insert
    D-->>A: COMMIT
    W->>D: Claim batch with lease
    W->>C: Deliver event
    C->>D: BEGIN: Inbox dedupe + local effect
    D-->>C: COMMIT
    C-->>W: ACK
    W->>D: Mark delivery complete
```

Delivery از نوع **At-least-once** است. Worker ممکن است پس از ارسال و قبل از ثبت ACK خاموش شود؛ بنابراین Consumer باید `(consumer_name, event_id)` یکتا داشته باشد. Exactly-once برای تماس بیرونی ادعا نمی‌شود. برای چند Consumer، وضعیت Delivery برای هر Consumer جدا ثبت شود؛ یک `published_at` مشترک جای Fan-out مطمئن را نمی‌گیرد.

- Claim کوتاه با `FOR UPDATE SKIP LOCKED` و Lease Expiry؛ Lock هنگام HTTP باز نماند.
- Retry با Exponential Backoff و Jitter، محدودیت تعداد و Dead Letter.
- ترتیب برای هر Aggregate با `aggregateVersion`؛ رویداد آینده Buffer یا Re-fetch شود.
- Inbox و اثر محلی در یک Transaction؛ اثر بیرونی با Command پایدار و Provider Idempotency.
- Replay بدون Email، Refund یا چاپ تکراری؛ هر Side Effect دارای کلید یکتا باشد.

<a id="database"></a>
## 7. Database و Schema

### 7.1 اصول داده

- شناسه‌ها UUID؛ هر جدول متعلق به رستوران دارای `tenant_id` است.
- وابستگی شعبه با Foreign Key مرکب `(tenant_id, location_id)` برقرار می‌شود.
- پول در Minor Unit با `bigint` و Currency ذخیره می‌شود؛ در API به‌صورت رشته برای جلوگیری از خطای JavaScript Number.
- مقدار ماده اولیه `numeric(18,6)` با واحد پایه است؛ تبدیل Unit فقط با ضریب مشخص و سازگار.
- Timestampهای رویداد `timestamptz` و UTC هستند؛ Business Date بر اساس Timezone شعبه و ساعت پایان روز محاسبه می‌شود.
- قیمت، نام، Modifier، Tax Rule و Recipe مربوط به فروش Snapshot می‌شوند.
- گزارش مالی از تراکنش‌های ثبت‌شده و اصلاحیه ساخته می‌شود؛ ویرایش منو تاریخچه را تغییر نمی‌دهد.
- Soft Delete برای داده مرجع؛ حذف یا بازنویسی سند مالی ثبت‌شده مجاز نیست. PII قابل جداسازی است.

### 7.2 مدل ارتباطی خلاصه

```mermaid
erDiagram
    TENANTS ||--o{ LOCATIONS : owns
    TENANTS ||--o{ MEMBERSHIPS : grants
    USERS ||--o{ MEMBERSHIPS : joins
    LOCATIONS ||--o{ ORDERS : receives
    PRODUCTS ||--o{ ORDER_ITEMS : snapshots
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o{ PAYMENT_ALLOCATIONS : settled_by
    PAYMENTS ||--o{ PAYMENT_ALLOCATIONS : allocates
    PAYMENTS ||--o{ REFUNDS : reverses
    ORDERS ||--o{ KITCHEN_TICKETS : dispatches
    ORDERS ||--o{ FISCAL_TRANSACTIONS : records
    PRODUCTS ||--o{ RECIPE_VERSIONS : prepared_from
    RECIPE_VERSIONS ||--|{ RECIPE_LINES : contains
    INGREDIENTS ||--o{ RECIPE_LINES : used_by
    INGREDIENTS ||--o{ STOCK_MOVEMENTS : changes
    LOCATIONS ||--o{ STOCK_MOVEMENTS : stores
```

### 7.3 فهرست جداول لازم

| گروه | جدول‌ها و فیلدهای کلیدی |
|---|---|
| Organization | `tenants`، `locations(timezone,business_day_cutoff,currency)` |
| Access | `users`، `memberships(tenant,user,role)`، `membership_locations`، `device_sessions` |
| Catalog | `products`، `categories`، `menu_versions`، `menu_items`، `modifier_groups`، `modifier_options`، `product_allergens`، `location_product_overrides` |
| Ordering | `orders(status,version,source,total)`، `order_items(snapshot,quantity)`، `order_adjustments`، `order_status_history` |
| Kitchen | `stations`، `kitchen_tickets(order,revision)`، `kitchen_ticket_items(status,started_at,ready_at)` |
| Payments | `payments(provider,account,reference,status)`، `payment_allocations`، `refunds`، `refund_allocations`، `payment_ledger` |
| Fiscal | `fiscal_transactions`، `fiscal_receipts`، `fiscal_corrections`، `cash_sessions` در صورت کاربرد |
| Inventory | `ingredients`، `recipe_versions`، `recipe_lines`، `stock_movements`، `stock_reservations`، `stock_balances`، `stocktakes` |
| Purchasing | `suppliers`، `purchase_orders`، `purchase_order_lines`، `goods_receipts`، `goods_receipt_lines` |
| Customer | `customers`، `consents`، `reservations`، `loyalty_ledger` |
| SaaS | `plans`، `subscriptions`، `entitlements`، `billing_events` |
| Reliability | `outbox_events`، `event_deliveries`، `consumer_inbox`، `webhook_inbox`، `idempotency_keys`، `integration_commands` |
| Operations | `integration_connections`، `external_mappings`، `sync_cursors`، `audit_logs`، `export_jobs`، `daily_sales` |

### 7.4 نمونه SQL هسته

این بلوک یک Schema حداقلی قابل اجرا در PostgreSQL است؛ تمام جدول‌های فهرست بالا را پیاده‌سازی نمی‌کند. IDها در Application ساخته می‌شوند. حساب Migration مالک جدول‌هاست؛ حساب Runtime مالک یا Superuser نیست.

```sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE locations (
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  id uuid NOT NULL,
  name text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  currency char(3) NOT NULL DEFAULT 'EUR',
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE orders (
  tenant_id uuid NOT NULL,
  id uuid NOT NULL,
  location_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN (
    'placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'
  )),
  source text NOT NULL CHECK (source IN ('staff', 'qr', 'pickup', 'channel')),
  currency char(3) NOT NULL,
  gross_minor bigint NOT NULL CHECK (gross_minor >= 0),
  tax_minor bigint NOT NULL CHECK (tax_minor >= 0 AND tax_minor <= gross_minor),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  business_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id, location_id) REFERENCES locations(tenant_id, id)
);

CREATE TABLE order_items (
  tenant_id uuid NOT NULL,
  id uuid NOT NULL,
  order_id uuid NOT NULL,
  product_id uuid,
  name_snapshot text NOT NULL,
  quantity numeric(12,3) NOT NULL CHECK (quantity > 0),
  unit_gross_minor bigint NOT NULL CHECK (unit_gross_minor >= 0),
  line_gross_minor bigint NOT NULL CHECK (line_gross_minor >= 0),
  tax_rate_bps integer NOT NULL CHECK (tax_rate_bps BETWEEN 0 AND 10000),
  line_tax_minor bigint NOT NULL CHECK (line_tax_minor >= 0),
  modifiers_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id, order_id) REFERENCES orders(tenant_id, id)
);

CREATE TABLE outbox_events (
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  event_id uuid NOT NULL,
  aggregate_id uuid NOT NULL,
  aggregate_version integer NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, event_id)
);

CREATE TABLE consumer_inbox (
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  consumer_name text NOT NULL,
  event_id uuid NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, consumer_name, event_id)
);

CREATE INDEX orders_location_created_idx
  ON orders (tenant_id, location_id, created_at DESC, id DESC);
CREATE INDEX orders_active_idx
  ON orders (tenant_id, location_id, status)
  WHERE status IN ('placed', 'accepted', 'preparing', 'ready');
```

`product_id` در این نمونه صرفاً Reference تاریخی اختیاری است. در Migration کامل، FK مرکب به Catalog اضافه شود یا ارتباط با Snapshot و سیاست حذف صریح مدیریت شود. Constraintهای مجموع اقلام، Tax و Allocation به منطق Transaction و آزمون نیاز دارند؛ `CHECK` یک Row جمع جدول دیگر را کنترل نمی‌کند.

### 7.5 RLS نمونه

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

CREATE POLICY orders_tenant_isolation ON orders
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  );

-- داخل همان Connection و Transaction مورد استفاده Query:
BEGIN;
SELECT set_config('app.tenant_id', '10000000-0000-4000-8000-000000000001', true);
SELECT id, status FROM orders ORDER BY created_at DESC LIMIT 20;
COMMIT;
```

Policy مشابه برای **تمام** جدول‌های Tenant-owned لازم است. مقدار Tenant از Session معتبر و Membership تأییدشده می‌آید. Scope شعبه همچنان در Authorization و Query کنترل می‌شود. Context در Connection Pool باید Transaction-local باشد. Superuser و `BYPASSRLS` از RLS عبور می‌کنند و `FORCE` این موضوع را برای آن‌ها رفع نمی‌کند. RLS جلوی Application Server تسخیرشده با اختیار تغییر Context را نمی‌گیرد؛ لایه دفاعی در برابر خطا و دسترسی ناخواسته است. [مستندات رسمی PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### 7.6 Constraint و Index تکمیلی

- یکتایی External Order: `(tenant_id, connector_id, external_order_id)`.
- یکتایی Provider Payment: `(provider, provider_account_id, provider_payment_id)`.
- یکتایی Webhook: `(provider, provider_account_id, provider_event_id)`.
- یکتایی Stock Effect: `(tenant_id, source_type, source_id, ingredient_id, effect_kind)`.
- یکتایی Idempotency: `(tenant_id, actor_scope, route, idempotency_key)` همراه Request Hash.
- Sequence رسید یا شماره نمایشی بر اساس شعبه و سری سند، با تخصیص اتمیک؛ UUID جای شماره قانونی سند نیست.
- Index بر اساس Query واقعی و `EXPLAIN ANALYZE`؛ Partition فقط پس از شواهد حجم.
- Cross-tenant FK در تمام روابط داخلی باید ناممکن باشد؛ UUID تصادفی به‌تنهایی Isolation نیست.

<a id="workflow"></a>
## 8. جریان سفارش، پرداخت و آشپزخانه

### 8.1 وضعیت‌ها مستقل‌اند

یک `status` برای همه چیز کافی نیست. سفارش ممکن است آماده ولی پرداخت‌نشده، لغوشده ولی Refund در انتظار، یا پرداخت‌شده ولی رسید مالیاتی در انتظار باشد.

```mermaid
stateDiagram-v2
    [*] --> placed
    placed --> accepted: Accept policy satisfied
    placed --> cancelled: Reject or expire
    accepted --> preparing: Start preparation
    accepted --> cancelled: Authorized cancel
    preparing --> ready: All required items ready
    preparing --> cancelled: Manager cancel plus waste decision
    ready --> completed: Handover or served
    ready --> cancelled: Exception with audit
    completed --> [*]
    cancelled --> [*]
```

| محور | وضعیت‌های نمونه |
|---|---|
| Order | `placed, accepted, preparing, ready, completed, cancelled` |
| Payment Attempt | `created, requires_action, processing, succeeded, failed, cancelled, unknown` |
| Order Financial Summary | `unpaid, partially_paid, paid, partially_refunded, refunded, overpaid` به‌صورت مشتق‌شده |
| Refund | `requested, processing, succeeded, failed, unknown` |
| Fiscal | `not_started, open, pending_close, issued, failed, requires_review` |
| Integration | `queued, sent, acknowledged, retrying, dead_letter` |

`unknown` به معنای نامعلوم‌بودن نتیجه تماس بیرونی است؛ تا Reconciliation نباید آن را Failed فرض کرد و دوباره پول گرفت.

### 8.2 جریان پایه

1. Client فقط Product، Quantity، Modifier و نوع سرویس را ارسال می‌کند؛ قیمت، Tax و دسترسی از Server محاسبه می‌شود.
2. Tenant، شعبه، ساعات فعالیت، موجودبودن، محدودیت Modifier و سقف سفارش بررسی می‌شود.
3. Quote کوتاه‌عمر با نسخه منو تولید می‌شود. اگر قیمت تغییر کند، مشتری باید قیمت جدید را تأیید کند.
4. درخواست ثبت با `Idempotency-Key`، Request Hash و Scope کاربر یا Guest Session دریافت می‌شود.
5. Order، Item Snapshot، History و Outbox در یک Transaction ثبت می‌شوند؛ Conflict همان Key با Body متفاوت، `409` است.
6. در **Prepaid**، سفارش تا Payment موفق و تأیید ظرفیت پذیرفته نمی‌شود. در **Pay-later** پذیرش با مسئولیت کارمند مجاز انجام می‌شود.
7. Payment Provider از طریق Command پایدار و کلید Idempotency مخصوص همان PaymentAttempt فراخوانی می‌شود.
8. Redirect مرورگر مدرک پرداخت نیست؛ Webhook امضاشده یا Query معتبر PSP نتیجه را تأیید می‌کند.
9. در Transaction، Payment ثبت و به Order تخصیص داده می‌شود؛ پس از برقرارشدن Policy، `order.accepted.v1` منتشر می‌شود.
10. KDS Ticket یکتا ساخته می‌شود؛ Worker و KDS هر دو قابلیت Resync دارند.
11. آغاز آماده‌سازی مصرف مواد را ثبت می‌کند؛ Ready اعلان و Handover، Completed را ایجاد می‌کند.
12. Fiscal Adapter مطابق چرخه قانونی خود از آغاز تا پایان فرایند درگیر است؛ صدور نهایی رسید با وضعیت مالی تطبیق داده می‌شود.
13. پایان روز، مجموع پرداخت، Refund، رسید و Settlement بررسی می‌شود.

**نکته مالیاتی:** مراحل بالا ترتیب تجاری را نشان می‌دهند. شروع Fiscal Transaction ممکن است پیش از پرداخت و در آغاز فرایند لازم باشد؛ امضای TSE را نباید صرفاً به پایان سفارش موکول کرد. نگاشت دقیق را شریک POS برای مسیر واقعی تأیید کند.

```mermaid
sequenceDiagram
    participant C as Customer
    participant A as API
    participant D as Database
    participant P as PSP
    participant W as Worker
    participant K as Kitchen
    C->>A: Place order + Idempotency Key
    A->>D: Order + payment command + outbox
    D-->>A: Commit
    A-->>C: Order ID and pending payment
    W->>P: Create payment with stable key
    P-->>C: Hosted payment UI
    P->>A: Signed webhook
    A->>D: Durable webhook inbox
    A-->>P: 2xx after durable receipt
    W->>D: Validate amount/account + apply payment
    W->>D: Accept eligible order + outbox
    W->>K: Kitchen ticket
    K->>A: Start / ready / complete
    A->>D: State transition + stock effect + outbox
```

### 8.3 Concurrency و Money

- تغییر Order با Optimistic Lock روی `version` یا Row Lock انجام شود؛ دو کاربر نمی‌توانند همزمان اصلاح ناسازگار ثبت کنند.
- PaymentAttempt فعال و رزرو مبلغ مانع ایجاد چند پرداخت ناخواسته برای یک مانده می‌شود؛ Lock محلی تراکنش بیرونی را اتمیک نمی‌کند.
- اگر دو پرداخت بیرونی با وجود کنترل‌ها موفق شدند، هر دو حقیقت مالی ثبت و Overpayment به صف حل اختلاف منتقل شود؛ ثبت دوم نباید گم شود.
- Refundهای همزمان حداکثر مبلغ Refundable را با Lock روی Payment و احتساب Refundهای Pending رزرو کنند.
- جمع Allocationها از Payment موفق بیشتر نباشد و Refund باید به Allocationهای اصلی مربوط شود.
- Split Bill در مدل داده پیش‌بینی شده، اما UI پیچیده آن P1 است؛ MVP می‌تواند پرداخت کامل یا چند Payment با تخصیص مبلغ مشخص داشته باشد.
- Discount روی Tax Groupها با الگوریتم قطعی توزیع شود؛ باقی‌مانده Cent با ترتیب ثابت تخصیص یابد.
- برای Gross-inclusive: `net = round(gross / (1 + rate))` و `tax = gross - net`؛ سطح گردکردن با مسیر حسابداری و POS یکسان باشد.
- Tip، Service Charge، Voucher، Deposit و Delivery Fee گروه مالیاتی مستقل و قواعد تأییدشده می‌خواهند.

### 8.4 نمونه Use Case اتمیک

Pseudocode زیر الگوی Boundary را نشان می‌دهد. `lockOrder` از Row Lock، `transition` از Domain Rule و `withTenantTransaction` از Context معتبر استفاده می‌کند.

```ts
async function acceptOrder(ctx: AuthorizedTenantContext, orderId: string) {
  return db.withTenantTransaction(ctx, async (tx) => {
    const order = await tx.orderRepository.lockOrder(ctx.tenantId, orderId);
    permissions.require(ctx, "order.accept", order.locationId);
    if (order.status === "accepted") return order;
    order.assertAcceptable();
    await paymentPolicy.assertSatisfied(tx, order);
    order.transition("accepted");
    await tx.orderRepository.save(order);
    await tx.outbox.append({
      eventId: ids.uuid(),
      tenantId: ctx.tenantId,
      aggregateId: order.id,
      aggregateVersion: order.version,
      eventType: "order.accepted.v1",
      payload: { orderId: order.id, locationId: order.locationId }
    });
    return order;
  });
}
```

### 8.5 خطاها و جبران

| سناریو | رفتار لازم |
|---|---|
| دوبار زدن ثبت | همان Order و Response با Key یکسان |
| Webhook تکراری | Inbox یکتا؛ بدون Allocation دوم |
| Webhook خارج از ترتیب | بازیابی State معتبر PSP؛ عدم بازگشت Success به Processing |
| قطع ارتباط پس از Payment | نمایش Pending؛ Query با همان مرجع و Reconciliation |
| پرداخت موفق، پذیرش ناموفق | صف Review و Refund مجاز؛ پول هرگز نادیده گرفته نشود |
| تغییر منو پس از ثبت | Order Snapshot ثابت بماند |
| لغو پیش از پخت | آزادسازی Reservation؛ Refund طبق Policy |
| لغو پس از مصرف مواد | Refund مالی مستقل؛ مواد مصرف‌شده خودکار به انبار برنگردند |
| چاپگر یا KDS قطع | صف تحویل و Alert؛ Resync و کنترل Reprint |
| POS Timeout | وضعیت Unknown؛ جست‌وجو با External Reference پیش از ارسال دوباره |
| Redis از دست برود | بازسازی Job از Outbox و Commandهای PostgreSQL |

برای Webhook، Raw Body و Signature، حساب Provider، محیط Test/Live، Currency، مبلغ و Mapping بررسی شوند. در ارسال Stripe، رویداد تکراری و ترتیب متفاوت ممکن است؛ Design باید این حالت‌ها را تحمل کند. [Stripe Webhooks](https://docs.stripe.com/webhooks)

کلید Provider Idempotency برای Retry همان عملیات ثابت می‌ماند؛ عملیات جدید مانند Refund دوم کلید جدید می‌گیرد. نگهداری کلید محلی و Ledger نباید فقط به مهلت نگهداری Provider وابسته باشد. [Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)

<a id="integrations"></a>
## 9. Integrations و سخت‌افزار

### 9.1 رویکرد Adapter

Domain به Provider خاص وابسته نباشد. Interfaceها با قابلیت‌های واقعی مانند `createPayment`، `lookupPayment`، `submitOrder`، `lookupOrder` و `fetchFiscalReceipt` تعریف شوند. همه POSها Refund، Modifier یا Offline یکسان ندارند؛ Capability Matrix لازم است.

| اتصال | راه پیشنهادی | شرط ورود به MVP |
|---|---|---|
| POS | API رسمی یا Partner Adapter | Sandbox، Contract و Fiscal Mapping تأییدشده |
| PSP | Hosted UI و Webhook | Settlement، Refund، SCA و Merchant Account روشن |
| Delivery | Webhook + Polling جبرانی | دسترسی تجاری و Mapping منو |
| Accounting | CSV نسخه‌دار و سپس DATEV Adapter | تأیید فایل نمونه توسط حسابدار |
| Messaging | Transactional Email؛ SMS در صورت نیاز | Opt-out و رضایت برای پیام بازاریابی |
| Printing | Local Print Agent یا Gateway معتبر | ACK، Queue و شناسه Job |
| Fiscal Provider | POS/TSE Adapter قراردادشده | چرخه، Export، Outage و مسئولیت‌ها مشخص |

نام تأمین‌کننده در این سند انتخاب قطعی یا تضمین دسترسی API نیست. هزینه، منطقه خدمت، SLA، Certification و شرایط قرارداد باید بررسی شود.

### 9.2 امنیت و Reliability اتصال

- Credential هر Tenant رمزگذاری‌شده با KMS/Secret Manager؛ Tokenها در Log یا Event عمومی قرار نگیرند.
- Webhook به Tenant از Mapping سروری Provider Account وصل شود، نه `tenantId` داخل Body.
- Circuit Breaker، Timeout کوتاه، Queue و سقف Retry؛ Retry عمومی برای Payment بدون Idempotency ممنوع است.
- Errorهای دائمی مانند Modifier نامعتبر به Operator نمایش داده شوند؛ Retry بی‌پایان نشوند.
- هر Command دارای Correlation ID، External Reference، وضعیت و آخرین خطای Sanitized باشد.
- Reconciliation دوره‌ای و پایان روز از API یا Settlement File برای کشف Webhook ازدست‌رفته.
- تحویل سفارش کانال بیرونی با Mapping یکتای Product و Modifier؛ مورد نامشخص به Review برود.

### 9.3 Offline و شبکه محلی

MVP به اینترنت برای ثبت نهایی نیاز دارد. PWA می‌تواند منوی Cacheشده و Draft محلی را نشان دهد، اما تا Server ACK، سفارش پذیرفته‌شده یا پرداخت موفق نمایش ندهد. KDS در قطع اتصال Banner و آخرین زمان Sync نشان دهد.

Offline کامل پروژه P1/P2 است: Local Agent، Durable Queue، Device Identity، Conflict Policy و مسیر Fiscal تأییدشده می‌خواهد. ساعت دستگاه و شماره محلی منبع نهایی ترتیب مالی نیستند. پرداخت Offline فقط با قابلیت و Policy رسمی PSP انجام شود.

چاپ دقیقاً یک‌بار در شبکه تضمین‌پذیر نیست؛ Crash پس از چاپ و پیش از ACK ممکن است Reprint بسازد. روی نسخه مجدد برچسب «Copy» و شناسه سند درج و اقدام کارمند ثبت شود.

<a id="inventory"></a>
## 10. Inventory، Recipe و خرید

### 10.1 مدل موجودی

موجودی از **Ledger حرکات** محاسبه می‌شود؛ فیلد قابل ویرایش `quantity` به‌تنهایی منبع حقیقت نیست.

```text
on_hand = opening + receipts + transfers_in - transfers_out
          - consumption - waste + signed_adjustments
available = on_hand - active_reservations
```

- `on_hand`: موجودی فیزیکی ثبت‌شده، با مقدار Signed Delta در Movement.
- `reserved`: تعهد سفارش پذیرفته‌شده که هنوز مصرف نشده است.
- `available`: مقدار قابل فروش یا رزرو جدید.
- `theoretical_usage`: مصرف مورد انتظار بر اساس Recipe Snapshot.
- `actual_usage`: از شمارش واقعی و ورودی/خروجی محاسبه می‌شود.
- `variance`: اختلاف واقعی و نظری؛ دلیل آن الزاماً سرقت یا عملکرد فرد نیست.

### 10.2 چرخه مصرف پیشنهادی

1. Recipe Version برای محصول با واحد پایه `g`، `ml` یا `piece` ثبت شود.
2. در پذیرش، مواد بر اساس نسخه Recipe همان سفارش رزرو شوند.
3. در شروع آماده‌سازی هر Item، Reservation آزاد و Consumption ثبت شود؛ Effect Key یکتا جلوی مصرف دوباره را بگیرد.
4. اگر جریان کار Start ندارد، هنگام Ready مصرف ثبت شود؛ این Policy برای هر شعبه صریح و ثابت باشد.
5. لغو پیش از مصرف Reservation را آزاد می‌کند؛ لغو پس از مصرف نیازمند تصمیم Waste یا Recovery واقعی است.
6. Refund پرداخت به‌تنهایی موجودی را زیاد نمی‌کند.
7. Rework یا غذای جایگزین Consumption جدید دارد و به سفارش اصلی ارجاع می‌دهد.

```json
{
  "product": "Margherita",
  "recipeVersion": 4,
  "yieldPortions": "1",
  "lines": [
    { "ingredient": "dough", "quantity": "250", "unit": "g" },
    { "ingredient": "tomato_sauce", "quantity": "90", "unit": "g" },
    { "ingredient": "mozzarella", "quantity": "100", "unit": "g" }
  ]
}
```

Modifierهایی مانند Extra Cheese باید Recipe Delta داشته باشند. Yield و ضایعات فرایند، تبدیل وزن خام به قابل مصرف و نسخه Recipe در Food Cost اثر دارند. Negative Stock در MVP با Alert و دلیل قابل ثبت است؛ بستن فروش فقط پس از اثبات دقت موجودی و Policy شعبه فعال شود.

### 10.3 خرید و شمارش

- Purchase Order موجودی را تغییر نمی‌دهد؛ Goods Receipt تأییدشده آن را افزایش می‌دهد.
- Partial Receipt، قیمت واقعی، Unit Conversion و اختلاف تحویل ثبت شوند.
- Stocktake با زمان Cutoff و حساب‌کردن Movementهای پس از شمارش، Adjustment قابل حسابرسی بسازد.
- انتقال بین شعبه دو Leg مرتبط دارد؛ شعبه مقصد باید Receipt انتقال را تأیید کند.
- Lot، Expiry و FEFO در صورت نیاز مشتری افزوده شوند؛ ادعای Traceability کامل غذا بدون این داده‌ها نشود.
- ارزش‌گذاری پیشنهادی اولیه Weighted Average است؛ روش نهایی با حسابدار انتخاب شود.
- Alert حد سفارش، پیشنهاد خرید و Supplier Lead Time در P1؛ خرید خودکار در MVP انجام نمی‌شود.

<a id="analytics"></a>
## 11. Analytics و شاخص‌ها

### 11.1 گزارش‌ها

| Report | تعریف و قید |
|---|---|
| Gross / Net Sales | فروش با/بدون Tax؛ لغو و Refund و Discount به تفکیک |
| Payments Received | پرداخت موفق؛ الزاماً برابر فروش همان روز نیست |
| Settlement | وجه تسویه‌شده پس از Fee و تأخیر PSP |
| Average Order Value | فروش تعریف‌شده تقسیم بر سفارش‌های همان Scope |
| Kitchen Lead Time | از Accept تا Ready؛ Median و P95 جدا |
| Food Cost | هزینه Recipe نسبت به فروش خالص؛ برآورد عملیاتی |
| Waste | مقدار و ارزش Waste با علت |
| Stock Variance | اختلاف مصرف واقعی و نظری در بازه قابل مقایسه |
| Channel Mix | سهم حضوری، QR، Pickup و Provider |
| SaaS Health | Activation، Churn، MRR و Support Minutes |

### 11.2 طراحی داده تحلیلی

در MVP، Queryهای محدود و `daily_sales` یا Materialized View کافی است. Rollup باید از Ledger و رویدادهای پایدار قابل بازسازی باشد؛ Watermark، نسخه Projection و وضعیت Backfill ذخیره شود. Warehouse جدا فقط با افزایش حجم و نیاز جدی BI.

- Timezone شعبه، Business Day Cutoff و تغییر ساعت تابستانی در گزارش لحاظ شوند.
- گزارش فروش براساس زمان تحقق/ثبت مالی تعریف شود؛ جریان نقدی براساس زمان Payment/Refund.
- Refund امروز برای فروش دیروز، هم در گزارش جریان نقدی امروز و هم در نمای Restated فروش قبلی قابل توضیح باشد.
- هر Dashboard زمان آخرین Refresh و Pending/Unreconciled Amount را نشان دهد.
- مرجع حسابداری از Export معتبر و قواعد تأییدشده می‌آید؛ Dashboard عملیاتی صورت سودوزیان رسمی نیست.
- Permission گزارش برای Accountant می‌تواند Read-only و محدود به شعبه باشد.

### 11.3 نمونه محاسبه

```text
Net sales = recognized gross sales - sales tax - eligible reversals
Contribution estimate = net sales - ingredient cost - channel fees - PSP fees

Payment reconciliation difference =
  provider confirmed payments - local recorded payments

Cash count difference =
  actual closing cash - (opening float + cash sales - cash refunds
                         + paid_in - paid_out)
```

Formulaهای مالی قبل از استفاده عملیاتی باید دامنه Discount، Tip، Refund و Settlement را روشن کنند. Labour، Rent و Energy در برآورد Contribution بالا لحاظ نشده‌اند.

<a id="ai"></a>
## 12. AI و اتوماسیون

### 12.1 ترتیب ارزش‌آفرینی

ابتدا کیفیت داده و Rule-based Alert؛ سپس AI. محصول برای کار روزمره نباید به پاسخ مدل وابسته باشد.

| Use Case | ورودی | خروجی | کنترل |
|---|---|---|---|
| خلاصه روزانه | KPI محاسبه‌شده و اختلاف‌ها | توضیح کوتاه و ارجاع به داده | عدد جدید تولید نکند |
| پیشنهاد خرید | Sales History، Recipe، Lead Time | Draft خرید | تأیید مدیر |
| پیش‌بینی تقاضا | تاریخچه، روز هفته و تعطیلی ثبت‌شده | Forecast و بازه عدم قطعیت | مقایسه با Seasonal Baseline |
| ترجمه منو | متن تأییدشده | Draft چندزبانه | تأیید انسانی؛ Allergen حساس |
| تشخیص ناهنجاری | Metricهای تجمیعی | Alert احتمالی | بدون اتهام به کارکنان |
| پرسش از گزارش | Semantic Metrics مجاز | پاسخ همراه بازه و Scope | Query محدود و Read-only |

### 12.2 معماری AI پیشنهادی

- `AI Orchestrator` فقط Toolهای Allowlisted مانند `getDailyMetrics` یا `draftPurchaseOrder` دارد.
- مدل به Database Credential و SQL آزاد دسترسی ندارد.
- هر Tool همان Tenant و RBAC کاربر را اعمال می‌کند؛ Prompt مرز امنیتی نیست.
- PII پیش از ارسال حذف یا کمینه شود؛ قرارداد Data Processing و منطقه پردازش بررسی شود.
- Prompt، Model ID، Tool Schema و نسخه Evaluation ثبت شوند؛ متن حساس در Log عمومی نباشد.
- Budget و Token Limit برای Tenant، Timeout و Fallback بدون AI وجود داشته باشد.
- پاسخ شامل Data Window، زمان داده و عدم قطعیت باشد؛ مدل نباید Tax Rate یا Allergen را از حدس بسازد.
- متن Supplier، Menu یا Comment داده نامطمئن است؛ دستور داخل آن نباید Tool Action ایجاد کند.
- قیمت‌گذاری، Refund، ثبت خرید و تغییر منو بدون تأیید کاربر انجام نشود.

### 12.3 معیار پذیرش AI

Forecast باید در Backtest زمانی از Seasonal Naive بهتر باشد؛ Leakage از آینده ممنوع است. برای تقاضای کم یا صفر، MAE یا WAPE تجمعی با احتیاط استفاده شود. هر خلاصه عددی باید از خروجی محاسبه‌شده قابل بازتولید باشد. اگر معیار بهتر نشد، Feature به Rule-based یا Draft محدود برگردد.

انتخاب Provider و هزینه AI در زمان پیاده‌سازی و با مستندات رسمی روز بررسی شود؛ این سند مدل یا قیمت API خاصی را قطعی نمی‌کند.

<a id="tenancy"></a>
## 13. Multi-tenancy و کنترل دسترسی

### 13.1 مدل Tenant

- **Tenant:** یک کسب‌وکار یا مجموعه با قرارداد SaaS مستقل.
- **Location:** یک شعبه با Timezone، منو، Device، تنظیمات مالی و Integration مشخص.
- **User:** هویت سراسری؛ دسترسی از Membership به Tenant و Location داده می‌شود.
- **Guest Session:** مجوز محدود به منوی منتشرشده و سفارش‌های همان Session؛ عضویت Tenant نیست.

پیشنهاد MVP، Shared Database / Shared Schema با `tenant_id`، FK مرکب، RLS و کنترل Application است. Dedicated Database برای Enterprise فقط با نیاز واقعی و قیمت‌گذاری متناسب.

### 13.2 مسیر تعیین Context

1. Session یا Token اعتبارسنجی شود.
2. Tenant درخواستی از URL یا Subdomain استخراج شود؛ این مقدار صرفاً Selector است.
3. Membership فعال از منبع معتبر تأیید شود.
4. Role و Location Scope با Resource درخواستی تطبیق داده شوند.
5. Context فقط برای همان Transaction، Job یا Subscription برقرار شود.
6. Audit و Trace، Tenant و Location مؤثر را ثبت کنند.

Guest QR از Slug عمومی و Token غیرقابل حدس استفاده می‌کند. QR ثابت حضور فیزیکی کنار میز را ثابت نمی‌کند؛ برای جلوگیری از سفارش مزاحم، تأیید کارکنان، Rate Limit یا Table Session چرخشی لازم است.

### 13.3 نقش‌های پیشنهادی

| Role | مجوز اصلی | محدودیت |
|---|---|---|
| Owner | تنظیمات، Billing، Export و دسترسی‌ها | MFA اجباری پیشنهادی |
| Manager | منو، سفارش، لغو و Refund مجاز | سقف مبلغ و شعبه |
| Cashier | ثبت و دریافت پرداخت | بدون تغییر Tax Rule یا دسترسی Secrets |
| Waiter | ثبت و وضعیت سفارش میز | Scope شیفت و شعبه |
| Kitchen | Ticket و آماده‌سازی | بدون PII و گزارش مالی غیرضروری |
| Inventory Manager | Recipe، Receipt و Stocktake | بدون Refund |
| Accountant | گزارش و Export | Read-only و بازه مشخص |
| Support | دسترسی موقت برای Incident | بدون دسترسی دائمی و بدون Impersonation پنهان |

Permissionهایی مانند `order.cancel`، `payment.refund`، `inventory.adjust` و `member.invite` مستقل باشند. Plan تجاری و Role دو کنترل متفاوت‌اند؛ داشتن Plan Pro به کاربر Kitchen اجازه Refund نمی‌دهد.

### 13.4 Isolation در تمام لایه‌ها

- Query و Cache Key: `tenant:{tenantId}:location:{locationId}:...`.
- Object Storage: Prefix و Metadata مربوط به Tenant؛ URL امضاشده پس از Authorization صادر شود.
- Queue: Context معتبر در Envelope و بررسی مجدد Connection Mapping در Consumer.
- Realtime: هر Subscription با Tenant/Location مجاز؛ پارامتر Channel از Browser قابل اعتماد نیست.
- Exports: فایل خصوصی، زمان انقضا، Audit دانلود و پاک‌سازی خودکار.
- Support Tool: نمایش واضح Tenant، علت دسترسی، TTL و Approval داخلی مشخص.
- آزمون Isolation شامل فهرست، جست‌وجو، Lookup با ID، Export، Upload، Job و SSE باشد.

<a id="security"></a>
## 14. Security و Privacy

### 14.1 مدل تهدید اولیه

دارایی‌های حساس شامل فروش، پرداخت، اطلاعات مشتری و کارکنان، Credentials اتصال و اسناد مالی هستند. تهدیدهای اصلی: Cross-tenant Access، Account Takeover، Refund Fraud، تزریق ورودی، Webhook جعلی، Secret Leak، دستکاری رسید و Ransomware.

### 14.2 کنترل‌های اجرایی پیشنهادی

- TLS، Encryption در Storage و Backup و مدیریت کلید جدا از فایل داده.
- Session با Cookieهای `HttpOnly`، `Secure` و `SameSite` مناسب؛ دفاع CSRF برای Cookie Auth.
- MFA برای Owner، دسترسی Support و عملیات حساس؛ Re-auth برای تغییر حساب تسویه و Export حساس.
- Device Session قابل ابطال، Timeout برای دستگاه مشترک و ثبت خروج از شیفت.
- Password در صورت مدیریت داخلی با الگوریتم مناسب مانند Argon2id و کتابخانه معتبر؛ بدون رمزنگاری اختصاصی.
- Validation سخت‌گیرانه، Query پارامتری، محدودیت Upload و Sanitization خروجی متنی.
- Rate Limit برای Login، QR Ordering، Search و Webhook؛ Limit جداگانه برای هر Tenant و IP.
- Refund نیازمند Permission، سقف مبلغ، Reason و Audit؛ تغییر Settlement Account نیازمند کنترل مضاعف.
- Audit شامل Actor، Action، Resource، Tenant، Location، Timestamp و Correlation ID؛ بدون PAN، CVV، Token یا متن حساس.
- Runtime Database Role با Least Privilege؛ Migration Role جدا و بدون دسترسی از Browser.
- Secret Rotation، Dependency Scanning، Container Scanning و Patch Calendar.
- Backup غیرقابل دستکاری در حساب جدا، با Restore آزمایش‌شده.
- Hosted Payment داده کارت را از Backend دور می‌کند، اما تعهدات PCI متناسب با Integration و Merchant همچنان باید مشخص شوند.

### 14.3 سیاست داده پیشنهادی

| داده | سیاست محصول | تصمیم لازم |
|---|---|---|
| سفارش مالی و رسید | Archive و اصلاحیه؛ بدون بازنویسی | مدت نگهداری قانونی به تفکیک سند |
| پروفایل مشتری | اختیاری و جدا از سند مالی | حذف، Pseudonymization و Legal Hold |
| رضایت بازاریابی | Purpose و نسخه متن و Withdrawal | اثبات رضایت و توقف ارسال |
| Operational Logs | کوتاه‌مدت و Sanitized | مقدار اولیه پیشنهادی 30 روز |
| امنیت و Audit | دسترسی محدود و Retention متناسب | سیاست مبتنی بر ریسک و قانون |
| فایل Export موقت | انقضای سریع | مقدار اولیه پیشنهادی 7 روز |
| Raw Webhook | حداقل Payload و Encryption | Retention بر اساس Debug و DPA |

اعداد 30 و 7 روز، تنظیم پیشنهادی محصول‌اند و مدت قانونی اسناد نیستند. Account Delete نباید اسناد دارای الزام نگهداری را بی‌دلیل پاک کند؛ هویت قابل حذف از Record مالی جدا شود.

<a id="compliance"></a>
## 15. GDPR و الزامات POS آلمان

این بخش مسائل لازم برای طراحی و Launch را مشخص می‌کند؛ انطباق واقعی به نقش محصول، قراردادها، عملیات رستوران و تأیید متخصص بستگی دارد. وجود Cloud Hosting یا TSE Provider به‌تنهایی به معنای انطباق کامل RestaurantOS نیست.

### 15.1 GDPR

رستوران برای داده مهمان معمولاً Controller و RestaurantOS در پردازش به نمایندگی از آن Processor است؛ داده Billing خود SaaS می‌تواند نقش متفاوتی داشته باشد. برای هر Purpose، مبنای قانونی، کمینه‌سازی و Retention ثبت شود. الزامات طراحی شامل DPA مطابق Article 28، کنترل امنیتی Article 32، حقوق دسترسی/حذف با استثناهای قانونی، Privacy by Design و ارزیابی انتقال خارج EEA است. Incident Plan باید مسئولیت اطلاع‌رسانی Controller و ارزیابی مهلت Article 33 را روشن کند. Consent بازاریابی از انجام سفارش جدا باشد. [متن رسمی GDPR، به‌ویژه Articles 5, 6, 17, 25, 28, 32, 33, 44](https://eur-lex.europa.eu/legal-content/EN/TXT/?qid=1680253036157&uri=CELEX%3A32016R0679)

**خروجی‌های لازم برای Launch:** Data Map، DPA، فهرست Subprocessor، مسیر Data Subject Request، Retention Matrix و Runbook رخداد. EU Hosting انتخاب پیشنهادی است؛ بررسی مسیر دسترسی Support و Subprocessor نیز لازم است.

### 15.2 تصمیم راهبردی POS

**مسیر A — اتصال به POS موجود:** گزینه پیشنهادی MVP. POS منتخب نقش مالیاتی و مسیر رسید خود را دارد و RestaurantOS سفارش و عملیات را به آن متصل می‌کند. قبل از Launch، Data Flow، ثبت اولین رویداد و نقش هر دو سیستم بررسی شود؛ نام «Back Office» به‌تنهایی سیستم را از شمول قانون خارج نمی‌کند.

**مسیر B — RestaurantOS به‌عنوان Kassensystem:** دامنه مستقل شامل چرخه TSE، صدور رسید، Export، Cash Session، اصلاحیه، خرابی، مستندسازی و نصب واقعی است. ابتدا شریک Fiscal و ارزیابی طبقه‌بندی، سپس توسعه و تست پذیرش؛ این کار در برآورد MVP پایه منظور نشده است.

سامانه‌های الکترونیکی دارای کارکرد صندوق در دامنه KassenSichV قرار می‌گیرند. معاف‌بودن یک نرم‌افزار صرفاً حسابداری را نباید به نرم‌افزاری با امکان پردازش Cash تعمیم داد. [KassenSichV، متن BMF 2026](https://ao.bundesfinanzministerium.de/ao/2026/Abgabenordnung/Vierter-Teil/Zweiter-Abschnitt/Erster-Unterabschnitt/Paragraf-146a/KassenSichV.html)، [FAQ رسمی BMF](https://www.bundesfinanzministerium.de/Content/DE/FAQ/FAQ-steuergerechtigkeit-belegpflicht.html)

### 15.3 TSE و رسید

- Fiscal Adapter باید شروع، Update و پایان Transaction و ارتباط آن با Business Event را مطابق مسیر تأییدشده مدیریت کند.
- اطلاعات Receipt شامل هویت فروشنده، زمان‌ها، اقلام، مبلغ/Tax، Transaction Number و شناسه‌ها و داده‌های TSE طبق §6 نگهداری و ارائه شود.
- رسید دیجیتال باید با الزامات جاری، از جمله رضایت دریافت‌کننده در حالت مقرر، هماهنگ باشد.
- اصلاح مالی از طریق Correction / Storno با Reference به اصل؛ حذف سابقه جایگزین اصلاحیه نیست.
- قطعی TSE یا POS به Incident و مسیر ثبت مورد تأیید نیاز دارد؛ «بعداً همه را امضا می‌کنیم» راهکار عمومی نیست.

این موارد باید با قالب رسمی و Partner Validator آزموده شوند. [KassenSichV §6](https://www.gesetze-im-internet.de/kassensichv/__6.html)

### 15.4 DSFinV-K، GoBD و ثبت سیستم

DSFinV-K خروجی ساختاریافته ویژه صندوق است؛ CSV گزارش فروش جای آن را نمی‌گیرد. نسخه Schema و Validator در Export ثبت شود و خروجی با داده نمونه قابل بازخوانی باشد. [مرجع رسمی BZSt برای DSFinV-K](https://www.bzst.de/DE/Unternehmen/Aussenpruefungen/DigitaleSchnittstelleFinV/digitaleschnittstellefinv_node.html?lv2=90794)

برای GoBD باید قابلیت ردیابی تغییر، کنترل دسترسی، بایگانی و Verfahrensdokumentation طراحی و در فرایند واقعی اجرا شود. Self-label مانند «GoBD compliant» بدون شواهد کافی استفاده نشود. [FAQ رسمی BMF درباره مستندسازی سیستم و تغییرات](https://www.bundesfinanzministerium.de/Content/DE/FAQ/FAQ-steuergerechtigkeit-belegpflicht.html)

فرایند اعلام سیستم به اداره مالیات از طریق ELSTER/ERiC در دسترس است. اطلاعات لازم، مسئول انجام و وضعیت ثبت هر شعبه در Onboarding مشخص شود؛ تاریخ‌ها و تعهدها هنگام نصب دوباره بررسی شوند. [مرجع رسمی اداره مالیات Hessen](https://finanzamt.hessen.de/meldung-von-kassensystemen-und-taxameternwegstreckenzaehlern-nach-ss-146a-absatz-4-ao)

### 15.5 VAT آلمان

طبق §12 UStG بررسی‌شده در تاریخ سند، نرخ عمومی 19% است و Restaurant/Catering Services، به‌جز ارائه نوشیدنی، در نرخ کاهش‌یافته 7% قرار می‌گیرند. طبقه‌بندی واقعی اقلام، بسته‌های ترکیبی و موارد استثنا نیاز به Rule تأییدشده دارد. [UStG §12](https://www.gesetze-im-internet.de/ustg_1980/__12.html)، [بخشنامه BMF درباره تغییر از 2026-01-01](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-12-22-verpflegungsdienstleistungen.pdf?__blob=publicationFile&v=5)

بنابراین Tax Rule باید `country`، `category`، `service_type`، `valid_from` و `valid_to` داشته باشد و هنگام فروش Snapshot شود. فرض تاریخی «غذای داخل رستوران همیشه 19% است» نباید در کد ثابت شود. Tip، Voucher و Combo Rule جدا و تست‌شده می‌خواهند.

### 15.6 Launch Gates حقوقی و عملیاتی

| موضوع | مدرک لازم | مسئول پیشنهادی |
|---|---|---|
| نقش صندوق و TSE | Data Flow و تأیید دامنه | Fiscal Partner + Founder |
| مالیات و سند | نمونه رسید و Tax Mapping | Steuerberater + POS Partner |
| Export | فایل معتبر و تست بازخوانی | Engineering + Accountant |
| حفاظت داده | DPA و Data Map و حقوق اشخاص | Privacy Owner |
| عملکرد خرابی | تمرین POS/TSE/Internet Outage | Operations + Restaurant Manager |
| دسترس‌پذیری و محتوای فروش | بررسی مسیر سفارش، قیمت و Allergen | Product + مشاور مرتبط |
| نصب و ثبت سیستم | Checklist شعبه و مسئولیت ثبت | Restaurant Operator |

طرح‌های قانونی آتی نباید با قانون جاری مخلوط شوند؛ هر تغییر اعلام‌شده برای 2027/2028 قبل از اجرا به‌طور مستقل بررسی و نسخه سند به‌روزرسانی شود.

<a id="api"></a>
## 16. API و قراردادها

### 16.1 قواعد عمومی

- REST JSON زیر `/v1`، قرارداد OpenAPI و Schema Validation.
- Scope شعبه در مسیر مشخص؛ Tenant Selector با Membership کنترل شود.
- پول با `{ "amountMinor": "1250", "currency": "EUR" }` و Quantity به‌صورت Decimal String.
- زمان‌ها ISO-8601 UTC و تاریخ کسب‌وکار جدا؛ Display بر اساس Locale.
- Mutationهای قابل Retry دارای `Idempotency-Key`؛ Schema و Request Hash ذخیره شوند.
- `If-Match` یا `expectedVersion` برای اصلاح همزمان؛ Conflict برابر `409`.
- Cursor Pagination با Sort پایدار `(created_at,id)`؛ سقف `limit` مثلاً 100.
- `202 Accepted` برای Job؛ `201 Created` برای Resource ساخته‌شده.
- خطاها بدون PII و اطلاعات Tenant دیگر؛ ID نامجاز معمولاً `404` برگرداند.
- Rate Limit و Request ID در Header؛ Error Model ثابت.

### 16.2 Endpointها

| Method | Endpoint | نقش / رفتار |
|---|---|---|
| GET | `/v1/me` | هویت و Membershipهای کاربر |
| GET | `/v1/tenants/{tenantId}/locations` | شعبه‌های مجاز |
| POST | `/v1/tenants/{tenantId}/memberships` | Owner؛ دعوت نقش محدود |
| GET | `/v1/tenants/{tenantId}/locations/{locationId}/menu` | منوی مدیریت |
| POST | `/v1/tenants/{tenantId}/menu-versions` | Draft منو |
| POST | `/v1/tenants/{tenantId}/menu-versions/{versionId}/publish` | انتشار نسخه |
| GET | `/v1/public/restaurants/{slug}/menu` | فقط منوی منتشرشده |
| POST | `/v1/public/restaurants/{slug}/quotes` | Quote معتبر و کوتاه‌عمر |
| POST | `/v1/public/restaurants/{slug}/orders` | Guest Session، Quote و Rate Limit |
| GET | `/v1/public/orders/{orderId}` | فقط Token مربوط به همان Order |
| POST | `/v1/tenants/{tenantId}/locations/{locationId}/orders` | ثبت توسط Staff |
| GET | `/v1/tenants/{tenantId}/locations/{locationId}/orders` | فیلتر وضعیت و Cursor |
| GET | `/v1/tenants/{tenantId}/orders/{orderId}` | دریافت با Location Scope |
| POST | `/v1/tenants/{tenantId}/orders/{orderId}/accept` | پذیرش با Policy |
| POST | `/v1/tenants/{tenantId}/orders/{orderId}/cancel` | Reason، Permission و Version |
| POST | `/v1/tenants/{tenantId}/orders/{orderId}/payment-attempts` | ساخت Attempt برای مانده مجاز |
| POST | `/v1/tenants/{tenantId}/payments/{paymentId}/refunds` | Manager و محدودیت مبلغ |
| GET | `/v1/tenants/{tenantId}/locations/{locationId}/kitchen/tickets` | Snapshot KDS |
| POST | `/v1/tenants/{tenantId}/kitchen/tickets/{ticketId}/transitions` | Start / Ready با Version |
| GET | `/v1/tenants/{tenantId}/locations/{locationId}/events` | SSE با Resume Cursor |
| GET | `/v1/tenants/{tenantId}/locations/{locationId}/inventory/balances` | موجودی و زمان محاسبه |
| POST | `/v1/tenants/{tenantId}/inventory/adjustments` | Reason و Audit |
| POST | `/v1/tenants/{tenantId}/purchasing/goods-receipts` | Receipt واقعی |
| GET | `/v1/tenants/{tenantId}/locations/{locationId}/reports/daily-sales` | Date و Timezone روشن |
| POST | `/v1/tenants/{tenantId}/exports` | Export Job محدود به دسترسی |
| GET | `/v1/tenants/{tenantId}/exports/{jobId}` | وضعیت و URL کوتاه‌عمر |
| GET | `/v1/tenants/{tenantId}/billing/subscription` | Owner |
| POST | `/v1/tenants/{tenantId}/integrations/{connectorId}/reconcile` | Job کنترل‌شده |
| POST | `/v1/webhooks/payments/{provider}` | Signature و Provider Account Mapping |
| POST | `/v1/webhooks/pos/{provider}` | Signature، Inbox و External Mapping |
| POST | `/v1/webhooks/billing/{provider}` | جدا از پرداخت سفارش غذا |

مسیرهای Staff و Guest به یک Application Use Case می‌رسند، اما Authorization و Rate Limit متفاوت دارند. Endpoint عمومی نباید با دانستن Order ID اجازه خواندن یا Refund بدهد.

### 16.3 نمونه درخواست و پاسخ

```http
POST /v1/tenants/10000000-0000-4000-8000-000000000001/locations/20000000-0000-4000-8000-000000000001/orders
Content-Type: application/json
Idempotency-Key: 72f493be-29d6-4fef-935f-77d5960557ea

{
  "serviceType": "pickup",
  "paymentPolicy": "prepaid",
  "menuVersion": 12,
  "items": [
    {
      "productId": "40000000-0000-4000-8000-000000000001",
      "quantity": "1",
      "modifierOptionIds": []
    }
  ]
}
```

```json
{
  "id": "30000000-0000-4000-8000-000000000001",
  "orderStatus": "placed",
  "financialStatus": "unpaid",
  "fiscalStatus": "not_started",
  "version": 1,
  "total": { "amountMinor": "1250", "currency": "EUR" },
  "businessDate": "2026-10-28",
  "createdAt": "2026-10-28T11:30:00Z"
}
```

مقدار `fiscalStatus` نمونه به مسیر Partner بستگی دارد؛ اگر ثبت سفارش آغاز فرایند مالیاتی است، Use Case باید همان زمان Fiscal Command لازم را بسازد.

```json
{
  "error": {
    "code": "ORDER_VERSION_CONFLICT",
    "message": "سفارش تغییر کرده است؛ وضعیت جدید را دریافت کنید.",
    "requestId": "req-8d09",
    "details": { "expectedVersion": 3, "currentVersion": 4 }
  }
}
```

### 16.4 SSE و Resync

هر Event دارای ID پایدار است. Client پس از قطع اتصال با `Last-Event-ID` ادامه می‌دهد؛ اگر Cursor منقضی باشد، Server درخواست Snapshot کامل می‌دهد. ترتیب Ticket از State سرور می‌آید. SSE یک اعلان تغییر است و جای Query معتبر یا Ledger را نمی‌گیرد. Auth با Cookie امن یا Token کوتاه‌عمر، بدون Access Token بلندمدت در URL.

<a id="repository"></a>
## 17. Repository و استاندارد توسعه

```text
restaurant-os/
├── apps/
│   ├── web/                      # Owner, staff, customer routes
│   ├── api/                      # HTTP and SSE entrypoint
│   └── worker/                   # Outbox, integration and reporting jobs
├── packages/
│   ├── modules/
│   │   ├── identity/
│   │   ├── organization/
│   │   ├── catalog/
│   │   ├── ordering/
│   │   ├── kitchen/
│   │   ├── payments/
│   │   ├── fiscal/
│   │   ├── inventory/
│   │   ├── purchasing/
│   │   ├── customers/
│   │   ├── reporting/
│   │   ├── billing/
│   │   └── integrations/
│   ├── shared-kernel/            # Money, IDs, Clock, event envelope
│   ├── contracts/                # Versioned API/event schemas
│   ├── ui/                       # Shared accessible components
│   └── config/                   # Typed runtime validation
├── database/
│   ├── prisma/
│   ├── migrations/               # Including SQL constraints and RLS
│   └── seeds/                    # Synthetic tenant fixtures only
├── tests/
│   ├── integration/
│   ├── tenancy/
│   ├── contract/
│   ├── e2e/
│   └── load/
├── infrastructure/
│   ├── docker/
│   └── environments/
├── docs/
│   ├── adr/
│   ├── api/
│   ├── runbooks/
│   └── fiscal-mapping/
├── scripts/
├── .env.example
├── compose.yaml
├── pnpm-workspace.yaml
└── README.md
```

ساختار داخلی یک ماژول:

```text
ordering/
├── domain/             # Aggregate, value objects, invariants
├── application/        # Use cases and ports
├── infrastructure/     # SQL repositories and adapters
├── presentation/       # Controllers and DTO mapping
└── public.ts           # Explicit exports for other modules
```

### 17.1 قرارداد تیم

- Domain بدون وابستگی HTTP، ORM و Provider SDK.
- Boundary Lint از Import داخلی ماژول‌ها جلوگیری کند.
- DTO با Domain Entity یکسان فرض نشود؛ Response فیلترشده باشد.
- Config در Startup اعتبارسنجی شود؛ Missing Secret باعث Fail-fast شود.
- ADR برای تصمیم Tenant Isolation، Fiscal Role، Payment Flow و Inventory Policy ثبت شود.
- OpenAPI و Event Schema همراه کد Review شوند؛ تغییر Breaking صریح باشد.
- Feature Flag در Server اعمال شود؛ مخفی‌کردن دکمه در UI کنترل دسترسی نیست.

### 17.2 نمونه متغیرهای محیطی

```dotenv
APP_ENV=development
DATABASE_URL=postgresql://restaurant_app:local_only@localhost:5432/restaurantos
REDIS_URL=redis://localhost:6379
PUBLIC_APP_URL=http://localhost:3000
OIDC_ISSUER_URL=https://identity.example.test
PAYMENT_PROVIDER_MODE=test
PAYMENT_SECRET_KEY=replace_with_test_secret
PAYMENT_WEBHOOK_SECRET=replace_with_test_webhook_secret
OBJECT_STORAGE_BUCKET=restaurantos-local
DEFAULT_LOCATION_TIMEZONE=Europe/Berlin
AI_ENABLED=false
```

این مقادیر صرفاً مثال توسعه‌اند. Secret واقعی وارد Repository نشود و متغیر Secret در Namespace عمومی Frontend قرار نگیرد.

<a id="devops"></a>
## 18. DevOps، بازیابی و عملیات

### 18.1 توپولوژی استقرار

```mermaid
flowchart LR
    U[Users] --> E[EU Edge / HTTPS]
    E --> WEB[Web Container]
    E --> API[API Containers]
    API --> DB[(Managed PostgreSQL)]
    API --> CACHE[(Redis)]
    W[Worker Containers] --> DB
    W --> CACHE
    W --> EXT[External Providers]
    API --> S[(Private Object Storage)]
    DB --> B[(Encrypted Backups / PITR)]
    API --> O[Logs / Metrics / Traces]
    W --> O
```

برای MVP، Managed Database و Container Runtime با محیط EU پیشنهاد می‌شود. Redis محل یگانه داده حیاتی نباشد. تعداد Replica بر اساس Load Test انتخاب شود؛ High Availability و Backup هزینه و هدف متفاوت دارند.

### 18.2 Pipeline

1. Install از Lockfile، Type Check و Lint.
2. Unit Test قواعد Domain و Integration Test با PostgreSQL واقعی.
3. Tenant Isolation، Payment Retry و Contract Test.
4. Build Image، Dependency/Secret Scan و ثبت Digest.
5. Deploy در Staging و اجرای Migration نسخه‌دار.
6. Smoke Test سفارش تا KDS و Payment Sandbox.
7. Deploy تدریجی در Production با Feature Flag و پایش.
8. بررسی Error Rate، Outbox Lag و Payment Reconciliation پیش از توسعه Rollout.

Migration با **Expand → Backfill → Switch → Contract** انجام شود. حذف Column یا تغییر Type ناسازگار همزمان با Deploy انجام نشود. Rollback کد، داده مالی ثبت‌شده را برنمی‌گرداند؛ اصلاح داده نیازمند Forward Fix یا Correction حسابرسی‌شده است.

### 18.3 SLOهای پیشنهادی برای طراحی

| معیار | هدف اولیه | روش سنجش |
|---|---|---|
| Availability مسیر سفارش | 99.9% ماهانه | Synthetic و Server Metrics؛ دامنه External Dependency جدا گزارش شود |
| P95 ثبت سفارش محلی | کمتر از 800ms | بدون انتظار PSP/POS؛ پس از Load Test تثبیت شود |
| KDS Update Lag | P95 کمتر از 2 ثانیه | از Commit تا نمایش یا ACK |
| Outbox Lag | معمولاً کمتر از 5 ثانیه | سن قدیمی‌ترین Delivery آماده |
| RPO هدف | حداکثر 5 دقیقه | با قابلیت واقعی PITR و Backup تأیید شود |
| RTO هدف | حداکثر 60 دقیقه | تمرین Restore در محیط جدا |

این‌ها هدف مهندسی‌اند و بدون شواهد نباید در SLA قرارداد تضمین شوند. SLO داخلی و SLA تجاری با جریمه قرارداد یکی نیستند.

### 18.4 Monitoring و Alert

- Error Rate و Latency بر Endpoint، بدون Label با Cardinality نامحدود.
- تعداد سفارش در `placed` بیش از حد انتظار و Ticket بدون ACK.
- Payment در `unknown`، Refund معطل و اختلاف مبلغ یا Currency.
- Outbox Lag، Dead Letter Count، Retry Storm و Connector Circuit Open.
- Pool Exhaustion، Slow Query، Storage، Replica Lag و Backup Failure.
- POS/TSE Failure، Certificate/Token Expiry و Export Failure.
- Spike دسترسی ردشده، Login Failure و Export غیرمعمول.

Alert باید Owner، Severity، لینک Runbook و معیار رفع داشته باشد. صرفاً ارسال Email بدون فرد پاسخگو کافی نیست.

### 18.5 Runbookهای لازم

| Incident | اقدام فوری | بازیابی |
|---|---|---|
| PSP Timeout | ایجاد پرداخت جدید متوقف؛ UI Pending | Lookup و تطبیق مرجع؛ ثبت نتیجه |
| POS قطع | کانال متأثر Pause و اطلاع به شعبه | اجرای مسیر توافق‌شده و Replay کنترل‌شده |
| KDS قطع | اطلاع به آشپزخانه و مسیر جایگزین ثبت‌شده | Snapshot کامل و Dedup Ticket |
| Database Failure | جلوگیری از ACK ثبت‌نشده | Failover یا Restore و تطبیق بیرونی |
| Data Leak | قطع دسترسی و حفظ Evidence | Incident Response و ارزیابی حقوقی |
| TSE Failure | اجرای Runbook رسمی شریک Fiscal | مستندسازی خرابی و کنترل رسیدها |

### 18.6 Backup و تداوم

- Backup رمزگذاری‌شده خودکار، PITR و کپی در حساب یا دامنه دسترسی جدا.
- Restore ماهانه پیشنهادی و پیش از تغییرات بزرگ Schema.
- بررسی تعداد Tenant، مبالغ، آخرین Event و فایل‌های Storage پس از Restore.
- پس از بازگردانی DB، Payment و POS ممکن است جلوتر از Backup باشند؛ پیش از Replay، با Provider Reconcile شود.
- Restore یک Tenant از Backup مشترک ابتدا در محیط ایزوله انجام و سپس به‌صورت کنترل‌شده Merge شود؛ Restore کل DB روی داده فعلی راهکار بازیابی یک رستوران نیست.
- دسترسی Break-glass با ثبت کامل و انقضا؛ Backup بدون آزمون Restore، تضمین بازیابی نیست.

<a id="quality"></a>
## 19. کیفیت و معیار پذیرش

### 19.1 تست‌های ضروری

| سطح | سناریو |
|---|---|
| Domain | انتقال وضعیت، Tax Rounding، Modifier، Discount و Refund Limit |
| Database | FK مرکب، Constraintها، Lock و Transaction Rollback |
| Isolation | خواندن/نوشتن Cross-tenant، Export، Cache، Queue، Storage و SSE |
| Payments | Duplicate، Out-of-order، Timeout بعد از Success، دو Attempt همزمان |
| Inventory | Consumption یکتا، Recipe Version، لغو قبل/بعد مصرف، Stocktake همزمان |
| Integrations | Signature نامعتبر، Account Mapping اشتباه و Schema تغییرکرده |
| E2E | ساخت منو تا سفارش، پرداخت Sandbox، KDS و رسید Partner |
| Reliability | Worker Crash قبل/بعد ACK، Redis Loss و Provider Outage |
| Accessibility | مسیر اصلی با Keyboard، Labelها، کنتراست و Touch Target |
| Load | سناریوی Burst بر مبنای فرض پایلوت و تعداد Connectionهای KDS |
| Fiscal | چرخه TSE و Export با Validator و شریک مسئول |

Integration Test باید با RLS فعال و **Runtime Role واقعی** اجرا شود؛ تست با Superuser نمی‌تواند Isolation را ثابت کند. Query Context در Pool و Jobهای پس‌زمینه جداگانه آزموده شود.

### 19.2 Definition of Done برای پایلوت پولی

- [ ] سه Role اصلی Owner، Staff و Kitchen به Scope مجاز محدودند.
- [ ] قیمت و Tax فقط از Server و Snapshot می‌آیند.
- [ ] Retry ثبت سفارش، Payment و Webhook اثر مضاعف ایجاد نمی‌کند.
- [ ] هر پول موفق بیرونی در Ledger ثبت یا در Review قابل مشاهده است.
- [ ] Refund و Cancellation، Inventory و Fiscal را به‌صورت مستقل و صحیح مدیریت می‌کنند.
- [ ] KDS پس از قطع شبکه Resync می‌شود و سفارش گم نمی‌شود.
- [ ] مسیر رسید و Export برای مدل POS منتخب تأیید شده است.
- [ ] Backup Restore و Reconciliation پس از بازیابی تمرین شده است.
- [ ] قرارداد، DPA، Retention و مسئول Support مشخص‌اند.
- [ ] آموزش شیفت، Checklist پایان روز و مسیر بازگشت به عملیات موجود آماده‌اند.
- [ ] اختلاف مالی توضیح‌نداده در پایلوت حل شده یا مانع Launch است.

<a id="roadmap"></a>
## 20. MVP Roadmap

### 20.1 فرض زمان‌بندی

برآورد اولیه **12 تا 16 هفته** برای تیمی با دو Full-stack Engineer، مشارکت Founder/Product و دسترسی پاره‌وقت QA/Design و متخصص Fiscal است. این برآورد به API آماده یک POS، Scope محدود و پاسخ‌گویی شریک بستگی دارد. ساخت صندوق مستقل، Offline کامل و چند Aggregator در این زمان منظور نشده‌اند. برای یک توسعه‌دهنده زمان بیشتر و Scope کمتر لازم است.

### 20.2 فازها

| فاز | بازه پیشنهادی | خروجی | Gate خروج |
|---|---|---|---|
| Discovery | هفته 1–2 | مصاحبه، Baseline، انتخاب POS و Data Flow | سه پایلوت و امکان Integration |
| Foundation | هفته 3–4 | Tenant، Auth، RLS، CI/CD و Audit | تست Isolation و Deploy Staging |
| Core Operations | هفته 5–7 | منو، Order، KDS، Outbox و Resync | سفارش انتهابه‌انتها بدون پول واقعی |
| Payments & POS | هفته 8–10 | PSP، Refund محدود، Fiscal Bridge و Reconciliation | Failure Test و تأیید Partner |
| Reporting & Onboarding | هفته 11–12 | Import، فروش روزانه، Export و Billing اولیه | تطبیق کامل روز آزمایشی |
| Controlled Pilot | هفته 13–14 | یک شعبه، شیفت محدود و Support نزدیک | نبود اختلاف باز و Adoption کافی |
| Stabilization | هفته 15–16 | رفع خطا، تمرین Restore و گسترش محدود | قرارداد پولی و Runbook پایدار |

فازها زمان تقویمی قطعی نیستند. اگر POS در هفته دوم Sandbox و دسترسی تجاری ندهد، Plan باید اصلاح شود؛ نباید این ریسک تا هفته هشتم پنهان بماند.

### 20.3 Backlog بعد از MVP

1. Inventory Ledger و Recipe برای پرفروش‌ترین اقلام.
2. Purchasing، Stocktake و Waste Report.
3. یک Delivery Integration با قرارداد واقعی.
4. Multi-location Menu و Permission پیشرفته.
5. Reservations یا Loyalty، بر اساس تقاضای مشتری پرداخت‌کننده.
6. AI Summary و Forecast پس از شکل‌گیری داده معتبر.
7. Offline Edge و صندوق مستقل فقط با توجیه تجاری و شریک مناسب.

### 20.4 معیار توقف یا تغییر مسیر

- اگر مشکل اصلی مشتری صرفاً Hardware است و RestaurantOS آن را حل نمی‌کند، Positioning بازنگری شود.
- اگر هزینه اتصال هر مشتری از سود قابل انتظار بسیار بیشتر است، تعداد POSهای پشتیبانی‌شده محدود شود.
- اگر مدیر برای Report حاضر به پرداخت نیست اما برای Order Reliability هست، اولویت محصول تغییر کند.
- اگر پایلوت نیازمند ورود دوباره دائمی داده است، قبل از افزودن Feature مشکل Integration حل شود.

<a id="pricing"></a>
## 21. Pricing و مدل مالی

تمام قیمت‌های زیر **فرضیه پیشنهادی برای آزمایش بازار** هستند؛ قیمت تأییدشده بازار یا نقل‌قول تأمین‌کننده نیستند. مبالغ ماهانه به EUR و بدون VAT بیان شده‌اند.

### 21.1 پلن‌های پیشنهادی

| Plan | قیمت آزمایشی | محدوده پیشنهادی |
|---|---|---|
| Starter | €79 / Location / ماه | منو، سفارش، KDS و گزارش پایه؛ یک Connector استاندارد منتخب |
| Pro | €149 / Location / ماه | Starter + Recipe/Inventory، Purchase Draft و گزارش پیشرفته پس از عرضه |
| Group | از €299 / ماه برای دو شعبه | مدیریت مرکزی و گزارش گروهی؛ هر شعبه اضافه با Quote مشخص |
| Enterprise | قرارداد جدا | Dedicated Deployment، SSO یا SLA متناسب با هزینه |

Feature عرضه‌نشده فروخته یا در قرارداد فعال معرفی نشود. Seatهای عملیاتی معمول می‌توانند در پلن باشند تا استفاده کارکنان محدود نشود؛ سقف منصفانه و هزینه مصرف غیرعادی صریح باشد.

هزینه‌های جداگانه احتمالی:

- Onboarding و Import استاندارد: فرض آزمایشی €199 تا €499، بر اساس کیفیت داده.
- Integration اختصاصی، Hardware، TSE، SMS، PSP Fee و هزینه خود POS: جدا و شفاف.
- AI: بسته مصرفی اختیاری با سقف، پس از سنجش Cost per Tenant.
- Support خارج ساعت یا SLA ویژه: فقط با ظرفیت پاسخ‌گویی و قیمت مستقل.

در MVP از درصد روی هر سفارش به‌عنوان درآمد اصلی شروع نشود مگر ارزش و قرارداد آن روشن باشد. درآمد Subscription از وجه سفارش رستوران جداست. Marketplace Settlement یا نگهداری وجوه نیازمند ساختار حقوقی و PSP مناسب است؛ در مدل پایه RestaurantOS پول غذا را به حساب خود جمع نمی‌کند.

### 21.2 Unit Economics نمونه

**فرض محاسباتی، نه پیش‌بینی:**

```text
30 locations × €99 average monthly revenue = €2,970 MRR
Variable cost per location                 = €20 / month
Contribution per location                  = €79 / month
Monthly contribution before fixed costs   = €2,370
Fixed monthly operating cost              = €6,000
Break-even locations                       = ceil(6000 / 79) = 76

If CAC = €400:
Simple CAC payback = 400 / 79 ≈ 5.1 months
```

این نمونه Tax، Churn، دستمزد Founder در صورت خارج‌بودن از Fixed Cost، Bad Debt و هزینه یک‌باره Integration را به‌طور خودکار پوشش نمی‌دهد. `€99` میانگین مفروض سبد است، نه پلن چهارم. اگر Support هر شعبه افزایش یابد، Contribution کاهش می‌یابد. LTV بدون Cohort و Churn معتبر محاسبه قطعی ندارد.

### 21.3 Go-to-market اجرایی

1. شروع در یک شهر و یک نوع رستوران با یک POS منتخب.
2. Demo بر اساس منوی واقعی مشتری و یک سناریوی شیفت.
3. پایلوت محدود 30 روزه با Baseline، تعهد همکاری و مسئول مشخص.
4. جلسه هفتگی برای خطا، زمان پشتیبانی و معیار ارزش.
5. پیشنهاد قرارداد با نتیجه قابل اندازه‌گیری و دامنه Support روشن.
6. معرفی مشتری جدید با اجازه مشتری فعلی؛ همکاری با نصاب POS یا حسابدار در صورت توافق.
7. گسترش شهر و POS فقط بعد از تکرارپذیرشدن Onboarding و Support.

### 21.4 شاخص‌های SaaS

MRR، Net Revenue Retention، Logo Churn، Activation Time، Support Minutes، Gross Margin، CAC Payback و Connector Failure Rate رصد شوند. برای نمونه کوچک، داده خام Cohort همراه درصد گزارش شود تا یک مشتری تصویر را منحرف نکند.

<a id="risks"></a>
## 22. ریسک‌ها و تصمیم‌های باز

### 22.1 Risk Register

| ریسک | احتمال/اثر اولیه | کاهش ریسک | مسئول پیشنهادی |
|---|---|---|---|
| طبقه‌بندی اشتباه به‌عنوان Back Office | نامعلوم / بسیار بالا | بررسی Data Flow و تأیید Fiscal پیش از فروش | Founder |
| API محدود یا غیرقابل دسترس POS | بالا / بالا | قرارداد و Sandbox در Discovery | Integration Lead |
| پرداخت تکراری یا گمشده | متوسط / بسیار بالا | Idempotency، Ledger و Reconciliation | Payments Engineer |
| Cross-tenant Leak | متوسط / بسیار بالا | RLS، FK مرکب، RBAC و آزمون همه لایه‌ها | Tech Lead |
| اختلال اینترنت هنگام شیفت | بالا / بالا | نمایش قطع اتصال و Runbook عملیاتی | Operations |
| Adoption پایین کارکنان | متوسط / بالا | مشاهده شیفت، Touch UX و آموزش کوتاه | Product |
| موجودی غیرواقعی | بالا / متوسط | Recipe محدود، شمارش و هشدار کیفیت داده | Restaurant Manager |
| هزینه Support بیش از درآمد | متوسط / بالا | Standardization و سنجش دقیقه/شعبه | Founder |
| وابستگی به یک Vendor | متوسط / بالا | Adapter، Export و Exit Plan | Tech Lead |
| Scope Creep | بالا / بالا | Gateهای MVP و سقف Connector | Product |
| AI نامعتبر یا افشای داده | متوسط / بالا | Tools محدود، Evaluation و Minimized Data | AI Owner |
| بی‌اعتباری قیمت‌گذاری | نامعلوم / بالا | آزمایش قرارداد پولی و Cohort Margin | Founder |

### 22.2 تصمیم‌هایی که قبل از کدنویسی اصلی باید بسته شوند

| تصمیم | پیشنهاد این سند | شرط تأیید |
|---|---|---|
| بازار نخست | آلمان، یک شهر، رستوران کوچک | مصاحبه و دسترسی Founder |
| نقش محصول | Order/KDS با POS Bridge | بررسی حقوقی و Fiscal |
| POS نخست | یک Provider دارای API رسمی | دسترسی، Mapping و هزینه |
| Payment Policy | Prepaid برای QR/Pickup؛ Pay-later برای Staff مجاز | قرارداد و عملیات شعبه |
| Inventory Consumption | Start Preparation | وجود رویداد معتبر در KDS |
| Multi-tenancy | Shared Schema + RLS | تست Runtime Role |
| Deployment | Managed EU Container + PostgreSQL | هزینه، DPA و Restore |
| Billing | Subscription شعبه‌ای | پذیرش قیمت در پایلوت |

### 22.3 ADRهای اولیه

- **ADR-001:** Modular Monolith به‌جای Microservices تا وجود نیاز مستند.
- **ADR-002:** Tenant Isolation در Application، Constraint و RLS.
- **ADR-003:** Outbox/Inbox برای تحویل پایدار و Idempotent Effects.
- **ADR-004:** Ledger پرداخت و تطبیق؛ Payment State مستقل از Order State.
- **ADR-005:** Recipe Snapshot و Stock Movement Ledger.
- **ADR-006:** POS/Fiscal Integration پیش از صندوق مستقل.
- **ADR-007:** AI اختیاری و محدود به داده و Tool مجاز.

<a id="implementation"></a>
## 23. گام‌های اجرایی

### 23.1 ده روز کاری نخست

| روز | اقدام | خروجی قابل تحویل |
|---|---|---|
| 1 | تأیید ICP، نوع سفارش و نقش Fiscal | Product Scope یک‌صفحه‌ای |
| 2 | مصاحبه و مشاهده عملیات | سه مشکل با Baseline |
| 3 | تماس با POS و بررسی قرارداد/API | Capability Matrix و Sandbox |
| 4 | مرور Data Flow با شریک Fiscal | لیست Launch Gate و مسئولیت |
| 5 | طراحی Order/Payment State Machine | سناریوهای خطا و Acceptance Criteria |
| 6 | ایجاد Workspace و CI | Build تکرارپذیر و محیط Staging |
| 7 | Tenant، Membership و Runtime DB Role | تست مثبت و منفی Isolation |
| 8 | Migration هسته و Outbox | Commit اتمیک سفارش و Event |
| 9 | منوی حداقلی و Use Case ثبت | سفارش با Snapshot و Retry امن |
| 10 | KDS Snapshot و SSE | Demo از ثبت تا Ready همراه Resync |

بخش فنی می‌تواند با Discovery موازی پیش برود، اما تصمیم Fiscal و اتصال POS نباید پس از ساخت کل محصول به تعویق بیفتد.

### 23.2 ترتیب Vertical Slice

1. **Tenant Slice:** Login ← Membership ← Location ← Query ایزوله.
2. **Catalog Slice:** Product ← Modifier ← Publish ← Public Menu.
3. **Order Slice:** Quote ← Place ← Snapshot ← History ← Outbox.
4. **Kitchen Slice:** Accept ← Ticket ← Start ← Ready ← Resync.
5. **Payment Slice:** Attempt ← PSP Sandbox ← Signed Webhook ← Allocation ← Reconcile.
6. **Fiscal Slice:** شروع/پایان از مسیر Partner ← Receipt ← Correction ← Export.
7. **Reporting Slice:** Close Day ← Sales/Payment Comparison ← Export.
8. **Pilot Slice:** Import واقعی ← آموزش ← شیفت محدود ← Review ← قرارداد.

### 23.3 User Storyهای آماده تبدیل به Issue

| Story | Acceptance Criteria |
|---|---|
| مدیر منوی شعبه را منتشر می‌کند | Draft از Published جداست؛ نسخه قدیمی سفارش تغییر نمی‌کند |
| مشتری با QR سفارش می‌دهد | Client Price نادیده گرفته می‌شود؛ Retry یک Order می‌سازد |
| آشپز Ticket را آماده می‌کند | Role محدود؛ Start/Ready با Version؛ Resync بدون گم‌شدن Ticket |
| Payment Webhook دریافت می‌شود | Signature و Account بررسی؛ Inbox پایدار پیش از ACK |
| مدیر Refund می‌کند | Permission، سقف و Reason؛ Retry بدون Refund دوم |
| Inventory مصرف ثبت می‌کند | Recipe Snapshot و Effect Key؛ Refund موجودی را زیاد نمی‌کند |
| حسابدار Export می‌گیرد | Scope مجاز، فایل خصوصی، Audit و نسخه Schema |
| Support مشکل Tenant را می‌بیند | دسترسی موقت، Actor واقعی و ثبت علت |

### 23.4 قرارداد تحویل MVP

**ورودی لازم از مشتری:** منو، Tax Mapping تأییدشده، مشخصات شعبه، دسترسی مجاز POS، کاربران و مسئول شیفت.

**خروجی تیم:** نرم‌افزار Deployشده، اتصال آزموده‌شده، مستند Onboarding، Runbook، Export نمونه، آموزش و معیار پایلوت.

**شرط Go-live:** عبور از Definition of Done و Launch Gate؛ تصمیم مدیر مسئول و شواهد Partner در دامنه Fiscal.

**پس از Go-live:** یک چرخه کامل بستن روز، ثبت و حل اختلاف، بررسی Adoption و هزینه Support؛ سپس گسترش تدریجی.

### 23.5 پرسش‌های بازبینی پیش از تعهد بودجه

- آیا POS منتخب واقعاً API، مجوز تجاری و داده لازم برای اصلاح، Refund و رسید را فراهم می‌کند؟
- آیا سه رستوران پایلوت برای همین مسئله و با قیمت پیشنهادی حاضر به پرداخت‌اند؟
- آیا برآورد 12–16 هفته با نقش Fiscal انتخاب‌شده و ظرفیت واقعی تیم سازگار است؟

<a id="references"></a>
## 24. منابع و واژه‌نامه

### 24.1 منابع رسمی بررسی‌شده

لینک‌ها در تاریخ 2026-10-28 بررسی شده‌اند. قانون و مستندات Provider ممکن است تغییر کنند؛ هنگام عقد قرارداد و Launch دوباره بررسی شوند. منابع قانونی مبنای Issue Spotting این سند هستند و منابع فنی قواعد زیرساخت را توضیح می‌دهند؛ قیمت‌ها و SLOهای این سند از این منابع اقتباس نشده‌اند.

1. [KassenSichV — متن رسمی BMF 2026](https://ao.bundesfinanzministerium.de/ao/2026/Abgabenordnung/Vierter-Teil/Zweiter-Abschnitt/Erster-Unterabschnitt/Paragraf-146a/KassenSichV.html)
2. [KassenSichV §6 — الزامات رسید](https://www.gesetze-im-internet.de/kassensichv/__6.html)
3. [BMF FAQ — Kassengesetz و Belegpflicht](https://www.bundesfinanzministerium.de/Content/DE/FAQ/FAQ-steuergerechtigkeit-belegpflicht.html)
4. [BZSt — DSFinV-K](https://www.bzst.de/DE/Unternehmen/Aussenpruefungen/DigitaleSchnittstelleFinV/digitaleschnittstellefinv_node.html?lv2=90794)
5. [Hessen Finanzamt — اعلام سیستم طبق §146a AO](https://finanzamt.hessen.de/meldung-von-kassensystemen-und-taxameternwegstreckenzaehlern-nach-ss-146a-absatz-4-ao)
6. [UStG §12 — نرخ مالیات](https://www.gesetze-im-internet.de/ustg_1980/__12.html)
7. [BMF — تغییر مالیات Restaurant/Catering از 2026](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-12-22-verpflegungsdienstleistungen.pdf?__blob=publicationFile&v=5)
8. [EUR-Lex — Regulation (EU) 2016/679، GDPR](https://eur-lex.europa.eu/legal-content/EN/TXT/?qid=1680253036157&uri=CELEX%3A32016R0679)
9. [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
10. [Stripe — Webhooks](https://docs.stripe.com/webhooks)
11. [Stripe — Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)

### 24.2 واژه‌نامه

| اصطلاح | معنی در RestaurantOS |
|---|---|
| SaaS | نرم‌افزار اشتراکی ارائه‌شده به چند کسب‌وکار |
| Tenant | مرز داده و قرارداد یک کسب‌وکار |
| Location | شعبه عملیاتی |
| Modular Monolith | یک محصول Deployشونده با مرزهای ماژولی روشن |
| Bounded Context | محدوده مالکیت مدل و قواعد یک Domain |
| Aggregate | مجموعه داده‌ای که قواعد یکپارچگی آن با هم اعمال می‌شود |
| Outbox | رویداد پایدار ثبت‌شده همزمان با تغییر کسب‌وکار |
| Inbox | ثبت دریافت برای جلوگیری از پردازش تکراری |
| Idempotency | تکرار درخواست بدون تکرار اثر همان عملیات |
| KDS | Kitchen Display System |
| PSP | Payment Service Provider |
| POS | Point of Sale / سیستم صندوق و فروش |
| TSE | Technische Sicherheitseinrichtung |
| DSFinV-K | قالب استاندارد خروجی داده صندوق برای اداره مالیات آلمان |
| GoBD | اصول مستندسازی و نگهداری الکترونیکی داده‌های مرتبط با حسابداری |
| RLS | Row-Level Security در Database |
| RBAC | Role-Based Access Control |
| DPA | Data Processing Agreement |
| PII | داده قابل انتساب به فرد |
| Reconciliation | تطبیق وضعیت و مبلغ بین دو منبع مستقل |
| Snapshot | کپی ثابت داده مورد استفاده در زمان یک رویداد |
| RPO | حداکثر ازدست‌رفتن داده قابل تحمل بر حسب زمان |
| RTO | مدت هدف برای بازیابی خدمت |
| ADR | Architecture Decision Record |
| SLO | هدف داخلی کیفیت خدمت |
| SLA | تعهد قراردادی سطح خدمت |

---

**وضعیت نهایی سند:** طرح پیشنهادی منسجم برای ساخت و اعتبارسنجی RestaurantOS؛ موارد باز اصلی، POS/Fiscal Partner، تأیید تقاضا و قیمت، و ظرفیت تیم هستند. این فایل مستند طراحی است و به معنای وجود نرم‌افزار پیاده‌سازی‌شده یا تأییدیه قانونی نیست.
