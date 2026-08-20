---
name: pre-commit-check
description: Checklist to run before committing/handing back changes in EcommerceShop — lint, test, build affected projects, and check for the known project-specific footguns. Use before finishing any task that edited code, or when the user asks "is this ready to commit" / "run checks".
---

# Pre-Commit Check (EcommerceShop)

## 1. Affected-scope checks (matches what CI runs)

```powershell
npx nx affected -t lint test build
```

If Nx cache/daemon is acting up first, reset it: `npx nx reset`, and disable the daemon/cloud for a clean local run if needed: `$env:NX_DAEMON='false'; $env:NX_NO_CLOUD='true'`.

For a faster targeted check while iterating on one project:
```powershell
npx nx lint <project>
npx nx test <project>
npx nx build <project>
```

## 2. Prisma

If `prisma/schema.prisma` changed:
```powershell
npx prisma generate
npx prisma validate
```
Then grep for any Prisma model usage that now needs relation fields (see `prisma-schema-change` skill) — a schema change that adds/removes a relation silently breaks components using the bare generated type instead of `Prisma.<model>GetPayload`.

## 3. Known footguns to grep for before committing

- `from "@tanstack/react-query/build/...` — must import from the package root instead.
- New `api-gateway` proxy route added **below** the catch-all `app.use("/", proxy(...))` in `apps/api-gateway/src/main.ts` — it will never be reached.
- Hardcoded `localhost:<port>` URLs in frontend code instead of `NEXT_PUBLIC_SERVER_URI` / other `NEXT_PUBLIC_*` env vars.
- Secrets or `.env` values pasted into source files instead of read from `process.env`.

## 4. Git hygiene

```powershell
git status
git diff
```
Review the diff before staging — confirm no `.env`, `dist/`, or `.next/` build output is being committed (already covered by [.gitignore](../../../.gitignore), but double-check for anything added with `git add -A`).
