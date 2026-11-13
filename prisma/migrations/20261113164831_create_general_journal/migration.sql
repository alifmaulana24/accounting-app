-- CreateEnum
CREATE TYPE "JournalSource" AS ENUM ('MANUAL', 'PURCHASE', 'PURCHASE_PAYMENT', 'SALE', 'SALE_PAYMENT');

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "journal_number" VARCHAR(30) NOT NULL,
    "journal_date" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "source_type" "JournalSource" NOT NULL,
    "source_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" UUID NOT NULL,
    "journal_entry_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" VARCHAR(255),
    "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_journal_number_key" ON "journal_entries"("journal_number");

-- CreateIndex
CREATE INDEX "journal_entries_journal_date_idx" ON "journal_entries"("journal_date");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_source_type_source_id_key" ON "journal_entries"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "journal_lines_account_id_idx" ON "journal_lines"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_lines_journal_entry_id_line_number_key" ON "journal_lines"("journal_entry_id", "line_number");

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
