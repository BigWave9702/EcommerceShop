/**
 * Hand-written OpenAPI 3.0 spec covering every HTTP endpoint exposed across
 * the whole EcommerceShop platform, as reached through api-gateway (the
 * single public entry point). Each backend service mounts its router at
 * "/api", and api-gateway proxies a path prefix per service — so a path
 * here like "/product/api/get-categories" is exactly what a client calls
 * through the gateway; product-service itself only sees "/api/get-categories".
 *
 * This file is served at:
 *   GET /api-docs   — Swagger UI
 *   GET /docs-json  — raw JSON spec
 *
 * Keep this in sync manually when routes change — it is NOT auto-generated
 * from route files (unlike the per-service swagger-autogen docs still
 * available individually on auth-service/product-service/order-service).
 */

const cookieAuthDescription =
  "Session cookies set by the login endpoints. Buyers/admins use `access_token` + `refresh_token`; sellers use `seller-access-token` + `seller-refresh-token`. All are httpOnly, so they are sent automatically by the browser (`withCredentials: true`) — there is nothing to paste into Swagger UI's Authorize dialog for cookie auth, this is documented for completeness.";

const errorResponse = {
  type: "object",
  properties: {
    message: { type: "string", example: "Something went wrong" },
  },
};

const successMessage = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
  },
};

const Responses = {
  400: { description: "Validation error", content: { "application/json": { schema: errorResponse } } },
  401: { description: "Unauthorized — missing/invalid/expired token, or wrong role", content: { "application/json": { schema: errorResponse } } },
  404: { description: "Not found", content: { "application/json": { schema: errorResponse } } },
  500: { description: "Internal server error", content: { "application/json": { schema: errorResponse } } },
};

