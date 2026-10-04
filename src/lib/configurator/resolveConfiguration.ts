import type { Product } from '@/payload-types'
import { buildProductConfiguratorModel } from './buildProductConfiguratorData'
import type { CatalogueRef } from './configuratorShared'
import { CUSTOM_FORMAT_LABEL } from './labels'
import { parseDimension } from './safeCount'
import { buildConfigurationSummary, measureText } from './state'
import {
  emptyTransportedConfiguration,
  serializeConfiguration,
  type ParsedConfigurationTransport,
  type TransportedConfiguration,
} from './transport'
import {
  CORE_DIMENSION_KEYS as KEYS,
  CUSTOM_FORMAT_VALUE,
  emptyConfigurationState,
  groupValueType,
  type ConfigurationSummaryRow,
  type ConfiguratorGroup,
  type MeasureValue,
  type ProductConfigurationState,
} from './types'

export type ResolvedCatalogueItem = CatalogueRef

/**
 * One answer to a product-specific dimension (anything that is not one of the
 * nine core dimensions), as the server resolved it. Persisted on the quote
 * so the lead keeps what the customer chose even if the CMS changes later.
 */
export interface TechnicalSelection {
  /** Dimension registry key. */
  key: string
  /** French dimension label. */
  label: string
  /** Display value ("Soft Touch, Vernis UV", "120 × 80 × 40 mm", "Oui"…). */
  valueLabel: string
  /** Individual labels for multi-choice answers. */
  valueLabels?: string[]
  numericValue?: number
  unit?: string
}

/** Facts about the canonical configuration, in the shape persistence needs. */
export interface ResolvedSelections {
  /** Public label of the chosen format ("Sur mesure" for a custom one). */
  format?: string
  customFormat?: { width: number; height: number; unit: 'mm' | 'cm' }
  orientation?: string
  pageCount?: string
  printSides?: string
  /** Public label of the chosen colour mode. */
  colorMode?: string
  material?: ResolvedCatalogueItem
  grammage?: string
  finishes: ResolvedCatalogueItem[]
  quantity?: string
  /** Every other dimension of the product, in schema order. */
  technical: TechnicalSelection[]
}

/**
 * A configuration the server has checked against the *current published*
 * product: only offered options survive, everything else is dropped.
 */
export interface ResolvedConfiguration {
  /** Canonical, restorable state — feeds the configurator and the summary. */
  state: ProductConfigurationState
  /** Selected rows only, French labels (shared with the configurator summary). */
  rows: ConfigurationSummaryRow[]
  /** Canonical re-serialization (always the newest transport version). */
  transport?: string
  selections: ResolvedSelections
  /** How many transported entries were rejected (stale, foreign or tampered). */
  rejectedCount: number
  /** Why the whole transport was ignored, when it was. */
  transportIssue?: string
  /** Which definition produced the product's options. */
  source: 'schema' | 'legacy'
}

export interface LegacyConfigurationSlugs {
  materialSlug?: string
  finishSlug?: string
}

/** Merges the legacy `?support=` / `?finition=` slugs under (never over) the transport. */
function mergeLegacy(
  transported: TransportedConfiguration,
  legacy: LegacyConfigurationSlugs | undefined,
): TransportedConfiguration {
  if (!legacy?.materialSlug && !legacy?.finishSlug) return transported
  const merged: TransportedConfiguration = {
    ...transported,
    single: { ...transported.single },
    multiple: { ...transported.multiple },
  }
  if (legacy.materialSlug && !merged.single[KEYS.material]) merged.single[KEYS.material] = legacy.materialSlug
  if (legacy.finishSlug && !merged.multiple[KEYS.finish]?.length) merged.multiple[KEYS.finish] = [legacy.finishSlug]
  return merged
}

function normalizeMeasure(measure: MeasureValue): MeasureValue | undefined {
  const axis = (value: string) => {
    const parsed = parseDimension(value)
    return parsed === undefined ? '' : String(parsed)
  }
  const normalized: MeasureValue = {
    width: axis(measure.width),
    height: axis(measure.height),
    depth: axis(measure.depth),
    unit: measure.unit,
  }
  return normalized.width || normalized.height || normalized.depth ? normalized : undefined
}

const stripControl = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Canonicalizes an untrusted transported configuration against the product.
 *
 * Each transported dimension is checked against *that product's own*
 * configuration groups: the dimension must belong to the product, the value
 * must be offered by that product's allowlist now, and the value's kind must
 * match the dimension's type. Rejected: another product's dimension or
 * option, unpublished materials/finishes, renamed or removed options,
 * dimensions the product doesn't define, custom values the schema doesn't
 * allow, non-positive or non-numeric measures. Nothing is invented — no
 * auto-selected defaults, no filled gaps — and a malformed / unknown-version
 * transport yields an empty configuration.
 *
 * Pure: takes the product, returns plain data.
 */
export function resolveProductConfiguration(args: {
  product: Product
  transport: ParsedConfigurationTransport
  legacy?: LegacyConfigurationSlugs
}): ResolvedConfiguration {
  const model = buildProductConfiguratorModel(args.product)
  const transported = args.transport.status === 'ok' ? args.transport.configuration : emptyTransportedConfiguration()

  const resolved = resolveAgainstModel(model.data.groups, mergeLegacy(transported, args.legacy), model)
  if (args.transport.status === 'invalid') resolved.transportIssue = args.transport.reason
  return resolved
}

