-- CreateTable
CREATE TABLE "purchases" (
    "id" UUID NOT NULL,
    "purchase_number" VARCHAR(30) NOT NULL,
    "purchase_date" DATE NOT NULL,
    "supplier_code" VARCHAR(50) NOT NULL,
    "supplier_name" VARCHAR(255) NOT NULL,
    "total_amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "product_sku" VARCHAR(50) NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_payments" (
    "id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchases_purchase_number_key" ON "purchases"("purchase_number");

-- CreateIndex
CREATE INDEX "purchases_purchase_date_idx" ON "purchases"("purchase_date");

-- CreateIndex
CREATE INDEX "purchases_supplier_code_idx" ON "purchases"("supplier_code");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_items_purchase_id_product_sku_key" ON "purchase_items"("purchase_id", "product_sku");

-- CreateIndex
CREATE INDEX "purchase_payments_purchase_id_idx" ON "purchase_payments"("purchase_id");

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_payments" ADD CONSTRAINT "purchase_payments_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
