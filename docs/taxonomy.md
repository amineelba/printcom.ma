# Taxonomy

Full taxonomy trees as defined in the brief and seeded by
`src/lib/seed/runSeed.ts` (idempotent — re-running `pnpm seed` upserts by
slug, never duplicates). Source of truth for the literal labels is the
brief itself; this file documents where each tree lives and its
publication status.

## Product categories (§12) — `product-categories`, status `published`

Two levels: 8 families, each with 9-10 sub-categories (87 terms total).
Published immediately since categories are structural, not factual
claims.

Papeterie d'entreprise · Supports marketing · Édition et documents ·
Packaging · Étiquettes et stickers · PLV et supports de vente · Affichage
et grand format · Signalétique.

See `src/lib/seed/runSeed.ts` (`PRODUCT_TAXONOMY`) for the full sub-term
lists.

## Services (§13) — `services`, status `draft`

6 families, each with 4-6 sub-services (32 terms total). Seeded **draft**
— per the brief, only confirmed service offerings should ever be
published. An editor must deliberately promote each one after
confirming Printcom actually offers it.

Conseil et accompagnement · Studio graphique · Prépresse · Production ·
Façonnage · Livraison et déploiement.

## Solutions par besoin (§14) — `solutions`, status `draft`

8 terms, draft: Lancer une entreprise, Promouvoir une offre, Présenter
des produits, Emballer un produit, Équiper un point de vente, Organiser
un événement, Déployer une campagne nationale, Imprimer en urgence.

## Solutions par secteur (§15) — `sectors`, status `draft`

15 terms, draft, each seeded with the exact neutral positioning note the
brief mandates ("Printcom étudie les contraintes d'impression propres à
ce secteur.") — never a claim of sector expertise or a named client.

Retail et grande distribution · Agroalimentaire · Cosmétique et beauté ·
Pharmaceutique et santé · Hôtellerie et restauration · Immobilier et
construction · Automobile · Banque et assurance · Industrie · Éducation
et formation · Institutions publiques · Associations et ONG ·
Événementiel · Agences de communication · E-commerce.

## Technologies (§16) — `technologies`, status `draft`, `verificationStatus: unverified`

8 terms: Impression offset, Impression numérique, Impression grand
format, Impression sur supports rigides, Sérigraphie, Flexographie,
Impression UV, Sublimation. **Hidden from the frontend** until an admin
sets both `status: published` and `verificationStatus: confirmed` — see
`docs/content-to-confirm.md`.

## Materials (§17) — `materials`, status `published`, grouped

Published immediately (these are catalogue facts about paper/board/
substrate types generally available in the printing industry, not claims
specific to Printcom's capability).

- **papier**: Couché mat, Couché brillant, Offset, Bristol, Kraft,
  Recyclé, Texturé, Autocollant, Papier synthétique
- **carton**: Carton compact, Carton ondulé, Microcannelure, Carton gris,
  Carton kraft
- **supports-souples**: Vinyle, Bâche, Toile, Textile, Film transparent
- **supports-rigides**: PVC Forex, Plexiglas, Dibond, Akilux, Carton
  plume, Bois, Métal

## Finishes (§18) — `finishes`, status `published`, grouped

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

## Demo products (§32) — `products`, status `draft`

10 demonstration entries (Carte de visite, Flyer, Dépliant, Brochure,
Catalogue, Chemise à rabats, Boîte pliante, Étiquette produit, Roll-up,
Panneau signalétique), each linked to its real category, each explicitly
described as a demonstration fiche "en cours de qualification" — never
presented as a confirmed, orderable offer.
