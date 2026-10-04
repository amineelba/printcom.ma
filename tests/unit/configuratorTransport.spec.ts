import { describe, expect, it } from 'vitest'
import {
  CONFIGURATION_PARAM,
  buildProductConfigurationHref,
  buildQuoteCheckoutHref,
  parseConfigurationTransport,
  readConfigurationParam,
  serializeConfiguration,
} from '@/lib/configurator/transport'
import { CUSTOM_FORMAT_VALUE, emptyConfigurationState, type ProductConfigurationState } from '@/lib/configurator/types'

const stateOf = (partial: Partial<ProductConfigurationState>): ProductConfigurationState => ({
  ...emptyConfigurationState(),
  ...partial,
})

const encode = (version: number, wire: unknown) =>
  `${version}.${Buffer.from(JSON.stringify(wire), 'utf8').toString('base64url')}`

const decode = (transport: string) => JSON.parse(Buffer.from(transport.slice(2), 'base64url').toString('utf8'))

describe('configuration transport — serialize (v2)', () => {
  it('returns undefined when nothing is selected (no parameter at all)', () => {
    expect(serializeConfiguration(emptyConfigurationState())).toBeUndefined()
  })

  it('is versioned v2 and URL-safe', () => {
    const transport = serializeConfiguration(stateOf({ single: { format: 'A4 / 210×297 é', grammage: '350 g' } }))!
    expect(transport.startsWith('2.')).toBe(true)
    expect(transport).toMatch(/^2\.[A-Za-z0-9_-]+$/)
    expect(encodeURIComponent(transport)).toBe(transport)
  })

  it('is deterministic whatever the insertion order', () => {
    const a = serializeConfiguration(stateOf({ single: { format: 'A4', quantity: '500', grammage: '350 g' } }))
    const b = serializeConfiguration(stateOf({ single: { grammage: '350 g', quantity: '500', format: 'A4' } }))
    expect(a).toBe(b)
  })

  it('carries multi-choice values in state order and drops blanks', () => {
    const state = stateOf({ single: { material: '  ', format: 'A5' }, multiple: { finish: ['soft-touch', 'vernis-uv'] } })
    const parsed = parseConfigurationTransport(serializeConfiguration(state))
    expect(parsed.status === 'ok' && parsed.configuration.single).toEqual({ format: 'A5' })
    expect(parsed.status === 'ok' && parsed.configuration.multiple).toEqual({ finish: ['soft-touch', 'vernis-uv'] })
  })

  it('includes custom-format dimensions only while "Sur mesure" is chosen', () => {
    const custom = stateOf({
      single: { format: CUSTOM_FORMAT_VALUE },
      customFormat: { width: '85', height: '55', unit: 'cm' },
    })
    const parsedCustom = parseConfigurationTransport(serializeConfiguration(custom))
    expect(parsedCustom.status === 'ok' && parsedCustom.configuration.customFormat).toEqual({
      width: '85',
      height: '55',
      unit: 'cm',
    })

    const stale = stateOf({ single: { format: 'A4' }, customFormat: { width: '85', height: '55', unit: 'cm' } })
    const parsedStale = parseConfigurationTransport(serializeConfiguration(stale))
    expect(parsedStale.status === 'ok' && parsedStale.configuration.customFormat).toBeUndefined()
  })

  it('never leaks ids, prices or labels beyond the selected values', () => {
    const transport = serializeConfiguration(stateOf({ single: { format: 'A4' } }))!
    expect(decode(transport)).toEqual({ s: { format: 'A4' } })
  })

  it('transports product-specific dimensions: measures, numbers, texts, booleans', () => {
    const state = stateOf({
      single: { fenetre: 'standard' },
      multiple: { fermeture: ['adhesive', 'languette'] },
      measures: { dimensions: { width: '120', height: '80', depth: '40', unit: 'mm' } },
      numbers: { 'nombre-de-feuilles': '50' },
      texts: { precision: 'coins arrondis' },
      flags: { 'elastique-eventuel': true, autre: false },
    })
    const parsed = parseConfigurationTransport(serializeConfiguration(state))
    expect(parsed).toEqual({
      status: 'ok',
      version: 2,
      configuration: {
        single: { fenetre: 'standard' },
        multiple: { fermeture: ['adhesive', 'languette'] },
        measures: { dimensions: { width: '120', height: '80', depth: '40', unit: 'mm' } },
        numbers: { 'nombre-de-feuilles': '50' },
        texts: { precision: 'coins arrondis' },
        flags: { 'elastique-eventuel': true },
      },
    })
  })
})

