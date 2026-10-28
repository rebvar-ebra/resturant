import { newId, type Uuid } from "@restaurantos/shared-kernel";

export class Tenant {
  private constructor(
    readonly id: Uuid,
    readonly name: string,
  ) {}

  static create(name: string): Tenant {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      throw new Error("Tenant name must be at least 2 characters");
    }
    return new Tenant(newId(), trimmed);
  }
}
