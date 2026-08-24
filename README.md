# EcommerceShop

EcommerceShop is a full-stack multi-vendor ecommerce platform built as an Nx monorepo. It provides a buyer storefront, seller dashboard, admin dashboard, order and payment workflows, real-time chat, analytics/event tracking, and a microservice-oriented backend.

The project is designed as a production-style ecommerce system: each domain is separated into its own service, frontend applications are independently buildable, and shared infrastructure packages keep authentication, database access, Redis, Kafka, ImageKit, and error handling consistent across the codebase.

## Product Overview

EcommerceShop supports three main user experiences:

- Buyer experience: product browsing, shop discovery, cart, checkout, wishlist, profile, orders, and inbox.
- Seller experience: seller onboarding, shop creation, product management, discount codes, orders, payments, notifications, and customer chat.
- Admin experience: platform dashboard, product/user/seller management, events, orders, payments, customization, notifications, and logging.

## Demo and Deployment

Use this section to add your deployed URLs after publishing:

```text
Buyer UI:    https://your-user-ui-domain.com
Seller UI:   https://your-seller-ui-domain.com
Admin UI:    https://your-admin-ui-domain.com
API Gateway: https://your-api-gateway-domain.com
```

Suggested demo accounts:

```text
Buyer:  buyer@example.com
Seller: seller@example.com
Admin:  admin@example.com
```

Replace these placeholders with real seeded accounts when your deployment is ready.

## Key Features

- Multi-role authentication for buyers, sellers, and admins
- Multi-vendor shop and seller management
- Product catalog with images, categories, subcategories, filters, and offers/events
- Cart, checkout, Stripe payment integration, and order tracking
- Seller order and payment dashboards
- Discount code management
- Real-time buyer-seller chat
- Admin dashboard for platform operations
- Kafka-based user/product/shop analytics events
- Redis-backed session/cache style infrastructure
- ImageKit integration for media upload
- Prisma schema for MongoDB data modeling
- Swagger generation scripts for selected backend services

## Architecture

```text
                   Buyer UI
                      |
                   Seller UI
                      |
                   Admin UI
                      |
                  API Gateway
                      |
  ----------------------------------------------------------
  |        |        |          |          |        |       |
 Auth    User    Product    Seller     Order    Chat    Admin
 Service Service Service    Service    Service  Service Service
  |        |        |          |          |        |       |
  ------------------- Shared Packages ----------------------
         Prisma | Redis | Kafka | ImageKit | Errors
                      |
             MongoDB / Redis / Kafka
```

The project uses Nx to manage independent applications and services while keeping shared packages in one repository.

## Tech Stack

- Monorepo: Nx
- Frontend: Next.js 15, React 19, Tailwind CSS
- Backend: Express.js, Node.js
- Database: MongoDB with Prisma
- Cache and realtime infrastructure: Redis
- Event streaming: Kafka
- Payments: Stripe
- Media: ImageKit
- Data fetching and tables: TanStack Query, TanStack Table
- UI helpers: Lucide React, Recharts, ApexCharts

## Project Structure

```text
apps/
  user-ui                 Buyer storefront UI
  seller-ui               Seller dashboard UI
  admin-ui                Admin dashboard UI
  api-gateway             API gateway/proxy
  auth-service            Registration, login, authentication
  user-service            Logged-in user profile, addresses, password change
  product-service         Products, shops, events, discount codes
  seller-service          Seller/shop APIs
  order-service           Cart, orders, payments, webhooks
  chatting-service        Chat and websocket APIs
  admin-service           Admin APIs
  kafka-service           Kafka event and analytics processing
  logger-service          Logger/websocket service
  recommendation-service  Recommendation service

packages/
  libs/                   Prisma, Redis, ImageKit
  middleware/             Auth and role middleware
  utils/                  Kafka and shared helpers
  error-handler/          Error classes and error middleware

prisma/
  schema.prisma           Prisma schema
```

## Requirements

- Node.js
- npm
- MongoDB connection string
- Redis connection string
- Kafka credentials if analytics/event tracking is enabled
- Stripe keys if payment is enabled
- ImageKit keys if image upload is enabled
- SMTP credentials if email sending is enabled

## Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL=
REDIS_DATABASE_URL=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

IMAGE_KIT_PUBLIC_KEY=
IMAGE_KIT_PRIVATE_KEY=
IMAGE_KIT_URL_ENDPOINT=

SMTP_HOST=
SMTP_PORT=
SMTP_SERVICE=
SMTP_USER=
SMTP_PASS=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PUBLIC_STRIPE_PUBLIC_KEY=

KAFKA_API_KEY=
KAFKA_API_SECRET=

