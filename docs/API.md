# Ledger --- API Conventions

## 1. General conventions

API endpoints are implemented using Next.js App Router Route Handlers
under `app/api/`.

-   Use HTTP methods that match the operation.
-   Validate incoming data on the server with Zod.
-   Return JSON responses with a consistent structure.
-   Use meaningful HTTP status codes.
-   Do not expose database credentials or internal stack traces to
    clients.
-   Log unexpected server errors on the server.
-   Do not allow clients to submit protected or server-calculated
    fields.

## 2. Product endpoints

### `GET /api/products`

Purpose: retrieve the product list.

Current behavior: - Queries `prisma.product.findMany()`. - Sorts by
product name ascending. - Returns `success` and `data`.

Example response:

``` json
{
  "success": true,
  "data": []
}
```

### `POST /api/products`

Purpose: create a product.

Expected request fields:

``` json
{
  "sku": "TEST001",
  "name": "Cat Food Adult",
  "category": "Makanan Kucing",
  "brand": "Choize",
  "unit": "PCS"
}
```

Rules: - Validate with the product creation Zod schema. - Do not accept
stock quantity or a client-supplied ID. - Category and unit are trimmed
and normalized to uppercase. - New products are active by default. -
Persist using Prisma. - Return HTTP `201` when successful. - Return HTTP
`400` for invalid input. - Return HTTP `409` when SKU already exists. -
Return HTTP `500` for unexpected server errors.

Example success response:

``` json
{
  "success": true,
  "message": "Produk berhasil ditambahkan.",
  "data": {
    "sku": "TEST001"
  }
}
```

The actual response may contain additional Product fields.

### `PATCH /api/products/[sku]`

Purpose: update product information and/or active status.

Expected request fields:

``` json
{
  "name": "Cat Food Adult Tuna",
  "category": "Makanan Kucing",
  "brand": "Choize",
  "unit": "PCS",
  "isActive": true
}
```

Rules:
- Validate with `editProductSchema`.
- `sku` cannot be modified (primary key).
- Category and unit are trimmed and normalized to uppercase.
- Return HTTP `200` with updated data when successful.
- Return HTTP `400` for invalid input with `errors`.
- Return HTTP `404` when product is not found.
- Return HTTP `500` for unexpected server errors.

Example success response:

``` json
{
  "success": true,
  "message": "Produk berhasil diperbarui.",
  "data": {
    "sku": "TEST001",
    "name": "Cat Food Adult Tuna",
    "category": "MAKANAN KUCING",
    "brand": "Choize",
    "unit": "PCS",
    "isActive": true,
    "createdAt": "2026-11-12T08:53:03.523Z",
    "updatedAt": "2026-11-12T09:15:00.000Z"
  }
}
```

### `DELETE /api/products/[sku]`

Purpose: delete a product by its unique SKU.

Behavior:
- Reads the SKU from the dynamic route parameter.
- Deletes the product from the database using Prisma `prisma.product.delete()`.
- Currently, deletion is direct without checking transaction references.
- Returns HTTP `200` when successful.
- Returns HTTP `404` when the product is not found.
- Returns HTTP `500` for unexpected server errors.

Example success response:

``` json
{
  "success": true,
  "message": "Produk berhasil dihapus."
}
```

Example not found response (`404`):

``` json
{
  "success": false,
  "message": "Produk tidak ditemukan."
}
```

## 3. Supplier endpoints

### `GET /api/suppliers`

Purpose: retrieve the supplier list.

Current behavior:
- Queries `prisma.supplier.findMany()`.
- Sorts by supplier name ascending.
- Returns `success` and `data`.

Example response:

``` json
{
  "success": true,
  "data": []
}
```

### `POST /api/suppliers`

Purpose: create a new supplier.

Expected request fields:

``` json
{
  "supplierCode": "SUP-001",
  "name": "PT Maju Bersama",
  "phone": "021-55512345",
  "email": "info@majubersama.com",
  "address": "Jl. Raya Jakarta No. 10"
}
```

Rules:
- Validate with `createSupplierSchema` from `lib/validations/supplier.ts`.
- `supplierCode` is required, maximum 50 characters, and unique.
- `name` is required, maximum 255 characters.
- `phone`, `email`, and `address` are optional (`null` if empty or omitted).
- New suppliers are active by default (`isActive = true`).
- Return HTTP `201` when successful.
- Return HTTP `400` for invalid input with `errors`.
- Return HTTP `409` when `supplierCode` already exists.
- Return HTTP `500` for unexpected server errors.

Example success response:

