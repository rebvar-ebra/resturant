/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `locations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guest_token]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correlation_id` to the `outbox_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "event_deliveries" ADD COLUMN     "lease_until" TIMESTAMPTZ(6),
ADD COLUMN     "next_attempt_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "location_product_overrides" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "allergens_snapshot" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "category_id_snapshot" UUID,
ADD COLUMN     "category_name_snapshot" TEXT,
ADD COLUMN     "category_sort_snapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description_snapshot" TEXT,
ADD COLUMN     "modifier_groups_snapshot" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "menu_versions" ADD COLUMN     "published_by" UUID;

-- AlterTable
ALTER TABLE "modifier_groups" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "modifier_options" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "guest_token" TEXT,
ADD COLUMN     "payment_policy" TEXT NOT NULL DEFAULT 'pay_later',
ADD COLUMN     "service_type" TEXT NOT NULL DEFAULT 'dine_in';

-- AlterTable
ALTER TABLE "outbox_events" ADD COLUMN     "correlation_id" TEXT NOT NULL,
ADD COLUMN     "location_id" UUID;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "product_modifier_groups" (
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_modifier_groups_pkey" PRIMARY KEY ("tenant_id","product_id","group_id")
);

-- CreateTable
CREATE TABLE "public_location_slugs" (
    "slug" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_location_slugs_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_location_slugs_tenant_id_location_id_key" ON "public_location_slugs"("tenant_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_slug_key" ON "locations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "orders_guest_token_key" ON "orders"("guest_token");

-- CreateIndex
CREATE INDEX "outbox_events_occurred_idx" ON "outbox_events"("occurred_at");

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_tenant_id_group_id_fkey" FOREIGN KEY ("tenant_id", "group_id") REFERENCES "modifier_groups"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
