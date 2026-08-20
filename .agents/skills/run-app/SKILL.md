---
name: run-app
description: Launch and verify one or more parts of the EcommerceShop Nx monorepo (backend microservices behind api-gateway, or the buyer/seller/admin Next.js UIs). Use when asked to run, start, serve, or check that a change works in the real app.
---

# Run App (EcommerceShop)

This is an Nx monorepo: 3 Next.js frontends + 9 Express microservices behind an API gateway, backed by MongoDB (Prisma), Redis, and Kafka. See [CLAUDE.md](../../../CLAUDE.md) for architecture and full command reference.

## Prerequisites (first run only)

```powershell
npm install
npx prisma generate
```

Requires a root `.env` with `DATABASE_URL`, `REDIS_DATABASE_URL`, and the other variables listed in [README.md](../../../README.md#environment-variables). Without these, backend services will fail to connect on startup.

## Running a single service or UI

Prefer running only what you're testing rather than the whole stack:

```powershell
npx nx serve auth-service          # backend service, plain project name
npx nx serve @./api-gateway        # some backend projects use the @./ prefix — run `npx nx show projects` if unsure
npm run user-ui                    # buyer storefront (Next.js)
npm run seller-ui                  # seller dashboard
npm run admin-ui                   # admin dashboard
```

Default ports: api-gateway 3333, auth-service 6001, product-service 6002, seller-service 6003, order-service 6004, admin-service 6005, chatting-service 6006, recommendation-service 6007, logger-service 6008.

To exercise a UI flow end-to-end (e.g. login, product browsing, checkout), also run `api-gateway` plus whichever backend service(s) that flow depends on — the UI talks to the gateway via `NEXT_PUBLIC_SERVER_URI`, not directly to services.

## Running everything

```powershell
npm run dev
```

Runs every app's `serve`/`dev` target in parallel via `nx run-many`. Slower to start; use it when a change spans multiple services.

## Verifying a change

- Backend: hit the relevant route through the gateway (`http://localhost:3333/...`) or the service directly, and check the terminal/log output for errors.
- Frontend: open the running UI in the browser and exercise the changed flow; check the browser console/network tab for failures.
- If Swagger docs exist for the touched service (`auth-service`, `product-service`, `order-service`), regenerate with `npm run auth-docs` / `npm run product-docs` / `npm run order-docs` after changing routes.

## Common startup issues

- **Nx Cloud 401 warning** — harmless, set `$env:NX_NO_CLOUD='true'`.
- **Nx daemon hangs** — set `$env:NX_DAEMON='false'`.
- **Google Fonts fetch failure on UI build** — no network access to fetch `Poppins`; needs network or a local-font fallback.
- **Prisma type missing a relation field** (e.g. `avatar` on `shops`) — expected; generated types only include scalars. Query with `include` and type via `Prisma.<model>GetPayload`.
