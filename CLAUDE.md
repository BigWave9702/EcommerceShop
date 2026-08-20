# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

EcommerceShop is a multi-vendor ecommerce platform built as an Nx monorepo: three independent Next.js frontends (buyer, seller, admin), a set of Express/Node microservices behind an API gateway, and shared packages for Prisma, Redis, Kafka, ImageKit, and error handling. Backend data lives in MongoDB via Prisma; Redis backs sessions/cache; Kafka carries analytics/events.

```
Buyer/Seller/Admin UI -> API Gateway -> Auth/Product/Seller/Order/Chat/Admin/Recommendation/Kafka/Logger services -> shared packages (Prisma, Redis, Kafka, ImageKit, error-handler) -> MongoDB/Redis/Kafka
```

Project names in Nx sometimes carry an `@./` prefix (e.g. `@./api-gateway`, `@./product-service`) instead of the plain folder name — check `npx nx show projects` if a `nx` command can't find a project by its directory name.

## Commands

Install deps and prep Prisma (run once, or after `prisma/schema.prisma` changes):
```powershell
npm install
npx prisma generate
npx prisma validate
```

Run everything:
```powershell
npm run dev
```

Run a single service/app (preferred while iterating on one piece):
```powershell
npx nx serve auth-service
npx nx serve @./api-gateway
npx nx serve @./product-service
npm run user-ui        # or seller-ui / admin-ui
```

Lint / test / build one project, or a single test file:
```powershell
npx nx lint auth-service
npx nx test auth-service
npx nx test auth-service --testFile=apps/auth-service/src/some.spec.ts
npx nx build auth-service
```

Affected-only (what CI runs):
```powershell
npx nx affected -t lint test build
```

Full build (matches CI/`npm run build:ui` + `build:backend`; use this exact form on Windows because `@`-prefixed project names break unquoted argument parsing):
```powershell
$env:NX_DAEMON='false'; $env:NX_NO_CLOUD='true'; npx nx run-many --target=build --projects="@./user-ui,@./seller-ui,@./admin-ui,auth-service,@./api-gateway,@./product-service,@./seller-service,@./order-service,@./chatting-service,@./admin-service,@./kafka-service,@./logger-service,@./recomendation-service"
```

Other useful commands:
```powershell
npx nx show projects              # list all project names (needed for exact @./ prefixes)
npx nx show project auth-service  # see a project's available targets
npx nx reset                      # clear Nx cache/daemon when things behave oddly
```

## Architecture notes

- **Nx monorepo**: `apps/*` are deployables (3 Next.js UIs + 9 backend services + `auth-service-e2e`), `packages/*` are shared libraries consumed across apps. Nx infers `build`/`test`/`serve`/`lint`/`typecheck` targets via the `@nx/js`, `@nx/jest`, `@nx/webpack`, `@nx/next` plugins configured in [nx.json](nx.json) — there are no manual per-project target definitions to hunt for.
- **Shared packages** ([packages/](packages/)): `libs/prisma` (DB client), `libs/redis`, `libs/imageKit`, `middleware/isAuthenticated.ts` + `authorizeRoles.ts` (auth/role guards used across services), `utils/kafka` (producer/consumer helpers), `error-handler/` (shared error classes + Express error middleware). Backend services import these rather than duplicating DB/cache/auth logic — check here first before adding cross-service functionality.
- **Prisma schema** is centralized at [prisma/schema.prisma](prisma/schema.prisma) (single schema for MongoDB, shared by all services via `packages/libs/prisma`), not per-service.
- **API gateway** ([apps/api-gateway](apps/api-gateway)) is the single entry point that proxies to backend services (`express-http-proxy`); frontends talk to it via `NEXT_PUBLIC_SERVER_URI` rather than calling services directly.
- **Kafka** ([apps/kafka-service](apps/kafka-service)) consumes analytics/event data (user/product/shop events) produced by other services through `packages/utils/kafka`; `apps/recommendation-service` builds on this event stream.
- **Prisma relation typing gotcha**: generated model types (e.g. `shops`, `users`) only include scalar fields. When a component/query needs a relation (e.g. `avatar`), include it in the Prisma query and type the result with `Prisma.<model>GetPayload<{ include: {...} }>` rather than the bare model type.
- **TanStack Query imports** must come from the package root (`import { useQuery } from "@tanstack/react-query"`), never from internal build paths like `node_modules/@tanstack/react-query/build/...`.

## Environment

Services/UIs read config from a root `.env` (see [README.md](README.md) for the full variable list: `DATABASE_URL`, `REDIS_DATABASE_URL`, token secrets, ImageKit, SMTP, Stripe, Kafka, and `NEXT_PUBLIC_*` frontend URLs). Default local ports: api-gateway 3333, auth 6001, product 6002, seller 6003, order 6004, admin 6005, chatting 6006, recommendation 6007, logger 6008 (override via `PORT`).

## Known environment quirks (see README "Common Issues" for details)

- Nx Cloud may print a 401/"not connected" warning on fresh clones — harmless; set `$env:NX_NO_CLOUD='true'` to silence it.
- If the Nx daemon hangs, set `$env:NX_DAEMON='false'`.
- UI builds fetch `Poppins` from Google Fonts at build time; this fails without network access to Google Fonts.
