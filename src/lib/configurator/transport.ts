import { z } from 'zod'
import { CUSTOM_FORMAT_VALUE, type CustomFormatUnit, type ProductConfigurationState } from './types'

/**
 * URL-safe transport of a product configuration (Sprint 4).
 *
 * One serializer, one parser, used by the product page ("Obtenir mon devis",
 * "Modifier"), the checkout page and the submit action. The payload is the
 * *machine values* of the configurator state — never labels, never row ids,
 * never prices — wrapped in a version prefix so the format can evolve:
 *
 *   `1.<base64url(JSON)>`
 *
 * It is untrusted input by construction: parsing only checks the *shape*
 * (types, lengths, known keys). Whether a value is actually offered by the
 * product is decided server-side by `resolveConfiguration`.
 */

export const CONFIGURATION_TRANSPORT_VERSION = 1
/** Query-string parameter that carries the transport. */
export const CONFIGURATION_PARAM = 'cfg'

/** Hard ceilings: a legitimate configuration is far below these. */
const MAX_TRANSPORT_LENGTH = 2000
const MAX_VALUE_LENGTH = 200
const MAX_FINISHES = 20

type SingleKey = keyof ProductConfigurationState['single']

/** Compact wire keys, in the fixed order used when serializing. */
const SINGLE_WIRE_KEYS: Record<SingleKey, string> = {
  format: 'f',
  orientation: 'o',
  pageCount: 'p',
  printSides: 's',
  colorMode: 'c',
  material: 'm',
  grammage: 'g',
  quantity: 'q',
}

const SINGLE_KEYS = Object.keys(SINGLE_WIRE_KEYS) as SingleKey[]

const wireString = z.string().min(1).max(MAX_VALUE_LENGTH)

const wireSchema = z
  .object({
    f: wireString.optional(),
    o: wireString.optional(),
    p: wireString.optional(),
    s: wireString.optional(),
    c: wireString.optional(),
    m: wireString.optional(),
    g: wireString.optional(),
    q: wireString.optional(),
    /** finishes (multi-select) */
    n: z.array(wireString).max(MAX_FINISHES).optional(),
    /** custom format: [width, height, unit] */
    x: z.tuple([z.string().max(40), z.string().max(40), z.enum(['mm', 'cm'])]).optional(),
  })
  .strict()

/** What a transport decodes to. Raw, untrusted values — see `resolveConfiguration`. */
export interface TransportedConfiguration {
  single: Partial<Record<SingleKey, string>>
  finishes: string[]
  customFormat?: { width: string; height: string; unit: CustomFormatUnit }
}

export type ParsedConfigurationTransport =
  | { status: 'empty' }
  | { status: 'invalid'; reason: string }
  | { status: 'ok'; configuration: TransportedConfiguration }

/* ---------- base64url helpers (UTF-8 safe, work in Node and the browser) ---------- */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(encoded: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error('not base64url')
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(encoded.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

/* ---------- serialize ---------- */

/**
 * Serializes configurator state. Returns `undefined` when nothing is
 * selected (so callers add no parameter at all). Output is deterministic:
 * fixed key order, finishes in the order held by the state (CMS order),
 * custom-format dimensions only while "Sur mesure" is the chosen format.
 */
export function serializeConfiguration(state: ProductConfigurationState): string | undefined {
  const wire: Record<string, unknown> = {}

  for (const key of SINGLE_KEYS) {
    const value = state.single[key]?.trim()
    if (value) wire[SINGLE_WIRE_KEYS[key]] = value
  }

  const finishes = (state.multiple.finish ?? []).filter(Boolean)
  if (finishes.length) wire.n = finishes

  if (state.single.format === CUSTOM_FORMAT_VALUE) {
    const width = state.customFormat.width.trim()
    const height = state.customFormat.height.trim()
    if (width || height) wire.x = [width, height, state.customFormat.unit]
  }

  if (!Object.keys(wire).length) return undefined
  return `${CONFIGURATION_TRANSPORT_VERSION}.${toBase64Url(JSON.stringify(wire))}`
}

/* ---------- parse ---------- */

/**
 * Parses a transport string. Never throws: a missing value is `empty`;
 * anything malformed, oversized, from an unknown version or carrying
 * unknown keys is `invalid` and must be ignored by the caller (fail closed).
 */
export function parseConfigurationTransport(raw: string | null | undefined): ParsedConfigurationTransport {
  if (raw === undefined || raw === null || raw === '') return { status: 'empty' }
  if (typeof raw !== 'string' || raw.length > MAX_TRANSPORT_LENGTH) {
    return { status: 'invalid', reason: 'too-long' }
  }

  const separator = raw.indexOf('.')
  if (separator < 1) return { status: 'invalid', reason: 'malformed' }
  if (raw.slice(0, separator) !== String(CONFIGURATION_TRANSPORT_VERSION)) {
    return { status: 'invalid', reason: 'unknown-version' }
  }

  let json: unknown
  try {
    json = JSON.parse(fromBase64Url(raw.slice(separator + 1)))
  } catch {
    return { status: 'invalid', reason: 'malformed' }
  }

  const parsed = wireSchema.safeParse(json)
  if (!parsed.success) return { status: 'invalid', reason: 'invalid-shape' }

  const wire = parsed.data
  const single: TransportedConfiguration['single'] = {}
  for (const key of SINGLE_KEYS) {
    const value = wire[SINGLE_WIRE_KEYS[key] as keyof typeof wire]
    if (typeof value === 'string') single[key] = value
  }

  const configuration: TransportedConfiguration = {
    single,
    finishes: [...new Set(wire.n ?? [])],
  }
  if (wire.x) configuration.customFormat = { width: wire.x[0], height: wire.x[1], unit: wire.x[2] }

  return { status: 'ok', configuration }
}

/* ---------- URLs ---------- */

type SearchParamValue = string | string[] | undefined

/** Reads the transport param from Next's `searchParams` (first value wins). */
export function readConfigurationParam(params: Record<string, SearchParamValue>): string | undefined {
  const value = params[CONFIGURATION_PARAM]
  return Array.isArray(value) ? value[0] : value
}

/** `/produits/<slug>` with the configuration restored — the checkout's "Modifier" link. */
export function buildProductConfigurationHref(slug: string, transport?: string): string {
  const base = `/produits/${encodeURIComponent(slug)}`
  if (!transport) return base
  const query = new URLSearchParams({ [CONFIGURATION_PARAM]: transport })
  return `${base}?${query.toString()}`
}

/** `/demande-de-devis?produit=<slug>[&cfg=…]` — where "Obtenir mon devis" leads. */
export function buildQuoteCheckoutHref(slug: string, transport?: string): string {
  const query = new URLSearchParams({ produit: slug })
  if (transport) query.set(CONFIGURATION_PARAM, transport)
  return `/demande-de-devis?${query.toString()}`
}