``` json
{
  "success": true,
  "message": "Supplier berhasil ditambahkan.",
  "data": {
    "supplierCode": "SUP-001",
    "name": "PT Maju Bersama",
    "phone": "021-55512345",
    "email": "info@majubersama.com",
    "address": "Jl. Raya Jakarta No. 10",
    "isActive": true,
    "createdAt": "2026-11-12T08:53:03.523Z",
    "updatedAt": "2026-11-12T08:53:03.523Z"
  }
}
```

### `GET /api/suppliers/[supplierCode]`

Purpose: retrieve supplier detail by supplierCode.

Behavior:
- Reads `supplierCode` from dynamic route parameter.
- Queries `prisma.supplier.findUnique({ where: { supplierCode } })`.
- Returns HTTP `200` with supplier data when found.
- Returns HTTP `404` when supplier is not found.
- Returns HTTP `500` for unexpected server errors.

### `PATCH /api/suppliers/[supplierCode]`

Purpose: update supplier information and/or active status.

Expected request fields:

``` json
{
  "name": "PT Maju Bersama Updated",
  "phone": "021-55599999",
  "email": "contact@majubersama.com",
  "address": "Jl. Baru No. 20",
  "isActive": false
}
```

Rules:
- Validate with `editSupplierSchema`.
- `supplierCode` cannot be modified (primary key).
- Return HTTP `200` with updated data when successful.
- Return HTTP `400` for invalid input with `errors`.
- Return HTTP `404` when supplier is not found.
- Return HTTP `500` for unexpected server errors.

### `DELETE /api/suppliers/[supplierCode]`

Purpose: delete a supplier by supplierCode.

Behavior:
- Reads `supplierCode` from dynamic route parameter.
- Deletes using `prisma.supplier.delete({ where: { supplierCode } })`.
- Returns HTTP `200` when successful.
- Returns HTTP `404` when supplier is not found.
- Returns HTTP `500` for unexpected server errors.

## 4. Customer endpoints

### `GET /api/customers`

Purpose: retrieve the customer list.

Current behavior:
- Queries `prisma.customer.findMany()`.
- Sorts by customer name ascending.
- Returns `success` and `data`.

Example response:

``` json
{
  "success": true,
  "data": []
}
```

### `POST /api/customers`

Purpose: create a new customer.

Expected request fields:

``` json
{
  "customerCode": "CUST-001",
  "name": "Toko Berkah Abadi",
  "phone": "0812-3456-7890",
  "email": "toko.berkah@example.com",
  "address": "Jl. Merdeka No. 12"
}
```

Rules:
- Validate with `createCustomerSchema` from `lib/validations/customer.ts`.
- `customerCode` is required, maximum 50 characters, and unique.
- `name` is required, maximum 255 characters.
- `phone`, `email`, and `address` are optional (empty strings or whitespace are normalized to `null`).
- New customers are active by default (`isActive = true`).
- Return HTTP `201` when successful.
- Return HTTP `400` for invalid input with `errors`.
- Return HTTP `409` when `customerCode` already exists.
- Return HTTP `500` for unexpected server errors.

Example success response:

``` json
{
  "success": true,
  "message": "Pelanggan berhasil ditambahkan.",
  "data": {
    "customerCode": "CUST-001",
    "name": "Toko Berkah Abadi",
    "phone": "0812-3456-7890",
    "email": "toko.berkah@example.com",
    "address": "Jl. Merdeka No. 12",
    "isActive": true,
    "createdAt": "2026-11-12T14:13:10.000Z",
    "updatedAt": "2026-11-12T14:13:10.000Z"
  }
}
```

### `GET /api/customers/[customerCode]`

Purpose: retrieve customer detail by customerCode.

Behavior:
- Reads `customerCode` from dynamic route parameter.
- Queries `prisma.customer.findUnique({ where: { customerCode } })`.
- Returns HTTP `200` with customer data when found.
- Returns HTTP `404` when customer is not found.
- Returns HTTP `500` for unexpected server errors.

### `PATCH /api/customers/[customerCode]`

Purpose: update customer information and/or active status.

Expected request fields:

``` json
{
  "name": "Toko Berkah Abadi Updated",
  "phone": "0812-9999-0000",
  "email": "kontak@berkahabadi.com",
  "address": "Jl. Merdeka No. 15",
  "isActive": false
}
```

Rules:
- Validate with `editCustomerSchema`.
- `customerCode` cannot be modified (primary key).
- Return HTTP `200` with updated data when successful.
- Return HTTP `400` for invalid input with `errors`.
- Return HTTP `404` when customer is not found.
- Return HTTP `500` for unexpected server errors.

### `DELETE /api/customers/[customerCode]`

Purpose: delete a customer by customerCode.

