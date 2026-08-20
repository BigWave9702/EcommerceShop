---
name: create-ui-component
description: Add a new UI component to EcommerceShop — either shared across apps (packages/components) or local to one app (user-ui, seller-ui, admin-ui). Use when asked to build a form input, selector, editor, card, table, or any other reusable piece of UI.
---

# Create UI Component (EcommerceShop)

## Decide where it lives

- **Used by 2+ apps (or clearly generic)** → `packages/components/<component-name>/index.tsx`. Existing examples: [color-selector](../../../packages/components/color-selector/index.tsx), [input](../../../packages/components/input/index.tsx), [rich-text-editor](../../../packages/components/rich-text-editor/index.tsx), `custom-specifications`, `Custom-properties`. Follow the same `<component-name>/index.tsx` folder shape.
- **Used by one app only** → put it under that app's own `src` component directory (e.g. `apps/seller-ui/src/...`), not in `packages/`.

## Conventions

- Styling is Tailwind CSS (see each app's `tailwind.config.js`); there is no CSS-in-JS convention here despite `styled-components` being a dependency — check the app's existing components before introducing a new styling approach.
- Forms use `react-hook-form`; icons use `lucide-react`; toasts use `sonner` or `react-hot-toast` (check which one the target app already uses — don't mix both in the same app).
- State: prefer local component state or `react-hook-form`; cross-component client state uses `zustand` or `jotai` depending on what the app already has in place.
- Data-driven components fetch via TanStack Query hooks, not inline `axios` calls in the component body — see the `integrate-api` skill.

## Steps

1. Check `packages/components/` and the target app for an existing component that's close enough to extend instead of duplicating.
2. Scaffold the component following the folder/export shape of the nearest existing example.
3. If shared, import it into consuming apps via the `packages/components` path used elsewhere in that app.
4. Verify visually with the `run-app` skill (serve the relevant UI, check the component in the browser — light logic can be covered by a Jest test with `npx nx test <app>`, but visual correctness needs an actual browser check).
