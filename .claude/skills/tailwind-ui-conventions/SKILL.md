---
name: tailwind-ui-conventions
description: Styling and layout conventions to follow across the three EcommerceShop Next.js apps (user-ui, seller-ui, admin-ui) so new screens match the existing look. Use when building or restyling any page/component in these apps.
---

# Tailwind UI Conventions (EcommerceShop)

Each app (`apps/user-ui`, `apps/seller-ui`, `apps/admin-ui`) has its own `tailwind.config.js` and `postcss.config.js` — check the target app's config for its theme extensions (colors, fonts, breakpoints) before hardcoding a value; don't assume the three apps share identical design tokens even though they share the same tech stack.

## Before styling something new

1. Look for an existing page/component in the **same app** doing something visually similar (a card, a table, a modal) and match its class patterns rather than inventing a new one.
2. Check `packages/components/` first — an existing shared component (`input`, `color-selector`, `rich-text-editor`, `custom-specifications`) may already implement the pattern you need; extend it instead of duplicating markup.
3. Respect whichever charting/table library the screen already uses — `recharts` and `apexcharts` are both present in the codebase; don't introduce a third charting library for a new screen without a reason.

## Fonts

UI apps use `next/font/google` (e.g. Poppins). This requires network access to Google Fonts at build time — if working offline or in a restricted build environment, this is the known cause of build failures (see [CLAUDE.md](../../../CLAUDE.md) known issues), not a code bug to "fix" by changing the font import.

## Icons & feedback

- Icons: `lucide-react` — reuse an existing icon before pulling in another icon set.
- Toasts/notifications: check whether the target app already uses `sonner` or `react-hot-toast` and stay consistent within that app (they coexist across the monorepo, but mixing both in one app is inconsistent).
- Animations: `framer-motion` is available; `canvas-confetti` is used for celebratory moments (e.g. checkout success) — there's a known non-blocking build warning about its `reset` import, safe to ignore.

## Responsive/role-specific layout

- `admin-ui` and `seller-ui` are dashboard-style apps (sidebar + content) — match the existing dashboard shell rather than building a new page layout from scratch.
- `user-ui` is the public storefront — optimize for mobile-first responsive layout since it's the buyer-facing app.
