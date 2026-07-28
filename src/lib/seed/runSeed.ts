/**
 * Idempotent seed logic. Safe to run repeatedly: every document is
 * upserted by slug (or by another natural unique key), never duplicated.
 *
 * Seeds the full taxonomy described in the brief (sections 12-18) as
 * structure — categories, services, solutions, sectors, technologies,
 * materials, finishes — plus navigation and site settings. Everything
 * that is not a confirmed Printcom fact is seeded in `draft` status (or
 * `verificationStatus: unverified` for technologies) so nothing unverified
 * can reach the public frontend. Demo products are draft and clearly
 * scoped as such — never presented as confirmed offers.
 *
 * Split from src/scripts/seed.ts so it can be exercised directly in
 * integration tests (the CLI entrypoint calls process.exit, which a test
 * runner must never do).
 */
import type { Payload } from 'payload'

type Slugged = { slug: string; [key: string]: unknown }

async function upsertBySlug<T extends Slugged>(
  payload: Payload,
  collection: string,
  items: T[],
): Promise<Record<string, number>> {
  const idBySlug: Record<string, number> = {}

  for (const item of items) {
    const existing = await payload.find({
      collection: collection as never,
      where: { slug: { equals: item.slug } },
      limit: 1,
      depth: 0,
    })

    const existingDoc = existing.docs[0] as { id: number } | undefined
    if (existingDoc) {
      idBySlug[item.slug] = existingDoc.id
      continue
    }

    const created = (await payload.create({
      collection: collection as never,
      data: item as never,
      overrideAccess: true,
    })) as { id: number }
    idBySlug[item.slug] = created.id
  }

  return idBySlug
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------
// Taxonomy source data (section 12)
// ---------------------------------------------------------------------
const PRODUCT_TAXONOMY: Record<string, string[]> = {
  'Papeterie d’entreprise': [
    'Cartes de visite',
    'Papier à en-tête',
    'Enveloppes',
    'Chemises à rabats',
    'Blocs-notes',
    'Carnets personnalisés',
    'Factures et bons',
    'Formulaires autocopiants',
    'Calendriers',
    'Agendas',
  ],
  'Supports marketing': [
    'Flyers',
    'Dépliants',
    'Plaquettes commerciales',
    'Brochures',
    'Catalogues',
    'Fiches produits',
    'Prospectus',
    'Coupons',
    'Cartes promotionnelles',
    'Mailings imprimés',
  ],
  'Édition et documents': [
    'Livres',
    'Magazines',
    'Rapports annuels',
    'Rapports institutionnels',
    'Manuels',
    'Guides',
    'Livrets',
    'Journaux',
    'Thèses et mémoires',
    'Documents de formation',
  ],
  Packaging: [
    'Boîtes pliantes',
    'Étuis produits',
    'Boîtes alimentaires',
    'Boîtes cosmétiques',
    'Boîtes pharmaceutiques',
    'Fourreaux',
    'Pochettes',
    'Sacs en papier',
    'Papier d’emballage',
    'Packaging sur mesure',
  ],
  'Étiquettes et stickers': [
    'Étiquettes produits',
    'Étiquettes alimentaires',
    'Étiquettes cosmétiques',
    'Étiquettes pharmaceutiques',
    'Étiquettes en rouleau',
    'Étiquettes en planche',
    'Stickers personnalisés',
    'Stickers vitrine',
    'Étiquettes transparentes',
    'Étiquettes de sécurité',
  ],
  'PLV et supports de vente': [
    'Présentoirs de comptoir',
    'Présentoirs de sol',
    'Stop-rayons',
    'Frontons',
    'Totems',
    'Chevalets',
    'Kakémonos',
    'Roll-ups',
    'Displays',
    'Habillage de linéaires',
  ],
  'Affichage et grand format': [
    'Affiches',
    'Posters',
    'Bâches',
    'Banderoles',
    'Panneaux publicitaires',
    'Vinyles adhésifs',
    'Habillage de vitrines',
    'Habillage mural',
    'Habillage de véhicules',
    'Impression événementielle',
  ],
  Signalétique: [
    'Enseignes',
    'Plaques professionnelles',
    'Signalétique intérieure',
    'Signalétique extérieure',
    'Signalétique directionnelle',
    'Signalétique de sécurité',
    'Panneaux de chantier',
    'Marquage au sol',
    'Signalétique sur mesure',
  ],
}

const SERVICE_TAXONOMY: Record<string, string[]> = {
  'Conseil et accompagnement': [
    'Analyse du besoin',
    'Conseil sur les supports',
    'Optimisation des configurations',
    'Planification de production',
  ],
  'Studio graphique': [
    'Création graphique',
    'Mise en page',
    'Adaptation de formats',
    'Exécution graphique',
    'Déclinaison de campagnes',
  ],
  Prépresse: [
    'Vérification des fichiers',
    'Contrôle colorimétrique',
    'Imposition',
    'Épreuvage',
    'Bon à tirer',
    'Préparation de production',
  ],
  Production: [
    'Impression offset',
    'Impression numérique',
    'Impression grand format',
    'Impression sur supports rigides',
    'Sérigraphie',
    "Impression d'étiquettes",
  ],
  Façonnage: ['Découpe', 'Pliage', 'Rainage', 'Perforation', 'Assemblage', 'Collage', 'Reliure', 'Conditionnement'],
  'Livraison et déploiement': [
    'Livraison nationale',
    'Livraison multi-sites',
    'Gestion des stocks',
    'Préparation par point de vente',
    'Installation de signalétique',
    'Déploiement de campagnes',
  ],
}

const SOLUTIONS_BY_NEED = [
  'Lancer une entreprise',
  'Promouvoir une offre',
  'Présenter des produits',
  'Emballer un produit',
  'Équiper un point de vente',
  'Organiser un événement',
  'Déployer une campagne nationale',
  'Imprimer en urgence',
]

const SECTORS = [
  'Retail et grande distribution',
  'Agroalimentaire',
  'Cosmétique et beauté',
  'Pharmaceutique et santé',
  'Hôtellerie et restauration',
  'Immobilier et construction',
  'Automobile',
  'Banque et assurance',
  'Industrie',
  'Éducation et formation',
  'Institutions publiques',
  'Associations et ONG',
  'Événementiel',
  'Agences de communication',
  'E-commerce',
]

const TECHNOLOGIES = [
  'Impression offset',
  'Impression numérique',
  'Impression grand format',
  'Impression sur supports rigides',
  'Sérigraphie',
  'Flexographie',
  'Impression UV',
  'Sublimation',
]

const MATERIALS: Record<string, string[]> = {
  papier: ['Couché mat', 'Couché brillant', 'Offset', 'Bristol', 'Kraft', 'Recyclé', 'Texturé', 'Autocollant', 'Papier synthétique'],
  carton: ['Carton compact', 'Carton ondulé', 'Microcannelure', 'Carton gris', 'Carton kraft'],
  'supports-souples': ['Vinyle', 'Bâche', 'Toile', 'Textile', 'Film transparent'],
  'supports-rigides': ['PVC Forex', 'Plexiglas', 'Dibond', 'Akilux', 'Carton plume', 'Bois', 'Métal'],
}

const FINISHES: Record<string, string[]> = {
  pelliculage: ['Mat', 'Brillant', 'Soft touch', 'Anti-rayures'],
  vernis: ['Vernis machine', 'Vernis UV', 'Vernis sélectif', 'Vernis sélectif 3D'],
  ennoblissement: ['Dorure à chaud', 'Dorure argent', 'Gaufrage', 'Débossage', 'Marquage holographique'],
  decoupe: ['Coupe droite', 'Coins arrondis', 'Forme personnalisée', 'Découpe laser', 'Mi-chair'],
  reliure: ['Agrafage', 'Dos carré collé', 'Spirale', 'Couture', 'Wire-O', 'Couverture rigide'],
}

const DEMO_PRODUCTS = [
  { title: 'Carte de visite', category: 'Papeterie d’entreprise' },
  { title: 'Flyer', category: 'Supports marketing' },
  { title: 'Dépliant', category: 'Supports marketing' },
  { title: 'Brochure', category: 'Supports marketing' },
  { title: 'Catalogue', category: 'Supports marketing' },
  { title: 'Chemise à rabats', category: 'Papeterie d’entreprise' },
  { title: 'Boîte pliante', category: 'Packaging' },
  { title: 'Étiquette produit', category: 'Étiquettes et stickers' },
  { title: 'Roll-up', category: 'PLV et supports de vente' },
  { title: 'Panneau signalétique', category: 'Signalétique' },
]

const LEGAL_DOCUMENTS = [
  { slug: 'mentions-legales', title: 'Mentions légales' },
  { slug: 'politique-de-confidentialite', title: 'Politique de confidentialité' },
  { slug: 'politique-des-cookies', title: 'Politique des cookies' },
]

export async function runSeed(payload: Payload): Promise<void> {
  payload.logger.info('Starting Printcom seed…')

  // -----------------------------------------------------------------
  // Product categories (two levels)
  // -----------------------------------------------------------------
  const categoryIds: Record<string, number> = {}
  for (const [family, children] of Object.entries(PRODUCT_TAXONOMY)) {
    const familySlug = slugify(family)
    const [familyId] = Object.values(
      await upsertBySlug(payload, 'product-categories', [
        { slug: familySlug, title: family, status: 'published' },
      ]),
    )
    categoryIds[family] = familyId

    await upsertBySlug(
      payload,
      'product-categories',
      children.map((child) => ({
        slug: `${familySlug}-${slugify(child)}`,
        title: child,
        parent: familyId,
        status: 'published',
      })),
    )
  }
  payload.logger.info(`Seeded ${Object.keys(PRODUCT_TAXONOMY).length} product category families.`)

  // -----------------------------------------------------------------
  // Services (draft — publish only confirmed offers, section 13)
  // -----------------------------------------------------------------
  for (const [family, children] of Object.entries(SERVICE_TAXONOMY)) {
    const familySlug = slugify(family)
    const [familyId] = Object.values(
      await upsertBySlug(payload, 'services', [{ slug: familySlug, title: family, status: 'draft' }]),
    )

    await upsertBySlug(
      payload,
      'services',
      children.map((child) => ({
        slug: `${familySlug}-${slugify(child)}`,
        title: child,
        parent: familyId,
        status: 'draft',
      })),
    )
  }
  payload.logger.info(`Seeded ${Object.keys(SERVICE_TAXONOMY).length} service families (draft).`)

  // -----------------------------------------------------------------
  // Solutions par besoin
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'solutions',
    SOLUTIONS_BY_NEED.map((title) => ({
      slug: slugify(title),
      title,
      status: 'draft',
      quoteCTA: 'Demander un devis',
    })),
  )
  payload.logger.info(`Seeded ${SOLUTIONS_BY_NEED.length} solutions par besoin (draft).`)

  // -----------------------------------------------------------------
  // Sectors (draft — no client claims without proof, section 15)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'sectors',
    SECTORS.map((title) => ({
      slug: slugify(title),
      title,
      status: 'draft',
      neutralPositioningNote: 'Printcom étudie les contraintes d’impression propres à ce secteur.',
    })),
  )
  payload.logger.info(`Seeded ${SECTORS.length} sectors (draft).`)

  // -----------------------------------------------------------------
  // Technologies (unverified until business-confirmed, section 16)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'technologies',
    TECHNOLOGIES.map((title) => ({
      slug: slugify(title),
      title,
      status: 'draft',
      verificationStatus: 'unverified',
    })),
  )
  payload.logger.info(`Seeded ${TECHNOLOGIES.length} technologies (unverified).`)

  // -----------------------------------------------------------------
  // Materials and finishes
  // -----------------------------------------------------------------
  for (const [group, items] of Object.entries(MATERIALS)) {
    await upsertBySlug(
      payload,
      'materials',
      items.map((title) => ({ slug: slugify(title), title, group, status: 'published' })),
    )
  }
  payload.logger.info(`Seeded materials across ${Object.keys(MATERIALS).length} groups.`)

  for (const [group, items] of Object.entries(FINISHES)) {
    await upsertBySlug(
      payload,
      'finishes',
      items.map((title) => ({ slug: slugify(title), title, group, status: 'published' })),
    )
  }
  payload.logger.info(`Seeded finishes across ${Object.keys(FINISHES).length} groups.`)

  // -----------------------------------------------------------------
  // Demo products (draft — never presented as confirmed offers)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'products',
    DEMO_PRODUCTS.map((product) => ({
      slug: slugify(product.title),
      title: product.title,
      shortDescription: `${product.title} — fiche de démonstration en cours de qualification.`,
      primaryCategory: categoryIds[product.category],
      status: 'draft',
      quoteOnly: true,
      indicativePriceEnabled: false,
    })),
  )
  payload.logger.info(`Seeded ${DEMO_PRODUCTS.length} demo products (draft).`)

  // -----------------------------------------------------------------
  // Legal documents (draft placeholders — content must be reviewed by
  // Printcom/legal counsel before publishing)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'legal-documents',
    LEGAL_DOCUMENTS.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      status: 'draft',
      body: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: '[À confirmer] Contenu à rédiger avec l’équipe juridique de Printcom.' }],
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
    })),
  )
  payload.logger.info('Seeded legal document placeholders (draft).')

  // -----------------------------------------------------------------
  // Navigation and site globals
  // -----------------------------------------------------------------
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  if (!header.menus || header.menus.length === 0) {
    await payload.updateGlobal({
      slug: 'header',
      data: {
        menus: [
          { label: 'Produits', href: '/produits' },
          { label: 'Solutions', href: '/solutions/par-besoin' },
          { label: 'Services', href: '/services' },
          { label: 'Ressources', href: '/ressources' },
          {
            label: 'Printcom',
            columns: [
              {
                heading: 'Printcom',
                links: [
                  { label: 'À propos', href: '/a-propos' },
                  { label: 'Notre savoir-faire', href: '/notre-savoir-faire' },
                  { label: 'Qualité et engagements', href: '/qualite-et-engagements' },
                  { label: 'Contact', href: '/contact' },
                ],
              },
            ],
          },
        ],
        quoteCTA: { label: 'Demander un devis', href: '/demande-de-devis' },
      },
    })
    payload.logger.info('Seeded header navigation.')
  }

  const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
  if (!footer.columns || footer.columns.length === 0) {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        columns: [
          {
            heading: 'Produits',
            links: Object.keys(PRODUCT_TAXONOMY)
              .slice(0, 6)
              .map((family) => ({ label: family, href: `/produits?categorie=${slugify(family)}` })),
          },
          {
            heading: 'Printcom',
            links: [
              { label: 'À propos', href: '/a-propos' },
              { label: 'Notre savoir-faire', href: '/notre-savoir-faire' },
              { label: 'Contact', href: '/contact' },
              { label: 'Plan du site', href: '/sitemap' },
            ],
          },
        ],
        legalLinks: [
          { label: 'Mentions légales', href: '/mentions-legales' },
          { label: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
          { label: 'Politique des cookies', href: '/politique-des-cookies' },
        ],
        copyrightNotice: `© ${new Date().getFullYear()} Printcom. Tous droits réservés.`,
      },
    })
    payload.logger.info('Seeded footer navigation.')
  }

  const seoDefaults = await payload.findGlobal({ slug: 'seo-defaults', depth: 0 })
  if (!seoDefaults.defaultMetaDescription) {
    await payload.updateGlobal({
      slug: 'seo-defaults',
      data: {
        defaultMetaTitle: 'Printcom — Impression commerciale B2B au Maroc',
        defaultMetaDescription:
          'Printcom accompagne les entreprises dans la préparation, la production et le déploiement de leurs supports imprimés.',
        titleTemplate: '%s — Printcom',
        robotsIndexingEnabled: true,
        organizationJsonLd: true,
      },
    })
    payload.logger.info('Seeded SEO defaults.')
  }

  const homepage = await payload.findGlobal({ slug: 'homepage', depth: 0 })
  if (!homepage.featuredCategories || homepage.featuredCategories.length === 0) {
    const topCategoryIds = Object.values(categoryIds).slice(0, 6)
    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        featuredCategories: topCategoryIds,
      },
    })
    payload.logger.info('Seeded homepage featured categories.')
  }

  payload.logger.info('Printcom seed complete.')
}
