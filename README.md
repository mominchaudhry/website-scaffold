# Website Scaffold (Next.js + Strapi 5)

Forkable monorepo scaffold for CMS-driven websites.

## What this provides
- Next.js frontend (`apps/web`) with TypeScript and App Router.
- Strapi 5 backend (`apps/cms`) with dynamic section-driven pages.
- Auto header generation from pages (`MULTI_PAGE`) or sections (`SPA`).
- Theme tokens in Strapi mapped to CSS variables in Next.js.
- Draft preview endpoint and on-demand cache revalidation.
- S3-compatible media provider support (MinIO/S3/R2).

## Monorepo layout
- `apps/web`: frontend deployed to Vercel.
- `apps/cms`: backend deployed to Railway.
- `packages/contracts`: shared types and Zod schemas.

## Quick start
1. Install dependencies:
```bash
pnpm install
```
2. Ensure Docker is running.

3. Run everything locally with one command:
```bash
pnpm dev:local
```
This command will:
- create `apps/web/.env.local` and `apps/cms/.env` if missing
- enforce local-safe values in those env files for DB/Strapi URLs on each run
- auto-select free local ports for Strapi (prefers `1337`) and web (prefers `3000`) if defaults are busy
- start local Postgres + MinIO with Docker
- wait until Postgres is ready
- auto-create the CMS database if missing
- auto-seed a generic business single-page starter (first run, when no pages exist)
- force local runtime env overrides for DB and Strapi URL (so stale remote `.env` values do not break local startup)
- start Strapi and Next.js, then print the selected URLs

4. Stop local infra when done:
```bash
pnpm infra:down
```

5. Manual mode (optional):
```bash
pnpm setup:env
pnpm infra:up
pnpm dev:web
pnpm dev:cms
```

## Core scripts
- `pnpm dev:local`
- `pnpm dev:web`
- `pnpm dev:cms`
- `pnpm setup:env`
- `pnpm infra:up`
- `pnpm infra:down`
- `pnpm build:web`
- `pnpm build:cms`
- `pnpm test`
- `pnpm typecheck`

## Key behavior
- Primary nav is **derived**, not manually curated.
- Unknown sections fail soft (render fallback + log warning).
- Automatic publish revalidation: Strapi lifecycle hooks call Next `/api/revalidate` on publish/update/delete.
- Base revalidation tags always include `cms`, `site-config`, `pages`, `themes` (plus `page:{slug}` / `theme:{id}` when available).
- `REVALIDATE_SECRET` must match between `apps/web` and `apps/cms`, and `apps/cms` must set `REVALIDATE_WEBHOOK_URL`.

## Deployment
See [docs/deployment.md](./docs/deployment.md) for Vercel + Railway setup.
