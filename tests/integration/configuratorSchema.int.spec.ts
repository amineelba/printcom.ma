// @vitest-environment node
import { getPayload, Payload } from 'payload'
import sharp from 'sharp'
import config from '@/payload.config'
import { runSeed } from '@/lib/seed/runSeed'
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'
import type { Product } from '@/payload-types'
import { applyBackfill, applyImport, ensureBuiltInDimensions, loadData, loadImportContext } from '@/lib/configurator-schema/db'
import { planProducts } from '@/lib/configurator-schema/backfillPlan'
import { parseReviewFile, planImport, toCsv, type ReviewRow, CUSTOM_VALUE } from '@/lib/configurator-schema/reviewWorkflow'
import type { ProductSource } from '@/lib/configurator-schema/sources'
import { buildLegacyConfiguratorModel } from '@/lib/configurator/legacyConfigurator'
import { buildProductConfiguratorModel } from '@/lib/configurator/buildProductConfiguratorData'
import { serializeConfiguration } from '@/lib/configurator/transport'
import { emptyConfigurationState, type ProductConfigurationState } from '@/lib/configurator/types'
import { resolveQuoteContext } from '@/lib/quote/resolveQuoteContext'

let currentIp = '192.0.2.1'
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': currentIp }),
}))
const { submitQuoteRequest } = await import('@/app/(frontend)/demande-de-devis/actions')

const SLUG = { card: 'int5-carte', doc: 'int5-document', label: 'int5-etiquette' }
const MATERIALS = ['int5-mat-a', 'int5-mat-b']
const FINISHES = ['int5-fin-a', 'int5-fin-b']

const sources: ProductSource[] = [
  { title: 'Carte int5', slug: SLUG.card, dimensions: ['format', 'orientation', 'support', 'finition', 'fenêtre'], kind: 'seed-source' },
  { title: 'Document int5', slug: SLUG.doc, dimensions: ['format', 'pagination', 'reliure'], kind: 'seed-source' },
  { title: 'Étiquette int5', slug: SLUG.label, dimensions: ['dimensions', 'adhésif'], kind: 'seed-source' },
]

let payload: Payload
let ipCounter = 10
const nextIp = () => {
  ipCounter += 1
  currentIp = `192.0.2.${ipCounter}`
}
const references: string[] = []
const preExistingDimensionIds = new Set<number>()
const preExistingOptionIds = new Set<number>()
const mediaIds: number[] = []
const ids: { matA: number; matB: number; finA: number; finB: number; thumb: number; preview: number } = {} as never

const state = (partial: Partial<ProductConfigurationState>) => ({ ...emptyConfigurationState(), ...partial })
const idOf = (value: unknown) => (typeof value === 'object' && value ? (value as { id: number }).id : value)

async function product(slug: string, depth = 2): Promise<Product> {
  const found = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, depth, overrideAccess: true })
  return found.docs[0] as Product
}

async function snapshotsAndPlans() {
  const data = await loadData(payload)
  const own = data.snapshots.filter((snapshot) => Object.values(SLUG).includes(snapshot.slug))
  return { data, own, plans: planProducts(own, { seed: sources }) }
}

async function submit(extra: Record<string, unknown>) {
  nextIp()
  const result = await submitQuoteRequest({
    fullName: 'Amine Test',
    phone: '+212600000000',
    email: 'amine@example.com',
    designSource: 'client',
    consentConfirmed: true,
    idempotencyKey: crypto.randomUUID(),
    ...extra,
  } as never)
  expect(result.status).toBe('success')
  references.push(result.reference!)
  const found = await payload.find({ collection: 'quote-requests', where: { reference: { equals: result.reference! } }, limit: 1, depth: 0, overrideAccess: true })
  return found.docs[0]
}

