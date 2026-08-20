---
name: create-microservice
description: Scaffold a brand-new Express backend microservice in the EcommerceShop Nx monorepo and wire it into api-gateway. Use when asked to add a new service (e.g. "notification-service", "review-service"), not when adding a route to an existing one.
---

# Create Microservice (EcommerceShop)

Only use this for a genuinely new domain service. For a new route on an existing service, use `.agents/skills/integrate-api` instead.

## 1. Generate the Nx app

```powershell
npx nx g @nx/express:app apps/<name>-service
```

This wires up the `@nx/webpack` + `@nx/js` inferred targets automatically (matches how existing services like `apps/order-service` are set up — no manual `project.json` target wiring needed, per [nx.json](../../../nx.json)).

## 2. Match the existing service shape

Mirror an existing service (e.g. `apps/auth-service` or `apps/order-service`):

```
apps/<name>-service/
  src/
    main.ts              # express app, listens on process.env.PORT
    controller/          # <domain>.controller.ts
    routes/               # <domain>.route.ts
    utils/                # service-local helpers
  webpack.config.js
  tsconfig.app.json
  tsconfig.json
```

In `main.ts`: use `express.json()`, `cookie-parser`, the shared `packages/error-handler` middleware, and `packages/libs/prisma` for DB access — don't create a second Prisma client instance. Pick an unused port (see [CLAUDE.md](../../../CLAUDE.md) for the current port map: 3333, 6001-6008) and default it via `process.env.PORT || <port>`.

## 3. Wire into api-gateway

Add a proxy line in [apps/api-gateway/src/main.ts](../../../apps/api-gateway/src/main.ts) **above** the catch-all `app.use("/", proxy(...))` line:

```ts
app.use("/<name>", proxy(`http://localhost:<port>`));
```

## 4. Add to the build/dev scripts

Add the new project name to the `build:backend` script's `--projects` list in [package.json](../../../package.json) so it's included in full builds and CI.

## 5. Document

Add the service to the architecture list and port table in [CLAUDE.md](../../../CLAUDE.md) and [README.md](../../../README.md), and to `.env` variable docs if it needs new secrets/connection strings.

## 6. Verify

Use `.agents/skills/run-app` to serve the new service plus `api-gateway`, and confirm `/gateway-health` still responds and the new prefix proxies correctly.
