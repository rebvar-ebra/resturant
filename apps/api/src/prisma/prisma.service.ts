import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import type { AppConfig } from "@restaurantos/config";
import type { TenantContext } from "@restaurantos/shared-kernel";
import { CONFIG } from "../config.token.js";

/**
 * Central data access service.
 *
 * Tenant isolation (spec §7.5, §13.4):
 *  - Every query touching tenant-owned tables MUST run inside
 *    `withTenantTransaction`, which sets a *transaction-local*
 *    `app.tenant_id` consumed by RLS policies.
 *  - `set_config(..., true)` is transaction-local: safe on a pooled
 *    connection, never leaks the tenant to the next checkout.
 *  - The runtime DB role is not a table owner and has no bypass;
 *    FORCE ROW LEVEL SECURITY is enabled on tenant-owned tables.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Inject(CONFIG) config: AppConfig) {
    super({
      datasources: { db: { url: config.DATABASE_URL } },
      log:
        config.APP_ENV === "development"
          ? ["warn", "error"]
          : ["error"],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Run `fn` inside a single PostgreSQL transaction with the RLS tenant
   * context bound. External network calls must NOT happen inside (spec §4.2.3).
   */
  async withTenantTransaction<T>(
    ctx: TenantContext,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      // Parameterised set_config — never interpolate the tenant id into SQL.
      await tx.$executeRaw`
        SELECT set_config('app.tenant_id', ${ctx.tenantId}::text, true)
      `;
      return fn(tx);
    });
  }

  /**
   * Identity-scoped transaction (ADR-0001): sets app.user_id so the
   * access-control tables (users, memberships, membership_locations) are
   * visible for *this user only* — e.g. GET /v1/me. Business tables stay
   * closed because they only accept the tenant context.
   */
  async withIdentityTransaction<T>(
    userId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT set_config('app.user_id', ${userId}::text, true)
      `;
      return fn(tx);
    });
  }

  /**
   * For operations that are legitimately cross-tenant by design
   * (e.g. outbox relay in the worker). Use sparingly and review every call.
   */
  async withSystemTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    this.logger.warn("withSystemTransaction used — verify necessity");
    return this.$transaction(fn);
  }
}
