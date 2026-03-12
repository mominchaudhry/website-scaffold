# Deployment Guide

## Overview
- Deploy `apps/web` to Vercel.
- Deploy `apps/cms` + PostgreSQL to Railway.
- Use S3-compatible object storage for Strapi uploads (MinIO, S3, R2).

## Vercel (apps/web)
1. Import this repository as a Vercel project.
2. Set **Root Directory** to `apps/web`.
3. In project settings, enable using workspace files outside root.
4. Configure env vars:
- `NEXT_PUBLIC_SITE_URL`
- `STRAPI_API_URL`
- `STRAPI_PUBLIC_TOKEN`
- `STRAPI_PREVIEW_TOKEN`
- `PREVIEW_SECRET`
- `REVALIDATE_SECRET`

## Railway (apps/cms + db)
1. Create a new Railway service from this repository.
2. Set service root to `apps/cms`.
3. Provision PostgreSQL and bind `DATABASE_URL`.
4. Configure env vars from `apps/cms/.env.example`.
5. Expose Strapi on a public domain for Vercel access.

## Strapi API Access
1. Create a **read-only API token** for published content (`page`, `site-config`, `theme`).
2. Add that token to web env as `STRAPI_PUBLIC_TOKEN`.
3. Create a second token for draft preview access and set `STRAPI_PREVIEW_TOKEN`.
4. Keep both tokens server-side only (do not expose in client JS).

## Revalidation Wiring
- Set `REVALIDATE_WEBHOOK_URL` in Strapi to your web endpoint:
`https://<your-web-domain>/api/revalidate`
- Use the same `REVALIDATE_SECRET` value in both apps.
- Strapi lifecycle hooks subscribe to all `api::*` content types and notify this endpoint on create/update/delete/publish.
- Next invalidates broad tags (`cms`, `site-config`, `pages`, `themes`) plus specific tags/paths when available.

## Preview Wiring
- Next preview URL format:
`https://<your-web-domain>/api/preview?secret=<PREVIEW_SECRET>&slug=/pricing`
- Set `PREVIEW_SECRET` in both apps.
- Use Strapi Preview feature to point editors to this URL pattern.
