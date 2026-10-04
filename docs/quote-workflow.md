# Quote request workflow

## Public-facing flow

Configuration happens on the product page (`docs/product-configurator.md`);
its "Obtenir mon devis" button leads here with `?produit=<slug>&cfg=<transport>`
(Sprint 4): the selected options travel as a versioned, URL-safe `cfg`
payload that the server canonicalizes against the published product.

`/demande-de-devis` (`src/app/(frontend)/demande-de-devis/page.tsx`)
renders `QuoteCheckout`: **one single-scroll page, no stepper, no
next/back, no recap step.** It replaced the former six-step wizard
(Besoin → Configuration → Production et livraison → Fichiers → Contact →
Récapitulatif) as a product decision — the customer journey is now
`product → visual configurator → "Obtenir mon devis" →
short checkout → lead → Printcom follows up manually`. This is a quote
*request*: no cart, no payment, no pricing, no instant quote.

The page collects only:

| Field | Required | Notes |
|---|---|---|
| Nom complet | yes | trimmed, min 2 chars |
| Téléphone | yes | trimmed, min 6 chars — deliberately no strict regex (Moroccan and international formats) |
| E-mail | yes | valid address |
| Qui fournit le design ? | yes | exactly one of `client` ("J'ai déjà mon design") / `printcom` ("Printcom réalise le design"); a native radio group shown as two cards. Choosing never reveals extra fields (no brief, no upload) |
| Consentement | yes | `literal(true)`, same wording/privacy link as before |
| Entreprise | no | optional since Sprint 1 |
| Commentaire | no | optional, max 2000 chars |

Everything else the wizard used to ask (job title, city, delivery,
urgency, installation, usage, sector, files, external link, format/
material/finish, request description…) is **not** collected publicly;
Printcom gathers it during human follow-up. Validation lives in
`quoteCheckoutSchema` (`src/lib/validation/quote.ts`) — the public input
contract — and is run both in the browser (for fast feedback, errors tied
to their field with `aria-describedby`, first error focused) and again in
the server action.

**"Votre demande" summary.** Query params `?produit=<slug>`, `?cfg=<transport>`
and the legacy `?support=<slug>` / `?finition=<slug>` are resolved by
`resolveQuoteContext` (`src/lib/quote/resolveQuoteContext.ts`) against the
**published** product only (`docs/product-configurator.md` § Quote hand-off
for the transport and canonicalization rules). The server renders the
product title plus the selected configuration rows only — French labels,
multiple finishes joined, custom format as "L × H unit" — with no ids,
enum values, nulls or empty rows. A real **"Modifier"** link returns to
`/produits/<slug>?cfg=…` with the configuration restored; it is omitted when
there is no valid product. The legacy `support`/`finition` slugs are folded
into the canonical configuration (validated against the product, never
overriding `cfg`); without a product they fall back to the plain
published-material/finish lookup. Unknown/unpublished products, or no
params, render no summary at all and the form works as a generic quote. The
checkout itself stays contact-only: no configuration controls, no upload,
no brief. Only the product slug and the canonical transport travel through
the client (`productContext`); the server action re-resolves and
re-canonicalizes them, so nothing is trusted.

## Persistence: public input vs stored structure

The `quote-requests` collection keeps its historical groups
(`need`/`configuration`/`productionAndDelivery`/`files`/`contact`) — they
are what the admin, the PDF export and the future product configurator
read. `mapCheckoutToQuoteRequest`
(`src/lib/quote/mapCheckoutToQuoteRequest.ts`) is the single place that
normalizes a checkout into that shape:

- `files.designSource` (`client` | `printcom`) is a first-class select
  added by migration `20261004_021246_quote_checkout_design_source`; it
  has **no default**, so records created before it existed stay empty
  instead of being assigned an answer the customer never gave. The legacy
  `files.needsGraphicDesign` is kept consistent (`true` only for
  `printcom`); `filesReady` / `needsFileCheck` are never inferred.
- `contact.company` is optional (the same migration drops the column's
  `NOT NULL`; `down()` backfills `''` before restoring it).
