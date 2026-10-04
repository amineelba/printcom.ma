import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const CONFIGURABLE_SLUG = 'e2e-produit-configurable'
export const BARE_SLUG = 'e2e-produit-sans-configuration'
const FIXTURE_PRODUCT_SLUGS = [CONFIGURABLE_SLUG, BARE_SLUG]
const FIXTURE_MATERIAL_SLUGS = ['e2e-papier-mat', 'e2e-papier-brillant']
const FIXTURE_FINISH_SLUGS = ['e2e-vernis-a', 'e2e-vernis-b']

/**
 * The seed publishes no products and gives none of them configuration data,
 * so e2e needs its own published fixtures. Created through the Local API and
 * removed again afterwards; nothing here touches seeded documents.
 */
export async function removeConfiguratorFixtures(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'products', where: { slug: { in: FIXTURE_PRODUCT_SLUGS } }, overrideAccess: true })
  await payload.delete({ collection: 'materials', where: { slug: { in: FIXTURE_MATERIAL_SLUGS } }, overrideAccess: true })
  await payload.delete({ collection: 'finishes', where: { slug: { in: FIXTURE_FINISH_SLUGS } }, overrideAccess: true })
}

export async function createConfiguratorFixtures(): Promise<void> {
  const payload = await getPayload({ config })
  await removeConfiguratorFixtures()

  const categories = await payload.find({
    collection: 'product-categories',
    where: { slug: { equals: 'packaging' } },
    limit: 1,
    overrideAccess: true,
  })
  const category = categories.docs[0]
  if (!category) throw new Error('Seed missing: "packaging" category (run pnpm seed)')

  const materials = await Promise.all(
    [
      { title: 'E2E Papier mat', slug: 'e2e-papier-mat', shortDescription: 'Surface lisse.' },
      { title: 'E2E Papier brillant', slug: 'e2e-papier-brillant' },
    ].map((data) =>
      payload.create({ collection: 'materials', data: { ...data, group: 'papier', status: 'published' }, overrideAccess: true }),
    ),
  )
  const finishes = await Promise.all(
    [
      { title: 'E2E Vernis A', slug: 'e2e-vernis-a' },
      { title: 'E2E Vernis B', slug: 'e2e-vernis-b' },
    ].map((data) =>
      payload.create({ collection: 'finishes', data: { ...data, group: 'vernis', status: 'published' }, overrideAccess: true }),
    ),
  )

  await payload.create({
    collection: 'products',
    data: {
      title: 'E2E Produit configurable',
      slug: CONFIGURABLE_SLUG,
      shortDescription: 'Un produit de test configurable.',
      primaryCategory: category.id,
      status: 'published',
      availableFormats: [{ label: 'A4' }, { label: 'A5' }],
      customFormatAvailable: true,
      orientations: ['portrait', 'landscape'],
      printSides: ['single', 'double'],
      materials: materials.map((m) => m.id),
      finishes: finishes.map((f) => f.id),
      quantities: [{ label: '100' }, { label: '500' }],
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'products',
    data: {
      title: 'E2E Produit sans configuration',
      slug: BARE_SLUG,
      shortDescription: 'Un produit de test sans options.',
      primaryCategory: category.id,
      status: 'published',
    },
    overrideAccess: true,
  })
}
