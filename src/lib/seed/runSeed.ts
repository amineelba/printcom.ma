/**
 * Idempotent seed logic. Safe to run repeatedly: every document is
 * upserted by slug — created if missing, updated in place if it already
 * exists — so re-running `pnpm seed` after an editorial content update
 * keeps the database in sync with the source data below instead of
 * silently ignoring it.
 *
 * Content is sourced from the Printcom master content brief
 * (`src/lib/seed/content/*`) and seeded at the CMS status the brief's
 * publication rules (section 33) specify — draft/review for anything not
 * yet confirmed by Printcom, published for structural taxonomy and for
 * content Printcom has confirmed (currently: solutions), since neither
 * carries an unverified business claim. Nothing here is ever presented as
 * a confirmed offer: products stay `quoteOnly`, technologies stay
 * `verificationStatus: unverified`, and no "Réalisations"/portfolio
 * content is ever created.
 *
 * Split from src/scripts/seed.ts so it can be exercised directly in
 * integration tests (the CLI entrypoint calls process.exit, which a test
 * runner must never do).
 */
import type { Payload } from 'payload'
import { PRODUCT_CATEGORIES } from './content/productCategories'
import { PRODUCTS } from './content/products'
import { SERVICES } from './content/services'
import { SOLUTIONS } from './content/solutions'
import { SECTORS } from './content/sectors'
import { TECHNOLOGIES } from './content/technologies'
import { MATERIALS } from './content/materials'
import { FINISHES } from './content/finishes'
import { RESOURCES } from './content/resources'
import { FAQS } from './content/faqs'

type Slugged = { slug: string; [key: string]: unknown }

/** Create-or-update by slug. Never duplicates; keeps content in sync on re-run. */
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
      await payload.update({
        collection: collection as never,
        id: existingDoc.id,
        data: item as never,
        overrideAccess: true,
      })
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

const LEGAL_DOCUMENTS = [
  { slug: 'mentions-legales', title: 'Mentions légales' },
  { slug: 'politique-de-confidentialite', title: 'Politique de confidentialité' },
  { slug: 'politique-des-cookies', title: 'Politique des cookies' },
]