- The canonical configuration (Sprint 4) maps onto the existing
  `configuration` group — only values that were actually selected are
  written; selected labels are stored as text snapshots so a lead stays
  truthful if CMS options change later, relationships keep ids:

  | Selection | Stored in |
  |---|---|
  | product | `need.desiredProduct` (relationship) |
  | format | `configuration.format` (label; `Sur mesure` for a custom one) |
  | custom format | `customFormatWidth` / `customFormatHeight` (numbers, `.`/`,` decimals, positive only) / `customFormatUnit` |
  | orientation | `configuration.orientation` (`portrait` / `landscape` / `square`) |
  | page count | `configuration.pageCount` **only when the label is explicitly a count** (`8`, `16 pages`, `1 000 ex.`) + the label in `pageCountLabel` |
  | print sides | `configuration.printSides` |
  | colour mode | `configuration.color` (French label) |
  | material | `configuration.material` (relationship) |
  | grammage | `configuration.grammage` (label) |
  | finishes | `configuration.finish` (relationships, hasMany) |
  | quantity | `configuration.quantity` **only when explicitly numeric** (`500 ex.`) + the label in `quantityLabel` |

  `parseExplicitCount` (`src/lib/configurator/safeCount.ts`) accepts bare
  digits, space-grouped thousands and an explicit unit; "500 à 1000",
  "Sur devis" or "1.000,5" yield *no number* (the label is still kept) —
  there is no blind `Number(label)` and never a `NaN`. Migration
  `20261004_031420_quote_configuration_snapshot` adds the `square`
  orientation (the product model offers it, the quote model did not), and
  `pageCountLabel` / `quantityLabel`; it is additive, historical rows are
  untouched. The PDF export shows the labels (falling back to the numbers)
  and `Carré`.
- `need.requestType` (required by the collection) is `product-printing`
  when a product resolved, otherwise `other`; `need.description` is left
  empty — nothing is manufactured to satisfy a field.
- The optional comment is stored in `contact.comments`.
- `workflow` = `status: new`, `priority: normal`,
  `source: website-quote-form`.

## File uploads (backend retained, not exposed publicly)

The public checkout no longer asks for artwork, but the backend is kept
for a later file-exchange flow: the `uploadQuoteFile` server action
(extension allowlist, `FILE_UPLOAD_MAX_SIZE`, sanitized filename, written
to the never-public `private-quote-files` collection with
`overrideAccess: true`) and the `FileUpload` client component still exist
and are currently unused by any public page.

## Submission (`submitQuoteRequest`)

1. Honeypot check — a filled hidden `website` field short-circuits to a
   fake "success" response without writing anything.
2. `quoteCheckoutSchema` validation — returns field-level errors (keyed by
   field name) if invalid, regardless of what the browser already checked.
3. **Idempotency check**: the checkout generates a `crypto.randomUUID()`
   once per mount and sends it with every submit attempt. If the same key
   was already processed (in-memory `Map`, 10-minute TTL — see
   `docs/assumptions.md` for the durability caveat), the same reference is
   returned instead of creating a duplicate lead. The client additionally
   guards against double-clicks with a ref and a disabled button.
4. **Rate limiting**: max 3 submissions per IP per 60 seconds
   (`src/lib/security/rateLimit.ts`).
5. Context resolution: the published product and its canonicalized
   configuration (tampered, stale or foreign values are dropped; a
   malformed `configurationTransport` is ignored, keeping the product).
6. **Reference generation**: `PC-DEVIS-YYYY-000001`, retried up to 5
   times on a unique-constraint collision (see `docs/assumptions.md`).
7. `payload.create({ collection: 'quote-requests', ..., overrideAccess: true })`
   — submission stays behind this trusted server action; the collection is
   never publicly writable (see `docs/access-control.md`).
8. Two emails, built in `src/lib/quote/quoteEmails.ts` (all customer text
   HTML-escaped): an internal notification to
   `quote-settings.notificationRecipients` (falls back to
   `PRINTCOM_QUOTE_RECIPIENTS`) with reference, name, company *only if
   present*, e-mail, phone, the product and the same canonical
   configuration rows as the checkout summary (populated rows only), design
   source in French and the optional comment; and a concise confirmation
   to the submitter quoting their reference — no promised deadline, no
   claim that a quote is already available. A mail failure is logged but
   never turns an already-saved lead into an error for the customer.
9. `quote_submitted` is emitted (client side, no personal data) only
   after this success response — never on validation failure, rate limit or
   server error. UTM parameters are not captured: no UTM handling existed
   before Sprint 4 and the `workflow.utm*` fields stay empty (adding it
   needs a consent decision).
10. Client redirects to `/demande-de-devis/merci?reference=...`
   ("Demande reçue", the reference, and "Notre équipe étudie votre demande
   et vous contactera pour confirmer les détails.").

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
