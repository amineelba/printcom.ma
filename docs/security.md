# Security

## HTTP security headers

`next.config.ts` → `headers()` applies to every route **except**
`/admin` and `/api` (Payload manages its own script/style loading and
must not inherit a CSP written for the public frontend):

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security` (production only)
- `Content-Security-Policy`:
  `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'`

**Known follow-up**: `script-src`/`style-src` include `'unsafe-inline'`.
Next.js App Router injects a small inline hydration bootstrap script, and
`SiteHeader.tsx` uses an inline `style` attribute for the
backdrop-filter/gradient nav background — a stricter nonce-based CSP is
possible (Next supports this via a nonce generated in `src/proxy.ts` and
threaded through `next/headers`) but wasn't implemented here to keep
scope bounded. If Printcom's security requirements call for it, this is
the next hardening step — see Next's CSP guide.

Verified at runtime (`curl -I` against a production build) — headers are
present and correct; see the build/verification log in the PR/commit
history for this change.

## Redirects and images

`next.config.ts` allows `*.public.blob.vercel-storage.com` as a
`remotePatterns` entry for `next/image`, so switching `Media` to Vercel
Blob storage (via `BLOB_READ_WRITE_TOKEN`) doesn't require an image-config
change.

## Rate limiting

`src/lib/security/rateLimit.ts` — in-memory sliding window, applied to
both `submitContactForm` (5/min/IP) and `submitQuoteRequest` (3/min/IP).
**Durability caveat**: state lives in a process-local `Map`, so it resets
on redeploy and isn't shared across concurrent serverless instances. For
Printcom's expected form-submission volume this is a reasonable v1; if
the deployment target runs multiple concurrent instances under
meaningful abuse load, replace with a shared store (Vercel KV, Upstash
Redis) — the function signature (`isRateLimited(key, { windowMs, max })`)
is designed to make that a drop-in swap.

## Idempotency

`src/lib/security/idempotency.ts` — same in-memory caveat as rate
limiting, 10-minute TTL. Protects `submitQuoteRequest` against duplicate
lead creation from a double-click or a retried network request (the
client generates one UUID per wizard mount and resends it on every
submit attempt).

## Anti-spam

Honeypot field (`src/lib/security/honeypot.ts`) on both the contact form
and the quote wizard: a hidden `website` input that's invisible to
sighted users and screen readers (`aria-hidden`, `sr-only`, `tabIndex={-1}`)
but present in the DOM for bots that blind-fill every field. A filled
honeypot short-circuits to a fake success response — the bot gets no
signal that it was caught, and nothing is written to the database.

## File upload validation

`uploadQuoteFile` (`src/app/(frontend)/demande-de-devis/actions.ts`):
extension allowlist (pdf/jpg/jpeg/png/tif/tiff/webp/ai/eps/indd/zip), a
size ceiling (`FILE_UPLOAD_MAX_SIZE`, default 15MB), and filename
sanitization (`[^a-zA-Z0-9._-]` stripped) before the file ever reaches
disk/Blob storage. No executable extensions are on the allowlist.
`private-quote-files` itself has no public read/write access (see
`docs/access-control.md`).

## Secrets

`.env` is gitignored (verified — never committed). `.env.example`
documents every variable with no real values. `PAYLOAD_SECRET` and
`PREVIEW_SECRET` must be long random strings in any real deployment (the
dev values in this repo's local `.env` are placeholders, never used
outside this sandboxed session).

## Cookies

Payload's own admin-session cookie (`payload-token`) is `httpOnly` and
`secure` in production by default — this project doesn't override
Payload's cookie configuration, so it inherits Payload's own
security-reviewed defaults.

## Logging

`sendEmail`'s console fallback logs the full email body (recipient,
subject, HTML) to stdout — acceptable for local development, but if
`EMAIL_PROVIDER` is left at `console` in a real deployment, submitted
quote/contact data (names, emails, phone numbers) will appear in server
logs. Set `EMAIL_PROVIDER=resend` (or another real provider) before
going live — see `docs/environment-variables.md`.

## What was not implemented (documented gaps, not silent omissions)

- **Distributed rate limiting / idempotency** — see above, in-memory
  only.
- **Nonce-based CSP** — `unsafe-inline` currently required for React
  hydration + the one inline style usage.
- **CAPTCHA/challenge on forms** — honeypot + rate limiting only; if spam
  becomes a real problem in production, adding a CAPTCHA (e.g. Turnstile)
  to `ContactForm`/`QuoteWizard`'s final step is a contained addition.
