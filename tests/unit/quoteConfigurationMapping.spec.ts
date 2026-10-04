import { describe, expect, it } from 'vitest'
import { mapCheckoutToQuoteRequest } from '@/lib/quote/mapCheckoutToQuoteRequest'
import { buildQuoteConfirmationEmail, buildQuoteNotificationEmail } from '@/lib/quote/quoteEmails'
import { resolveProductConfiguration } from '@/lib/configurator/resolveConfiguration'
import { parseConfigurationTransport, serializeConfiguration } from '@/lib/configurator/transport'
import { CUSTOM_FORMAT_VALUE, emptyConfigurationState, type ProductConfigurationState } from '@/lib/configurator/types'
import type { QuoteCheckoutData } from '@/lib/validation/quote'
import type { ResolvedQuoteContext } from '@/lib/quote/resolveQuoteContext'
import { makeFullProduct } from './helpers/configuratorFixtures'

const data: QuoteCheckoutData = {
  fullName: 'Amine Test',
  phone: '+212600000000',
  email: 'amine@example.com',
  designSource: 'client',
  consentConfirmed: true,
  idempotencyKey: 'k',
}

const product = makeFullProduct()

function contextFor(state: Partial<ProductConfigurationState>): ResolvedQuoteContext {
  const configuration = resolveProductConfiguration({
    product,
    transport: parseConfigurationTransport(
      serializeConfiguration({ ...emptyConfigurationState(), ...state }),
    ),
  })
  return {
    product: { id: product.id, slug: product.slug, title: product.title },
    material: configuration.selections.material,
    finish: configuration.selections.finishes[0],
    configuration,
  }
}

describe('mapCheckoutToQuoteRequest — configuration', () => {
  it('maps a full configuration onto the existing structured fields', () => {
    const request = mapCheckoutToQuoteRequest(
      'PC-1',
      data,
      contextFor({
        single: {
          format: 'A5',
          orientation: 'landscape',
          'page-count': '4 pages',
          'print-sides': 'double',
          'color-mode': 'cmyk',
          material: 'offset',
          grammage: '350 g',
          quantity: '500',
        },
        multiple: { finish: ['soft-touch', 'vernis-uv'] },
      }),
    )
    expect(request.need).toEqual({ requestType: 'product-printing', desiredProduct: 10 })
    expect(request.configuration).toEqual({
      format: 'A5',
      customFormatWidth: undefined,
      customFormatHeight: undefined,
      customFormatUnit: undefined,
      orientation: 'landscape',
      pageCount: 4,
      pageCountLabel: '4 pages',
      printSides: 'double',
      color: 'Quadrichromie (CMJN)',
      material: 22,
      grammage: '350 g',
      finish: [41, 42],
      quantity: 500,
      quantityLabel: '500',
    })
  })

  it('stores custom dimensions as numbers and the label as "Sur mesure"', () => {
    const { configuration } = mapCheckoutToQuoteRequest(
      'PC-1',
      data,
      contextFor({ single: { format: CUSTOM_FORMAT_VALUE }, customFormat: { width: '85,5', height: '55', unit: 'cm' } }),
    )
    expect(configuration).toMatchObject({
      format: 'Sur mesure',
      customFormatWidth: 85.5,
      customFormatHeight: 55,
      customFormatUnit: 'cm',
    })
  })

  it('never writes NaN: non-numeric labels keep the label and leave the number empty', () => {
    const odd = makeFullProduct({
      pageCountOptions: [{ id: 'p', label: 'Sur devis' }, { id: 'p2', label: '8 pages' }],
      quantities: [{ id: 'q', label: '500 ex.' }, { id: 'q2', label: '500 à 1000' }],
    })
    const resolve = (pageCount: string, quantity: string) => {
      const configuration = resolveProductConfiguration({
        product: odd,
        transport: parseConfigurationTransport(
          serializeConfiguration({ ...emptyConfigurationState(), single: { 'page-count': pageCount, quantity } }),
        ),
      })
      return mapCheckoutToQuoteRequest('PC-1', data, { product: { id: 10, slug: 's', title: 't' }, configuration })
        .configuration!
    }

    const explicit = resolve('8 pages', '500 ex.')
    expect(explicit).toMatchObject({ pageCount: 8, pageCountLabel: '8 pages', quantity: 500, quantityLabel: '500 ex.' })

    const vague = resolve('Sur devis', '500 à 1000')
    expect(vague.pageCount).toBeUndefined()
    expect(vague.quantity).toBeUndefined()
    expect(vague).toMatchObject({ pageCountLabel: 'Sur devis', quantityLabel: '500 à 1000' })
    for (const value of Object.values(vague)) expect(Number.isNaN(value)).toBe(false)
  })

  it('persists a square orientation', () => {
    const squareProduct = makeFullProduct({ orientations: ['square'] })
    const configuration = resolveProductConfiguration({
      product: squareProduct,
      transport: parseConfigurationTransport(
        serializeConfiguration({ ...emptyConfigurationState(), single: { orientation: 'square' } }),
      ),
    })
    const request = mapCheckoutToQuoteRequest('PC-1', data, {
      product: { id: 10, slug: 's', title: 't' },
      configuration,
    })
    expect(request.configuration?.orientation).toBe('square')
  })

  it('product only: links the product, stores no configuration values', () => {
    const request = mapCheckoutToQuoteRequest('PC-1', data, contextFor({}))
    expect(request.need?.desiredProduct).toBe(10)
    expect(Object.values(request.configuration ?? {}).filter((value) => value !== undefined)).toEqual([])
  })

  it('generic quote: no product, no configuration (Sprint 1 behaviour)', () => {
    const request = mapCheckoutToQuoteRequest('PC-1', data, {})
    expect(request.need).toEqual({ requestType: 'other', desiredProduct: undefined })
    expect(request.configuration).toEqual({ material: undefined, finish: undefined })
  })

  it('legacy material/finish context without a product still maps', () => {
    const request = mapCheckoutToQuoteRequest('PC-1', data, {
      material: { id: 5, slug: 'm', title: 'M' },
      finish: { id: 6, slug: 'f', title: 'F' },
    })
    expect(request.configuration).toEqual({ material: 5, finish: [6] })
  })
})

describe('quote emails — canonical configuration', () => {
  it('lists the product and only the populated configuration rows', () => {
    const { html } = buildQuoteNotificationEmail(
      'PC-1',
      data,
      contextFor({ single: { format: 'A5', quantity: '500' }, multiple: { finish: ['soft-touch', 'vernis-uv'] } }),
    )
    expect(html).toContain('Produit :</strong> Cartes de visite')
    expect(html).toContain('Format :</strong> A5')
    expect(html).toContain('Finition :</strong> Soft Touch, Vernis UV')
    expect(html).toContain('Quantité :</strong> 500')
    expect(html).not.toContain('Orientation')
    expect(html).not.toContain('Grammage')
    expect(html).not.toMatch(/undefined|null|NaN/)
  })

  it('product-only requests list the product and nothing else', () => {
    const { html } = buildQuoteNotificationEmail('PC-1', data, contextFor({}))
    expect(html).toContain('Produit :</strong> Cartes de visite')
    expect(html).not.toContain('Format')
  })

  it('keeps the customer email concise: no configuration, price, deadline or PDF promise', () => {
    const { html } = buildQuoteConfirmationEmail('PC-1', data)
    expect(html).not.toMatch(/format|finition|quantité|prix|tarif|délai|PDF|MAD|DH/i)
  })
})
