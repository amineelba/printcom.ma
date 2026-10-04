import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { runSeed } from '@/lib/seed/runSeed'
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'
import { serializeConfiguration } from '@/lib/configurator/transport'
import { resolveQuoteContext } from '@/lib/quote/resolveQuoteContext'
import { CUSTOM_FORMAT_VALUE, emptyConfigurationState, type ProductConfigurationState } from '@/lib/configurator/types'

let currentIp = '198.51.100.1'
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': currentIp }),
}))
const { submitQuoteRequest } = await import('@/app/(frontend)/demande-de-devis/actions')

const SLUGS = { product: 'int-cfg-produit', draftProduct: 'int-cfg-brouillon', other: 'int-cfg-autre' }
const MATERIALS = ['int-cfg-mat-a', 'int-cfg-mat-b', 'int-cfg-mat-autre']
const FINISHES = ['int-cfg-fin-a', 'int-cfg-fin-b']

let payload: Payload
let ipCounter = 10
const nextIp = () => {
  ipCounter += 1
  currentIp = `198.51.100.${ipCounter}`
}
const references: string[] = []

const state = (partial: Partial<ProductConfigurationState>): ProductConfigurationState => ({
  ...emptyConfigurationState(),
  ...partial,
})

const valid = () => ({
  fullName: 'Amine Test',
  phone: '+212600000000',
  email: 'amine@example.com',
  designSource: 'client' as const,
  consentConfirmed: true as const,
  idempotencyKey: crypto.randomUUID(),
})

const idOf = (value: unknown) => (typeof value === 'object' && value ? (value as { id: number }).id : value)

