import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import config from '../../src/payload.config.js'

export const CONFIGURABLE_SLUG = 'e2e-produit-configurable'
export const BARE_SLUG = 'e2e-produit-sans-configuration'
export const VISUAL_SLUG = 'e2e-produit-visuel'
const FIXTURE_PRODUCT_SLUGS = [CONFIGURABLE_SLUG, BARE_SLUG, VISUAL_SLUG]
const FIXTURE_MATERIAL_SLUGS = ['e2e-papier-mat', 'e2e-papier-brillant', 'e2e-papier-image']
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
  await payload.delete({ collection: 'media', where: { filename: { like: 'e2e-visual-' } }, overrideAccess: true })
}

/** Flat-colour PNG generated on the fly — test data only, never seeded content. */
async function fixtureMedia(payload: Payload, name: string, alt: string, rgb: [number, number, number]) {
  const data = await sharp({ create: { width: 640, height: 480, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } })
    .png()
    .toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/png', name: `e2e-visual-${name}.png`, size: data.length },
    overrideAccess: true,
  })
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
      colorModes: ['cmyk', 'bw'],
      materials: materials.map((m) => m.id),
      grammages: [{ label: '350 g' }, { label: '400 g' }],
      finishes: finishes.map((f) => f.id),
      quantities: [{ label: '100 ex.' }, { label: '500 ex.' }, { label: 'Sur devis' }],
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

  // Product with image-backed options: thumbnail+preview, thumbnail only, text only.
  const [base, a4Thumb, a4Preview, a5Thumb, matThumb] = await Promise.all([
    fixtureMedia(payload, 'base', 'Produit de base e2e', [180, 180, 180]),
    fixtureMedia(payload, 'a4-thumb', 'Vignette A4', [200, 60, 60]),
    fixtureMedia(payload, 'a4-preview', 'Aperçu A4 e2e', [60, 200, 60]),
    fixtureMedia(payload, 'a5-thumb', 'Vignette A5', [60, 60, 200]),
    fixtureMedia(payload, 'mat-thumb', 'Texture papier', [220, 200, 120]),
  ])
  const imageMaterial = await payload.create({
    collection: 'materials',
    data: { title: 'E2E Papier image', slug: 'e2e-papier-image', group: 'papier', status: 'published', image: matThumb.id },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'products',
    data: {
      title: 'E2E Produit visuel',
      slug: VISUAL_SLUG,
      shortDescription: 'Un produit de test avec des options visuelles.',
      primaryCategory: category.id,
      status: 'published',
      primaryImage: base.id,
      availableFormats: [
        { label: 'A4', description: '210 × 297 mm', image: a4Thumb.id, previewImage: a4Preview.id },
        { label: 'A5', image: a5Thumb.id },
        { label: 'A6' },
      ],
      materials: [imageMaterial.id],
      quantities: [{ label: '100' }, { label: '500' }],
    },
    overrideAccess: true,
  })
}

/** Reads back a submitted lead (depth 0) so e2e can assert what was really persisted. */
export async function findQuoteByReference(reference: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'quote-requests',
    where: { reference: { equals: reference } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0]
}

export async function removeQuotesByReference(references: string[]): Promise<void> {
  if (!references.length) return
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'quote-requests', where: { reference: { in: references } }, overrideAccess: true })
}

/** Id of a fixture material/finish, to compare against persisted relationships. */
export async function fixtureDocId(collection: 'materials' | 'finishes', slug: string): Promise<number> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
  return result.docs[0].id
}
