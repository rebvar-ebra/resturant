import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthorizedTenantContext, Uuid } from "@restaurantos/shared-kernel";
import type { TenantScopedRequest } from "./tenant-context.guard.js";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Uuid => {
    return ctx.switchToHttp().getRequest<TenantScopedRequest>().userId;
  },
);

export const CurrentTenantContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthorizedTenantContext => {
    return ctx.switchToHttp().getRequest<TenantScopedRequest>().tenantCtx;
  },
);
