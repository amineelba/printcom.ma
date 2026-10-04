import type { Finish, Material, Product } from '@/payload-types'
import { buildProductConfiguratorData } from './buildProductConfiguratorData'
import { buildConfigurationSummary } from './state'
import { parseDimension } from './safeCount'
import { serializeConfiguration, type ParsedConfigurationTransport, type TransportedConfiguration } from './transport'
import {
  CUSTOM_FORMAT_VALUE,
  type ConfigurationSummaryRow,
  type ConfiguratorGroup,
  type ProductConfigurationState,
  type ProductConfiguratorData,
} from './types'
import { CUSTOM_FORMAT_LABEL } from './labels'

type SingleKey = keyof ProductConfigurationState['single']

export interface ResolvedCatalogueItem {
  id: number
  slug: string
  title: string
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
  /** Canonical re-serialization; `undefined` when nothing valid is selected. */
  transport?: string
  selections: ResolvedSelections
  /** How many transported entries were rejected (stale, foreign or tampered). */
  rejectedCount: number
  /** Why the whole transport was ignored, when it was. */
  transportIssue?: string
}

export interface LegacyConfigurationSlugs {
  materialSlug?: string
  finishSlug?: string
}

const isPublishedDoc = <T extends Material | Finish>(doc: T | number): doc is T =>
  typeof doc === 'object' && doc.status === 'published'

function catalogueMap(docs: (Material | Finish | number)[] | null | undefined): Map<string, ResolvedCatalogueItem> {
  const map = new Map<string, ResolvedCatalogueItem>()
  for (const doc of docs ?? []) {
    if (isPublishedDoc(doc)) map.set(doc.slug, { id: doc.id, slug: doc.slug, title: doc.title })
  }
  return map
}

function normalizeDimension(input: string): string {
  const value = parseDimension(input)
  return value === undefined ? '' : String(value)
}

/** Merges the legacy `?support=` / `?finition=` slugs under (never over) the transport. */
function mergeLegacy(
  transported: TransportedConfiguration,
  legacy: LegacyConfigurationSlugs | undefined,
): TransportedConfiguration {
  if (!legacy?.materialSlug && !legacy?.finishSlug) return transported
  return {
    ...transported,
    single: {
      ...transported.single,
      ...(legacy.materialSlug && !transported.single.material ? { material: legacy.materialSlug } : {}),
    },
    finishes:
      legacy.finishSlug && !transported.finishes.length ? [legacy.finishSlug] : transported.finishes,
  }
}

const EMPTY_TRANSPORTED: TransportedConfiguration = { single: {}, finishes: [] }

/**
 * Canonicalizes an untrusted transported configuration against the product.
 *
 * - option values must be offered *now* by this published product — a
 *   material/finish of another product, a renamed inline option or an enum
 *   the product doesn't list is rejected;
 * - nothing is invented: no auto-selected defaults, no filled gaps;
 * - custom-format dimensions are kept only as positive numbers, and only
 *   while "Sur mesure" is the chosen format;
 * - a malformed / unknown-version transport yields an empty configuration.
 *
 * Pure: takes the product, returns plain data.
 */
export function resolveProductConfiguration(args: {
  product: Product
  transport: ParsedConfigurationTransport
  legacy?: LegacyConfigurationSlugs
}): ResolvedConfiguration {
  const data = buildProductConfiguratorData(args.product)
  const transported =
    args.transport.status === 'ok' ? args.transport.configuration : EMPTY_TRANSPORTED

  const resolved = resolveAgainstData(
    data,
    mergeLegacy(transported, args.legacy),
    { materials: catalogueMap(args.product.materials), finishes: catalogueMap(args.product.finishes) },
  )

  if (args.transport.status === 'invalid') resolved.transportIssue = args.transport.reason
  return resolved
}

function resolveAgainstData(
  data: ProductConfiguratorData,
  transported: TransportedConfiguration,
  catalogue: { materials: Map<string, ResolvedCatalogueItem>; finishes: Map<string, ResolvedCatalogueItem> },
): ResolvedConfiguration {
  const state: ProductConfigurationState = {
    single: {},
    multiple: {},
    customFormat: { width: '', height: '', unit: 'mm' },
  }
  let rejectedCount = 0

  const offered = (group: ConfiguratorGroup) => new Set(group.options.map((option) => option.value))
  const groups = new Map(data.groups.map((group) => [group.key, group]))

  for (const [key, value] of Object.entries(transported.single) as [SingleKey, string][]) {
    const group = groups.get(key)
    if (group && offered(group).has(value)) state.single[key] = value
    else rejectedCount += 1
  }

  const finishGroup = groups.get('finish')
  if (transported.finishes.length) {
    if (finishGroup) {
      const requested = new Set(transported.finishes)
      const kept = finishGroup.options.map((option) => option.value).filter((value) => requested.has(value))
      rejectedCount += requested.size - kept.length
      if (kept.length) state.multiple.finish = kept
    } else {
      rejectedCount += transported.finishes.length
    }
  }

  if (transported.customFormat) {
    if (state.single.format === CUSTOM_FORMAT_VALUE) {
      state.customFormat = {
        width: normalizeDimension(transported.customFormat.width),
        height: normalizeDimension(transported.customFormat.height),
        unit: transported.customFormat.unit,
      }
    } else {
      rejectedCount += 1
    }
  }

  const rows = buildConfigurationSummary(data, state)
  const labelOf = (key: SingleKey) =>
    groups.get(key)?.options.find((option) => option.value === state.single[key])?.label

  const customFormat =
    state.single.format === CUSTOM_FORMAT_VALUE
      ? (() => {
          const width = parseDimension(state.customFormat.width)
          const height = parseDimension(state.customFormat.height)
          return width !== undefined && height !== undefined
            ? { width, height, unit: state.customFormat.unit }
            : undefined
        })()
      : undefined

  const selections: ResolvedSelections = {
    format: state.single.format === CUSTOM_FORMAT_VALUE ? CUSTOM_FORMAT_LABEL : labelOf('format'),
    customFormat,
    orientation: state.single.orientation,
    pageCount: labelOf('pageCount'),
    printSides: state.single.printSides,
    colorMode: labelOf('colorMode'),
    material: state.single.material ? catalogue.materials.get(state.single.material) : undefined,
    grammage: labelOf('grammage'),
    finishes: (state.multiple.finish ?? []).flatMap((slug) => {
      const item = catalogue.finishes.get(slug)
      return item ? [item] : []
    }),
    quantity: labelOf('quantity'),
  }

  return { state, rows, transport: serializeConfiguration(state), selections, rejectedCount }
}

/** True when the canonical configuration holds at least one selected value. */
export function hasSelections(configuration: ResolvedConfiguration | undefined): boolean {
  return Boolean(configuration?.rows.length)
}