NEXT_PUBLIC_SERVER_URI=
NEXT_PUBLIC_USER_UI_LINK=
NEXT_PUBLIC_SELLER_SERVER_UI=
NEXT_PUBLIC_CHATTING_WEBSOCKET_URI=
NEXT_PUBLIC_SOCKET_UI=
```

## Default Local Ports

```text
api-gateway             3333
auth-service            6001
product-service         6002
seller-service          6003
order-service           6004
admin-service           6005
chatting-service        6006
recommendation-service  6007
logger-service          6008
user-service            6009
```

Each service can be overridden with the `PORT` environment variable.

## Getting Started

Install dependencies:

```powershell
npm install
```

Generate and validate Prisma:

```powershell
npx prisma generate
npx prisma validate
```

Run all projects with a `serve` target:

```powershell
npm run dev
```

Run each UI app independently:

```powershell
npm run user-ui
npm run seller-ui
npm run admin-ui
```

Run a backend service directly:

```powershell
npx nx serve auth-service
npx nx serve @./api-gateway
npx nx serve @./product-service
```

## Build

Build all UI applications:

```powershell
npm run build:ui
```

Build all backend services:

```powershell
npm run build:backend
```

Build the full platform:

```powershell
npm run build:ui
npm run build:backend
```

Stable PowerShell command for the full build:

```powershell
$env:NX_DAEMON='false'; $env:NX_NO_CLOUD='true'; npx nx run-many --target=build --projects="@./user-ui,@./seller-ui,@./admin-ui,auth-service,@./api-gateway,@./product-service,@./seller-service,@./order-service,@./chatting-service,@./admin-service,@./kafka-service,@./logger-service,@./recomendation-service,@./user-service"
```

## Verified Build Status

The project has been build-tested locally with the current Nx setup:

```text
UI build:      user-ui, seller-ui, admin-ui
Backend build: auth-service, api-gateway, product-service, seller-service,
               order-service, chatting-service, admin-service, kafka-service,
               logger-service, recommendation-service
```

Known non-blocking warning:

```text
user-ui: attempted import warning for reset from canvas-confetti
```

This warning does not currently stop the production build.

## Swagger Docs

Generate Swagger output for services that already have scripts:

```powershell
npm run auth-docs
npm run product-docs
npm run order-docs
```

## Useful Nx Commands

List all projects:

```powershell
$env:NX_DAEMON='false'; npx nx show projects
```

Show available targets for a project:

```powershell
npx nx show project auth-service
```

Reset Nx cache and daemon:

```powershell
npx nx reset
```

## Deployment Notes

For deployment, each UI app and backend service can be built independently. A typical deployment layout is:

- Deploy `user-ui`, `seller-ui`, and `admin-ui` as separate Next.js apps.
- Deploy `api-gateway` as the public API entry point.
- Deploy backend services behind the gateway.
- Provide shared environment variables to each service.
- Configure MongoDB, Redis, Kafka, Stripe, ImageKit, and SMTP credentials in the hosting provider.
- Make sure Google Fonts can be fetched at build time, or replace `next/font/google` with local fonts.

## Common Issues

### Nx Cloud 401

If you see:

```text
Nx Cloud encountered some problems
This workspace is more than three days old and is not connected
```

This is an Nx Cloud remote cache warning, not a source code error. Disable Nx Cloud locally:

```powershell
$env:NX_NO_CLOUD='true'
```

### Nx daemon hangs

Disable the Nx daemon:

```powershell
$env:NX_DAEMON='false'
```

### PowerShell fails with project names containing `@`

Wrap the `--projects` value in quotes:

```powershell
npx nx run-many --target=build --projects="@./user-ui,@./seller-ui,@./admin-ui"
```

### Next.js cannot fetch Google Fonts

If UI build fails with:

```text
Failed to fetch `Poppins` from Google Fonts
```

The build environment cannot access Google Fonts. Run with network access or switch to local fonts.

### Wrong TanStack Query import

Do not import from internal `node_modules` paths:

```ts
node_modules/@tanstack/react-query/build/modern/_tsup-dts-rollup
```

Use:

```ts
import { useQuery } from "@tanstack/react-query";
```

### Prisma relation types

Generated Prisma model types such as `shops` or `users` only include scalar fields. If a component needs a relation such as `avatar`, include it in the query and type it with `Prisma.<model>GetPayload`.

```ts
import { Prisma } from "@prisma/client";

type ShopWithAvatar = Prisma.shopsGetPayload<{
  include: { avatar: true };
}>;
```

## Roadmap

- Complete remaining UI flows and polish dashboard screens
- Add seed data for demo accounts
- Add automated tests for critical checkout and auth flows
- Replace Google Fonts dependency with local font assets for offline builds
- Clean up non-blocking build warnings
- Add CI pipeline for build validation
- Add production deployment documentation with real URLs

## License

This project is licensed under the MIT License.
