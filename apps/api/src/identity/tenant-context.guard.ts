import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  PrismaMembershipRepository,
  ResolveTenantContext,
} from "@restaurantos/identity";
import {
  NotFoundError,
  type AuthorizedTenantContext,
} from "@restaurantos/shared-kernel";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AuthenticatedRequest } from "./session.guard.js";

export interface TenantScopedRequest extends AuthenticatedRequest {
  tenantCtx: AuthorizedTenantContext;
}

/**
 * Spec §13.2: the tenant id in the URL is only a selector. This guard
 * verifies the active membership and attaches the effective context.
 * Queries afterwards run inside withTenantTransaction (RLS-bound).
 */
@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<TenantScopedRequest>();
    const tenantIdParam = req.params["tenantId"];
    if (typeof tenantIdParam !== "string" || tenantIdParam.length === 0) {
      throw new NotFoundException();
    }
    const tenantId = tenantIdParam;

    const resolve = new ResolveTenantContext(new PrismaMembershipRepository());
    try {
      // Membership lookup runs in the tenant's own transaction so RLS is
      // exercised from the very first query of the request.
      req.tenantCtx = await this.prisma.withTenantTransaction(
        { tenantId },
        (tx) => resolve.execute(tx, req.userId, tenantId),
      );
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw new NotFoundException();
      throw error;
    }
  }
}
