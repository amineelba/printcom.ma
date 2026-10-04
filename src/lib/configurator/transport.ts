import { z } from 'zod'
import {
  CORE_DIMENSION_KEYS,
  CUSTOM_FORMAT_VALUE,
  type CustomFormatUnit,
  type MeasureValue,
  type ProductConfigurationState,
} from './types'

/**
 * URL-safe transport of a product configuration.
 *
 * One serializer, one parser, used by the product page ("Obtenir mon devis",
 * "Modifier"), the checkout page and the submit action. The payload is the
 * *machine values* of the configurator state — never labels, never row ids,
 * never prices — wrapped in a version prefix so the format can evolve:
 *
 *   `<version>.<base64url(JSON)>`
 *
 * - **v1** (Sprint 4): fixed keys for the nine core dimensions. Still
 *   parsed, never emitted.
 * - **v2** (Sprint 5): generic maps keyed by dimension key, so
 *   product-specific dimensions travel too. Always emitted.
 *
 * It is untrusted input by construction: parsing only checks the *shape*
 * (types, lengths, known keys). Whether a dimension/value is actually
 * offered by the product is decided server-side by `resolveConfiguration`.
 * v1 is parsed into the same generic structure — it is never reinterpreted.
 */

export const CONFIGURATION_TRANSPORT_VERSION = 2
export const SUPPORTED_TRANSPORT_VERSIONS = [1, 2] as const
/** Query-string parameter that carries the transport. */
export const CONFIGURATION_PARAM = 'cfg'

/** Hard ceilings: a legitimate configuration is far below these. */
const MAX_TRANSPORT_LENGTH = 4000
const MAX_VALUE_LENGTH = 200
const MAX_TEXT_LENGTH = 80
const MAX_CHOICES = 30
const MAX_DIMENSIONS = 40

const DIMENSION_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const unit = z.enum(['mm', 'cm'])
const dimensionKey = z.string().max(60).regex(DIMENSION_KEY)
const wireString = z.string().min(1).max(MAX_VALUE_LENGTH)

function keyedMap<T extends z.ZodTypeAny>(value: T) {
  return z.record(dimensionKey, value).refine((record) => Object.keys(record).length <= MAX_DIMENSIONS)
}

const wireV2 = z
  .object({
    /** single-choice: key → value */
    s: keyedMap(wireString).optional(),
    /** multi-choice: key → values */
    m: keyedMap(z.array(wireString).max(MAX_CHOICES)).optional(),
    /** custom format: [width, height, unit] */
    c: z.tuple([z.string().max(40), z.string().max(40), unit]).optional(),
    /** measures: key → [width, height, depth, unit] */
    d: keyedMap(z.tuple([z.string().max(40), z.string().max(40), z.string().max(40), unit])).optional(),
    /** numbers: key → typed number */
    n: keyedMap(z.string().min(1).max(40)).optional(),
    /** short texts: key → text */
    t: keyedMap(z.string().min(1).max(MAX_TEXT_LENGTH)).optional(),
    /** booleans: key → 1 (only `true` is ever transported) */
    b: keyedMap(z.literal(1)).optional(),
  })
  .strict()

/** Sprint 4 payload: fixed keys. */
const wireV1 = z
  .object({
    f: wireString.optional(),
    o: wireString.optional(),
    p: wireString.optional(),
    s: wireString.optional(),
    c: wireString.optional(),
    m: wireString.optional(),
    g: wireString.optional(),
    q: wireString.optional(),
    n: z.array(wireString).max(20).optional(),
    x: z.tuple([z.string().max(40), z.string().max(40), unit]).optional(),
  })
  .strict()

const V1_SINGLE_KEYS: Record<string, string> = {
  f: CORE_DIMENSION_KEYS.format,
  o: CORE_DIMENSION_KEYS.orientation,
  p: CORE_DIMENSION_KEYS.pageCount,
  s: CORE_DIMENSION_KEYS.printSides,
  c: CORE_DIMENSION_KEYS.colorMode,
  m: CORE_DIMENSION_KEYS.material,
  g: CORE_DIMENSION_KEYS.grammage,
  q: CORE_DIMENSION_KEYS.quantity,
}

/** What a transport decodes to. Raw, untrusted values — see `resolveConfiguration`. */
export interface TransportedConfiguration {
  single: Record<string, string>
  multiple: Record<string, string[]>
  customFormat?: { width: string; height: string; unit: CustomFormatUnit }
  measures: Record<string, MeasureValue>
  numbers: Record<string, string>
  texts: Record<string, string>
  flags: Record<string, boolean>
}

export function emptyTransportedConfiguration(): TransportedConfiguration {
  return { single: {}, multiple: {}, measures: {}, numbers: {}, texts: {}, flags: {} }
}

export type ParsedConfigurationTransport =
  | { status: 'empty' }
  | { status: 'invalid'; reason: string }
  | { status: 'ok'; configuration: TransportedConfiguration; version: number }

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

