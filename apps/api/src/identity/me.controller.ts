import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { PrismaMembershipRepository } from "@restaurantos/identity";
import type { Uuid } from "@restaurantos/shared-kernel";
import { PrismaService } from "../prisma/prisma.service.js";
import { CurrentUser } from "./decorators.js";
import { SessionGuard } from "./session.guard.js";

/** GET /v1/me — identity and memberships of the current user (spec §16.2). */
@Controller("me")
@UseGuards(SessionGuard)
export class MeController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async me(@CurrentUser() userId: Uuid) {
    // Access-control data is visible to the owning user via app.user_id
    // (ADR-0001); tenant-owned business tables stay closed here.
    const memberships = await this.prisma.withIdentityTransaction(
      userId,
      (tx) => new PrismaMembershipRepository().listByUser(tx, userId),
    );

    return {
      userId,
      memberships: memberships.map((m) => ({
        tenantId: m.tenantId,
        role: m.role,
        locationIds: m.locationIds,
      })),
    };
  }
}
