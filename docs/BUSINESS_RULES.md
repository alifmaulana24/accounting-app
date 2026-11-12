# Ledger --- Business Rules

This document records the currently approved business rules. Features
marked as planned are not necessarily implemented yet.

## 1. General operating rules

-   The initial system supports one business and one warehouse.
-   Currency is IDR.
-   Negative stock is not allowed.
-   Product identity is managed in Master Produk; stock quantity and
    value are managed by inventory records.
-   Products are manually created. No product CSV/Excel import is
    planned for the initial version.

## 2. Master Produk

### Product fields

  -----------------------------------------------------------------------
  Field                               Rule
  ----------------------------------- -----------------------------------
  SKU                                 Required, unique, maximum 50
                                      characters; currently used as the
                                      primary key

  Product name                        Required, maximum 255 characters

  Category                            Required, maximum 100 characters;
                                      normalized to uppercase

  Brand                               Optional, maximum 100 characters

  Unit                                Required, maximum 30 characters;
                                      normalized to uppercase

  Active status                       Defaults to active

  Created/updated timestamps          Maintained by the database/ORM
  -----------------------------------------------------------------------

Category and unit are entered manually as text. Separate category and
unit master tables are not part of the current design.

### Stock and product lifecycle

-   Do not add a stock quantity field to the Master Produk form.
-   New products begin with zero stock.
-   Stock changes must be recorded through inventory operations, not by
    editing the product master.
-   Product deletion: Products can be deleted directly via `DELETE /api/products/[sku]`.
    In the current implementation, deletion does not check transaction or inventory references.
-   Use active/inactive status to control whether a product is available
    for new operations.

### SKU considerations

SKU is currently the product primary key. Treat it as immutable through
ordinary product update operations. Changing this decision requires
reviewing all dependent foreign keys and transaction/inventory
references.

### Product update rules

- Product data can be updated via `PATCH /api/products/[sku]`.
- Updatable fields: `name`, `category`, `brand`, `unit`, and `isActive`.
- SKU cannot be modified on update.
- Category and unit values are automatically trimmed and normalized to uppercase.
- Brand is optional and normalized to `null` if empty or whitespace only.
- Validation errors return HTTP 400 with per-field errors.

## 3. Master Supplier

### Supplier fields

  -----------------------------------------------------------------------
  Field                               Rule
  ----------------------------------- -----------------------------------
  Kode Supplier (supplierCode)        Required, unique, maximum 50
                                      characters; primary key, input manually

  Nama Supplier (name)                Required, maximum 255 characters

  Nomor Telepon (phone)               Optional, maximum 30 characters

  Email                               Optional, maximum 255 characters, valid email format

  Alamat (address)                    Optional, text

  Status (isActive)                   Defaults to active (true)

  Created/updated timestamps          Maintained by database/ORM
  -----------------------------------------------------------------------

### Lifecycle and Snapshot Boundary

- `supplierCode` is immutable as the primary key.
- Suppliers can be edited, activated, deactivated, and deleted.
- Ledger uses a snapshot approach for historical transactions. Modifying or deleting master supplier data does not affect historical transaction records.
- No contact person, notes, balance, or total purchase fields are maintained on the master supplier record.

## 4. Master Customer

### Customer fields

  -----------------------------------------------------------------------
  Field                               Rule
  ----------------------------------- -----------------------------------
  Kode Pelanggan (customerCode)       Required, unique, maximum 50
                                      characters; primary key, input manually

  Nama Pelanggan (name)               Required, maximum 255 characters

  Nomor Telepon (phone)               Optional, maximum 30 characters

  Email                               Optional, maximum 255 characters, valid email format

  Alamat (address)                    Optional, text

  Status (isActive)                   Defaults to active (true)

  Created/updated timestamps          Maintained by database/ORM
  -----------------------------------------------------------------------

### Lifecycle and Snapshot Boundary

- `customerCode` is immutable as the primary key.
- Customers can be edited, activated, deactivated, and deleted.
- Ledger uses a snapshot approach for historical transactions. Modifying or deleting master customer data does not affect historical transaction records.
- No contact person, notes, balance, or total sales fields are maintained on the master customer record.

## 5. Purchasing

-   Purchase transactions reference existing products and suppliers.
-   A purchase receipt is recorded in full in the initial workflow.
-   Receiving purchased goods increases inventory and creates FIFO
    inventory cost layers.
-   Purchase payment may be full, partial, or unpaid.
-   Unpaid amounts contribute to accounts payable.

## 6. Sales

-   Sales transactions reference existing products and customers where
    applicable.
-   A sale reduces inventory and consumes FIFO layers.
-   The backend determines FIFO allocations and calculates COGS. The
    frontend must not calculate or submit authoritative FIFO allocations
    or COGS.
-   Sales must be rejected if available stock is insufficient.
-   Sales payment may be full, partial, or unpaid.
-   Unpaid amounts contribute to accounts receivable.

## 7. Inventory and FIFO

-   Inventory valuation uses FIFO (First In, First Out).
-   Each incoming stock event creates an inventory layer with quantity
    and unit cost.
-   Outgoing stock consumes the oldest available layers first.
-   If multiple layers have the same effective ordering value, use a
    deterministic tie-breaker.
-   Record stock movements for traceability.
-   Stock increases through adjustment require a unit cost so that a
    FIFO layer can be created.
-   Stock decreases through adjustment consume existing FIFO layers.

## 8. Payments and outstanding balances

-   Payment records must be linked to their originating purchase or
    sales transaction.
-   Payment status is derived from the invoice amount and total
    payments:
    -   Belum Dibayar
    -   Dibayar Sebagian
    -   Lunas
-   Fully paid transactions have no remaining payable/receivable
    balance.
-   Partial and unpaid transactions retain their outstanding balances.

## 9. Journals

-   Relevant operational transactions generate journal entries.
-   Manual journal entries are also supported by the planned General
    Journal module.
-   A simple Chart of Accounts is required for manual journal entries
    and journal classification.
-   Posted journal entries should not be silently edited. Corrections
    should use reversal entries.

## 10. Cancellation and correction

-   Preserve cancelled transactions for auditability.
-   Do not treat cancellation as merely changing a status if inventory,
    payments, or journals have already been affected.
-   Cancellation must reverse the relevant effects correctly.
-   A sale cancellation should restore the quantities to the original
    FIFO layers where feasible.
-   A purchase cancellation must be blocked if reversing it would cause
    stock to become negative because the received goods have already
    been consumed.
-   Detailed refund/payment reversal behavior still requires an explicit
    design decision before implementing cancellation workflows.

## 11. Important implementation boundary

The frontend may collect user input and display calculated results, but
business-critical calculations and validation (stock availability, FIFO
allocation, COGS, balances, and journal generation) must be performed or
verified on the server.
