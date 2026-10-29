-- CreateTable
CREATE TABLE "public_slugs" (
    "slug" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_slugs_pkey" PRIMARY KEY ("slug")
);
