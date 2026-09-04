/**
 * Product Collections — transversal merchandising groupings (brief §5,
 * "Collection Board"). Structural/organizational content, not a factual
 * claim (same reasoning productCategories.ts uses to justify publishing
 * immediately) — so these seed as `active`, not `draft`, and members are a
 * curated re-organization of real, already-seeded catalogue products.
 * Membership is expressed as product slugs (see products.ts/
 * goodiesProducts.ts) and resolved to relationship IDs in runSeed.ts.
 */

export interface ProductCollectionSeed {
  key: string
  title: string
  order: number
  /** Product slugs to tag into this collection's `collections[]` field. */
  productSlugs: string[]
}

export const PRODUCT_COLLECTIONS: ProductCollectionSeed[] = [
  {
    key: 'ramadan',
    title: 'Ramadan',
    order: 1,
    productSlugs: ['coffrets-personnalises', 'cadeaux-affaires', 'boites-alimentaires', 'sacs-en-papier', 'etiquettes-alimentaires'],
  },
  {
    key: 'yennayer',
    title: 'Yennayer',
    order: 2,
    productSlugs: ['calendriers', 'agendas', 'cadeaux-affaires', 'coffrets-personnalises', 'cartes-promotionnelles'],
  },
  {
    key: 'nouvel-an',
    title: 'Nouvel An',
    order: 3,
    productSlugs: ['calendriers', 'agendas', 'cartes-promotionnelles', 'coffrets-personnalises'],
  },
  {
    key: 'eid-al-adha',
    title: 'Eid al-Adha',
    order: 4,
    productSlugs: ['coffrets-personnalises', 'cadeaux-affaires', 'sacs-personnalises', 'boites-alimentaires', 'etiquettes-alimentaires'],
  },
  {
    key: 'coupe-du-monde-2030',
    title: 'Coupe du Monde 2030',
    order: 5,
    productSlugs: [
      'casquettes',
      'textile-personnalise',
      'tours-de-cou-badges',
      'banderoles',
      'vinyles-adhesifs',
      'habillage-de-vehicules',
      'tote-bags',
    ],
  },
  {
    key: 'evenementiel',
    title: 'Événementiel',
    order: 6,
    productSlugs: ['roll-ups', 'kakemonos', 'totems', 'banderoles', 'baches', 'affiches', 'chevalets', 'panneaux-publicitaires'],
  },
]
