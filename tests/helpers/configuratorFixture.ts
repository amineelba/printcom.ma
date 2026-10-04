import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import config from '../../src/payload.config.js'

export const CONFIGURABLE_SLUG = 'e2e-produit-configurable'
export const BARE_SLUG = 'e2e-produit-sans-configuration'
export const VISUAL_SLUG = 'e2e-produit-visuel'
/** Sprint 5: three structurally different products defined only by their own configurationSchema. */
export const SCHEMA_CARD_SLUG = 'e2e-schema-carte'
export const SCHEMA_DOC_SLUG = 'e2e-schema-document'
export const SCHEMA_LABEL_SLUG = 'e2e-schema-etiquette'
const FIXTURE_PRODUCT_SLUGS = [CONFIGURABLE_SLUG, BARE_SLUG, VISUAL_SLUG, SCHEMA_CARD_SLUG, SCHEMA_DOC_SLUG, SCHEMA_LABEL_SLUG]
const FIXTURE_NOTE = 'e2e-fixture'
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
  await payload.delete({ collection: 'configurator-options', where: { notes: { equals: FIXTURE_NOTE } }, overrideAccess: true })
  await payload.delete({ collection: 'configurator-dimensions', where: { notes: { equals: FIXTURE_NOTE } }, overrideAccess: true })
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

  await createSchemaFixtures(payload, category.id)
}

type DimensionSpec = {
  key: string
  label: string
  valueType?: 'single-choice' | 'multi-choice' | 'dimensions' | 'number' | 'text' | 'boolean'
  optionSource?: 'catalog' | 'materials' | 'finishes' | 'enum' | 'custom'
  unit?: string
}

/**
 * Sprint 5 fixtures: three products with *different* dimension sets, none of
 * them using the legacy generic fields. Core dimensions are reused when the
 * database already has them (and left alone afterwards); everything else is
 * tagged and removed by removeConfiguratorFixtures.
 */
