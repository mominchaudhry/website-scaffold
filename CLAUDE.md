# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

pnpm + Turborepo monorepo. Next.js 14 App Router frontend (`apps/web`, ESM, TypeScript) and Strapi 5 backend (`apps/cms`, CommonJS, JavaScript) sharing types through `packages/contracts` (workspace dep `@scaffold/contracts`). Local dev runs Postgres + MinIO via `docker-compose.selfhost.yml`.

## Commands

- `pnpm dev:local` — one-shot full local dev: writes `.env` files, brings up Docker, waits for Postgres, creates the DB, picks free ports (prefers 1337/3000), seeds starter content on first run, then runs both apps. See `scripts/dev-local.sh`.
- `pnpm dev:web` / `pnpm dev:cms` — run one app on its own (requires infra + env already set up).
- `pnpm infra:up` / `pnpm infra:down` — Docker only.
- `pnpm typecheck` / `pnpm test` / `pnpm lint` — fan out via Turbo. `lint` in both apps currently just runs `tsc --noEmit` (no ESLint configured).
- Web tests: `pnpm --filter @scaffold/web test` (Vitest); single test: `pnpm --filter @scaffold/web exec vitest run tests/strapi.test.ts`.
- CI (`.github/workflows`) runs typecheck + tests per app, gated by `dorny/paths-filter` so unrelated changes skip the other app.

## Architecture

**Content flow.** Strapi is the source of truth for site config, theme tokens, pages, and section components. The web app fetches via REST in `apps/web/lib/strapi.ts`, which handles Strapi 5's two response shapes (flat vs `{ attributes }`) through `unwrapEntry`/`unwrapMany`/`unwrapRelation`, normalizes media URLs to absolute, and coerces each section's shape in `normalizeSection`. **Touch these helpers carefully** — they paper over Strapi response inconsistencies that bite if bypassed.

**Site shell.** `apps/web/lib/shell.ts` (`getSiteShellData`) is the single entry point used by both `app/page.tsx` (home) and `app/[slug]/page.tsx`. It fetches site config + pages in parallel, resolves the home page via `resolveHomePage` (explicit `homepage` relation → `isHome` flag → `slug === "home"` → first page), builds header links, and produces theme CSS variables. Fetches are wrapped in `.catch()` with fallbacks so a Strapi outage degrades rather than 500s.

**Navigation modes.** `siteMode` in Site Config is `MULTI_PAGE` (header = pages with `showInHeader`) or `SPA` (header = home-page sections with `showInHeader`, rendered as `#anchor` links). Logic lives in `packages/contracts/src/navigation.ts` (`buildHeaderLinks`) — keep both modes working when changing nav.

**Dynamic zone rendering.** `apps/web/components/SectionRenderer.tsx` switches on `section.__component` (`sections.hero`, `sections.feature-grid`, `sections.rich-text`, `sections.cta`, `sections.faq`, `sections.gallery`). Anchor IDs come from `getSectionAnchor` in `lib/sections.ts` (special-cases hero → `"home"`). **Unknown components must render `<UnknownSection>` and call `logUnknownSection` — never throw.**

**Cache & revalidation.** Web fetches set `next: { tags: ["cms", ...specific] }` so they participate in Next's tag-based cache. On any `api::*` write, Strapi's lifecycle hooks (`apps/cms/src/index.js`) fire `apps/cms/src/utils/revalidate.js`, which POSTs `{ secret, tags, paths }` to `REVALIDATE_WEBHOOK_URL` (the web app's `/api/revalidate`). Page mutations push `page:<slug>` + the path; theme mutations push `theme:<id>`. If you add a new content type, decide what tags/paths it should invalidate in `buildPayload`.

**Theme tokens.** `Theme` content type holds `colors`/`typography`/`spacing`/`radius`/`shadow` component objects. `mergeTheme` in `lib/strapi.ts` deep-merges with `fallbackTheme` from `@scaffold/contracts` so partial themes still render; `themeToCssVariables` projects the result to CSS custom properties applied in `app/layout.tsx`.

**Preview.** `/api/preview` enables Next.js draft mode behind `PREVIEW_SECRET`; downstream code passes `preview=true` through to `strapiFetch`, which uses `STRAPI_PREVIEW_TOKEN` (falling back to the public token) and `status=draft`.

## Adding a new section

Two workflows depending on your setup:

- **With Claude Code:** `/new-section <name>` — the agent reads all patterns and generates complete, customized files in one shot. Describe what content the section should display and the agent designs appropriate Strapi fields + React component. (Defined in `.claude/skills/new-section/SKILL.md`.)
- **Without AI:** `pnpm new:section <kebab-name>` — scaffolds skeleton files (heading + body) across all packages. You then customize the Strapi schema fields, update the matching TypeScript types, and build out the React component.

A new section touches up to 10 files across 3 packages:

| # | What | Where | When |
|---|------|-------|------|
| 1 | Strapi component schema | `apps/cms/src/components/sections/<name>.json` | Always |
| 2 | Sub-item component (if repeatable items) | `apps/cms/src/components/sections/<name>-item.json` | If section has repeatable child items |
| 3 | Register in page dynamic zone | `apps/cms/src/api/page/content-types/page/schema.json` → `sections.components[]` | Always |
| 4 | TypeScript interface + union member | `packages/contracts/src/site.ts` | Always |
| 5 | Zod schema + discriminated union member | `packages/contracts/src/sections.ts` | Always |
| 6 | Populate map entry | `apps/web/lib/strapi.ts` → `pageSectionsPopulate.sections.on` | Always |
| 7 | Normalization in `normalizeSection` | `apps/web/lib/strapi.ts` | If section has nested arrays, relations, media, or action links |
| 8 | CSS styles | `apps/web/app/globals.css` (before `.unknown-section`) | Always |
| 9 | React component | `apps/web/components/sections/<PascalName>Section.tsx` | Always |
| 10 | SectionRenderer case | `apps/web/components/SectionRenderer.tsx` | Always |

Every Strapi section schema must include the shared base attributes (`showInHeader` defaulting to `true`, `navLabel`, `anchorId`, `alignment`, `maxWidth`, `spacing`). Use `shared.link` for action/button fields. Use `sections.<name>-item` for repeatable sub-items.

React components must use `sectionClassName`/`sectionContainerClassName` from `lib/presentation` and only show the `navLabel` kicker when `navLabel` is set — never hardcode fallback text.

Reference exemplars: CTA (simplest), FAQ (has sub-items), Gallery (has media), Hero (has action links).

## Conventions

- Web app uses path alias `@/*` → `apps/web/*` (see `apps/web/tsconfig.json`); contracts import as `@scaffold/contracts`.
- CMS is plain JS (CommonJS); web/contracts are TS ESM. Don't introduce TS in `apps/cms` without configuring Strapi for it.
- Env-driven secrets (`PREVIEW_SECRET`, `REVALIDATE_SECRET`, Strapi tokens) have insecure dev defaults in `lib/env.ts` that warn — do not rely on them in production.
- Don't bypass the `unwrap*` helpers when adding Strapi calls; Strapi 5's response shape varies based on populate strategy and silently breaks downstream consumers.
- All user-facing text in the frontend must come from Strapi. No hardcoded content strings, placeholder text, or fallback labels in components. If a field is optional, hide the element when empty rather than showing a default.
