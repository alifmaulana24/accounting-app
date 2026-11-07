# Ledger --- Application Architecture

## 1. Architectural approach

Ledger uses a Next.js App Router application with a PostgreSQL database
accessed through Prisma.

The intended request flow is:

``` text
User interface (Next.js Client Components)
        |
        | HTTP request (fetch)
        v
Next.js Route Handler (app/api/**/route.ts)
        |
        | Validate input
        v
Zod schema
        |
        | Validated data
        v
Prisma Client
        |
        | PostgreSQL driver adapter
        v
PostgreSQL database
```

Frontend components must not access PostgreSQL directly. Database
operations belong on the server, normally in Route Handlers or
server-side modules.

## 2. Main technologies

-   **Next.js App Router:** routing, pages, layouts, and Route Handlers.
-   **TypeScript:** static type checking.
-   **Tailwind CSS:** utility-first styling.
-   **shadcn/ui:** reusable interface components.
-   **Zod:** runtime validation of untrusted input.
-   **Prisma:** database access and schema/migration management.
-   **PostgreSQL:** persistent relational database.

## 3. Project structure

The repository currently uses a root-level `app/` directory rather than
`src/app/`.

Relevant paths include:

``` text
app/
  api/
    products/
      route.ts
      [sku]/
        route.ts
  ...

components/
  ...

lib/
  prisma.ts
  auth.ts
  session.ts
  validations/
  generated/
    prisma/

prisma/
  schema.prisma
  migrations/

docs/
  PROJECT_CONTEXT.md
  ARCHITECTURE.md
  BUSINESS_RULES.md
  DATABASE.md
  API.md
```

This is a documentation guide, not an instruction to create every listed
file or folder immediately. Inspect the repository before adding paths.

## 4. Prisma client

The shared Prisma Client instance is initialized in `lib/prisma.ts` and
uses `PrismaPg` from `@prisma/adapter-pg`.

Import the shared instance rather than creating a new Prisma Client in
individual route handlers or components.

The generated Prisma Client is located at:

``` text
lib/generated/prisma/
```

Generated files must not be edited manually. Regenerate the client after
relevant Prisma schema changes.

## 5. Environment configuration

-   Next.js loads `.env.local` when running the application.
-   Direct TypeScript scripts executed with `tsx` may need to load
    `.env.local` explicitly using `dotenv`.
-   Prisma CLI configuration is defined in the repository's current
    Prisma config file.

Never commit `.env.local` or expose database credentials. Do not ask
users to paste secrets into chat or source control.

## 6. Validation and error handling

Validate incoming request data on the server using Zod. TypeScript types
alone do not validate runtime HTTP input.

Use explicit response status codes and predictable JSON response
structures. Do not pass arbitrary request-body properties directly into
Prisma.

## 7. Development principles

-   Keep components focused on clear responsibilities.
-   Keep database access on the server.
-   Avoid unnecessary dependencies and abstractions.
-   Do not change database schema or architecture as part of an
    unrelated UI task.
-   Prefer existing project conventions and installed shadcn/ui
    components.
-   Run `npx tsc --noEmit` after TypeScript changes.
