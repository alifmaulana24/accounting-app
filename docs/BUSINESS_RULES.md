# Ledger --- Business Rules

This document records the currently approved business rules. Features
marked as planned are not necessarily implemented yet.

## 1. General operating rules

-   The initial system supports one business and one warehouse.
-   Currency is IDR.
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

### Product lifecycle

-   Product deletion: Products can be deleted directly via `DELETE /api/products/[sku]`.
    In the current implementation, deletion does not check transaction references.
-   Use active/inactive status to control whether a product is available
    for new operations.

### SKU considerations

SKU is currently the product primary key. Treat it as immutable through
ordinary product update operations. Changing this decision requires
reviewing all dependent foreign keys and transaction
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
-   Purchase payment may be full, partial, or unpaid.
-   Payment records and their history remain attached to the originating
    purchase.

## 6. Sales

-   Sales transactions reference existing products and customers where
    applicable.
-   Sales payment may be full, partial, or unpaid.

## 7. Payments and remaining transaction amounts

-   Payment records must be linked to their originating purchase or
    sales transaction.
-   Payment status is derived from the invoice amount and total
    payments:
    -   Belum Dibayar
    -   Sebagian
    -   Lunas
-   Remaining amounts are tracked only on their originating transactions;
    they are not managed in a separate module.

## 8. Journals

-   Relevant operational transactions generate journal entries.
-   Manual journal entries are also supported by the planned General
    Journal module.
-   A simple Chart of Accounts is required for manual journal entries
    and journal classification.
-   Posted journal entries should not be silently edited. Corrections
    should use reversal entries.

## 9. Cancellation and correction

-   Preserve cancelled transactions for auditability.
-   Do not treat cancellation as merely changing a status if payments
    or journals have already been affected.
-   Cancellation must reverse the relevant effects correctly.
-   Detailed refund/payment reversal behavior still requires an explicit
    design decision before implementing cancellation workflows.

## 10. Important implementation boundary

The frontend may collect user input and display calculated results, but
business-critical calculations and validation (balances, and journal
generation) must be performed or verified on the server.
