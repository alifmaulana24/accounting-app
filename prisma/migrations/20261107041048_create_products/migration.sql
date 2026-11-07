-- CreateTable
CREATE TABLE "products" (
    "sku" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(100),
    "unit" VARCHAR(30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("sku")
);
