# Ledger --- Project Context

## 1. Overview

**Ledger** is a Purchasing, Sales, and Inventory Management System for a
single retail pet-care business.

The application focuses on operational business processes: product
management, purchasing, sales, inventory, supplier/customer records,
payment tracking, and basic journal recording. It is **not intended to
be a full accounting system**.

## 2. Project goals

-   Centralize product, supplier, and customer master data.
-   Record purchases and sales.
-   Track inventory quantities and stock movements.
-   Calculate inventory cost and cost of goods sold (COGS) using FIFO.
-   Track accounts payable and receivable.
-   Generate journal entries from relevant operational transactions.
-   Provide a clear operational dashboard and transaction history.

## 3. Technology stack

  Area                      Technology
  ------------------------- ----------------------
  Application               Next.js App Router
  Language                  TypeScript
  Styling                   Tailwind CSS
  UI components             shadcn/ui
  Database                  PostgreSQL
  ORM                       Prisma ORM 7.10.1
  Database driver adapter   `@prisma/adapter-pg`
  PostgreSQL driver         `pg`
  Validation                Zod

Use the versions and configuration currently installed in the repository
as the source of truth.

## 4. Application scope

### Included

-   Dashboard
-   Purchasing
-   Sales
-   Inventory management
-   Product master
-   Supplier master
-   Customer master
-   Accounts payable management
-   Accounts receivable management
-   Operational transaction history
-   General Journal

### Not included in the initial version

-   Full General Ledger, Trial Balance, Income Statement, or Balance
    Sheet modules
-   Marketplace integrations
-   Payment gateway integrations
-   Tax and return workflows

These exclusions describe the current initial scope and may change only
after an explicit project decision.

## 5. Operating assumptions

-   One business and one warehouse.
-   Currency: Indonesian Rupiah (IDR).
-   Products are created manually through Master Produk.
-   New products begin with zero stock.
-   No negative stock is allowed.
-   Inventory valuation uses FIFO.
-   A purchase receipt is recorded as received in full in the initial
    workflow.

## 6. Source of truth

When working on the project:

1.  Inspect the current code and Prisma schema.
2.  Read the relevant documentation.
3.  Follow the latest explicitly approved business decisions.
4.  If documentation and implementation conflict, do not silently choose
    one. Identify the conflict and ask for clarification when it affects
    business behavior.
5.  Update documentation when an approved change affects architecture,
    data, API behavior, or business rules.

Do not assume that an old idea or an unimplemented feature is already
part of the application.
