import { InvariantViolationError, type Uuid } from "@restaurantos/shared-kernel";

/**
 * MenuVersion (spec §6.1): prices and allergens are versioned. A published
 * version is immutable — orders keep their snapshot even if the menu changes
 * afterwards (spec §8.5).
 */
export type MenuVersionStatus = "draft" | "published" | "archived";

export class MenuVersion {
  constructor(
    readonly tenantId: Uuid,
    readonly id: Uuid,
    readonly version: number,
    private currentStatus: MenuVersionStatus,
  ) {}

  get status(): MenuVersionStatus {
    return this.currentStatus;
  }

  publish(): void {
    if (this.currentStatus !== "draft") {
      throw new InvariantViolationError(
        `Only a draft menu can be published (current: ${this.currentStatus})`,
      );
    }
    this.currentStatus = "published";
  }
}
