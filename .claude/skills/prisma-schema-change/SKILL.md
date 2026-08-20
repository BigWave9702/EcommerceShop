---
name: prisma-schema-change
description: Safely change the shared MongoDB Prisma schema in EcommerceShop and propagate the change across every service/UI that consumes it. Use when adding/removing a model, field, or relation in prisma/schema.prisma, or when a Prisma-typed object is missing a field the code expects.
---

# Prisma Schema Change (EcommerceShop)

There is **one** schema for the whole monorepo: [prisma/schema.prisma](../../../prisma/schema.prisma), consumed by every backend service through `packages/libs/prisma`. A change here can ripple into any service.

## Workflow

1. Edit `prisma/schema.prisma`.
2. Regenerate the client and validate:
   ```powershell
   npx prisma generate
   npx prisma validate
   ```
3. Grep the monorepo for usages of the changed model to find call sites that break or need updating:
   ```powershell
   npx nx affected -t typecheck
   ```
4. If you removed/renamed a field, check `packages/middleware`, and every service's `controller/` files that touch that model.

## The relation-typing gotcha (read before debugging a missing-field TS error)

Generated Prisma model types (e.g. `shops`, `users`) only include **scalar** fields. A relation field like `avatar` on `shops` will NOT be on the plain `shops` type even though it's a valid relation in the schema. If a query includes the relation but the code types the result as the bare model, TypeScript won't know the field exists (or worse, code compiles against `any`).

Fix: query with `include`, and type the result explicitly:

```ts
import { Prisma } from "@prisma/client";

const shop = await prisma.shops.findUnique({
  where: { id },
  include: { avatar: true },
});

type ShopWithAvatar = Prisma.shopsGetPayload<{
  include: { avatar: true };
}>;
```

Apply the same pattern for any other model + relation combination, not just `shops`/`avatar` — this is a general Prisma behavior, not a one-off bug.

## Since the DB is MongoDB

- Prisma's MongoDB connector has narrower migration tooling than SQL connectors — there is no traditional `prisma migrate` history file the way there is for Postgres/MySQL in this setup; schema sync is done via `prisma generate`/`db push` semantics. Confirm current project convention (check for a `migrations/` folder before assuming `prisma migrate dev` is wired up) rather than assuming SQL-style migrations exist.
- Embedded/relation modeling in Mongo Prisma schemas is stricter about `@relation` fields matching on both sides — a one-sided relation edit is a common source of `prisma validate` failures.
