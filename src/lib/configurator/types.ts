import type { ResponsiveImageMedia } from '@/components/ui/ResponsiveImage'

/**
 * Serializable view-model of a product's configurable choices. Built on the
 * server from a Payload `Product` (see buildProductConfiguratorData) and
 * handed to the client configurator — nothing in here references Payload.
 */

/** Trimmed copy of a Media document: only what the UI renders. */
export type ConfiguratorMedia = ResponsiveImageMedia & { id: string }

export const CONFIGURATOR_GROUP_KEYS = [
  'format',
  'orientation',
  'pageCount',
  'printSides',
  'colorMode',
  'material',
  'grammage',
  'finish',
  'quantity',
] as const

export type ConfiguratorGroupKey = (typeof CONFIGURATOR_GROUP_KEYS)[number]

export type ConfiguratorSelectionMode = 'single' | 'multiple'

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
  selectionMode: ConfiguratorSelectionMode
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

/**
 * The single source of truth for what the visitor has chosen. Values are
 * option `value`s (machine values), never labels — the summary resolves
 * labels from the group data. Kept as one plain object so a later sprint
 * can serialize it into the quote hand-off without restructuring.
 */
export interface ProductConfigurationState {
  /** Single-select groups: group key → selected option value. */
  single: Partial<Record<Exclude<ConfiguratorGroupKey, 'finish'>, string>>
  /** Multi-select groups: group key → selected option values, in CMS order. */
  multiple: Partial<Record<'finish', string[]>>
  customFormat: { width: string; height: string; unit: CustomFormatUnit }
}

export interface ConfigurationSummaryRow {
  key: ConfiguratorGroupKey
  label: string
  value: string
}
