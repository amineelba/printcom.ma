# Taxonomy

Full taxonomy trees as seeded by `src/lib/seed/runSeed.ts`, sourced from
the Printcom master content brief. The seed is idempotent — re-running
`pnpm seed` upserts by slug (create if missing, update in place if it
already exists), so editing the source content in `src/lib/seed/content/`
and re-running the seed keeps a database in sync.

## Product categories — `product-categories`, status `published`

Flat: 9 top-level families, each with a real intro/method paragraph and
formulaic SEO. Published immediately since categories are structural, not
factual claims. There is no second `product-categories` level — a
category is catalogue *ownership* only. Every product is its own
`products` document with `primaryCategory` pointing at exactly one of
these 9; cross-cutting/transversal groupings (seasonal campaigns,
merchandising themes) live in `product-collections` instead — see below.

Papeterie d'entreprise · Supports marketing · Édition et documents ·
Packaging · Étiquettes et stickers · PLV et supports de vente · Affichage
et grand format · Signalétique · Goodies & objets publicitaires.

See `src/lib/seed/content/productCategories.ts` for the full content.

## Products — `products`, status `draft`

94 real catalogue products: 79 from the brief (sections 7-8) plus 15
Goodies & objets publicitaires items (stylos, mugs, tote bags, etc. —
`src/lib/seed/content/goodiesProducts.ts`), which are ordinary Products
with `primaryCategory` set to "Goodies & objets publicitaires", not a
taxonomy sub-level. Each has a tagline, "usages fréquents"/"à configurer"
lists, formulaic SEO, and the shared file-preparation boilerplate
paragraph. Seeded `draft` — the copy is publication-ready, but nothing is
a confirmed commercial offer until Printcom reviews and publishes it
(brief section 33, rule 2). Every product is `quoteOnly: true` with
`indicativePriceEnabled: false`.

See `src/lib/seed/content/products.ts` and `goodiesProducts.ts` for the
full list.

## Product collections — `product-collections`, status `active`, 6 seeded

Transversal semantic merchandising groupings — a curated context a
Product may be surfaced in via `Products.collections[]`, independent of
its `primaryCategory` ownership. Not a content type with its own page: no
SEO fields, no slug implying a public URL (`key` is an internal
identifier only).

Seeded per `PRINTCOM-HOMEPAGE-UI-UX-BRIEF-UNIQUE.md`'s example list
(`src/lib/seed/content/productCollections.ts`), `active` from the start —
a structural/organizational grouping, not a factual claim, same
reasoning already used to publish the 9 categories immediately:

Ramadan · Yennayer · Nouvel An · Eid al-Adha · Coupe du Monde 2030 ·
Événementiel — each with a curated set of real, already-seeded catalogue
products tagged in (23 products total; pure re-organization, no new
catalogue content).

`Homepage.collectionBoard` (seeded `enabled: true`) chooses which active
collections a given page surfaces, as a presentation decision separate
from a collection's own lifecycle — the homepage's "Collection Board"
section (pills/tabs filtering product cards, no `/collections/*` route)
only shows a collection once it has at least one currently-*published*
matching product, so it may render fewer than all 6 until more products
are published.

## Services (brief section 9) — `services`, status `draft`

6 top-level services, each with 4-8 sub-services (35 sub-services total).
Seeded **draft** — per the brief, only confirmed service offerings should
ever be published.

Conseil et accompagnement · Studio graphique · Prépresse · Production ·
Façonnage · Livraison et déploiement.

## Solutions (brief sections 10 and 37) — `solutions`, status `draft`

11 entries in one flat collection: 8 "par besoin" (Lancer une entreprise,
Promouvoir une offre, Présenter des produits, Emballer un produit,
Équiper un point de vente, Organiser un événement, Déployer une campagne
nationale, Imprimer en urgence) plus 3 operational solutions (Production
en volume, Campagnes multi-sites, Impression urgente — distinct
CMS entities from their "par besoin" near-namesakes, per the brief).

## Sectors (brief section 11) — `sectors`, status `draft`

15 terms, draft, each seeded with the exact neutral positioning note the
brief mandates ("Printcom étudie les contraintes d'impression propres à
ce secteur.") — never a claim of sector expertise or a named client.

Retail et grande distribution · Agroalimentaire · Cosmétique et beauté ·
Pharmaceutique et santé · Hôtellerie et restauration · Immobilier et
construction · Automobile · Banque et assurance · Industrie · Éducation
et formation · Institutions publiques · Associations et ONG ·
Événementiel · Agences de communication · E-commerce.

## Technologies (brief section 12) — `technologies`, status `draft`, `verificationStatus: unverified`

8 terms: Impression offset, Impression numérique, Impression grand
format, Impression sur supports rigides, Sérigraphie, Flexographie,
Impression UV, Sublimation. **Hidden from the frontend** until an admin
sets both `status: published` and `verificationStatus: confirmed` — see
`docs/content-to-confirm.md`.

## Materials (brief section 13) — `materials`, status `draft`, grouped

Seeded `draft` — these describe generally-available substrate types, not
a confirmed Printcom inventory, so publication is a deliberate editorial
decision per document.

- **papier**: Couché mat, Couché brillant, Offset, Bristol, Kraft,
  Recyclé, Texturé, Autocollant, Papier synthétique
- **carton**: Carton compact, Carton ondulé, Microcannelure, Carton gris,
  Carton kraft
- **supports-souples**: Vinyle, Bâche, Toile, Textile, Film transparent
- **supports-rigides**: PVC Forex, Plexiglas, Dibond, Akilux, Carton
  plume, Bois, Métal

## Finishes (brief section 14) — `finishes`, status `draft`, grouped

- **pelliculage**: Mat, Brillant, Soft touch, Anti-rayures
- **vernis**: Vernis machine, Vernis UV, Vernis sélectif, Vernis sélectif
  3D
- **ennoblissement**: Dorure à chaud, Dorure argent, Gaufrage, Débossage,
  Marquage holographique
- **decoupe**: Coupe droite, Coins arrondis, Forme personnalisée,
  Découpe laser, Mi-chair
- **reliure**: Agrafage, Dos carré collé, Spirale, Couture, Wire-O,
  Couverture rigide

Finishes are relationship fields on `products`/`solutions`/quote
requests, never free-text tags, per the brief.

## Resources (brief section 16) — `resources`, status `review`/`draft`

10 practical guides with full editorial body text (file preparation,
bleed, resolution, RGB/CMYK, paper weight, offset vs digital, finishes,
cut files, proof validation, accepted file formats). 9 are `review`; the
guide about accepted file formats stays `draft` since it explicitly needs
Printcom's real format list before it can be reviewed for publication.

## FAQ (brief section 20) — `faqs`, status `review`

37 question/answer pairs covering quotes, files, colors, products,
quantities, lead times, proofs, packaging, labels, delivery, installation,
confidentiality and complaints.

## Legal documents — `legal-documents`, status `draft`

3 placeholders (Mentions légales, Politique de confidentialité, Politique
des cookies), each holding a `[À confirmer]` marker — legal content must
never be invented; it needs Printcom's legal counsel before publication.