async function cleanup() {
  await payload.delete({ collection: 'quote-requests', where: { reference: { in: references } }, overrideAccess: true })
  await payload.delete({ collection: 'products', where: { slug: { in: Object.values(SLUG) } }, overrideAccess: true })
  await payload.delete({ collection: 'materials', where: { slug: { in: MATERIALS } }, overrideAccess: true })
  await payload.delete({ collection: 'finishes', where: { slug: { in: FINISHES } }, overrideAccess: true })
  if (mediaIds.length) await payload.delete({ collection: 'media', where: { id: { in: mediaIds } }, overrideAccess: true })
  const options = await payload.find({ collection: 'configurator-options', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  for (const option of options.docs) if (!preExistingOptionIds.has(option.id)) await payload.delete({ collection: 'configurator-options', id: option.id, overrideAccess: true })
  const dimensions = await payload.find({ collection: 'configurator-dimensions', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  for (const dimension of dimensions.docs) if (!preExistingDimensionIds.has(dimension.id)) await payload.delete({ collection: 'configurator-dimensions', id: dimension.id, overrideAccess: true })
}

async function media(name: string) {
  const data = await sharp({ create: { width: 320, height: 240, channels: 3, background: { r: 120, g: 120, b: 120 } } }).png().toBuffer()
  const doc = await payload.create({ collection: 'media', data: { alt: name }, file: { data, mimetype: 'image/png', name: `int5-${name}.png`, size: data.length }, overrideAccess: true })
  mediaIds.push(doc.id)
  return doc.id
}

describe('product-specific configuration schema — database', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await runSeed(payload)
    for (const doc of (await payload.find({ collection: 'configurator-dimensions', limit: 0, pagination: false, depth: 0, overrideAccess: true })).docs) preExistingDimensionIds.add(doc.id)
    for (const doc of (await payload.find({ collection: 'configurator-options', limit: 0, pagination: false, depth: 0, overrideAccess: true })).docs) preExistingOptionIds.add(doc.id)
    await cleanup()

    const category = (await payload.find({ collection: 'product-categories', limit: 1, depth: 0, overrideAccess: true })).docs[0]
    const mats = await Promise.all(MATERIALS.map((slug) => payload.create({ collection: 'materials', data: { title: slug.toUpperCase(), slug, group: 'papier', status: 'published' }, overrideAccess: true })))
    const fins = await Promise.all(FINISHES.map((slug) => payload.create({ collection: 'finishes', data: { title: slug.toUpperCase(), slug, group: 'vernis', status: 'published' }, overrideAccess: true })))
    Object.assign(ids, { matA: mats[0].id, matB: mats[1].id, finA: fins[0].id, finB: fins[1].id, thumb: await media('thumb'), preview: await media('preview') })

    const base = { shortDescription: 'Produit de test.', primaryCategory: category.id, status: 'published' as const }
    await payload.create({
      collection: 'products',
      data: {
        ...base,
        title: 'Carte int5',
        slug: SLUG.card,
        availableFormats: [{ label: 'A4', description: '210 × 297 mm', image: ids.thumb, previewImage: ids.preview }, { label: 'A5' }],
        customFormatAvailable: true,
        orientations: ['portrait', 'landscape'],
        materials: [ids.matA, ids.matB],
        grammages: [{ label: '350 g' }],
        finishes: [ids.finA, ids.finB],
      },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'products',
      data: { ...base, title: 'Document int5', slug: SLUG.doc, availableFormats: [{ label: 'A4' }], pageCountOptions: [{ label: '16 pages' }, { label: '32 pages' }] },
      overrideAccess: true,
    })
    await payload.create({ collection: 'products', data: { ...base, title: 'Étiquette int5', slug: SLUG.label }, overrideAccess: true })
  }, 120_000)

  afterAll(async () => {
    await cleanup()
  })

  it('the additive migration leaves existing products and quotes readable', async () => {
    const products = await payload.find({ collection: 'products', limit: 1, depth: 0, overrideAccess: true })
    expect(products.totalDocs).toBeGreaterThan(90)
    // A product that predates the schema has no rows and still resolves through the legacy adapter.
    const legacy = await product(SLUG.doc)
    expect(legacy.configurationSchema ?? []).toEqual([])
    expect(buildProductConfiguratorModel(legacy).source).toBe('legacy')
    expect(buildProductConfiguratorModel(legacy).data.groups.map((group) => group.key)).toEqual(['format', 'page-count'])
  })

  it('dry-run plans everything and writes nothing', async () => {
    const before = (await payload.find({ collection: 'configurator-dimensions', limit: 0, depth: 0, overrideAccess: true })).totalDocs
    const { data, plans } = await snapshotsAndPlans()
    const summary = await applyBackfill(payload, data, plans, { write: false })
    expect(summary.productsChanged).toBe(3)
    expect(summary.rowsCreated).toBeGreaterThan(8)
    expect(summary.legacyValuesMigrated).toBeGreaterThan(8)
    expect((await payload.find({ collection: 'configurator-dimensions', limit: 0, depth: 0, overrideAccess: true })).totalDocs).toBe(before)
    expect((await product(SLUG.card)).configurationSchema ?? []).toEqual([])
  })

  it('write backfill creates product-specific schemas, reusing shared options', async () => {
    const { data, plans } = await snapshotsAndPlans()
    await ensureBuiltInDimensions(payload, data.registry, true)
    const summary = await applyBackfill(payload, data, plans, { write: true })
    expect(summary.productsChanged).toBe(3)
    expect(summary.optionsReused).toBeGreaterThan(0) // A4 is shared by two products

    const card = await product(SLUG.card, 1)
    const doc = await product(SLUG.doc, 1)
    const label = await product(SLUG.label, 1)
    const dimensionKeys = async (p: Product) => {
      const registry = (await loadData(payload)).registry
      return (p.configurationSchema ?? []).map((row) => registry.dimensionsById.get(idOf(row.dimension) as number)?.key)
    }
    expect(await dimensionKeys(card)).toEqual(['format', 'orientation', 'material', 'finish', 'fenetre', 'grammage'])
    expect(await dimensionKeys(doc)).toEqual(['format', 'page-count', 'reliure'])
    expect(await dimensionKeys(label)).toEqual(['dimensions', 'adhesif'])

    // Same shared A4 option bound by two products; different allowlists.
    const formatOf = (p: Product) => (p.configurationSchema ?? [])[0]
    const cardOptions = (formatOf(card).options ?? []).map((binding) => idOf(binding.option))
    const docOptions = (formatOf(doc).options ?? []).map((binding) => idOf(binding.option))
    expect(cardOptions).toHaveLength(2)
    expect(docOptions).toHaveLength(1)
    expect(docOptions[0]).toBe(cardOptions[0])

    // Sprint 3 metadata + relationships preserved.
    expect(formatOf(card).options?.[0]).toMatchObject({ descriptionOverride: '210 × 297 mm' })
    expect(idOf(formatOf(card).options?.[0].imageOverride)).toBe(ids.thumb)
    expect(idOf(formatOf(card).options?.[0].previewImage)).toBe(ids.preview)
    expect(formatOf(card).allowCustomValue).toBe(true)
    const materialRow = (card.configurationSchema ?? [])[2]
    expect((materialRow.materialOptions ?? []).map(idOf)).toEqual([ids.matA, ids.matB])
    expect(((card.configurationSchema ?? [])[3].finishOptions ?? []).map(idOf)).toEqual([ids.finA, ids.finB])

    // Known dimension, unknown values: row exists, no option invented.
    const window = (card.configurationSchema ?? [])[4]
    expect(window.dataStatus).toBe('needs-review')
    expect(window.options ?? []).toEqual([])
    expect(window.materialOptions ?? []).toEqual([])
    const unknownRows = (label.configurationSchema ?? []).filter((row) => row.dataStatus === 'needs-review')
    expect(unknownRows).toHaveLength(2)
  })

  it('a second backfill is a no-op', async () => {
    const { data, plans } = await snapshotsAndPlans()
    expect(plans.every((plan) => plan.noop)).toBe(true)
    const summary = await applyBackfill(payload, data, plans, { write: true })
    expect(summary.productsChanged).toBe(0)
    expect((await product(SLUG.card, 1)).configurationSchema).toHaveLength(6)
  })

  it('the schema-driven configurator matches the legacy one value for value, and hides unknown dimensions', async () => {
    const p = await product(SLUG.card)
    const schema = buildProductConfiguratorModel(p)
    const legacy = buildLegacyConfiguratorModel(p)
    expect(schema.source).toBe('schema')
    // `fenetre` (needs-review) is hidden: no empty control.
    expect(schema.data.groups.map((group) => group.key).sort()).toEqual(legacy.data.groups.map((group) => group.key).sort())
    for (const group of legacy.data.groups) {
      const other = schema.data.groups.find((candidate) => candidate.key === group.key)!
      expect(other.selectionMode).toBe(group.selectionMode)
      expect(other.options.map((option) => [option.value, option.label, option.description, option.image?.id, option.previewImage?.id])).toEqual(
        group.options.map((option) => [option.value, option.label, option.description, option.image?.id, option.previewImage?.id]),
      )
    }
    expect(Object.keys(schema.refs.material)).toEqual(['int5-mat-a', 'int5-mat-b'])
  })

  it('distinct products render distinct dimensions', async () => {
    const keys = async (slug: string) => buildProductConfiguratorModel(await product(slug)).data.groups.map((group) => group.key)
    expect(await keys(SLUG.card)).toEqual(['format', 'orientation', 'material', 'finish', 'grammage'])
    expect(await keys(SLUG.doc)).toEqual(['format', 'page-count'])
    expect(await keys(SLUG.label)).toEqual([])
  })

  it('a quote persists core fields; a legacy v1 URL still submits against the schema product', async () => {
    const v1 = `1.${Buffer.from(JSON.stringify({ f: 'A5', o: 'landscape', m: 'int5-mat-b', g: '350 g', n: ['int5-fin-a', 'int5-fin-b'] }), 'utf8').toString('base64url')}`
    const doc = await submit({ productContext: { productSlug: SLUG.card, configurationTransport: v1 } })
    expect(doc.configuration).toMatchObject({ format: 'A5', orientation: 'landscape', grammage: '350 g' })
    expect(idOf(doc.configuration?.material)).toBe(ids.matB)
    expect(((doc.configuration?.finish ?? []) as unknown[]).map(idOf).sort()).toEqual([ids.finA, ids.finB].sort())
    expect(doc.configuration?.technicalSelections ?? []).toEqual([])
  })

  it('a v2 URL submits; tampered dimensions and options are rejected server-side', async () => {
    const transport = serializeConfiguration(
      state({
        single: { format: 'A4', reliure: 'Spirale', fenetre: 'standard', orientation: 'square' },
        multiple: { finish: ['int5-fin-a', 'étrangère'] },
        numbers: { quantity: '5' },
      }),
    )
    const doc = await submit({ productContext: { productSlug: SLUG.card, configurationTransport: transport } })
    expect(doc.configuration?.format).toBe('A4')
    expect(doc.configuration?.orientation).toBeFalsy() // 'square' is not on this product's allowlist
    expect(((doc.configuration?.finish ?? []) as unknown[]).map(idOf)).toEqual([ids.finA])
    expect(doc.configuration?.technicalSelections ?? []).toEqual([]) // reliure/fenetre/quantity are not on this product
  })

  it('import --write adds confirmed values and typed dimensions; specialized selections are snapshotted on the quote', async () => {
    const rows: ReviewRow[] = [
      { category: '', product_slug: SLUG.label, product_title: 'Étiquette int5', dimension_key: 'dimensions', dimension_label: 'Dimensions', value: CUSTOM_VALUE, value_label: '', status: 'confirmed', notes: '' },
      { category: '', product_slug: SLUG.label, product_title: 'Étiquette int5', dimension_key: 'adhesif', dimension_label: 'Adhésif', value: 'Permanent', value_label: 'Permanent', status: 'confirmed', notes: '' },
      { category: '', product_slug: SLUG.label, product_title: 'Étiquette int5', dimension_key: 'adhesif', dimension_label: 'Adhésif', value: 'Amovible', value_label: 'Amovible', status: 'confirmed', notes: '' },
    ]
    const csv = toCsv(rows)
    const parsed = parseReviewFile(csv, 'csv')
    expect(parsed.errors).toEqual([])

    // Dry-run: diff only.
    let data = await loadData(payload)
    let plan = planImport(parsed.rows, await loadImportContext(payload, data))
    expect(plan.errors).toEqual([])
    expect(plan.products).toHaveLength(1)
    await applyImport(payload, data, plan, { write: false })
    expect(((await product(SLUG.label, 1)).configurationSchema ?? []).every((row) => row.dataStatus === 'needs-review')).toBe(true)

    // Write.
    const titleBefore = (await product(SLUG.label, 0)).title
    await applyImport(payload, data, plan, { write: true })
    const label = await product(SLUG.label, 1)
    expect((label.configurationSchema ?? []).map((row) => row.dataStatus)).toEqual(['confirmed', 'confirmed'])
    expect(label.title).toBe(titleBefore) // nothing unspecified is overwritten

    // Repeat: idempotent.
    data = await loadData(payload)
    plan = planImport(parsed.rows, await loadImportContext(payload, data))
    expect(plan.products).toEqual([])
    expect(plan.newCatalogOptions).toEqual([])

    // The product now shows exactly the confirmed dimensions...
    const groups = buildProductConfiguratorModel(await product(SLUG.label)).data.groups
    expect(groups.map((group) => [group.key, group.valueType ?? group.selectionMode])).toEqual([['dimensions', 'dimensions'], ['adhesif', 'single-choice']])
    expect(groups[1].options.map((option) => option.value)).toEqual(['Permanent', 'Amovible'])

    // ...and a quote snapshots the specialized selections with French labels.
    const transport = serializeConfiguration(
      state({ single: { adhesif: 'Amovible' }, measures: { dimensions: { width: '120,5', height: '80', depth: '', unit: 'mm' } } }),
    )
    const quote = await submit({ productContext: { productSlug: SLUG.label, configurationTransport: transport } })
    expect(quote.configuration?.technicalSelections).toEqual([
      expect.objectContaining({ key: 'dimensions', label: 'Dimensions', valueLabel: '120.5 × 80 mm', unit: 'mm' }),
      expect.objectContaining({ key: 'adhesif', label: 'Adhésif', valueLabel: 'Amovible' }),
    ])
    expect(quote.configuration?.format).toBeFalsy()
    expect(quote.need.requestType).toBe('product-printing')

    // Server-side tampering on a specialized dimension: an adhesive that the product doesn't offer.
    const tampered = serializeConfiguration(state({ single: { adhesif: 'Inexistant' } }))
    const rejected = await submit({ productContext: { productSlug: SLUG.label, configurationTransport: tampered } })
    expect(rejected.configuration?.technicalSelections ?? []).toEqual([])

    // The resolver view used by the checkout page agrees with what was stored.
    const context = await resolveQuoteContext(payload, { productSlug: SLUG.label, configurationTransport: transport })
    expect(context.configuration?.rows.map((row) => row.label)).toEqual(['Dimensions', 'Adhésif'])
  })

  it('import rejects bad rows without writing anything', async () => {
    const data = await loadData(payload)
    const plan = planImport(
      [{ category: '', product_slug: 'inconnu', product_title: '', dimension_key: 'format', dimension_label: '', value: 'A4', value_label: '', status: '', notes: '' }],
      await loadImportContext(payload, data),
    )
    expect(plan.errors).toHaveLength(1)
    await expect(applyImport(payload, data, plan, { write: true })).rejects.toThrow()
  })

  it('quote requests stay private and the registry/catalog collections never leak drafts to anonymous readers', async () => {
    await expect(payload.find({ collection: 'quote-requests', limit: 1, overrideAccess: false })).rejects.toThrow()
    const draft = await payload.create({
      collection: 'configurator-dimensions',
      data: { key: 'int5-brouillon', label: 'Brouillon', group: 'other', valueType: 'single-choice', optionSource: 'catalog', status: 'draft' },
      overrideAccess: true,
    })
    const anonymous = await payload.find({ collection: 'configurator-dimensions', where: { key: { equals: 'int5-brouillon' } }, overrideAccess: false })
    expect(anonymous.totalDocs).toBe(0)
    await payload.delete({ collection: 'configurator-dimensions', id: draft.id, overrideAccess: true })
  })
})
