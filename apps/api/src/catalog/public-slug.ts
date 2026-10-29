import { NotFoundError } from "@restaurantos/shared-kernel";
import { PrismaService } from "../prisma/prisma.service.js";

/**
 * Resolve a public QR slug via the public_slugs routing table (no RLS by
 * design — it only contains what the QR code already reveals).
 */
export async function resolvePublicSlug(
  prisma: PrismaService,
  slug: string,
): Promise<{ tenantId: string; locationId: string }> {
  const row = await prisma.publicSlug.findUnique({ where: { slug } });
  if (!row) throw new NotFoundError("restaurant", slug);
  return { tenantId: row.tenantId, locationId: row.locationId };
}
