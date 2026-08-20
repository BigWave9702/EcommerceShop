---
name: create-feature
description: End-to-end workflow for adding a new feature that spans a backend microservice and one of the Next.js UIs in EcommerceShop (e.g. a new product filter, seller payout flow, admin report). Use when the user asks to "add a feature", "implement X flow", or describes work that touches both an API and a screen.
---

# Create Feature (EcommerceShop)

A feature here usually touches 3-5 layers. Work through them in this order so each layer has what the next one needs.

## 1. Data model (if the feature needs new/changed fields)

- Edit [prisma/schema.prisma](../../../prisma/schema.prisma).
- Run `npx prisma generate && npx prisma validate`.
- See the `prisma-schema-change` skill (`.claude/skills/prisma-schema-change`) for the relation-typing gotcha before touching generated types.

## 2. Backend service

Pick the owning service under `apps/` (auth, product, seller, order, chatting, admin, recommendation, kafka, logger — see [CLAUDE.md](../../../CLAUDE.md) for the map). Backend code follows a `controller/` + `routes/` split, e.g. [apps/auth-service/src/controller/auth.controller.ts](../../../apps/auth-service/src/controller/auth.controller.ts) and `src/routes/auth.route.ts`:

- Add the handler in `src/controller/<name>.controller.ts`.
- Wire it in `src/routes/<name>.route.ts` and mount it in the service's `main.ts` if it's a new route file.
- Use shared middleware for auth/roles: `packages/middleware/isAuthenticated.ts`, `packages/middleware/authorizeRoles.ts`.
- Use `packages/error-handler` for thrown errors (don't hand-roll error responses) and `packages/libs/prisma` for DB access.
- If the feature should emit an analytics/event record, produce it via `packages/utils/kafka` — `kafka-service` and `recommendation-service` consume from there.

Use the `integrate-api` skill (`.agents/skills/integrate-api`) for wiring the route through `api-gateway`.

## 3. Frontend UI

Pick `apps/user-ui` (buyer), `apps/seller-ui`, or `apps/admin-ui`. Use the `create-ui-component` skill for new shared components, and `integrate-api` for the data-fetching side (TanStack Query hook calling the gateway).

## 4. Verify

Use the `run-app` skill to serve the affected service + UI (+ api-gateway) and exercise the flow in the browser. Then:

```powershell
npx nx lint <service-or-ui>
npx nx test <service-or-ui>
```

Finish with the `pre-commit-check` skill before handing the change back.
