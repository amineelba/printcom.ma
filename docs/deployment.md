# Deployment

Target: Vercel, per the brief. These steps apply to any Node.js host
capable of running a Next.js app against a reachable PostgreSQL instance,
with Vercel-specific notes called out.

## Prerequisites

- A PostgreSQL database (Vercel Postgres, Neon, Supabase, RDS, etc.)
- A Vercel Blob store (or another S3-compatible bucket — see note below)
  if you want persistent media storage in a serverless deployment (local
  disk storage does not survive across serverless invocations/deploys)
- An email provider account (Resend, or SMTP credentials) — see
  `docs/environment-variables.md`

## First deploy

1. Set every variable in `docs/environment-variables.md` in your
   hosting provider's environment configuration. At minimum:
   `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`.
2. Run migrations against the target database **before** the app
   receives traffic:
   ```bash
   pnpm payload migrate
   ```
   (`payload.config.ts` sets `push: false` — the app will not
   auto-create its schema on boot. This is deliberate; see
   `docs/architecture.md`.)
3. Seed baseline structure (idempotent, safe to run on every deploy if
   you want, though normally a one-time step):
   ```bash
   pnpm seed
   ```
4. Create the first admin user:
   ```bash
   ADMIN_EMAIL=you@printcom.ma ADMIN_PASSWORD='...' pnpm create-admin
   ```
5. Build and deploy:
   ```bash
   pnpm build
   pnpm start   # or your platform's equivalent
   ```

## On every subsequent deploy

1. If any collection/global field changed since the last deploy, a
   migration must exist and be committed
   (`pnpm payload migrate:create <name>` run locally against a dev DB,
   commit `src/migrations/`).
2. Run `pnpm payload migrate` against the production database as part of
   your deploy pipeline, before the new app version starts serving
   traffic.
3. `pnpm build` — if this fails, do not deploy (see
   `docs/testing.md` for what `pnpm build` gates).

## Vercel-specific notes

- Framework preset: Next.js. Build command: `pnpm build`. Output: default
  (`.next`).
- `src/proxy.ts` (Next 16's renamed "middleware") always runs on the
  Node.js runtime — no config needed on Vercel's side, but be aware it
  cannot run on Vercel's Edge network; it runs in the standard Node
  serverless/regional function environment.
- Set `BLOB_READ_WRITE_TOKEN` (from a Vercel Blob store) to persist
  uploaded media across deploys — without it, `Media` falls back to
  local disk storage, which is ephemeral on Vercel's serverless
  filesystem and **will lose uploaded images between deploys**. This is
  fine for local development, not for production.
- Rate limiting and idempotency (`docs/security.md`) are in-memory —
  each Vercel function instance has its own state. Acceptable at
  Printcom's expected traffic; revisit if traffic grows.

## Database migrations in CI/CD

If you wire a CI/CD pipeline, the recommended order per deploy is:

```text
pnpm install → pnpm typecheck → pnpm lint → pnpm test:unit
  → pnpm build → pnpm payload migrate (against prod DB)
  → deploy → pnpm test:e2e (against the deployed URL, optional smoke pass)
```

`pnpm test:integration` requires a real Postgres connection and is meant
for local/staging development, not typically run against production data
in CI.

## Health checks

`GET /api/[...slug]` (Payload's REST root) and any public page (e.g. `/`)
both require a working database connection to respond — either is a
reasonable liveness check target. `/robots.txt` and `/sitemap.xml` are
lightweight alternatives that also touch the database (they read
`seo-defaults` and the catalogue collections respectively).
