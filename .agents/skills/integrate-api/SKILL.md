---
name: integrate-api
description: Wire a new or existing backend microservice route through api-gateway and consume it from a Next.js UI with TanStack Query. Use when the user asks to "call the API", "hook up the backend", "add an endpoint", or a UI screen needs data it doesn't have yet.
---

# Integrate API (EcommerceShop)

The frontends never call a microservice directly — everything goes through `api-gateway`, which proxies by path prefix.

## 1. Backend route

Add/confirm the route exists in the owning service, e.g. `apps/product-service/src/routes/*.route.ts`, following the existing `controller/` + `routes/` pattern (see `create-feature` skill). Protect it with `packages/middleware/isAuthenticated.ts` / `authorizeRoles.ts` if it needs auth.

## 2. Gateway proxy mapping

[apps/api-gateway/src/main.ts](../../../apps/api-gateway/src/main.ts) maps path prefixes to services:

```ts
app.use("/logger", proxy("http://localhost:6008"));
app.use("/recommendation", proxy("http://localhost:6007"));
app.use("/chatting", proxy("http://localhost:6006"));
app.use("/order", proxy("http://localhost:6004"));
app.use("/admin", proxy("http://localhost:6005"));
app.use("/seller", proxy("http://localhost:6003"));
app.use("/product", proxy("http://localhost:6002"));
app.use("/", proxy("http://localhost:6001"));   // auth-service is the catch-all
```

If the route belongs to an existing prefix, no gateway change is needed. If you add a brand-new service, add its `app.use("/<prefix>", proxy("http://localhost:<port>"))` line **above** the catch-all `"/"` route (proxy match order matters — Express checks top to bottom).

A global rate limiter (`express-rate-limit`) and CORS (allowing the three local UI origins, credentials on) already wrap every route — don't re-implement these per-service.

## 3. Frontend data fetching

UIs call the gateway via `NEXT_PUBLIC_SERVER_URI` (see [CLAUDE.md](../../../CLAUDE.md) env section) using `axios` + `@tanstack/react-query`:

```ts
import { useQuery } from "@tanstack/react-query"; // always the package root, never node_modules/...
```

Follow the existing hook pattern in the target app's `src` (look for an existing `use*.ts` query hook in the same app before writing a new one from scratch — most data needs already have a similar hook to copy). Mutations use `useMutation` + query invalidation, not manual refetch.

## 4. Verify

Use `run-app` to serve `api-gateway` + the owning service + the UI, then check the browser network tab for the request hitting the gateway and proxying correctly (watch for CORS/cookie issues if auth is involved — cookies require `credentials: true` on both the gateway CORS config and the frontend `axios` client).
