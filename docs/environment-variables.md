# Environment variables

Copy `.env.example` to `.env` and fill in real values. `.env` is
gitignored — never commit it.

| Variable | Required | Status | Notes |
|---|---|---|---|
| `DATABASE_URL` | Yes | Implemented | PostgreSQL connection string. |
| `PAYLOAD_SECRET` | Yes | Implemented | Long random string, used for session signing. |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Implemented | Used for `metadataBase`, sitemap/robots absolute URLs, JSON-LD. |
| `PREVIEW_SECRET` | No | **Declared, not wired** | No draft-preview route currently reads this. Reserved for a future `/api/preview` implementation if Printcom wants live draft previews from the admin panel. |
| `BLOB_READ_WRITE_TOKEN` | No | Implemented | When set, `Media` uses `@payloadcms/storage-vercel-blob`; when unset, falls back to local disk storage (dev only — see `docs/deployment.md`). |
| `EMAIL_PROVIDER` | No | Implemented | `console` (default, logs instead of sending) or `resend`. |
| `EMAIL_FROM` | No | Implemented | Used as the `from` address for both providers. |
| `EMAIL_REPLY_TO` | No | Implemented | Passed as `reply_to` to Resend. |
| `RESEND_API_KEY` | Only if `EMAIL_PROVIDER=resend` | Implemented | |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | No | **Declared, not implemented** | `src/lib/email/sendEmail.ts` only implements `resend` and `console` — there is no SMTP transport wired up. Setting these currently does nothing; the effective behavior stays `console` unless `EMAIL_PROVIDER=resend`. Add a `nodemailer`-based branch if Printcom needs SMTP specifically instead of Resend. |
| `PRINTCOM_QUOTE_RECIPIENTS` | No | Implemented | Fallback for `quote-settings.notificationRecipients` if that global field is empty. |
| `PRINTCOM_CONTACT_RECIPIENTS` | No | Implemented | Fallback for `contact-settings.notificationRecipients`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Only for `pnpm create-admin` | Implemented | Not read anywhere else. |
| `FILE_UPLOAD_MAX_SIZE` | No | Implemented | Bytes; enforced in `uploadQuoteFile`. Default 15728640 (15MB). |
| `QUOTE_RETENTION_DAYS` / `CONTACT_RETENTION_DAYS` | No | **Declared, not implemented** | No scheduled job currently purges old `quote-requests`/`contact-requests` documents. If Printcom has a data-retention policy requiring automatic deletion, this needs a cron (e.g. a Vercel Cron Job calling a route handler that deletes documents older than N days) — the env vars exist as the intended configuration surface for that, but the job itself doesn't exist yet. |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` / `NEXT_PUBLIC_ANALYTICS_ID` | No | **Declared, not implemented** | No analytics snippet is currently rendered anywhere. Reserved for whichever provider Printcom chooses (Plausible, GA4, etc.) — wire into `src/app/(frontend)/layout.tsx` when decided. |

## Why some variables are declared but not wired

The brief's §34 lists this exact set of variables as the expected
configuration surface for a production deployment. Rather than either
(a) silently omitting the ones this build didn't have time to fully wire
end-to-end, or (b) claiming they work when they don't, they're declared
in `.env.example` (matching the required surface) and their actual
implementation status is documented here plainly. None of the
"not implemented" ones affect core functionality — quote/contact
submissions work correctly today via `console` or `resend`; retention
and analytics are operational/compliance features Printcom can prioritize
post-launch.