async function createSchemaFixtures(payload: Payload, categoryId: number) {
  const dimension = async (spec: DimensionSpec) => {
    const existing = await payload.find({ collection: 'configurator-dimensions', where: { key: { equals: spec.key } }, limit: 1, depth: 0, overrideAccess: true })
    if (existing.docs[0]) return existing.docs[0]
    return payload.create({
      collection: 'configurator-dimensions',
      data: {
        key: spec.key,
        label: spec.label,
        group: 'other',
        valueType: spec.valueType ?? 'single-choice',
        optionSource: spec.optionSource ?? 'catalog',
        unit: spec.unit,
        status: 'published',
        notes: FIXTURE_NOTE,
      },
      overrideAccess: true,
    })
  }
  const option = async (dimensionId: number, label: string) => {
    const existing = await payload.find({
      collection: 'configurator-options',
      where: { and: [{ dimension: { equals: dimensionId } }, { machineValue: { equals: label } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) return existing.docs[0]
    return payload.create({
      collection: 'configurator-options',
      data: { dimension: dimensionId, label, machineValue: label, verificationStatus: 'confirmed', status: 'published', notes: FIXTURE_NOTE },
      overrideAccess: true,
    })
  }
  const material = async (slug: string) =>
    (await payload.find({ collection: 'materials', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })).docs[0].id
  const finish = async (slug: string) =>
    (await payload.find({ collection: 'finishes', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })).docs[0].id

  const d = {
    format: await dimension({ key: 'format', label: 'Format' }),
    orientation: await dimension({ key: 'orientation', label: 'Orientation', optionSource: 'enum' }),
    material: await dimension({ key: 'material', label: 'Support', optionSource: 'materials' }),
    grammage: await dimension({ key: 'grammage', label: 'Grammage' }),
    finish: await dimension({ key: 'finish', label: 'Finition', optionSource: 'finishes', valueType: 'multi-choice' }),
    pageCount: await dimension({ key: 'page-count', label: 'Nombre de pages' }),
    cover: await dimension({ key: 'e2e-couverture', label: 'Couverture' }),
    binding: await dimension({ key: 'e2e-reliure', label: 'Reliure' }),
    dimensions: await dimension({ key: 'dimensions', label: 'Dimensions', valueType: 'dimensions', optionSource: 'custom' }),
    adhesive: await dimension({ key: 'e2e-adhesif', label: 'Adhésif' }),
    perSheet: await dimension({ key: 'e2e-par-planche', label: 'Quantité par planche', valueType: 'number', optionSource: 'custom', unit: 'étiquettes' }),
    elastic: await dimension({ key: 'e2e-elastique', label: 'Élastique', valueType: 'boolean', optionSource: 'custom' }),
    window: await dimension({ key: 'e2e-fenetre', label: 'Fenêtre' }),
  }

  const a4 = await option(d.format.id, 'A4')
  const a5 = await option(d.format.id, 'A5')
  const g350 = await option(d.grammage.id, '350 g')
  const g400 = await option(d.grammage.id, '400 g')
  const pages16 = await option(d.pageCount.id, '16 pages')
  const pages32 = await option(d.pageCount.id, '32 pages')
  const soft = await option(d.cover.id, 'Souple')
  const rigid = await option(d.cover.id, 'Rigide')
  const spiral = await option(d.binding.id, 'Spirale')
  const staple = await option(d.binding.id, 'Agrafage')
  const permanent = await option(d.adhesive.id, 'Permanent')
  const removable = await option(d.adhesive.id, 'Amovible')

  const [aThumb, aPreview] = await Promise.all([
    fixtureMedia(payload, 'schema-thumb', 'Vignette schéma', [200, 90, 90]),
    fixtureMedia(payload, 'schema-preview', 'Aperçu schéma A4', [90, 200, 90]),
  ])
  const baseMedia = await fixtureMedia(payload, 'schema-base', 'Produit schéma de base', [170, 170, 170])

  const common = { shortDescription: 'Produit de test défini par sa propre configuration technique.', primaryCategory: categoryId, status: 'published' as const }
  const row = (dimensionId: number, extra: Record<string, unknown> = {}) => ({ dimension: dimensionId, dataStatus: 'confirmed' as const, source: 'manual' as const, ...extra })

  await payload.create({
    collection: 'products',
    data: {
      ...common,
      title: 'E2E Schéma carte',
      slug: SCHEMA_CARD_SLUG,
      primaryImage: baseMedia.id,
      configurationSchema: [
        row(d.format.id, { options: [{ option: a4.id, descriptionOverride: '210 × 297 mm', imageOverride: aThumb.id, previewImage: aPreview.id }, { option: a5.id }] }),
        row(d.orientation.id, { enumOptions: ['portrait', 'landscape'] }),
        row(d.material.id, { materialOptions: [await material('e2e-papier-mat'), await material('e2e-papier-brillant')] }),
        row(d.grammage.id, { options: [{ option: g350.id }, { option: g400.id }] }),
        row(d.finish.id, { finishOptions: [await finish('e2e-vernis-a'), await finish('e2e-vernis-b')] }),
        row(d.window.id, { dataStatus: 'needs-review' }),
      ],
    },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'products',
    data: {
      ...common,
      title: 'E2E Schéma document',
      slug: SCHEMA_DOC_SLUG,
      configurationSchema: [
        row(d.format.id, { options: [{ option: a4.id }] }),
        row(d.pageCount.id, { options: [{ option: pages16.id }, { option: pages32.id }] }),
        row(d.cover.id, { options: [{ option: soft.id }, { option: rigid.id }] }),
        row(d.binding.id, { options: [{ option: spiral.id }, { option: staple.id }] }),
      ],
    },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'products',
    data: {
      ...common,
      title: 'E2E Schéma étiquette',
      slug: SCHEMA_LABEL_SLUG,
      configurationSchema: [
        row(d.dimensions.id, { allowCustomValue: true }),
        row(d.material.id, { materialOptions: [await material('e2e-papier-image')] }),
        row(d.adhesive.id, { options: [{ option: permanent.id }, { option: removable.id }] }),
        row(d.finish.id, { finishOptions: [await finish('e2e-vernis-a'), await finish('e2e-vernis-b')] }),
        row(d.perSheet.id, { allowCustomValue: true }),
        row(d.elastic.id),
        row(d.window.id, { dataStatus: 'needs-review' }),
      ],
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