const cookieSecurity = [{ cookieAuth: [] }];

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "EcommerceShop API",
    version: "1.0.0",
    description:
      "Unified API reference for every microservice in the EcommerceShop platform, as reached through api-gateway (http://localhost:3333). " +
      "The platform is a multi-vendor storefront: three roles (buyer, seller, admin) share the same JWT/cookie auth mechanics (auth-service), " +
      "while product catalog, orders/payments, chat, notifications, and recommendations each live in their own service behind the gateway.",
  },
  servers: [{ url: "http://localhost:3333", description: "api-gateway (local dev)" }],
  tags: [
    { name: "Auth", description: "Registration, login (user/seller/admin/Google), OTP verification, password reset, logout, shop creation, Stripe Connect onboarding, site layout — all owned by auth-service." },
    { name: "User", description: "The logged-in buyer's own profile, password, and shipping addresses — owned by user-service." },
    { name: "Product", description: "Catalog: categories, products, events (a product with a date range), discount codes, media upload, search/filter — owned by product-service." },
    { name: "Seller", description: "A seller's own shop settings and notifications — owned by seller-service." },
    { name: "Order", description: "Cart checkout, Stripe payment intents/sessions, coupon validation, order history per role — owned by order-service." },
    { name: "Chatting", description: "Buyer↔seller conversations and messages (also carried live over a separate WebSocket at NEXT_PUBLIC_CHATTING_WEBSOCKET_URI) — owned by chatting-service." },
    { name: "Admin", description: "Platform-wide moderation and reporting for admins only — owned by admin-service." },
    { name: "Recommendation", description: "Personalized product recommendations for the logged-in buyer — owned by recommendation-service." },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: cookieAuthDescription,
      },
    },
    schemas: {
      Error: errorResponse,
      SuccessMessage: successMessage,
    },
  },
  paths: {
    // ───────────────────────── AUTH ─────────────────────────
    "/api/user-registration": {
      post: {
        tags: ["Auth"],
        summary: "Start buyer registration (sends OTP)",
        description: "Validates the new buyer's name/email/password, checks the email isn't already registered, then emails a 6-digit OTP. Does not create the account yet — call /api/verify-user with the OTP to finish.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", minLength: 6 } } } } } },
        responses: { 200: { description: "OTP sent" }, 400: Responses[400] },
      },
    },
    "/api/verify-user": {
      post: {
        tags: ["Auth"],
        summary: "Verify buyer OTP and create the account",
        description: "Completes registration: checks the OTP emailed by /api/user-registration, then creates the users row with a bcrypt-hashed password.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "otp", "password", "name"], properties: { email: { type: "string" }, otp: { type: "string" }, password: { type: "string" }, name: { type: "string" } } } } } },
        responses: { 201: { description: "User registered" }, 400: Responses[400] },
      },
    },
    "/api/login-user": {
      post: {
        tags: ["Auth"],
        summary: "Buyer login (email + password)",
        description: "Verifies credentials against the users table and sets httpOnly `access_token` (15m) + `refresh_token` (7d) cookies. Rejects accounts that have no local password (i.e. Google-only accounts) with a clear message.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } },
        responses: { 200: { description: "Logged in, cookies set" }, 401: Responses[401] },
      },
    },
    "/api/login-google": {
      post: {
        tags: ["Auth"],
        summary: "Buyer login/registration via Google Sign-In",
        description: "Verifies the Google ID token (from @react-oauth/google on the frontend) server-side against GOOGLE_CLIENT_ID, then finds or creates a buyer by the token's email and sets the same session cookies as /api/login-user. Requires GOOGLE_CLIENT_ID to be configured; the created account has no local password.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["idToken"], properties: { idToken: { type: "string", description: "Google ID token (JWT) returned by the Google Identity Services client library" } } } } } },
        responses: { 200: { description: "Logged in, cookies set" }, 401: Responses[401] },
      },
    },
    "/api/refresh-token": {
      post: {
        tags: ["Auth"],
        summary: "Exchange a valid refresh token for a new access token",
        description: "Reads `refresh_token` or `seller-refresh-token` from cookies, verifies it, and reissues a 15-minute access token for the same role. The frontend axios interceptor calls this automatically on a 401.",
        responses: { 201: { description: "New access token cookie set" }, 401: Responses[401] },
      },
    },
    "/api/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out (clears every role's cookies)",
        description: "Clears access_token, refresh_token, seller-access-token, and seller-refresh-token in one call — safe to call regardless of which role is currently signed in.",
        responses: { 200: { description: "Logged out", content: { "application/json": { schema: successMessage } } } },
      },
    },
    "/api/forgot-password-user": {
      post: {
        tags: ["Auth"],
        summary: "Request a password-reset OTP (buyer)",
        description: "Emails a one-time OTP to the given address if a buyer account with that email exists.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string" } } } } } },
        responses: { 200: { description: "OTP sent" }, 400: Responses[400] },
      },
    },
    "/api/verify-forgot-password-user": {
      post: {
        tags: ["Auth"],
        summary: "Verify the buyer password-reset OTP",
        description: "Checks the OTP; on success the client proceeds to /api/reset-password-user. Shared implementation with the seller variant — only the emailed OTP itself is role-specific.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "otp"], properties: { email: { type: "string" }, otp: { type: "string" } } } } } },
        responses: { 200: { description: "OTP verified" }, 400: Responses[400] },
      },
    },
    "/api/reset-password-user": {
      post: {
        tags: ["Auth"],
        summary: "Set a new buyer password after OTP verification",
        description: "Requires the OTP to already have been verified. Rejects reusing the current password.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "newPassword"], properties: { email: { type: "string" }, newPassword: { type: "string" } } } } } },
        responses: { 200: { description: "Password reset" }, 400: Responses[400] },
      },
    },
    "/api/seller-registration": {
      post: {
        tags: ["Auth"],
        summary: "Start seller registration (sends OTP)",
        description: "Same OTP-first flow as buyer registration, plus phone_number/country. Does not create a shop — call /api/create-shop separately after verifying.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email", "password", "phone_number", "country"], properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" }, phone_number: { type: "string" }, country: { type: "string" } } } } } },
        responses: { 200: { description: "OTP sent" }, 400: Responses[400] },
      },
    },
    "/api/verify-seller": {
      post: {
        tags: ["Auth"],
        summary: "Verify seller OTP, create the seller account, and log them in",
        description: "Also sets `seller-access-token`/`seller-refresh-token` cookies on success, so the signup wizard's next steps (create-shop, create-stripe-link) can call authenticated endpoints immediately.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "otp", "password", "name", "phone_number", "country"], properties: { email: { type: "string" }, otp: { type: "string" }, password: { type: "string" }, name: { type: "string" }, phone_number: { type: "string" }, country: { type: "string" } } } } } },
        responses: { 201: { description: "Seller registered" }, 400: Responses[400] },
      },
    },
    "/api/login-seller": {
      post: {
        tags: ["Auth"],
        summary: "Seller login (email + password)",
        description: "Sets `seller-access-token` (15m) + `seller-refresh-token` (7d) cookies, distinct from the buyer cookies so both roles can be signed in on the same browser at once.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } },
        responses: { 200: { description: "Logged in, cookies set" }, 401: Responses[401] },
      },
    },
    "/api/logged-in-seller": {
      get: {
        tags: ["Auth"],
        summary: "Get the current seller's own account + shop",
        security: cookieSecurity,
        description: "Requires a valid seller session. Returns the seller row with its related shop.",
        responses: { 200: { description: "Seller profile" }, 401: Responses[401] },
      },
    },
    "/api/forgot-password-seller": {
      post: {
        tags: ["Auth"],
        summary: "Request a password-reset OTP (seller)",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string" } } } } } },
        responses: { 200: { description: "OTP sent" }, 400: Responses[400] },
      },
    },
    "/api/verify-forgot-password-seller": {
      post: {
        tags: ["Auth"],
        summary: "Verify the seller password-reset OTP",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "otp"], properties: { email: { type: "string" }, otp: { type: "string" } } } } } },
        responses: { 200: { description: "OTP verified" }, 400: Responses[400] },
      },
    },
    "/api/reset-password-seller": {
      post: {
        tags: ["Auth"],
        summary: "Set a new seller password after OTP verification",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "newPassword"], properties: { email: { type: "string" }, newPassword: { type: "string" } } } } } },
        responses: { 200: { description: "Password reset" }, 400: Responses[400] },
      },
    },
    "/api/create-shop": {
      post: {
        tags: ["Auth"],
        summary: "Create a shop for the current seller",
        security: cookieSecurity,
        description: "One shop per seller (`sellerId` is unique, taken from the seller session — not the request body). Called right after seller signup (verify-seller now auto-logs-in the seller), before onboarding to Stripe.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "bio", "address", "opening_hours", "category"], properties: { name: { type: "string" }, bio: { type: "string" }, address: { type: "string" }, opening_hours: { type: "string" }, website: { type: "string" }, category: { type: "string" } } } } } },
        responses: { 201: { description: "Shop created" }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/api/create-stripe-link": {
      post: {
        tags: ["Auth"],
        summary: "Create a Stripe Connect onboarding link for the current seller",
        security: cookieSecurity,
        description: "Creates a Stripe Express connected account for the current seller (if not already created) and returns a one-time onboarding URL to redirect the seller to. sellerId is taken from the seller session, not the request body.",
        responses: { 200: { description: "Onboarding URL", content: { "application/json": { schema: { type: "object", properties: { url: { type: "string" } } } } } }, 401: Responses[401] },
      },
    },
    "/api/login-admin": {
      post: {
        tags: ["Auth"],
        summary: "Admin login (email + password)",
        description: "Admins are `users` rows with `role: \"admin\"`. Sets the same access_token/refresh_token cookies as buyer login.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } },
        responses: { 200: { description: "Logged in, cookies set" }, 401: Responses[401] },
      },
    },
    "/api/get-layouts": {
      get: {
        tags: ["Auth"],
        summary: "Get site-wide layout config",
        description: "Returns the single site_config row (logo, banner) used to render shared chrome across the storefront.",
        responses: { 200: { description: "Layout config" } },
      },
    },

    // ───────────────────────── USER ─────────────────────────
    "/user/api/logged-in-user": {
      get: {
        tags: ["User"],
        summary: "Get the current buyer's own profile",
        security: cookieSecurity,
        responses: { 200: { description: "Buyer profile" }, 401: Responses[401] },
      },
    },
    "/user/api/change-password": {
      post: {
        tags: ["User"],
        summary: "Change the current buyer's password",
        security: cookieSecurity,
        description: "Requires the current password; rejects if the new password matches the current one.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["currentPassword", "newPassword", "confirmPassword"], properties: { currentPassword: { type: "string" }, newPassword: { type: "string" }, confirmPassword: { type: "string" } } } } } },
        responses: { 200: { description: "Password updated" }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/user/api/shipping-addresses": {
      get: {
        tags: ["User"],
        summary: "List the current buyer's saved shipping addresses",
        security: cookieSecurity,
        responses: { 200: { description: "Addresses, most recent first" }, 401: Responses[401] },
      },
    },
    "/user/api/add-address": {
      post: {
        tags: ["User"],
        summary: "Add a shipping address",
        security: cookieSecurity,
        description: "If `isDefault` is true, clears the default flag on the buyer's other addresses first.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["label", "name", "street", "city", "zip", "country"], properties: { label: { type: "string", enum: ["Home", "Work", "Other"] }, name: { type: "string" }, street: { type: "string" }, city: { type: "string" }, zip: { type: "string" }, country: { type: "string" }, isDefault: { type: "boolean" } } } } } },
        responses: { 201: { description: "Address created" }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/user/api/delete-address/{addressId}": {
      delete: {
        tags: ["User"],
        summary: "Delete a shipping address",
        security: cookieSecurity,
        parameters: [{ name: "addressId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Address deleted" }, 401: Responses[401], 404: Responses[404] },
      },
    },

    // ───────────────────────── PRODUCT ─────────────────────────
    "/product/api/get-categories": {
      get: {
        tags: ["Product"],
        summary: "Get the platform's category/subcategory list",
        description: "Powers the category and subcategory dropdowns on the \"Create Product\" form (site_config.categories / subCategories).",
        responses: { 200: { description: "Categories + subcategories map" } },
      },
    },
    "/product/api/create-discount-code": {
      post: {
        tags: ["Product"],
        summary: "Create a discount code (seller)",
        security: cookieSecurity,
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["public_name", "discountType", "discountValue", "discountCode"], properties: { public_name: { type: "string" }, discountType: { type: "string", enum: ["percentage", "flat"] }, discountValue: { type: "number" }, discountCode: { type: "string" } } } } } },
        responses: { 201: { description: "Discount code created" }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/product/api/get-discount-codes": {
      get: {
        tags: ["Product"],
        summary: "List the current seller's discount codes",
        security: cookieSecurity,
        responses: { 200: { description: "Discount codes" }, 401: Responses[401] },
      },
    },
    "/product/api/delete-discount-code/{id}": {
      delete: {
        tags: ["Product"],
        summary: "Delete a discount code (seller, own only)",
        security: cookieSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" }, 401: Responses[401], 404: Responses[404] },
      },
    },
    "/product/api/upload-product-image": {
      post: {
        tags: ["Product"],
        summary: "Upload a single product image to ImageKit /products",
        security: cookieSecurity,
        description: "Legacy single-purpose uploader used by the \"Create Product\" form. For new integrations prefer /product/api/upload-media, which also supports the /user folder and video files.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["fileName"], properties: { fileName: { type: "string", description: "Base64 data URI of the image" } } } } } },
        responses: { 201: { description: "Uploaded", content: { "application/json": { schema: { type: "object", properties: { file_url: { type: "string" }, fileId: { type: "string" } } } } } }, 401: Responses[401] },
      },
    },
    "/product/api/upload-media": {
      post: {
        tags: ["Product"],
        summary: "Upload an image or video to ImageKit (products or user folder)",
        security: cookieSecurity,
        description: "General-purpose media upload. Requires a valid session but is not role-restricted — any authenticated buyer, seller, or admin may call it. `folder` must be exactly \"products\" or \"user\".",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["file", "folder"], properties: { file: { type: "string", description: "Base64 data URI, e.g. data:image/png;base64,... or data:video/mp4;base64,..." }, folder: { type: "string", enum: ["products", "user"] } } } } } },
        responses: { 201: { description: "Uploaded", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, key: { type: "string", description: "ImageKit fileId" }, presigned_url: { type: "string", description: "Public ImageKit URL of the uploaded file" } } } } } }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/product/api/delete-product-image": {
      delete: {
        tags: ["Product"],
        summary: "Delete an image from ImageKit by fileId",
        security: cookieSecurity,
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["fileId"], properties: { fileId: { type: "string" } } } } } },
        responses: { 201: { description: "Deleted" }, 401: Responses[401] },
      },
    },
    "/product/api/create-product": {
      post: {
        tags: ["Product"],
        summary: "Create a product (seller)",
        security: cookieSecurity,
        description: "Also used to create an \"Event\": pass matching starting_date/ending_date and it's the same products row, just with a date range. Slug must be globally unique.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "slug", "short_description", "category", "subCategory", "sale_price", "regular_price", "stock", "tags", "images"],
                properties: {
                  title: { type: "string" }, slug: { type: "string" }, short_description: { type: "string" }, detailed_description: { type: "string" },
                  category: { type: "string" }, subCategory: { type: "string" }, brand: { type: "string" }, video_url: { type: "string" },
                  tags: { type: "string", description: "comma-separated" }, colors: { type: "array", items: { type: "string" } }, sizes: { type: "array", items: { type: "string" } },
                  stock: { type: "integer" }, sale_price: { type: "number" }, regular_price: { type: "number" }, warranty: { type: "string" },
                  cash_on_delivery: { type: "string", enum: ["yes", "no"] }, discountCodes: { type: "array", items: { type: "string" } },
                  custom_specifications: { type: "object" }, customProperties: { type: "object" },
                  starting_date: { type: "string", format: "date-time", description: "set together with ending_date to make this an Event" },
                  ending_date: { type: "string", format: "date-time" },
                  images: { type: "array", items: { type: "object", properties: { fileId: { type: "string" }, file_url: { type: "string" } } } },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Product created" }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/product/api/update-product/{productId}": {
      put: {
        tags: ["Product"],
        summary: "Update a product (seller, own shop only)",
        security: cookieSecurity,
        description: "Partial update — every field is optional and only provided fields are changed. Does not touch the product's images (use upload/delete-product-image for that).",
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", description: "Any subset of the create-product fields" } } } },
        responses: { 200: { description: "Product updated" }, 400: Responses[400], 401: Responses[401], 404: Responses[404] },
      },
    },
    "/product/api/get-shop-products": {
      get: {
        tags: ["Product"],
        summary: "List the current seller's own products",
        security: cookieSecurity,
        responses: { 200: { description: "Products (including soft-deleted)" }, 401: Responses[401] },
      },
    },
    "/product/api/get-shop-product/{productId}": {
      get: {
        tags: ["Product"],
        summary: "Get one of the current seller's products by id",
        description: "Seller-scoped and ownership-checked — used by the \"Edit Product\" form, unlike the public slug-based /product/api/get-product/{slug}.",
        security: cookieSecurity,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Product" }, 401: Responses[401], 404: Responses[404] },
      },
    },
    "/product/api/delete-product/{productId}": {
      delete: {
        tags: ["Product"],
        summary: "Soft-delete a product (seller, own only)",
        description: "Sets isDeleted + a deletedAt 24h in the future; can be undone via restore-product within that window.",
        security: cookieSecurity,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Scheduled for deletion" }, 401: Responses[401], 404: Responses[404] },
      },
    },
    "/product/api/restore-product/{productId}": {
      put: {
        tags: ["Product"],
        summary: "Undo a pending soft-delete (seller, own only)",
        security: cookieSecurity,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 201: { description: "Restored" }, 400: { description: "Product was not in a deleted state" }, 401: Responses[401] },
      },
    },
    "/product/api/get-all-products": {
      get: {
        tags: ["Product"],
        summary: "Public paginated product listing",
        description: "Excludes Events (products with both starting_date and ending_date set). Pass type=latest to sort by newest; any other/missing value sorts by totalSales.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "type", in: "query", schema: { type: "string", enum: ["latest"] }, description: "Omit for best-sellers sort" },
        ],
        responses: { 200: { description: "Products page + top10Products + pagination" } },
      },
    },
    "/product/api/get-all-events": {
      get: {
        tags: ["Product"],
        summary: "Public paginated Event listing (\"Top Offers\")",
        description: "Only products with both starting_date and ending_date set, sorted by totalSales.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: { description: "Events page + top10Products + pagination" } },
      },
    },
    "/product/api/get-product/{slug}": {
      get: {
        tags: ["Product"],
        summary: "Get public product details by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Product" }, 404: Responses[404] },
      },
    },
    "/product/api/get-filtered-products": {
      get: {
        tags: ["Product"],
        summary: "Filter/search the public catalog",
        description: "Excludes Events. Backs the /products storefront page's filter sidebar.",
        parameters: [
          { name: "priceRange", in: "query", schema: { type: "string", example: "0,10000" } },
          { name: "categories", in: "query", schema: { type: "array", items: { type: "string" } } },
          { name: "colors", in: "query", schema: { type: "array", items: { type: "string" } } },
          { name: "sizes", in: "query", schema: { type: "array", items: { type: "string" } } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
        ],
        responses: { 200: { description: "Filtered products + pagination" } },
      },
    },
    "/product/api/get-filtered-offers": {
      get: {
        tags: ["Product"],
        summary: "Filter/search Events (\"Offers\")",
        description: "Same filter shape as get-filtered-products, scoped to Events only.",
        parameters: [
          { name: "priceRange", in: "query", schema: { type: "string" } },
          { name: "categories", in: "query", schema: { type: "array", items: { type: "string" } } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
        ],
        responses: { 200: { description: "Filtered events + pagination" } },
      },
    },
    "/product/api/get-filtered-shops": {
      get: {
        tags: ["Product"],
        summary: "Filter/search shops",
        parameters: [
          { name: "categories", in: "query", schema: { type: "array", items: { type: "string" } } },
          { name: "countries", in: "query", schema: { type: "array", items: { type: "string" } } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
        ],
        responses: { 200: { description: "Filtered shops + pagination" } },
      },
    },
    "/product/api/search-products": {
      get: {
        tags: ["Product"],
        summary: "Full-text product search (autocomplete/search bar)",
        parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Matching products" }, 400: Responses[400] },
      },
    },
    "/product/api/top-shops": {
      get: {
        tags: ["Product"],
        summary: "Get the top-rated/best-selling shops for the homepage",
        responses: { 200: { description: "Shops" } },
      },
    },

    // ───────────────────────── SELLER ─────────────────────────
    "/seller/api/get-notifications": {
      get: {
        tags: ["Seller"],
        summary: "List the current seller's notifications",
        security: cookieSecurity,
        responses: { 200: { description: "Notifications, newest first" }, 401: Responses[401] },
      },
    },
    "/seller/api/mark-notification-as-read": {
      post: {
        tags: ["Seller"],
        summary: "Mark one of the current seller's notifications as read",
        description: "Ownership-checked — a seller can only mark their own notifications (receiverId must match).",
        security: cookieSecurity,
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["notificationId"], properties: { notificationId: { type: "string" } } } } } },
        responses: { 200: { description: "Marked as read" }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/seller/api/update-shop": {
      put: {
        tags: ["Seller"],
        summary: "Update the current seller's shop profile",
        description: "Partial update — every field optional. Backs the seller dashboard's Settings page.",
        security: cookieSecurity,
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, bio: { type: "string" }, category: { type: "string" }, address: { type: "string" }, opening_hours: { type: "string" }, website: { type: "string" }, socialLinks: { type: "array", items: { type: "object" } }, coverBanner: { type: "string" } } } } } },
        responses: { 200: { description: "Shop updated" }, 401: Responses[401], 404: Responses[404] },
      },
    },

    // ───────────────────────── ORDER ─────────────────────────
    "/order/api/create-payment-intent": {
      post: {
        tags: ["Order"],
        summary: "Create a Stripe PaymentIntent for a single seller's cart",
        security: cookieSecurity,
        description: "Charges the buyer with a 10% platform fee routed to the platform account and the rest to the seller's connected Stripe account.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["amount", "sellerStripeAccountId", "sessionId"], properties: { amount: { type: "number", description: "USD" }, sellerStripeAccountId: { type: "string" }, sessionId: { type: "string" } } } } } },
        responses: { 200: { description: "PaymentIntent client secret" }, 401: Responses[401] },
      },
    },
    "/order/api/create-payment-session": {
      post: {
        tags: ["Order"],
        summary: "Create a checkout session (cached in Redis) before payment",
        security: cookieSecurity,
        description: "Normalizes and stores the cart + selected address + coupon under a session id in Redis; the actual order row is only created once Stripe confirms payment via the /api/create-order webhook.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["cart"], properties: { cart: { type: "array", items: { type: "object" } }, selectedAddressId: { type: "string" }, coupon: { type: "object" } } } } } },
        responses: { 200: { description: "Session created" }, 400: Responses[400], 401: Responses[401] },
      },
    },
    "/order/api/verifying-payment-session": {
      get: {
        tags: ["Order"],
        summary: "Look up a cached checkout session by id",
        security: cookieSecurity,
        parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Session data" }, 400: Responses[400] },
      },
    },
    "/order/api/get-seller-orders": {
      get: {
        tags: ["Order"],
        summary: "List orders for the current seller's shop",
        security: cookieSecurity,
        responses: { 200: { description: "Orders" }, 401: Responses[401] },
      },
    },
    "/order/api/get-order-details/{orderId}": {
      get: {
        tags: ["Order"],
        summary: "Get one order's details (with line items)",
        security: cookieSecurity,
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Order" }, 401: Responses[401], 404: Responses[404] },
      },
    },
    "/order/api/update-status/{orderId}": {
      put: {
        tags: ["Order"],
        summary: "Update an order's delivery status (seller, own shop only)",
        security: cookieSecurity,
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["deliveryStatus"], properties: { deliveryStatus: { type: "string" } } } } } },
        responses: { 200: { description: "Status updated" }, 401: Responses[401], 404: Responses[404] },
      },
    },
    "/order/api/verify-coupon": {
      put: {
        tags: ["Order"],
        summary: "Validate a discount code against a cart",
        description: "Public — does not require login. Lets guests preview a coupon's validity before creating an account or checking out.",
        parameters: [
          { name: "couponCode", in: "query", required: true, schema: { type: "string" } },
          { name: "cart", in: "query", required: true, schema: { type: "string" }, description: "JSON-encoded cart array" },
        ],
        responses: { 200: { description: "Coupon is valid, with computed discount" }, 400: Responses[400] },
      },
    },
    "/order/api/get-user-orders": {
      get: {
        tags: ["Order"],
        summary: "List the current buyer's own orders",
        security: cookieSecurity,
        responses: { 200: { description: "Orders" }, 401: Responses[401] },
      },
    },
    "/order/api/get-admin-orders": {
      get: {
        tags: ["Order"],
        summary: "List all orders platform-wide (admin only)",
        security: cookieSecurity,
        responses: { 200: { description: "Orders" }, 401: Responses[401] },
      },
    },
    "/order/api/create-order": {
      post: {
        tags: ["Order"],
        summary: "Stripe webhook — creates the order after payment confirmation",
        description: "Called by Stripe, not by the frontend. Requires the raw request body for signature verification (STRIPE_WEBHOOK_SECRET) — this route is registered before express.json() in order-service for that reason. Use the Stripe CLI (`stripe listen`) to exercise it locally.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", description: "Raw Stripe event payload" } } } },
        responses: { 200: { description: "Order created" }, 400: { description: "Invalid Stripe signature" } },
      },
    },

    // ───────────────────────── CHATTING ─────────────────────────
    "/chatting/api/create-user-conversationGroup": {
      post: {
        tags: ["Chatting"],
        summary: "Start (or reuse) a conversation between the current buyer and a seller",
        security: cookieSecurity,
        description: "Idempotent — if a 1:1 conversation between this buyer and seller already exists, returns it (isNew: false) instead of creating a duplicate.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["sellerId"], properties: { sellerId: { type: "string" } } } } } },
        responses: { 200: { description: "Existing conversation" }, 201: { description: "New conversation created" }, 401: Responses[401] },
      },
    },
    "/chatting/api/get-user-conversations": {
      get: {
        tags: ["Chatting"],
        summary: "List the current buyer's conversations",
        security: cookieSecurity,
        description: "Includes each conversation's seller participant and last message, for the inbox list view.",
        responses: { 200: { description: "Conversations" }, 401: Responses[401] },
      },
    },
    "/chatting/api/get-seller-conversations": {
      get: {
        tags: ["Chatting"],
        summary: "List the current seller's conversations",
        security: cookieSecurity,
        responses: { 200: { description: "Conversations" }, 401: Responses[401] },
      },
    },
    "/chatting/api/get-messages/{conversationId}": {
      get: {
        tags: ["Chatting"],
        summary: "Get message history for a conversation (buyer view)",
        security: cookieSecurity,
        description: "New messages are also pushed live over the WebSocket at NEXT_PUBLIC_CHATTING_WEBSOCKET_URI once a message is registered via the first plain-text socket frame — this REST endpoint is for loading history on open.",
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Messages" }, 401: Responses[401] },
      },
    },
    "/chatting/api/get-seller-messages/{conversationId}": {
      get: {
        tags: ["Chatting"],
        summary: "Get message history for a conversation (seller view)",
        security: cookieSecurity,
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Messages" }, 401: Responses[401] },
      },
    },

    // ───────────────────────── ADMIN ─────────────────────────
    "/admin/api/get-all-products": {
      get: { tags: ["Admin"], summary: "List all products platform-wide", security: cookieSecurity, responses: { 200: { description: "Products" }, 401: Responses[401] } },
    },
    "/admin/api/get-all-events": {
      get: { tags: ["Admin"], summary: "List all Events platform-wide", security: cookieSecurity, responses: { 200: { description: "Events" }, 401: Responses[401] } },
    },
    "/admin/api/get-all-admins": {
      get: { tags: ["Admin"], summary: "List all admin accounts", security: cookieSecurity, responses: { 200: { description: "Admins" }, 401: Responses[401] } },
    },
    "/admin/api/add-new-admin": {
      put: {
        tags: ["Admin"],
        summary: "Promote an existing user to admin",
        security: cookieSecurity,
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string" } } } } } },
        responses: { 200: { description: "User is now an admin" }, 401: Responses[401], 404: Responses[404] },
      },
    },
    "/admin/api/get-all-users": {
      get: { tags: ["Admin"], summary: "List all buyer accounts", security: cookieSecurity, responses: { 200: { description: "Users" }, 401: Responses[401] } },
    },
    "/admin/api/get-all-sellers": {
      get: { tags: ["Admin"], summary: "List all sellers + shops", security: cookieSecurity, responses: { 200: { description: "Sellers" }, 401: Responses[401] } },
    },
    "/admin/api/get-all": {
      get: {
        tags: ["Admin"],
        summary: "Get site customization config",
        description: "Public — no auth required. Returns the site_config row used by the Admin UI's Customization screen.",
        responses: { 200: { description: "site_config" } },
      },
    },
    "/admin/api/get-all-notifications": {
      get: { tags: ["Admin"], summary: "List all platform notifications", security: cookieSecurity, responses: { 200: { description: "Notifications" }, 401: Responses[401] } },
    },
    "/admin/api/get-user-notifications": {
      get: {
        tags: ["Admin"],
        summary: "List the current admin's own notifications",
        security: cookieSecurity,
        responses: { 200: { description: "Notifications" }, 401: Responses[401] },
      },
    },

    // ───────────────────────── RECOMMENDATION ─────────────────────────
    "/recommendation/api/get-recommendation-products": {
      get: {
        tags: ["Recommendation"],
        summary: "Get personalized product recommendations for the current buyer",
        security: cookieSecurity,
        description: "Falls back to the 10 most recent products until the buyer has 50+ tracked actions in UserAnalytics; after that, retrains a personalized list at most every 3 hours (cached in UserAnalytics.recommendations).",
        responses: { 200: { description: "Recommended products" }, 401: Responses[401] },
      },
    },
  },
};
