import {
  CUSTOM_FORMAT_VALUE,
  type ConfigurationSummaryRow,
  type ConfiguratorGroup,
  type CustomFormatUnit,
  type ProductConfigurationState,
  type ProductConfiguratorData,
} from './types'
import { CUSTOM_FORMAT_LABEL } from './labels'
import { buildQuoteCheckoutHref, serializeConfiguration } from './transport'

type SingleKey = keyof ProductConfigurationState['single']

const isMultiple = (group: ConfiguratorGroup) => group.selectionMode === 'multiple'

/**
 * Starting state. The only thing chosen for the visitor is a group that has
 * exactly one valid option; groups with several options start empty — no
 * silent preference, no "recommended" default.
 */
export function createInitialConfigurationState(data: ProductConfiguratorData): ProductConfigurationState {
  const state: ProductConfigurationState = {
    single: {},
    multiple: {},
    customFormat: { width: '', height: '', unit: 'mm' },
  }

  for (const group of data.groups) {
    if (group.options.length !== 1) continue
    const [only] = group.options
    if (isMultiple(group)) state.multiple.finish = [only.value]
    else state.single[group.key as SingleKey] = only.value
  }

  return state
}

/** Single-choice groups: choosing an option replaces the previous choice. */
export function selectSingleOption(
  state: ProductConfigurationState,
  key: SingleKey,
  value: string,
): ProductConfigurationState {
  return { ...state, single: { ...state.single, [key]: value } }
}

/** Multi-choice groups: toggles `value`, keeping the CMS option order. */
export function toggleMultipleOption(
  state: ProductConfigurationState,
  group: ConfiguratorGroup,
  value: string,
): ProductConfigurationState {
  const current = new Set(state.multiple.finish ?? [])
  if (current.has(value)) current.delete(value)
  else current.add(value)
  const ordered = group.options.map((option) => option.value).filter((optionValue) => current.has(optionValue))
  return { ...state, multiple: { ...state.multiple, finish: ordered } }
}

export function updateCustomFormat(
  state: ProductConfigurationState,
  patch: Partial<{ width: string; height: string; unit: CustomFormatUnit }>,
): ProductConfigurationState {
  return { ...state, customFormat: { ...state.customFormat, ...patch } }
}

function customFormatText(custom: ProductConfigurationState['customFormat']): string {
  const width = custom.width.trim()
  const height = custom.height.trim()
  if (width && height) return `${width} × ${height} ${custom.unit}`
  if (width) return `${CUSTOM_FORMAT_LABEL} — largeur ${width} ${custom.unit}`
  if (height) return `${CUSTOM_FORMAT_LABEL} — hauteur ${height} ${custom.unit}`
  return CUSTOM_FORMAT_LABEL
}

/**
 * Derives the summary from state alone: only selected values, in group
 * order, as French labels — never machine values, never placeholders.
 */
export function buildConfigurationSummary(
  data: ProductConfiguratorData,
  state: ProductConfigurationState,
): ConfigurationSummaryRow[] {
  const rows: ConfigurationSummaryRow[] = []

  for (const group of data.groups) {
    if (isMultiple(group)) {
      const selected = new Set(state.multiple.finish ?? [])
      const labels = group.options.filter((option) => selected.has(option.value)).map((option) => option.label)
      if (labels.length) rows.push({ key: group.key, label: group.label, value: labels.join(', ') })
      continue
    }

    const selectedValue = state.single[group.key as SingleKey]
    const option = group.options.find((candidate) => candidate.value === selectedValue)
    if (!option) continue
    const value = option.value === CUSTOM_FORMAT_VALUE ? customFormatText(state.customFormat) : option.label
    rows.push({ key: group.key, label: group.label, value })
  }

  return rows
}

/**
 * Where the "Obtenir mon devis" button leads: the checkout, carrying the
 * product and (when anything is selected) the serialized configuration.
 * Without state it is the plain product link of Sprint 2.
 */
export function buildQuoteHref(slug: string, state?: ProductConfigurationState): string {
  return buildQuoteCheckoutHref(slug, state ? serializeConfiguration(state) : undefined)
}