Behavior:
- Reads `customerCode` from dynamic route parameter.
- Deletes using `prisma.customer.delete({ where: { customerCode } })`.
- Returns HTTP `200` when successful.
- Returns HTTP `404` when customer is not found.
- Returns HTTP `500` for unexpected server errors.

## 5. Planned product endpoints

The following endpoints are intended, but must be checked against the
current implementation before being treated as complete:

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  GET                     `/api/products/[sku]`   Retrieve product detail

  PATCH                   `/api/products/[sku]`   Update product
                                                  information and/or
                                                  active status
  -----------------------------------------------------------------------

Note: `DELETE /api/products/[sku]` is implemented as documented above.

## 6. Error response convention

Recommended shape:

``` json
{
  "success": false,
  "message": "A useful error message.",
  "errors": {}
}
```

The `errors` property may be included for field-level validation errors.

## 7. Security and data integrity

-   Treat all request bodies as untrusted.
-   Whitelist accepted fields; do not spread arbitrary request JSON into
    Prisma `data`.
-   Validate SKU and all other fields on the server.
-   Enforce uniqueness in PostgreSQL, not only in the UI.
-   Never expose raw Prisma errors or stack traces in public responses.
-   Use database transactions for multi-step business operations.

## 8. Purchase endpoints

### `GET /api/purchases`

Returns purchase summaries ordered by purchase date, including the invoice
number, supplier snapshot, total amount, total paid, outstanding amount,
and the backend-provided payment status (`Belum Dibayar`, `Sebagian`, or
`Lunas`).

### `POST /api/purchases`

Creates a purchase and its item snapshots. The frontend sends only:

``` json
{
  "purchaseDate": "2026-11-13",
  "supplierCode": "SUP-001",
  "items": [
    {
      "productSku": "PRD-001",
      "quantity": 2,
      "unitPrice": 25000
    }
  ],
  "initialPayment": 0
}
```

`initialPayment` is optional and defaults to `0`. Product and supplier
names, unit, subtotals, and total amount are resolved or calculated by the
backend. The endpoint returns HTTP `201` with the created purchase,
including its generated ID and invoice number. Invalid input returns
HTTP `400`; missing or inactive supplier/product returns HTTP `404`.

### `GET /api/purchases/[id]`

Returns purchase details including supplier and product snapshots, item
totals, payment history, total paid, outstanding amount, and backend
payment status. Returns HTTP `404` when the purchase is not found.

### `POST /api/purchases/[id]/payments`

Adds a payment to a purchase. Expected request fields:

``` json
{
  "paymentDate": "2026-11-13",
  "amount": 10000
}
```

The amount must be a positive whole number of Rupiah and cannot exceed
the outstanding amount. Successful responses include the payment and
updated totals/status. An amount exceeding the balance returns HTTP `400`.

### `DELETE /api/purchases/[id]`

Deletes a purchase only when it has no payment records. Returns HTTP `400`
when the purchase already has payment history, and HTTP `404` when it is
not found. Purchase transactions do not support edit/update operations.

## 9. Sales endpoints

### `GET /api/sales`

Returns sales summaries ordered by sale date, including invoice number,
customer snapshot, total amount, total paid, outstanding amount, and the
backend payment status (`Belum Dibayar`, `Sebagian`, or `Lunas`). The
response shape is `{ "success": true, "data": [] }`.

### `POST /api/sales`

Creates a sale and its customer, product, and payment snapshots. The
frontend sends:

``` json
{
  "saleDate": "2026-11-13",
  "customerCode": "CUST-001",
  "items": [
    {
      "productSku": "PRD-001",
      "quantity": 2,
      "unitPrice": 30000
    }
  ],
  "initialPayment": 0
}
```

`initialPayment` defaults to `0`. Product and customer snapshots and
financial totals are resolved or calculated by the backend. The endpoint
returns HTTP `201` with `{ "success": true, "message": "...", "data": {} }`.
Validation errors return HTTP `400`; missing or inactive customer/product
also return HTTP `400`.

### `GET /api/sales/[id]`

Returns a sale detail under `data`, including the stored customer and
product snapshots, payment history, totals, outstanding amount, and
backend payment status. It returns HTTP `404` with a `message` if not
found.

### `POST /api/sales/[id]/payments`

Adds a payment using `paymentDate` and a positive whole-Rupiah `amount`.
The response contains the payment and updated totals/status under `data`.
An amount exceeding the outstanding balance returns HTTP `400`.

### `DELETE /api/sales/[id]`

Deletes a sale only when it has no payment records. Returns HTTP `400`
when the sale already has payment history, and HTTP `404` when it is not
found. Sale transactions do not support edit/update operations.
