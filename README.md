# Website Scaffold (Next.js + Strapi 5)

Monorepo scaffold for CMS-driven websites. Create your own project from this template, customise the content in Strapi, and deploy your own site.

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 10 (`corepack enable` if needed)
- **Docker** (for local Postgres and MinIO)

## Quick start

### Option A: GitHub Template (recommended)

1. Click **[Use this template](../../generate)** at the top of this repo to create your own copy.
2. Clone your new repo and run the setup wizard:

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
pnpm setup
```

### Option B: degit (no GitHub account needed)

```bash
npx degit mominchaudhry/website-scaffold my-site
cd my-site
pnpm setup
```

### Option C: Manual clone

```bash
git clone https://github.com/mominchaudhry/website-scaffold.git my-site
cd my-site
pnpm setup
```

---

Once setup is complete, make sure Docker is running, then start everything:

```bash
pnpm dev:local
```

`pnpm dev:local` handles the full local setup automatically:

- Creates `apps/web/.env.local` and `apps/cms/.env` from examples if missing
- Enforces local-safe values for DB and Strapi URLs on each run
- Auto-selects free ports for Strapi (prefers 1337) and Next.js (prefers 3000)
- Starts local Postgres + MinIO via Docker
- Waits for Postgres, creates the CMS database if missing
- Seeds a starter single-page site on first run (when no pages exist)
- Starts Strapi and Next.js, then prints the selected URLs

When you're done:

```bash
pnpm infra:down
```

### Manual mode (optional)

```bash
pnpm setup:env      # Create .env files from examples
pnpm infra:up       # Start Postgres + MinIO
pnpm dev:cms        # Start Strapi
pnpm dev:web        # Start Next.js (in another terminal)
```

## Monorepo layout

```
apps/web        Next.js frontend (App Router, TypeScript)
apps/cms        Strapi 5 backend
packages/contracts  Shared types and Zod schemas
```

## Available scripts

| Script | Description |
|--------|-------------|
| `pnpm setup` | Rename packages and reinit git (run once after cloning) |
| `pnpm dev:local` | Full local dev with infra (recommended) |
| `pnpm dev:web` | Start Next.js only |
| `pnpm dev:cms` | Start Strapi only |
| `pnpm setup:env` | Create `.env` files from examples |
| `pnpm infra:up` | Start Docker services |
| `pnpm infra:down` | Stop Docker services |
| `pnpm build:web` | Production build for Next.js |
| `pnpm build:cms` | Production build for Strapi |
| `pnpm test` | Run tests |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | Lint the codebase |

## How it works

- **Dynamic nav**: The primary navigation is derived from your pages and sections in Strapi, not manually curated.
- **Theme tokens**: Colours, typography, spacing, and other design tokens are defined in Strapi and mapped to CSS variables in Next.js.
- **Auto-revalidation**: Strapi lifecycle hooks call the Next.js `/api/revalidate` endpoint on publish/update/delete, so your site stays in sync.
- **Draft preview**: A `/api/preview` endpoint lets editors preview unpublished content.
- **Soft failure**: Unknown section types render a fallback component and log a warning instead of crashing the page.

## Environment variables

Both apps read their config from environment variables. See `apps/web/.env.example` and `apps/cms/.env.example` for the full list with defaults.

Key variables to set for production:

| Variable | App | Purpose |
|----------|-----|---------|
| `STRAPI_API_URL` | web | URL of your Strapi instance |
| `STRAPI_PUBLIC_TOKEN` | web | Read-only API token for published content |
| `STRAPI_PREVIEW_TOKEN` | web | API token with draft access |
| `PREVIEW_SECRET` | both | Shared secret for draft preview |
| `REVALIDATE_SECRET` | both | Shared secret for cache revalidation |
| `REVALIDATE_WEBHOOK_URL` | cms | Next.js revalidation endpoint URL |
| `DATABASE_URL` | cms | PostgreSQL connection string |
| `S3_*` | cms | S3-compatible storage credentials |

## Deployment

See [docs/deployment.md](./docs/deployment.md) for Vercel + Railway setup instructions.

## Contributing

Contributions are welcome! Please open an issue to discuss what you'd like to change, or submit a pull request.

## License

MIT
