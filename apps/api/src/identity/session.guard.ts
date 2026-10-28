import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { AppConfig } from "@restaurantos/config";
import type { Uuid } from "@restaurantos/shared-kernel";
import type { Request } from "express";
import { CONFIG } from "../config.token.js";

export interface AuthenticatedRequest extends Request {
  userId: Uuid;
}

/**
 * Resolves the authenticated user.
 *
 * DEV ONLY: accepts `x-user-id` when APP_ENV is development/test so the
 * Tenant Slice can be exercised end-to-end before the OIDC provider is wired.
 * The OIDC implementation (spec §5, §14) replaces the header path; the rest
 * of the stack already depends only on `req.userId`.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (this.config.APP_ENV === "development" || this.config.APP_ENV === "test") {
      const header = req.headers["x-user-id"];
      if (typeof header === "string" && header.length > 0) {
        req.userId = header;
        return true;
      }
    }

    // TODO(oidc): validate access token against OIDC_ISSUER_URL (JWKS),
    // enforce MFA for owner/support, map to users table, check device session.
    throw new UnauthorizedException({
      error: {
        code: "UNAUTHENTICATED",
        message: "Valid session required",
      },
    });
  }
}