function resolveAgainstModel(
  groups: ConfiguratorGroup[],
  transported: TransportedConfiguration,
  model: ReturnType<typeof buildProductConfiguratorModel>,
): ResolvedConfiguration {
  const state = emptyConfigurationState()
  const byKey = new Map(groups.map((group) => [group.key, group]))
  let rejectedCount = 0

  const offered = (group: ConfiguratorGroup) => new Set(group.options.map((option) => option.value))

  for (const [key, value] of Object.entries(transported.single)) {
    const group = byKey.get(key)
    if (group && groupValueType(group) === 'single-choice' && offered(group).has(value)) state.single[key] = value
    else rejectedCount += 1
  }

  for (const [key, values] of Object.entries(transported.multiple)) {
    const group = byKey.get(key)
    if (group && groupValueType(group) === 'multi-choice') {
      const requested = new Set(values)
      const kept = group.options.map((option) => option.value).filter((value) => requested.has(value))
      rejectedCount += requested.size - kept.length
      if (kept.length) state.multiple[key] = kept
    } else {
      rejectedCount += values.length
    }
  }

  if (transported.customFormat) {
    if (state.single[KEYS.format] === CUSTOM_FORMAT_VALUE) {
      const normalized = normalizeMeasure({ ...transported.customFormat, depth: '' })
      state.customFormat = {
        width: normalized?.width ?? '',
        height: normalized?.height ?? '',
        unit: transported.customFormat.unit,
      }
    } else {
      rejectedCount += 1
    }
  }

  for (const [key, measure] of Object.entries(transported.measures)) {
    const group = byKey.get(key)
    const normalized = group && groupValueType(group) === 'dimensions' ? normalizeMeasure(measure) : undefined
    if (normalized) state.measures[key] = normalized
    else rejectedCount += 1
  }

  for (const [key, value] of Object.entries(transported.numbers)) {
    const group = byKey.get(key)
    const parsed = group && groupValueType(group) === 'number' ? parseDimension(value) : undefined
    if (parsed !== undefined) state.numbers[key] = String(parsed)
    else rejectedCount += 1
  }

  for (const [key, value] of Object.entries(transported.texts)) {
    const group = byKey.get(key)
    const text = group && groupValueType(group) === 'text' ? stripControl(value).slice(0, 80) : ''
    if (text) state.texts[key] = text
    else rejectedCount += 1
  }

  for (const [key, value] of Object.entries(transported.flags)) {
    const group = byKey.get(key)
    if (group && groupValueType(group) === 'boolean' && value) state.flags[key] = true
    else rejectedCount += 1
  }

  const data = { ...model.data, groups }
  const rows = buildConfigurationSummary(data, state)
  const rowByKey = new Map(rows.map((row) => [row.key, row]))

  const labelOf = (key: string) => byKey.get(key)?.options.find((option) => option.value === state.single[key])?.label
  const refOf = (key: string, value: string | undefined) => (value ? model.refs[key]?.[value] : undefined)

  const customFormat =
    state.single[KEYS.format] === CUSTOM_FORMAT_VALUE
      ? (() => {
          const width = parseDimension(state.customFormat.width)
          const height = parseDimension(state.customFormat.height)
          return width !== undefined && height !== undefined
            ? { width, height, unit: state.customFormat.unit }
            : undefined
        })()
      : undefined

  const coreKeys = new Set<string>(Object.values(KEYS))
  const technical: TechnicalSelection[] = []
  for (const group of groups) {
    if (coreKeys.has(group.key)) continue
    const row = rowByKey.get(group.key)
    if (!row) continue
    const entry: TechnicalSelection = { key: group.key, label: group.label, valueLabel: row.value }
    const type = groupValueType(group)
    if (type === 'multi-choice') {
      const selected = new Set(state.multiple[group.key] ?? [])
      entry.valueLabels = group.options.filter((option) => selected.has(option.value)).map((option) => option.label)
    } else if (type === 'dimensions') {
      entry.unit = state.measures[group.key]?.unit
      entry.valueLabel = measureText(state.measures[group.key]) ?? row.value
    } else if (type === 'number') {
      entry.numericValue = Number(state.numbers[group.key])
      entry.unit = group.unit
    }
    technical.push(entry)
  }

  const selections: ResolvedSelections = {
    format: state.single[KEYS.format] === CUSTOM_FORMAT_VALUE ? CUSTOM_FORMAT_LABEL : labelOf(KEYS.format),
    customFormat,
    orientation: state.single[KEYS.orientation],
    pageCount: labelOf(KEYS.pageCount),
    printSides: state.single[KEYS.printSides],
    colorMode: labelOf(KEYS.colorMode),
    material: refOf(KEYS.material, state.single[KEYS.material]),
    grammage: labelOf(KEYS.grammage),
    finishes: (state.multiple[KEYS.finish] ?? []).flatMap((slug) => {
      const ref = refOf(KEYS.finish, slug)
      return ref ? [ref] : []
    }),
    quantity: labelOf(KEYS.quantity),
    technical,
  }

  return { state, rows, transport: serializeConfiguration(state), selections, rejectedCount, source: model.source }
}

/** True when the canonical configuration holds at least one selected value. */
export function hasSelections(configuration: ResolvedConfiguration | undefined): boolean {
  return Boolean(configuration?.rows.length)
}
