# Ledger --- Database Design

## 1. Database and Prisma configuration

- Database engine: PostgreSQL.
- ORM: Prisma ORM 7.10.1.
- Schema: `prisma/schema.prisma`.
- Migration history: `prisma/migrations/`; the migration provider is PostgreSQL.
- Generated Prisma Client: `lib/generated/prisma/`, using the `prisma-client` generator.
- Prisma CLI configuration: `prisma7.config.ts`. It loads `.env.local`, points to the schema and migration folder, and configures `prisma/seed.ts`.
- Runtime database access: `lib/prisma.ts` creates the shared Prisma Client with `PrismaPg` and `DATABASE_URL`.

The checked-in Prisma schema and migrations are the source of truth. Do not edit generated Prisma Client files or make undocumented database changes.

## 2. Current models

The schema currently defines the following models and database tables:

| Model | Table | Primary key | Purpose and constraints |
| --- | --- | --- | --- |
| `Product` | `products` | `sku` (`VARCHAR(50)`) | Product master; `name` (255), `category` (100), nullable `brand` (100), `unit` (30), and `isActive` (default `true`). No stock quantity is stored. |
| `Supplier` | `suppliers` | `supplierCode` (`VARCHAR(50)`) | Supplier master; nullable phone (30), email (255), and address (`TEXT`); `name` is indexed. |
| `Customer` | `customers` | `customerCode` (`VARCHAR(50)`) | Customer master; nullable phone (30), email (255), and address (`TEXT`); `name` is indexed. |
| `Purchase` | `purchases` | `id` (`UUID`) | Purchase header with unique `purchaseNumber`, purchase date, supplier code/name snapshot, and `totalAmount` (`DECIMAL(18,2)`). Purchase date and supplier code are indexed. |
| `PurchaseItem` | `purchase_items` | `id` (`UUID`) | Purchase item snapshot with product SKU/name/unit, integer quantity, unit price, and subtotal (`DECIMAL(18,2)`). A purchase cannot contain duplicate product SKUs. |
| `PurchasePayment` | `purchase_payments` | `id` (`UUID`) | Purchase payment date, amount (`DECIMAL(18,2)`), and creation timestamp. Purchase ID is indexed. |
| `Sale` | `sales` | `id` (`UUID`) | Sale header with unique `saleNumber`, sale date, customer code/name snapshot, and `totalAmount` (`DECIMAL(18,2)`). Sale date and customer code are indexed. |
| `SaleItem` | `sale_items` | `id` (`UUID`) | Sale item snapshot with product SKU/name/unit, integer quantity, unit price, and subtotal (`DECIMAL(18,2)`). A sale cannot contain duplicate product SKUs. |
| `SalePayment` | `sale_payments` | `id` (`UUID`) | Sale payment date, amount (`DECIMAL(18,2)`), and creation timestamp. Sale ID is indexed. |
| `Account` | `accounts` | `id` (`UUID`) | Chart of Accounts entry with unique three-character `code`, name (100), account type, normal balance, `isSystem` (default `false`), and `isActive` (default `true`). Name is indexed. |

Supplier, customer, product, and account master rows have `createdAt` and `updatedAt` timestamps stored as `TIMESTAMPTZ(3)`. Transaction headers have the same timestamps; payment rows have `createdAt`.

## 3. Relations, snapshots, and database constraints

- `Purchase` has related `PurchaseItem` and `PurchasePayment` rows. Both foreign keys reference `purchases.id` and cascade on delete and update.
- `Sale` has related `SaleItem` and `SalePayment` rows. Both foreign keys reference `sales.id` and cascade on delete and update.
- Transaction item rows store product SKU, product name, and unit as snapshots. They do not have a foreign key to `products`.
- Purchase headers store supplier code and name as snapshots; sale headers store customer code and name as snapshots. These fields do not have foreign keys to the supplier or customer master tables.
- `Account` currently has no relations to journal or other transaction models.
- Unique constraints apply to product SKU, supplier code, customer code, account code, purchase number, and sale number. Each purchase/sale also has a composite unique constraint for its transaction ID and product SKU.
- The database column for account code limits it to three characters; the API validation schema enforces exactly three digits. Other application-level normalization and validation is enforced by the relevant Zod schemas.

The schema currently has no inventory/stock model and no journal model. Account entries therefore exist independently of any journal relation.

## 4. Enums and stored values

`AccountType` is a PostgreSQL enum with `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, and `EXPENSE`.

`NormalBalance` is a PostgreSQL enum with `DEBIT` and `CREDIT`.

Purchase and sale amounts use `DECIMAL(18,2)`. Transaction dates and payment dates use PostgreSQL `DATE`; timestamps use `TIMESTAMPTZ(3)`.

## 5. Seed data

`prisma/seed.ts` upserts eight default Chart of Accounts entries and marks newly created entries as system accounts. It uses `update: {}`, so rerunning the seed does not overwrite existing account records. Seeding is an explicit CLI operation; migrations do not automatically create these accounts.

## 6. Current migration history

The checked-in migrations create, in order:

1. Products (`20261107041048_create_products`)
2. Suppliers (`20261112074515_create_suppliers`)
3. Customers (`20261112093314_create_customers`)
4. Purchase tables (`20261113064027_add_purchase_tables`)
5. Sales tables (`20261113082824_add_sales`)
6. Account model and enums (`20261113092941_add_account_model`)

`prisma/migrations/migration_lock.toml` identifies PostgreSQL as the migration provider.

## 7. Schema change workflow

For an approved schema change:

1. Update `prisma/schema.prisma`.
2. Validate using the repository's Prisma 7 configuration:
   `npx prisma validate --config prisma7.config.ts`
3. Create and apply a development migration:
   `npx prisma migrate dev --name <migration_name> --config prisma7.config.ts`
4. Generate the client explicitly:
   `npx prisma generate --config prisma7.config.ts`
5. Run `npx tsc --noEmit`.
6. Update this document when the schema, constraints, or database workflow changes.

Use `npx prisma migrate deploy --config prisma7.config.ts` to apply checked-in migrations in a deployment environment. Run `npx prisma db seed --config prisma7.config.ts` only when the default account seed is required.

Do not use schema push as a substitute for the migration workflow in this project, and do not edit generated Prisma Client files manually.