export async function runSeed(payload: Payload): Promise<void> {
  payload.logger.info('Starting Printcom seed…')

  // -----------------------------------------------------------------
  // Product categories — 8 top-level families (brief section 7)
  // -----------------------------------------------------------------
  const categoryIds = await upsertBySlug(
    payload,
    'product-categories',
    PRODUCT_CATEGORIES.map((category) => ({
      slug: category.slug,
      title: category.title,
      shortDescription: category.shortDescription,
      order: category.order,
      status: 'published',
      seo: category.seo,
    })),
  )
  payload.logger.info(`Seeded ${PRODUCT_CATEGORIES.length} product categories (published).`)

  // -----------------------------------------------------------------
  // Products — full catalogue, 79 items (brief sections 7-8)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'products',
    PRODUCTS.map((product) => ({
      slug: product.slug,
      title: product.title,
      primaryCategory: categoryIds[product.category],
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      filePreparationInstructions: product.filePreparationInstructions,
      seo: product.seo,
      status: product.status,
      quoteOnly: product.quoteOnly,
      indicativePriceEnabled: product.indicativePriceEnabled,
    })),
  )
  payload.logger.info(`Seeded ${PRODUCTS.length} products (draft — quote-only, no confirmed pricing).`)

  // -----------------------------------------------------------------
  // Services and sub-services (brief section 9)
  // -----------------------------------------------------------------
  const serviceIds: Record<string, number> = {}
  for (const service of SERVICES) {
    const [id] = Object.values(
      await upsertBySlug(payload, 'services', [
        {
          slug: service.slug,
          title: service.title,
          parent: service.parent ? serviceIds[service.parent] : undefined,
          order: service.order,
          shortDescription: service.shortDescription,
          description: service.description,
          steps: service.steps,
          seo: service.seo,
          status: service.status,
        },
      ]),
    )
    serviceIds[service.slug] = id
  }
  payload.logger.info(`Seeded ${SERVICES.length} services and sub-services (draft).`)

  // -----------------------------------------------------------------
  // Solutions — par besoin + opérationnelles (brief sections 10 and 37)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'solutions',
    SOLUTIONS.map((solution) => ({
      slug: solution.slug,
      title: solution.title,
      shortDescription: solution.shortDescription,
      problem: solution.problem,
      desiredOutcome: solution.desiredOutcome,
      process: solution.process,
      quoteCTA: solution.quoteCTA,
      seo: solution.seo,
      status: solution.status,
    })),
  )
  payload.logger.info(`Seeded ${SOLUTIONS.length} solutions (published).`)

  // -----------------------------------------------------------------
  // Sectors — solutions par secteur (brief section 11)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'sectors',
    SECTORS.map((sector) => ({
      slug: sector.slug,
      title: sector.title,
      shortDescription: sector.shortDescription,
      challenges: sector.challenges,
      printingNeeds: sector.printingNeeds,
      constraints: sector.constraints,
      seo: sector.seo,
      status: sector.status,
    })),
  )
  payload.logger.info(`Seeded ${SECTORS.length} sectors (draft).`)

  // -----------------------------------------------------------------
  // Technologies (brief section 12) — unverified until business-confirmed
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'technologies',
    TECHNOLOGIES.map((technology) => ({
      slug: technology.slug,
      title: technology.title,
      shortDescription: technology.shortDescription,
      description: technology.description,
      seo: technology.seo,
      status: technology.status,
      verificationStatus: technology.verificationStatus,
    })),
  )
  payload.logger.info(`Seeded ${TECHNOLOGIES.length} technologies (draft, unverified).`)

  // -----------------------------------------------------------------
  // Materials and finishes (brief sections 13-14)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'materials',
    MATERIALS.map((material) => ({
      slug: material.slug,
      title: material.title,
      group: material.group,
      shortDescription: material.shortDescription,
      seo: material.seo,
      status: material.status,
    })),
  )
  payload.logger.info(`Seeded ${MATERIALS.length} materials (draft).`)

  await upsertBySlug(
    payload,
    'finishes',
    FINISHES.map((finish) => ({
      slug: finish.slug,
      title: finish.title,
      group: finish.group,
      shortDescription: finish.shortDescription,
      seo: finish.seo,
      status: finish.status,
    })),
  )
  payload.logger.info(`Seeded ${FINISHES.length} finishes (draft).`)

  // -----------------------------------------------------------------
  // Resources — practical guides (brief section 16)
  // -----------------------------------------------------------------
  await upsertBySlug(
    payload,
    'resources',
    RESOURCES.map((resource) => ({
      slug: resource.slug,
      title: resource.title,
      category: resource.category,
      introduction: resource.introduction,
      body: resource.body,
      seo: resource.seo,
      status: resource.status,
    })),
  )
  payload.logger.info(`Seeded ${RESOURCES.length} resources (review).`)

  // -----------------------------------------------------------------
  // FAQs (brief section 20)
  // -----------------------------------------------------------------
  for (const faq of FAQS) {
    const existing = await payload.find({
      collection: 'faqs',
      where: { question: { equals: faq.question } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const existingDoc = existing.docs[0] as { id: number } | undefined
    const data = {
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      status: faq.status,
    }
    if (existingDoc) {
      await payload.update({ collection: 'faqs', id: existingDoc.id, data, overrideAccess: true })
    } else {
      await payload.create({ collection: 'faqs', data, overrideAccess: true })
    }
  }
  payload.logger.info(`Seeded ${FAQS.length} FAQ entries (review).`)

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
            links: PRODUCT_CATEGORIES.slice(0, 6).map((category) => ({
              label: category.title,
              href: `/produits/${category.slug}`,
            })),
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
    const topCategoryIds = PRODUCT_CATEGORIES.slice(0, 6).map((category) => categoryIds[category.slug])
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
