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

### `DELETE /api/products/[sku]`

Purpose: delete a product by its unique SKU.

Behavior:
- Reads the SKU from the dynamic route parameter.
- Deletes the product from the database using Prisma `prisma.product.delete()`.
- Currently, deletion is direct without checking transaction or inventory references.
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

## 3. Planned product endpoints

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

## 4. Error response convention

Recommended shape:

``` json
{
  "success": false,
  "message": "A useful error message.",
  "errors": {}
}
```

The `errors` property may be included for field-level validation errors.

## 5. Security and data integrity

-   Treat all request bodies as untrusted.
-   Whitelist accepted fields; do not spread arbitrary request JSON into
    Prisma `data`.
-   Validate SKU and all other fields on the server.
-   Enforce uniqueness in PostgreSQL, not only in the UI.
-   Never expose raw Prisma errors or stack traces in public responses.
-   Use database transactions for multi-step business operations.