describe('configuration transport — parse', () => {
  it('round-trips core selections, UTF-8 included', () => {
    const state = stateOf({
      single: {
        format: CUSTOM_FORMAT_VALUE,
        orientation: 'landscape',
        'page-count': '16 pages',
        'print-sides': 'double',
        'color-mode': 'cmyk',
        material: 'couche-mat',
        grammage: '350 g',
        quantity: '1 000 ex. — étiquettes',
      },
      multiple: { finish: ['soft-touch', 'vernis-uv'] },
      customFormat: { width: '85,5', height: '55', unit: 'mm' },
    })
    const parsed = parseConfigurationTransport(serializeConfiguration(state))
    expect(parsed.status === 'ok' && parsed.configuration).toMatchObject({
      single: state.single,
      multiple: state.multiple,
      customFormat: { width: '85,5', height: '55', unit: 'mm' },
    })
  })

  it('treats a missing or blank value as empty', () => {
    expect(parseConfigurationTransport(undefined)).toEqual({ status: 'empty' })
    expect(parseConfigurationTransport(null)).toEqual({ status: 'empty' })
    expect(parseConfigurationTransport('')).toEqual({ status: 'empty' })
  })

  it.each([
    ['garbage', 'not-a-transport'],
    ['no payload', '2.'],
    ['bad base64', '2.!!!'],
    ['not json', `2.${Buffer.from('{oops', 'utf8').toString('base64url')}`],
    ['json array', encode(2, [1, 2])],
    ['unknown key', encode(2, { s: { format: 'A4' }, evil: 'x' })],
    ['wrong value type', encode(2, { s: { format: 12 } })],
    ['empty value', encode(2, { s: { format: '' } })],
    ['bad dimension key', encode(2, { s: { 'Not A Key': 'x' } })],
    ['prototype key', encode(2, { s: { __proto__: 'x' }, m: { 'a b': ['x'] } })],
    ['bad unit', encode(2, { d: { dimensions: ['1', '2', '3', 'km'] } })],
    ['multi not array', encode(2, { m: { finish: 'soft-touch' } })],
    ['too many choices', encode(2, { m: { finish: Array.from({ length: 31 }, (_, i) => `f${i}`) } })],
    ['value too long', encode(2, { s: { format: 'x'.repeat(201) } })],
    ['boolean not 1', encode(2, { b: { x: true } })],
  ])('fails closed on %s', (_name, raw) => {
    expect(parseConfigurationTransport(raw).status).toBe('invalid')
  })

  it('rejects an unknown version without reinterpreting it', () => {
    expect(parseConfigurationTransport(encode(3, { s: { format: 'A4' } }))).toEqual({
      status: 'invalid',
      reason: 'unknown-version',
    })
    expect(parseConfigurationTransport(encode(0, {})).status).toBe('invalid')
  })

  it('rejects oversized input without decoding it', () => {
    expect(parseConfigurationTransport(`2.${'A'.repeat(5000)}`)).toEqual({ status: 'invalid', reason: 'too-long' })
  })

  it('de-duplicates repeated choices', () => {
    const parsed = parseConfigurationTransport(encode(2, { m: { finish: ['a', 'a', 'b'] } }))
    expect(parsed.status === 'ok' && parsed.configuration.multiple.finish).toEqual(['a', 'b'])
  })
})

describe('configuration transport — v1 compatibility (Sprint 4 URLs)', () => {
  it('still parses a v1 payload into the generic structure, never reinterpreting it', () => {
    const v1 = encode(1, {
      f: 'A5',
      o: 'landscape',
      p: '8 pages',
      s: 'double',
      c: 'cmyk',
      m: 'offset',
      g: '350 g',
      q: '500 ex.',
      n: ['soft-touch', 'vernis-uv'],
    })
    const parsed = parseConfigurationTransport(v1)
    expect(parsed.status).toBe('ok')
    if (parsed.status !== 'ok') return
    expect(parsed.version).toBe(1)
    expect(parsed.configuration.single).toEqual({
      format: 'A5',
      orientation: 'landscape',
      'page-count': '8 pages',
      'print-sides': 'double',
      'color-mode': 'cmyk',
      material: 'offset',
      grammage: '350 g',
      quantity: '500 ex.',
    })
    expect(parsed.configuration.multiple).toEqual({ finish: ['soft-touch', 'vernis-uv'] })
  })

  it('parses a v1 custom format', () => {
    const parsed = parseConfigurationTransport(encode(1, { f: CUSTOM_FORMAT_VALUE, x: ['85', '55', 'cm'] }))
    expect(parsed.status === 'ok' && parsed.configuration.customFormat).toEqual({ width: '85', height: '55', unit: 'cm' })
  })

  it('fails closed on v1 payloads that carry v2-only keys', () => {
    expect(parseConfigurationTransport(encode(1, { s: { format: 'A4' } })).status).toBe('invalid')
  })

  it('a real Sprint 4 URL value is accepted verbatim', () => {
    // Emitted by Sprint 4 for { format: 'A5' } + the "4 pages" singleton.
    expect(parseConfigurationTransport('1.eyJmIjoiQTUiLCJwIjoiNCBwYWdlcyJ9')).toMatchObject({
      status: 'ok',
      version: 1,
      configuration: { single: { format: 'A5', 'page-count': '4 pages' } },
    })
  })
})

describe('configuration transport — URLs', () => {
  it('builds the checkout href with product and transport via URLSearchParams', () => {
    const transport = serializeConfiguration(stateOf({ single: { format: 'A4 & co' } }))!
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
    expect(buildProductConfigurationHref('cartes-de-visite', '2.abc')).toBe('/produits/cartes-de-visite?cfg=2.abc')
  })

  it('reads the first cfg value from Next search params', () => {
    expect(readConfigurationParam({ cfg: ['2.a', '2.b'] })).toBe('2.a')
    expect(readConfigurationParam({ cfg: '2.a' })).toBe('2.a')
    expect(readConfigurationParam({})).toBeUndefined()
  })
})
