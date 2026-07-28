# Information Printcom needs to confirm before launch

This is the checklist of every fact this build deliberately did **not**
invent (per the brief's rules of truth, §5). Nothing below is fabricated
anywhere in the codebase or seed data — these are genuine gaps, not
placeholders dressed up as content. Frontend never shows `[À confirmer]`;
instead, the relevant section stays hidden or uses neutral phrasing until
the underlying record is confirmed in the admin panel (see below for how).

## Brand identity

- [ ] Official Printcom brand color(s) → set in the `design-settings`
      global (`brandColorConfirmed: true`, `brandColorHex`). Until then
      the site uses a provisional action-blue (see `docs/assumptions.md`).
- [ ] Logo file(s) → upload to `site-settings.logo` / `logoMark`.
- [ ] Legal company name, founding year → `site-settings.legalCompanyName`
      / `foundingYear`.

## Company facts

- [ ] Founders, leadership, employee count, revenue, production volumes —
      no field currently exists for these; the brief explicitly forbids
      inventing them and doesn't request a dedicated "about the company"
      structured collection, so `/a-propos` stays deliberately generic
      until Printcom decides what (if anything) to disclose publicly.
- [ ] Address, phone, email → `site-settings.address` / `phone` / `email`
      (currently empty; `/contact` and the footer render nothing for
      these until filled in).
- [ ] Business hours → `site-settings.businessHours`.

## Production capability

- [ ] Production sites → `production-sites` collection exists, empty.
      Each entry needs `verificationStatus: confirmed` before appearing
      on `/qualite-et-engagements`.
- [ ] Machines → `machines` collection exists, empty. **`/parc-machines`
      stays a 404 for every visitor until at least one machine is both
      `status: published` and `verificationStatus: confirmed`.** This is
      intentional, tested behavior (see `docs/testing.md`), not a bug.
- [ ] Technologies actually in use → 8 technology terms are seeded as
      `draft` / `verificationStatus: unverified` (§16 of the brief). None
      appear on `/technologies` or anywhere else until an editor confirms
      each one Printcom genuinely operates and flips both fields.
- [ ] Standard lead times, minimum quantities, express availability — per
      product, on the `products` collection's Production field group.
      All demo products currently leave these blank.
- [ ] Certifications (ISO, quality labels, environmental commitments) —
      no collection exists for these because none were supplied.
      `/qualite-et-engagements` explicitly states no certification is
      shown until confirmed, rather than inventing one.

## Commercial

- [ ] Services actually offered — 32 service terms are seeded `draft`
      across the 6 families in §13. **None are published.** An editor
      must review each one against what Printcom genuinely offers before
      publishing.
- [ ] Real product offerings to replace/supplement the 10 `draft` demo
      products (§32) — these exist only to prove the catalogue
      structure works; none should go live as-is (their descriptions
      literally say "fiche de démonstration en cours de qualification").
- [ ] Pricing — deliberately never enabled anywhere (`quoteOnly: true`,
      `indicativePriceEnabled: false` by default on every product). If
      Printcom ever wants an indicative price shown, an admin must
      explicitly enable `indicativePriceEnabled` per product; the field
      itself is admin-only to edit even then.

## Clients, testimonials, sectors

- [ ] Client names/logos for public display → `clients` collection,
      empty. Requires `authorizationConfirmed: true` (a real, recorded
      permission, not a checkbox rubber-stamp) before publishing —
      enforced by `pnpm verify-content`.
- [ ] Testimonials → `testimonials` collection, empty. Requires
      `consentConfirmed: true` before publishing, same enforcement.
- [ ] Sector expertise — 15 sector terms are seeded `draft` with the
      brief's mandated neutral phrasing ("Printcom étudie les
      contraintes d'impression propres à ce secteur."). Publishing any
      of these with a stronger claim of sector expertise requires actual
      evidence (case studies, sector-specific certifications, named
      client work with permission) that doesn't currently exist.

## Legal

- [ ] Mentions légales, politique de confidentialité, politique des
      cookies → all three exist as `legal-documents` entries with
      placeholder body text ("[À confirmer] Contenu à rédiger avec
      l'équipe juridique de Printcom.") and `status: draft`. **These
      must be written and reviewed by qualified legal counsel before
      publishing** — this is not boilerplate a developer should write.

## Operational (not content, but adjacent)

- [ ] Email provider credentials (Resend API key, or an SMTP
      implementation if Printcom prefers) — see
      `docs/environment-variables.md`. Until configured,
      `EMAIL_PROVIDER=console` means quote/contact confirmations are
      logged, not delivered.
- [ ] Media storage (Vercel Blob token) for persistent image uploads in
      production — see `docs/deployment.md`.
- [ ] Analytics provider choice, if any — not wired up (see
      `docs/environment-variables.md`).

## How to publish something once confirmed

1. Log into `/admin`.
2. Navigate to the relevant collection, open the document.
3. Fill in/verify the real data.
4. Set `status` to `published` (and, for technologies/machines/
   testimonials/clients, `verificationStatus` to `confirmed` /
   `authorizationConfirmed` or `consentConfirmed` to checked).
5. Save. The frontend picks it up on the next request for
   `searchParams`-driven routes, or within 5 minutes for statically-
   rendered pages (the ISR window — see `docs/architecture.md`).
