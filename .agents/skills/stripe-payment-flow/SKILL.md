---
name: stripe-payment-flow
description: Work on the Stripe checkout/payment flow in order-service (payment intents, payment sessions, the create-order webhook, coupon verification). Use when the user asks to change checkout, payments, Stripe webhooks, or order creation logic.
---

# Stripe Payment Flow (EcommerceShop)

Owned entirely by `apps/order-service`. Routes live in [order.route.ts](../../../apps/order-service/src/routes/order.route.ts), handlers in [order.controller.ts](../../../apps/order-service/src/controllers/order.controller.ts).

## Route map

| Route | Purpose |
|---|---|
| `POST /api/create-payment-intent` | Create a Stripe PaymentIntent (auth required) |
| `POST /api/create-payment-session` | Create a Stripe Checkout Session (auth required) |
| `GET /api/verifying-payment-session` | Verify a session after redirect back from Stripe (auth required) |
| `PUT /api/verify-coupon` | Validate a discount/coupon code before payment (auth required) |
| `POST /api/create-order` | **Stripe webhook** — creates the order after payment confirmation |

## The webhook route is special — read this before touching `main.ts`

In [order-service/src/main.ts](../../../apps/order-service/src/main.ts), `/api/create-order` is registered **before** `app.use(express.json())`, with `bodyParser.raw({ type: "application/json" })` instead:

```ts
app.post(
  "/api/create-order",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);
app.use(express.json());
```

This is required because Stripe webhook signature verification (`STRIPE_WEBHOOK_SECRET`) needs the **raw, unparsed** request body — if this route is moved below `express.json()`, or the body gets JSON-parsed first, signature verification will silently break. Any new Stripe webhook route must follow this same raw-body-before-json pattern, registered before the global `express.json()` middleware.

Note this service's CORS block is currently commented out in `main.ts` — traffic reaches it only through `api-gateway`'s CORS, not its own.

## Env vars involved

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_STRIPE_PUBLIC_KEY` (frontend). See [CLAUDE.md](../../../CLAUDE.md) for the full env list.

## Frontend side

Checkout UI is in `apps/user-ui`, using `@stripe/react-stripe-js` + `@stripe/stripe-js` with `PUBLIC_STRIPE_PUBLIC_KEY`. It calls `create-payment-intent`/`create-payment-session` through `api-gateway`'s `/order` prefix (see `integrate-api` skill) — Stripe.js itself talks to Stripe directly from the browser, not through the gateway.

## Verify

Use the `run-app` skill to serve `api-gateway` + `order-service` + `user-ui`. For webhook testing locally, use the Stripe CLI to forward events (`stripe listen --forward-to localhost:3333/order/api/create-order`) since Stripe can't reach `localhost` directly — check whether `STRIPE_WEBHOOK_SECRET` in `.env` matches the CLI's printed signing secret when testing.
