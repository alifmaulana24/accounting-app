-- CreateTable
CREATE TABLE "suppliers" (
    "supplier_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplier_code")
);

-- CreateIndex
CREATE INDEX "suppliers_name_idx" ON "suppliers"("name");
