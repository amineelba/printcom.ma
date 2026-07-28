# Quote request workflow

## Public-facing flow

`/demande-de-devis` (`src/app/(frontend)/demande-de-devis/page.tsx`)
renders `QuoteWizard`, a 6-step client-side form:

1. **Besoin** (`quoteNeedSchema`) — request type, desired product,
   category, description (required), usage, sector
2. **Configuration** (`quoteConfigurationSchema`) — format, custom
   dimensions, orientation, page count, print sides, color, material,
   grammage, finishes (multi-select), binding, quantity, versions,
   variable-data flag
3. **Production et livraison** (`quoteProductionAndDeliverySchema`) —
   desired date (with the mandated disclaimer text: "La date demandée
   sera étudiée et confirmée par l'équipe Printcom."), urgency, city,
   address/zone, multi-site delivery + destination count, installation
   flag, logistics comments
4. **Fichiers** (`quoteFilesSchema`) — ready/needs-check/needs-design
   flags, file upload (see below), external link, comments
5. **Contact** (`quoteContactSchema`) — company, name, job title, email,
   phone, city, preferred contact method, comments, **consent checkbox**
   (required, `literal(true)` in the schema)
6. **Récapitulatif** (`QuoteSummary`) — every prior step's values,
   grouped, each section with a "Modifier" link that jumps back to that
   step (state is preserved — nothing resets)

Each step validates against its own Zod schema before advancing
(`validateStep` in `QuoteWizard.tsx`); the full `quoteRequestSchema` is
re-validated server-side on submit regardless of what the client already
checked.

Query params pre-fill the wizard: `/demande-de-devis?produit=<slug>`
(from a product detail page's CTA), `?support=<slug>`, `?finition=<slug>`
— resolved to Payload IDs server-side in `page.tsx` before being handed
to the client component as `defaults`.

## File uploads

Each file is uploaded **as soon as it's added** (not batched at final
submit) via the `uploadQuoteFile` server action
(`src/app/(frontend)/demande-de-devis/actions.ts`):

- Extension allowlist: pdf, jpg, jpeg, png, tif, tiff, webp, ai, eps,
  indd, zip.
- Size limit: `FILE_UPLOAD_MAX_SIZE` env var (default 15 MB).
- Filename sanitized to `[a-zA-Z0-9._-]` before persisting.
- Written to `private-quote-files` (never publicly readable — see
  `docs/access-control.md`) with `overrideAccess: true`, since the
  submitter has no session.
- The returned file ID is stored in the wizard's local state and only
  linked to the actual `quote-requests` document (`quoteRequest` field
  on `private-quote-files`) once the form is fully submitted — an
  abandoned form leaves orphaned-but-still-private files, never a
  half-created lead.

## Submission (`submitQuoteRequest`)

1. Honeypot check — a filled hidden field short-circuits to a fake
   "success" response without writing anything.
2. Full-schema Zod validation — returns field-level errors if invalid.
3. **Idempotency check**: the wizard generates a `crypto.randomUUID()`
   once per mount and sends it with every submit attempt. If the same
   key was already processed (in-memory `Map`, 10-minute TTL — see
   `docs/assumptions.md` for the durability caveat), the same reference
   is returned instead of creating a duplicate lead. This is what
   protects against a double-click or a retried network request.
4. **Rate limiting**: max 3 submissions per IP per 60 seconds
   (`src/lib/security/rateLimit.ts`).
5. **Reference generation**: `PC-DEVIS-YYYY-000001`, retried up to 5
   times on a unique-constraint collision (see `docs/assumptions.md`).
6. `payload.create({ collection: 'quote-requests', ..., overrideAccess: true })`
   — `workflow.status` defaults to `new`, `workflow.priority` to
   `normal`, `workflow.source` to `website-quote-form`.
7. Uploaded files are retroactively linked to the created document.
8. Two emails: an internal notification to
   `quote-settings.notificationRecipients` (falls back to
   `PRINTCOM_QUOTE_RECIPIENTS`), and a confirmation to the submitter
   quoting their reference number.
9. Client redirects to `/demande-de-devis/merci?reference=...`.

## Internal workflow (sales team, in the Payload admin)

`quote-requests.workflow.status` — one of:

```text
new → reviewing → information-required → qualified →
quotation-preparation → quotation-sent → negotiation → won | lost
                                                       → archived | spam
```

A `beforeChange` hook on the collection
(`src/collections/QuoteRequests.ts`) automatically appends to
`workflow.statusHistory` (status, timestamp, changed-by user) whenever
`workflow.status` changes — no manual bookkeeping needed, and it's
`admin.readOnly` so it can't be hand-edited into an inconsistent state.

Other internal-only fields: `assignedTo`, `internalNotes`,
`estimatedValue`, `priority`, `followUpDate`, `source`, `utmSource`,
`utmMedium`, `utmCampaign` — all under a sidebar group, all invisible to
the public API (see `docs/access-control.md`).

## Contact form (simpler, single-step)

`/contact` (`ContactForm.tsx` + `src/app/(frontend)/contact/actions.ts`)
follows the same shape at smaller scale: honeypot, Zod validation, rate
limiting (5/minute/IP), `contact-requests` document with
`consentConfirmed`/`consentTimestamp`, internal notification + auto-reply
email, redirect to `/contact/merci`. Its internal workflow is a simpler
`new → in-progress → resolved | spam`.