async function submit(extra: Record<string, unknown>) {
  nextIp()
  const result = await submitQuoteRequest({ ...valid(), ...extra })
  expect(result.status).toBe('success')
  references.push(result.reference!)
  const found = await payload.find({
    collection: 'quote-requests',
    where: { reference: { equals: result.reference! } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return found.docs[0]
}

async function cleanup() {
  await payload.delete({ collection: 'quote-requests', where: { reference: { in: references } }, overrideAccess: true })
  await payload.delete({ collection: 'products', where: { slug: { in: Object.values(SLUGS) } }, overrideAccess: true })
  await payload.delete({ collection: 'materials', where: { slug: { in: MATERIALS } }, overrideAccess: true })
  await payload.delete({ collection: 'finishes', where: { slug: { in: FINISHES } }, overrideAccess: true })
}

describe('quote checkout — configuration persistence', () => {
  let materialA: number
  let finishA: number
  let finishB: number

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await runSeed(payload)
    await cleanup()

    const category = (
      await payload.find({ collection: 'product-categories', limit: 1, depth: 0, overrideAccess: true })
    ).docs[0]

    const mats = await Promise.all(
      MATERIALS.map((slug) =>
        payload.create({
          collection: 'materials',
          data: { title: slug.toUpperCase(), slug, group: 'papier', status: 'published' },
          overrideAccess: true,
        }),
      ),
    )
    const fins = await Promise.all(
      FINISHES.map((slug) =>
        payload.create({
          collection: 'finishes',
          data: { title: slug.toUpperCase(), slug, group: 'vernis', status: 'published' },
          overrideAccess: true,
        }),
      ),
    )
    materialA = mats[0].id
    finishA = fins[0].id
    finishB = fins[1].id

    const base = {
      shortDescription: 'Produit de test.',
      primaryCategory: category.id,
    }
    await payload.create({
      collection: 'products',
      data: {
        ...base,
        title: 'Produit configurable int',
        slug: SLUGS.product,
        status: 'published',
        availableFormats: [{ label: 'A4' }, { label: 'A5' }],
        customFormatAvailable: true,
        orientations: ['portrait', 'square'],
        pageCountOptions: [{ label: '8 pages' }, { label: 'Sur devis' }],
        printSides: ['single', 'double'],
        colorModes: ['cmyk'],
        materials: [mats[0].id, mats[1].id],
        grammages: [{ label: '350 g' }],
        finishes: [fins[0].id, fins[1].id],
        quantities: [{ label: '500 ex.' }, { label: 'Entre 500 et 1000' }],
      },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'products',
      data: { ...base, title: 'Autre produit int', slug: SLUGS.other, status: 'published', materials: [mats[2].id] },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'products',
      data: { ...base, title: 'Brouillon int', slug: SLUGS.draftProduct, status: 'draft' },
      overrideAccess: true,
    })
  }, 90_000)

  afterAll(async () => {
    await cleanup()
  })

  it('persists a full canonical configuration into the structured fields', async () => {
    const doc = await submit({
      productContext: {
        productSlug: SLUGS.product,
        configurationTransport: serializeConfiguration(
          state({
            single: {
              format: 'A5',
              orientation: 'square',
              'page-count': '8 pages',
              'print-sides': 'double',
              'color-mode': 'cmyk',
              material: 'int-cfg-mat-a',
              grammage: '350 g',
              quantity: '500 ex.',
            },
            multiple: { finish: ['int-cfg-fin-a', 'int-cfg-fin-b'] },
          }),
        ),
      },
    })

    expect(doc.need.requestType).toBe('product-printing')
    expect(typeof doc.need.desiredProduct).toBe('number')
    expect(doc.configuration).toMatchObject({
      format: 'A5',
      orientation: 'square',
      pageCount: 8,
      pageCountLabel: '8 pages',
      printSides: 'double',
      color: 'Quadrichromie (CMJN)',
      grammage: '350 g',
      quantity: 500,
      quantityLabel: '500 ex.',
    })
    expect(idOf(doc.configuration?.material)).toBe(materialA)
    const finishIds = ((doc.configuration?.finish ?? []) as unknown[]).map(idOf).sort()
    expect(finishIds).toEqual([finishA, finishB].sort())
  })

  it('keeps the label (and no number) when it is not explicitly numeric', async () => {
    const doc = await submit({
      productContext: {
        productSlug: SLUGS.product,
        configurationTransport: serializeConfiguration(
          state({ single: { 'page-count': 'Sur devis', quantity: 'Entre 500 et 1000' } }),
        ),
      },
    })
    expect(doc.configuration?.pageCount).toBeFalsy()
    expect(doc.configuration?.quantity).toBeFalsy()
    expect(doc.configuration).toMatchObject({ pageCountLabel: 'Sur devis', quantityLabel: 'Entre 500 et 1000' })
  })

  it('persists custom-format dimensions as numbers', async () => {
    const doc = await submit({
      productContext: {
        productSlug: SLUGS.product,
        configurationTransport: serializeConfiguration(
          state({ single: { format: CUSTOM_FORMAT_VALUE }, customFormat: { width: '85,5', height: '55', unit: 'cm' } }),
        ),
      },
    })
    expect(doc.configuration).toMatchObject({
      format: 'Sur mesure',
      customFormatWidth: 85.5,
      customFormatHeight: 55,
      customFormatUnit: 'cm',
    })
  })

  it('stores only the product when there is no configuration', async () => {
    const doc = await submit({ productContext: { productSlug: SLUGS.product } })
    expect(typeof doc.need.desiredProduct).toBe('number')
    expect(doc.configuration?.format).toBeFalsy()
    expect(doc.configuration?.material).toBeFalsy()
    expect(doc.configuration?.finish ?? []).toHaveLength(0)
  })

  it('rejects tampered values server-side: foreign material, stale option, absent enum', async () => {
    const doc = await submit({
      productContext: {
        productSlug: SLUGS.product,
        configurationTransport: serializeConfiguration(
          state({
            single: {
              format: 'A3', // not offered
              material: 'int-cfg-mat-autre', // belongs to another product
              'print-sides': 'double', // valid, kept
              orientation: 'landscape', // not offered by this product
            },
            multiple: { finish: ['int-cfg-fin-a', 'finition-inconnue'] },
          }),
        ),
      },
    })
    expect(doc.configuration?.format).toBeFalsy()
    expect(doc.configuration?.material).toBeFalsy()
    expect(doc.configuration?.orientation).toBeFalsy()
    expect(doc.configuration?.printSides).toBe('double')
    expect(((doc.configuration?.finish ?? []) as unknown[]).map(idOf)).toEqual([finishA])
  })

  it('ignores a malformed or unknown-version transport but keeps the product', async () => {
    for (const bad of ['garbage', '9.eyJmIjoiQTQifQ', '1.!!!']) {
      const doc = await submit({ productContext: { productSlug: SLUGS.product, configurationTransport: bad } })
      expect(typeof doc.need.desiredProduct).toBe('number')
      expect(doc.configuration?.format).toBeFalsy()
    }
  })

  it('ignores an unpublished or unknown product and its configuration', async () => {
    const transport = serializeConfiguration(state({ single: { format: 'A4' } }))
    for (const productSlug of [SLUGS.draftProduct, 'produit-inexistant']) {
      const doc = await submit({ productContext: { productSlug, configurationTransport: transport } })
      expect(doc.need.desiredProduct).toBeFalsy()
      expect(doc.need.requestType).toBe('other')
      expect(doc.configuration?.format).toBeFalsy()
    }
  })

  it('keeps legacy ?support= / ?finition= context working, validated against the product', async () => {
    const doc = await submit({
      context: { productSlug: SLUGS.product, materialSlug: 'int-cfg-mat-b', finishSlug: 'int-cfg-fin-b' },
    })
    expect(typeof doc.need.desiredProduct).toBe('number')
    expect(typeof idOf(doc.configuration?.material)).toBe('number')
    expect(((doc.configuration?.finish ?? []) as unknown[]).map(idOf)).toEqual([finishB])

    const foreign = await submit({ context: { productSlug: SLUGS.product, materialSlug: 'int-cfg-mat-autre' } })
    expect(foreign.configuration?.material).toBeFalsy()
  })

  it('a generic quote without product still works and stays configuration-free', async () => {
    const doc = await submit({})
    expect(doc.need.requestType).toBe('other')
    expect(doc.need.desiredProduct).toBeFalsy()
    expect(doc.configuration?.format).toBeFalsy()
  })

  it('replays idempotently: a second send creates no second lead', async () => {
    nextIp()
    const input = {
      ...valid(),
      productContext: {
        productSlug: SLUGS.product,
        configurationTransport: serializeConfiguration(state({ single: { format: 'A4' } })),
      },
    }
    const first = await submitQuoteRequest(input)
    const second = await submitQuoteRequest(input)
    references.push(first.reference!)
    expect(second.reference).toBe(first.reference)
    const count = await payload.find({
      collection: 'quote-requests',
      where: { reference: { equals: first.reference! } },
      limit: 0,
      overrideAccess: true,
    })
    expect(count.totalDocs).toBe(1)
  })

  it('the honeypot still short-circuits without writing', async () => {
    nextIp()
    const before = (await payload.find({ collection: 'quote-requests', limit: 0, overrideAccess: true })).totalDocs
    const result = await submitQuoteRequest({
      ...valid(),
      honeypot: 'bot',
      productContext: { productSlug: SLUGS.product },
    })
    expect(result.status).toBe('success')
    const after = (await payload.find({ collection: 'quote-requests', limit: 0, overrideAccess: true })).totalDocs
    expect(after).toBe(before)
  })

  it('page and action agree: resolveQuoteContext yields the same canonical transport', async () => {
    const transport = serializeConfiguration(
      state({ single: { format: 'A4', material: 'int-cfg-mat-a' }, multiple: { finish: ['int-cfg-fin-b'] } }),
    )
    const context = await resolveQuoteContext(payload, { productSlug: SLUGS.product, configurationTransport: transport })
    expect(context.configuration?.transport).toBe(transport)
    expect(context.configuration?.rows.map((row) => row.label)).toEqual(['Format', 'Support', 'Finition'])
  })

  it('quote-requests stay private to anonymous readers', async () => {
    await expect(
      payload.find({ collection: 'quote-requests', limit: 1, overrideAccess: false }),
    ).rejects.toThrow()
  })
})
