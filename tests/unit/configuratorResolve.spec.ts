import { describe, expect, it } from 'vitest'
import { resolveProductConfiguration } from '@/lib/configurator/resolveConfiguration'
import { parseConfigurationTransport, serializeConfiguration } from '@/lib/configurator/transport'
import { parseDimension, parseExplicitCount } from '@/lib/configurator/safeCount'
import { CUSTOM_FORMAT_VALUE, emptyConfigurationState, type ProductConfigurationState } from '@/lib/configurator/types'
import { makeFinish, makeFullProduct, makeMaterial, makeProduct } from './helpers/configuratorFixtures'

function transportOf(partial: Partial<ProductConfigurationState>) {
  return parseConfigurationTransport(serializeConfiguration({ ...emptyConfigurationState(), ...partial }))
}

const product = makeFullProduct()

describe('resolveProductConfiguration', () => {
  it('canonicalizes a valid configuration and re-serializes it identically', () => {
    const transport = transportOf({
      single: { format: 'A4', orientation: 'portrait', material: 'couché-mat', quantity: '500' },
      multiple: { finish: ['soft-touch', 'vernis-uv'] },
    })
    const resolved = resolveProductConfiguration({ product, transport })
    expect(resolved.rejectedCount).toBe(0)
    expect(resolved.rows).toEqual([
      { key: 'format', label: 'Format', value: 'A4' },
      { key: 'orientation', label: 'Orientation', value: 'Portrait' },
      { key: 'material', label: 'Support', value: 'Couché mat' },
      { key: 'finish', label: 'Finition', value: 'Soft Touch, Vernis UV' },
      { key: 'quantity', label: 'Quantité', value: '500' },
    ])
    expect(resolved.selections.material).toEqual({ id: 21, slug: 'couché-mat', title: 'Couché mat' })
    expect(resolved.selections.finishes.map((f) => f.id)).toEqual([41, 42])
    expect(resolved.transport).toBeDefined()
  })

  it('invents nothing: no transport means no selection, singleton groups included', () => {
    const resolved = resolveProductConfiguration({ product, transport: { status: 'empty' } })
    expect(resolved.rows).toEqual([])
    expect(resolved.transport).toBeUndefined()
    expect(resolved.state.single['page-count']).toBeUndefined() // the lone "4 pages" option is not auto-picked here
  })

  it('ignores a malformed transport entirely and says why', () => {
    const resolved = resolveProductConfiguration({
      product,
      transport: parseConfigurationTransport('1.%%%'),
    })
    expect(resolved.rows).toEqual([])
    expect(resolved.transportIssue).toBe('malformed')
  })

  it('rejects a material and a finish that belong to another product', () => {
    const resolved = resolveProductConfiguration({
      product,
      transport: transportOf({
        single: { material: 'carton-kraft', format: 'A4' },
        multiple: { finish: ['pelliculage-brillant', 'soft-touch'] },
      }),
    })
    expect(resolved.selections.material).toBeUndefined()
    expect(resolved.selections.finishes.map((f) => f.slug)).toEqual(['soft-touch'])
    expect(resolved.rejectedCount).toBe(2)
    expect(resolved.rows.map((r) => r.value)).toEqual(['A4', 'Soft Touch'])
  })

  it('rejects stale inline options and enums the product does not offer', () => {
    const resolved = resolveProductConfiguration({
      product,
      transport: transportOf({
        single: { format: 'A3', orientation: 'square', 'print-sides': 'double', grammage: '999 g' },
      }),
    })
    expect(resolved.rows).toEqual([{ key: 'print-sides', label: 'Impression', value: 'Recto-verso' }])
    expect(resolved.rejectedCount).toBe(3)
  })

  it('rejects groups the product does not have at all', () => {
    const bare = makeProduct()
    const resolved = resolveProductConfiguration({
      product: bare,
      transport: transportOf({ single: { format: 'A4' }, multiple: { finish: ['soft-touch'] } }),
    })
    expect(resolved.rows).toEqual([])
    expect(resolved.rejectedCount).toBe(2)
  })

  it('never exposes unpublished materials or finishes', () => {
    const draftProduct = makeFullProduct({
      materials: [makeMaterial(21, 'Couché mat'), makeMaterial(23, 'Brouillon', { status: 'draft' })],
      finishes: [makeFinish(41, 'Soft Touch'), makeFinish(43, 'Secret', { status: 'draft' })],
    })
    const resolved = resolveProductConfiguration({
      product: draftProduct,
      transport: transportOf({ single: { material: 'brouillon' }, multiple: { finish: ['secret', 'soft-touch'] } }),
    })
    expect(resolved.selections.material).toBeUndefined()
    expect(resolved.selections.finishes.map((f) => f.slug)).toEqual(['soft-touch'])
  })

  describe('custom format', () => {
    it('keeps valid dimensions and normalizes decimal commas', () => {
      const resolved = resolveProductConfiguration({
        product,
        transport: transportOf({
          single: { format: CUSTOM_FORMAT_VALUE },
          customFormat: { width: '85,5', height: '55', unit: 'cm' },
        }),
      })
      expect(resolved.selections.customFormat).toEqual({ width: 85.5, height: 55, unit: 'cm' })
      expect(resolved.rows).toEqual([{ key: 'format', label: 'Format', value: '85.5 × 55 cm' }])
      expect(resolved.selections.format).toBe('Sur mesure')
    })

    it('drops non-positive or non-numeric dimensions rather than storing NaN', () => {
      const resolved = resolveProductConfiguration({
        product,
        transport: transportOf({
          single: { format: CUSTOM_FORMAT_VALUE },
          customFormat: { width: 'abc', height: '-4', unit: 'mm' },
        }),
      })
      expect(resolved.selections.customFormat).toBeUndefined()
      expect(resolved.rows).toEqual([{ key: 'format', label: 'Format', value: 'Sur mesure' }])
    })

    it('rejects custom dimensions when the product does not offer a custom format', () => {
      const resolved = resolveProductConfiguration({
        product: makeFullProduct({ customFormatAvailable: false }),
        transport: transportOf({
          single: { format: CUSTOM_FORMAT_VALUE },
          customFormat: { width: '85', height: '55', unit: 'mm' },
        }),
      })
      expect(resolved.rows).toEqual([])
      expect(resolved.selections.customFormat).toBeUndefined()
    })
  })

  describe('legacy ?support= / ?finition=', () => {
    it('are normalized into the canonical configuration', () => {
      const resolved = resolveProductConfiguration({
        product,
        transport: { status: 'empty' },
        legacy: { materialSlug: 'offset', finishSlug: 'vernis-uv' },
      })
      expect(resolved.rows).toEqual([
        { key: 'material', label: 'Support', value: 'Offset' },
        { key: 'finish', label: 'Finition', value: 'Vernis UV' },
      ])
      expect(resolved.transport).toBeDefined()
    })

    it('never override the transport and are validated against the product', () => {
      const resolved = resolveProductConfiguration({
        product,
        transport: transportOf({ single: { material: 'couché-mat' } }),
        legacy: { materialSlug: 'offset', finishSlug: 'inconnu' },
      })
      expect(resolved.selections.material?.slug).toBe('couché-mat')
      expect(resolved.selections.finishes).toEqual([])
    })
  })

  it('is stable: resolving the canonical transport again changes nothing', () => {
    const first = resolveProductConfiguration({
      product,
      transport: transportOf({ single: { format: 'A5', material: 'offset' }, multiple: { finish: ['vernis-uv', 'soft-touch'] } }),
    })
    const second = resolveProductConfiguration({ product, transport: parseConfigurationTransport(first.transport) })
    expect(second.state).toEqual(first.state)
    expect(second.transport).toBe(first.transport)
  })
})

describe('safe parsers', () => {
  it.each([
    ['500', 500],
    ['500 ex.', 500],
    ['1 000 ex.', 1000],
    ['1 000', 1000],
    ['16 pages', 16],
    ['250 exemplaires', 250],
    ['  8 p.  ', 8],
  ])('parseExplicitCount(%j) → %j', (label, expected) => {
    expect(parseExplicitCount(label)).toBe(expected)
  })

  it.each(['500-1000', 'A4', 'sur devis', '1.000,5', '0', '', '12 kg', '500 à 1000', '99999999999'])(
    'parseExplicitCount(%j) → undefined',
    (label) => {
      expect(parseExplicitCount(label)).toBeUndefined()
    },
  )

  it('parseDimension accepts positive decimals only', () => {
    expect(parseDimension('85')).toBe(85)
    expect(parseDimension('85,5')).toBe(85.5)
    expect(parseDimension(' 12.25 ')).toBe(12.25)
    for (const bad of ['', 'abc', '-1', '0', '1e3', '1,2,3', '999999']) expect(parseDimension(bad)).toBeUndefined()
  })
})
