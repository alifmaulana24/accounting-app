# Ledger --- Database Design

## 1. Database

-   Database engine: PostgreSQL.
-   ORM: Prisma 7.10.1.
-   Prisma schema: `prisma/schema.prisma`.
-   Migrations: `prisma/migrations/`.
-   Generated Prisma Client: `lib/generated/prisma/`.

Use Prisma migrations to evolve the database schema. Do not make
undocumented manual schema changes.

## 2. Current Product model

The approved Product model currently uses SKU as its primary key:

``` prisma
model Product {
  sku       String   @id @db.VarChar(50)
  name      String   @db.VarChar(255)
  category  String   @db.VarChar(100)
  brand     String?  @db.VarChar(100)
  unit      String   @db.VarChar(30)

  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@map("products")
}
```

The actual checked-in `schema.prisma` is authoritative if it differs
from this example.

## 3. Product data rules

-   `sku` is the primary key and must be unique.
-   `name`, `category`, and `unit` are required.
-   `brand` is nullable.
-   `isActive` defaults to `true`.
-   Category input is trimmed and normalized to uppercase by the Zod
    validation layer.
-   Unit input is trimmed and normalized to uppercase by the Zod
    validation layer.
-   Product does not contain a stock quantity column.

## 4. Data integrity

-   Enforce uniqueness and required fields at the database level
    wherever appropriate.
-   Use foreign keys for relationships between products and dependent
    transaction records.
-   Use database transactions for operations that must succeed or fail
    together.
-   Never rely solely on frontend validation for data integrity.

## 5. Schema change workflow

After an approved schema change:

1.  Update `prisma/schema.prisma`.
2.  Run `npx prisma validate`.
3.  Create and apply a migration using the project's configured Prisma
    workflow.
4.  Run `npx prisma generate`.
5.  Run `npx tsc --noEmit`.
6.  Update this document if the change affects documented data
    structures or rules.

Do not edit generated Prisma Client files manually.
