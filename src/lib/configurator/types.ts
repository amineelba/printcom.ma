import type { ResponsiveImageMedia } from '@/components/ui/ResponsiveImage'

/**
 * Serializable view-model of a product's configurable choices. Built on the
 * server from a Payload `Product` (see buildProductConfiguratorData) and
 * handed to the client configurator — nothing in here references Payload.
 */

/** Trimmed copy of a Media document: only what the UI renders. */
export type ConfiguratorMedia = ResponsiveImageMedia & { id: string }

/**
 * Canonical keys of the nine "core" dimensions every product may use. They
 * are ordinary technical dimensions (registry keys, see
 * docs/product-technical-schema.md) — the only ones whose answers also map
 * onto the historical structured fields of a quote request.
 */
export const CORE_DIMENSION_KEYS = {
  format: 'format',
  orientation: 'orientation',
  pageCount: 'page-count',
  printSides: 'print-sides',
  colorMode: 'color-mode',
  material: 'material',
  grammage: 'grammage',
  finish: 'finish',
  quantity: 'quantity',
} as const

/** A dimension's registry key (`format`, `page-count`, `fenetre`, …). */
export type ConfiguratorGroupKey = string

export type ConfiguratorValueType = 'single-choice' | 'multi-choice' | 'dimensions' | 'number' | 'text' | 'boolean'

export type ConfiguratorSelectionMode = 'single' | 'multiple'

export function groupValueType(group: Pick<ConfiguratorGroup, 'valueType' | 'selectionMode'>): ConfiguratorValueType {
  return group.valueType ?? (group.selectionMode === 'multiple' ? 'multi-choice' : 'single-choice')
}

/** Machine value of the synthetic "Sur mesure" format option. */
export const CUSTOM_FORMAT_VALUE = '__custom__'

export interface ConfiguratorOption {
  /** Unique within the group; used for DOM ids and React keys. */
  id: string
  /** Stable machine value stored in the configuration state. */
  value: string
  /** Public label shown in the UI and summary. */
  label: string
  description?: string
  /** Thumbnail shown inside the option card when the CMS has one. */
  image?: ConfiguratorMedia
  /**
   * Seam for a later sprint: an option-specific image that could drive the
   * main product preview. Not populated or consumed yet.
   */
  previewImage?: ConfiguratorMedia
  /** True only for the synthetic "Sur mesure" option. */
  isCustom?: boolean
}

export interface ConfiguratorGroup {
  key: ConfiguratorGroupKey
  label: string
  /** Defaults to single/multi-choice according to `selectionMode`. */
  valueType?: ConfiguratorValueType
  selectionMode: ConfiguratorSelectionMode
  /** Unit shown next to a `number` input (registry `unit`). */
  unit?: string
  /** Short hint rendered under the group title, when one is warranted. */
  hint?: string
  options: ConfiguratorOption[]
}

export interface ProductConfiguratorData {
  product: {
    id: string
    slug: string
    title: string
    categoryLabel?: string
  }
  /** Primary image first, then gallery; de-duplicated. */
  media: ConfiguratorMedia[]
  groups: ConfiguratorGroup[]
  customFormatAvailable: boolean
}

export type CustomFormatUnit = 'mm' | 'cm'

/** Three-axis measure typed by the visitor (`dimensions` dimensions). */
export interface MeasureValue {
  width: string
  height: string
  /** Optional third axis (boxes, displays…). Empty when not used. */
  depth: string
  unit: CustomFormatUnit
}

/**
 * The single source of truth for what the visitor has chosen, keyed by
 * dimension key. Values are option `value`s (machine values), never labels —
 * the summary resolves labels from the group data. One plain object, so it
 * serializes straight into the quote hand-off (transport v2).
 */
export interface ProductConfigurationState {
  /** Single-choice dimensions: key → selected option value. */
  single: Record<string, string>
  /** Multi-choice dimensions: key → selected option values, in schema order. */
  multiple: Record<string, string[]>
  /** The "Sur mesure" size of the `format` dimension. */
  customFormat: { width: string; height: string; unit: CustomFormatUnit }
  /** `dimensions` dimensions other than `format`. */
  measures: Record<string, MeasureValue>
  /** `number` dimensions (kept as the typed text; validated server-side). */
  numbers: Record<string, string>
  /** `text` dimensions (short, never personal data). */
  texts: Record<string, string>
  /** `boolean` dimensions. */
  flags: Record<string, boolean>
}

export function emptyConfigurationState(): ProductConfigurationState {
  return {
    single: {},
    multiple: {},
    customFormat: { width: '', height: '', unit: 'mm' },
    measures: {},
    numbers: {},
    texts: {},
    flags: {},
  }
}

export interface ConfigurationSummaryRow {
  key: ConfiguratorGroupKey
  label: string
  value: string
}
