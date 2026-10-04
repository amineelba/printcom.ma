import { describe, expect, it } from 'vitest'
import {
  CONFIGURATION_PARAM,
  buildProductConfigurationHref,
  buildQuoteCheckoutHref,
  parseConfigurationTransport,
  readConfigurationParam,
  serializeConfiguration,
} from '@/lib/configurator/transport'
import { CUSTOM_FORMAT_VALUE, type ProductConfigurationState } from '@/lib/configurator/types'

const empty = (): ProductConfigurationState => ({
  single: {},
  multiple: {},
  customFormat: { width: '', height: '', unit: 'mm' },
})

const encodeWire = (wire: unknown) =>
  `1.${Buffer.from(JSON.stringify(wire), 'utf8').toString('base64url')}`

describe('configuration transport — serialize', () => {
  it('returns undefined when nothing is selected (no parameter at all)', () => {
    expect(serializeConfiguration(empty())).toBeUndefined()
  })

  it('is versioned and URL-safe', () => {
    const state = empty()
    state.single = { format: 'A4 / 210×297 é', grammage: '350 g' }
    const transport = serializeConfiguration(state)!
    expect(transport.startsWith('1.')).toBe(true)
    expect(transport).toMatch(/^1\.[A-Za-z0-9_-]+$/)
    expect(encodeURIComponent(transport)).toBe(transport)
  })

  it('is deterministic whatever the insertion order', () => {
    const a = empty()
    a.single = { format: 'A4', quantity: '500', grammage: '350 g' }
    const b = empty()
    b.single = { grammage: '350 g', quantity: '500', format: 'A4' }
    expect(serializeConfiguration(a)).toBe(serializeConfiguration(b))
  })

  it('carries multiple finishes in state order and drops blank values', () => {
    const state = empty()
    state.single = { material: '  ', format: 'A5' }
    state.multiple.finish = ['soft-touch', 'vernis-uv']
    const parsed = parseConfigurationTransport(serializeConfiguration(state))
    expect(parsed).toEqual({
      status: 'ok',
      configuration: { single: { format: 'A5' }, finishes: ['soft-touch', 'vernis-uv'] },
    })
  })

  it('includes custom-format dimensions only while "Sur mesure" is chosen', () => {
    const custom = empty()
    custom.single = { format: CUSTOM_FORMAT_VALUE }
    custom.customFormat = { width: '85', height: '55', unit: 'cm' }
    const parsedCustom = parseConfigurationTransport(serializeConfiguration(custom))
    expect(parsedCustom.status === 'ok' && parsedCustom.configuration.customFormat).toEqual({
      width: '85',
      height: '55',
      unit: 'cm',
    })

    const stale = empty()
    stale.single = { format: 'A4' }
    stale.customFormat = { width: '85', height: '55', unit: 'cm' }
    const parsedStale = parseConfigurationTransport(serializeConfiguration(stale))
    expect(parsedStale.status === 'ok' && parsedStale.configuration.customFormat).toBeUndefined()
  })

  it('never leaks ids, prices or labels beyond the selected values', () => {
    const state = empty()
    state.single = { format: 'A4' }
    const decoded = Buffer.from(serializeConfiguration(state)!.slice(2), 'base64url').toString('utf8')
    expect(JSON.parse(decoded)).toEqual({ f: 'A4' })
  })
})

describe('configuration transport — parse', () => {
  it('round-trips every kind of selection, UTF-8 included', () => {
    const state = empty()
    state.single = {
      format: CUSTOM_FORMAT_VALUE,
      orientation: 'landscape',
      pageCount: '16 pages',
      printSides: 'double',
      colorMode: 'cmyk',
      material: 'couche-mat',
      grammage: '350 g',
      quantity: '1 000 ex. — étiquettes',
    }
    state.multiple.finish = ['soft-touch', 'vernis-uv']
    state.customFormat = { width: '85,5', height: '55', unit: 'mm' }
    const parsed = parseConfigurationTransport(serializeConfiguration(state))
    expect(parsed).toEqual({
      status: 'ok',
      configuration: {
        single: state.single,
        finishes: ['soft-touch', 'vernis-uv'],
        customFormat: { width: '85,5', height: '55', unit: 'mm' },
      },
    })
  })

  it('treats a missing or blank value as empty', () => {
    expect(parseConfigurationTransport(undefined)).toEqual({ status: 'empty' })
    expect(parseConfigurationTransport(null)).toEqual({ status: 'empty' })
    expect(parseConfigurationTransport('')).toEqual({ status: 'empty' })
  })

  it.each([
    ['garbage', 'not-a-transport'],
    ['no payload', '1.'],
    ['bad base64', '1.!!!'],
    ['not json', `1.${Buffer.from('{oops', 'utf8').toString('base64url')}`],
    ['json array', encodeWire([1, 2])],
    ['unknown key', encodeWire({ f: 'A4', evil: 'x' })],
    ['wrong value type', encodeWire({ f: 12 })],
    ['empty value', encodeWire({ f: '' })],
    ['bad unit', encodeWire({ f: 'A4', x: ['1', '2', 'km'] })],
    ['finishes not an array', encodeWire({ n: 'soft-touch' })],
    ['too many finishes', encodeWire({ n: Array.from({ length: 21 }, (_, i) => `f${i}`) })],
    ['value too long', encodeWire({ f: 'x'.repeat(201) })],
  ])('fails closed on %s', (_name, raw) => {
    expect(parseConfigurationTransport(raw).status).toBe('invalid')
  })

  it('rejects an unknown version', () => {
    expect(parseConfigurationTransport(`2.${Buffer.from('{}').toString('base64url')}`)).toEqual({
      status: 'invalid',
      reason: 'unknown-version',
    })
  })

  it('rejects oversized input without decoding it', () => {
    expect(parseConfigurationTransport(`1.${'A'.repeat(5000)}`)).toEqual({ status: 'invalid', reason: 'too-long' })
  })

  it('de-duplicates repeated finishes', () => {
    const parsed = parseConfigurationTransport(encodeWire({ n: ['a', 'a', 'b'] }))
    expect(parsed.status === 'ok' && parsed.configuration.finishes).toEqual(['a', 'b'])
  })
})

describe('configuration transport — URLs', () => {
  it('builds the checkout href with product and transport via URLSearchParams', () => {
    const state = empty()
    state.single = { format: 'A4 & co' }
    const transport = serializeConfiguration(state)!
    const href = buildQuoteCheckoutHref('cartes de visite', transport)
    const url = new URL(href, 'http://x')
    expect(url.pathname).toBe('/demande-de-devis')
    expect(url.searchParams.get('produit')).toBe('cartes de visite')
    expect(url.searchParams.get(CONFIGURATION_PARAM)).toBe(transport)
  })

  it('omits the parameter when there is no configuration', () => {
    expect(buildQuoteCheckoutHref('cartes-de-visite')).toBe('/demande-de-devis?produit=cartes-de-visite')
    expect(buildProductConfigurationHref('cartes-de-visite')).toBe('/produits/cartes-de-visite')
  })

  it('builds the product edit href', () => {
    expect(buildProductConfigurationHref('cartes-de-visite', '1.abc')).toBe('/produits/cartes-de-visite?cfg=1.abc')
  })

  it('reads the first cfg value from Next search params', () => {
    expect(readConfigurationParam({ cfg: ['1.a', '1.b'] })).toBe('1.a')
    expect(readConfigurationParam({ cfg: '1.a' })).toBe('1.a')
    expect(readConfigurationParam({})).toBeUndefined()
  })
})