const sortedEntries = <T>(record: Record<string, T>): [string, T][] =>
  Object.entries(record).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

/* ---------- serialize ---------- */

/**
 * Serializes configurator state as transport v2. Returns `undefined` when
 * nothing is selected (so callers add no parameter at all). Output is
 * deterministic: dimension keys sorted, choices in the state's (schema)
 * order, custom-format dimensions only while "Sur mesure" is the chosen
 * format, blank values omitted.
 */
export function serializeConfiguration(state: ProductConfigurationState): string | undefined {
  const wire: Record<string, unknown> = {}

  const single: Record<string, string> = {}
  for (const [key, value] of sortedEntries(state.single)) {
    if (value?.trim()) single[key] = value
  }
  if (Object.keys(single).length) wire.s = single

  const multiple: Record<string, string[]> = {}
  for (const [key, values] of sortedEntries(state.multiple)) {
    const kept = (values ?? []).filter(Boolean)
    if (kept.length) multiple[key] = kept
  }
  if (Object.keys(multiple).length) wire.m = multiple

  if (state.single[CORE_DIMENSION_KEYS.format] === CUSTOM_FORMAT_VALUE) {
    const width = state.customFormat.width.trim()
    const height = state.customFormat.height.trim()
    if (width || height) wire.c = [width, height, state.customFormat.unit]
  }

  const measures: Record<string, [string, string, string, CustomFormatUnit]> = {}
  for (const [key, measure] of sortedEntries(state.measures)) {
    const width = measure.width.trim()
    const height = measure.height.trim()
    const depth = measure.depth.trim()
    if (width || height || depth) measures[key] = [width, height, depth, measure.unit]
  }
  if (Object.keys(measures).length) wire.d = measures

  const numbers: Record<string, string> = {}
  for (const [key, value] of sortedEntries(state.numbers)) if (value.trim()) numbers[key] = value.trim()
  if (Object.keys(numbers).length) wire.n = numbers

  const texts: Record<string, string> = {}
  for (const [key, value] of sortedEntries(state.texts)) if (value.trim()) texts[key] = value.trim().slice(0, MAX_TEXT_LENGTH)
  if (Object.keys(texts).length) wire.t = texts

  const flags: Record<string, 1> = {}
  for (const [key, value] of sortedEntries(state.flags)) if (value) flags[key] = 1
  if (Object.keys(flags).length) wire.b = flags

  if (!Object.keys(wire).length) return undefined
  return `${CONFIGURATION_TRANSPORT_VERSION}.${toBase64Url(JSON.stringify(wire))}`
}

/* ---------- parse ---------- */

function parseV1(json: unknown): TransportedConfiguration | undefined {
  const parsed = wireV1.safeParse(json)
  if (!parsed.success) return undefined
  const wire = parsed.data
  const configuration = emptyTransportedConfiguration()
  for (const [wireKey, dimension] of Object.entries(V1_SINGLE_KEYS)) {
    const value = wire[wireKey as keyof typeof wire]
    if (typeof value === 'string') configuration.single[dimension] = value
  }
  if (wire.n?.length) configuration.multiple[CORE_DIMENSION_KEYS.finish] = [...new Set(wire.n)]
  if (wire.x) configuration.customFormat = { width: wire.x[0], height: wire.x[1], unit: wire.x[2] }
  return configuration
}

function parseV2(json: unknown): TransportedConfiguration | undefined {
  const parsed = wireV2.safeParse(json)
  if (!parsed.success) return undefined
  const wire = parsed.data
  const configuration = emptyTransportedConfiguration()
  configuration.single = { ...wire.s }
  for (const [key, values] of Object.entries(wire.m ?? {})) configuration.multiple[key] = [...new Set(values)]
  if (wire.c) configuration.customFormat = { width: wire.c[0], height: wire.c[1], unit: wire.c[2] }
  for (const [key, [width, height, depth, measureUnit]] of Object.entries(wire.d ?? {})) {
    configuration.measures[key] = { width, height, depth, unit: measureUnit }
  }
  configuration.numbers = { ...wire.n }
  configuration.texts = { ...wire.t }
  for (const key of Object.keys(wire.b ?? {})) configuration.flags[key] = true
  return configuration
}

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
  const version = Number(raw.slice(0, separator))
  if (!(SUPPORTED_TRANSPORT_VERSIONS as readonly number[]).includes(version) || String(version) !== raw.slice(0, separator)) {
    return { status: 'invalid', reason: 'unknown-version' }
  }

  let json: unknown
  try {
    json = JSON.parse(fromBase64Url(raw.slice(separator + 1)))
  } catch {
    return { status: 'invalid', reason: 'malformed' }
  }

  const configuration = version === 1 ? parseV1(json) : parseV2(json)
  if (!configuration) return { status: 'invalid', reason: 'invalid-shape' }
  return { status: 'ok', configuration, version }
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

