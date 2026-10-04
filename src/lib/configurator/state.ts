import {
  CUSTOM_FORMAT_VALUE,
  groupValueType,
  emptyConfigurationState,
  type ConfigurationSummaryRow,
  type ConfiguratorGroup,
  type CustomFormatUnit,
  type MeasureValue,
  type ProductConfigurationState,
  type ProductConfiguratorData,
} from './types'
import { BOOLEAN_YES_LABEL, CUSTOM_FORMAT_LABEL } from './labels'
import { buildQuoteCheckoutHref, serializeConfiguration } from './transport'

const isMultiple = (group: ConfiguratorGroup) => groupValueType(group) === 'multi-choice'

/**
 * Starting state. The only thing chosen for the visitor is a choice group
 * that has exactly one valid option; groups with several options start
 * empty — no silent preference, no "recommended" default.
 */
export function createInitialConfigurationState(data: ProductConfiguratorData): ProductConfigurationState {
  const state = emptyConfigurationState()

  for (const group of data.groups) {
    const type = groupValueType(group)
    if (type !== 'single-choice' && type !== 'multi-choice') continue
    if (group.options.length !== 1) continue
    const [only] = group.options
    if (isMultiple(group)) state.multiple[group.key] = [only.value]
    else state.single[group.key] = only.value
  }

  return state
}

/** Single-choice groups: choosing an option replaces the previous choice. */
export function selectSingleOption(
  state: ProductConfigurationState,
  key: string,
  value: string,
): ProductConfigurationState {
  return { ...state, single: { ...state.single, [key]: value } }
}

/** Multi-choice groups: toggles `value`, keeping the schema's option order. */
export function toggleMultipleOption(
  state: ProductConfigurationState,
  group: ConfiguratorGroup,
  value: string,
): ProductConfigurationState {
  const current = new Set(state.multiple[group.key] ?? [])
  if (current.has(value)) current.delete(value)
  else current.add(value)
  const ordered = group.options.map((option) => option.value).filter((optionValue) => current.has(optionValue))
  return { ...state, multiple: { ...state.multiple, [group.key]: ordered } }
}

export function updateCustomFormat(
  state: ProductConfigurationState,
  patch: Partial<{ width: string; height: string; unit: CustomFormatUnit }>,
): ProductConfigurationState {
  return { ...state, customFormat: { ...state.customFormat, ...patch } }
}

export const EMPTY_MEASURE: MeasureValue = { width: '', height: '', depth: '', unit: 'mm' }

export function updateMeasure(
  state: ProductConfigurationState,
  key: string,
  patch: Partial<MeasureValue>,
): ProductConfigurationState {
  return { ...state, measures: { ...state.measures, [key]: { ...EMPTY_MEASURE, ...state.measures[key], ...patch } } }
}

export function setNumber(state: ProductConfigurationState, key: string, value: string): ProductConfigurationState {
  return { ...state, numbers: { ...state.numbers, [key]: value } }
}

export function setText(state: ProductConfigurationState, key: string, value: string): ProductConfigurationState {
  return { ...state, texts: { ...state.texts, [key]: value } }
}

export function setFlag(state: ProductConfigurationState, key: string, value: boolean): ProductConfigurationState {
  return { ...state, flags: { ...state.flags, [key]: value } }
}

function customFormatText(custom: ProductConfigurationState['customFormat']): string {
  const width = custom.width.trim()
  const height = custom.height.trim()
  if (width && height) return `${width} × ${height} ${custom.unit}`
  if (width) return `${CUSTOM_FORMAT_LABEL} — largeur ${width} ${custom.unit}`
  if (height) return `${CUSTOM_FORMAT_LABEL} — hauteur ${height} ${custom.unit}`
  return CUSTOM_FORMAT_LABEL
}

/** "120 × 80 × 40 mm" — only the axes that were filled in; `undefined` when none. */
export function measureText(measure: MeasureValue | undefined): string | undefined {
  if (!measure) return undefined
  const axes = [measure.width, measure.height, measure.depth].map((axis) => axis.trim()).filter(Boolean)
  return axes.length ? `${axes.join(' × ')} ${measure.unit}` : undefined
}

/**
 * Derives the summary from state alone, in schema (group) order: only
 * selected values, as French labels — never machine values, never
 * placeholders. This is the one display mapper shared by the configurator,
 * the checkout summary and the emails.
 */
export function buildConfigurationSummary(
  data: ProductConfiguratorData,
  state: ProductConfigurationState,
): ConfigurationSummaryRow[] {
  const rows: ConfigurationSummaryRow[] = []

  for (const group of data.groups) {
    const push = (value: string | undefined) => {
      if (value) rows.push({ key: group.key, label: group.label, value })
    }

    switch (groupValueType(group)) {
      case 'multi-choice': {
        const selected = new Set(state.multiple[group.key] ?? [])
        push(
          group.options
            .filter((option) => selected.has(option.value))
            .map((option) => option.label)
            .join(', '),
        )
        break
      }
      case 'single-choice': {
        const option = group.options.find((candidate) => candidate.value === state.single[group.key])
        if (!option) break
        push(option.value === CUSTOM_FORMAT_VALUE ? customFormatText(state.customFormat) : option.label)
        break
      }
      case 'dimensions':
        push(measureText(state.measures[group.key]))
        break
      case 'number': {
        const value = state.numbers[group.key]?.trim()
        push(value ? (group.unit ? `${value} ${group.unit}` : value) : undefined)
        break
      }
      case 'text':
        push(state.texts[group.key]?.trim())
        break
      case 'boolean':
        push(state.flags[group.key] ? BOOLEAN_YES_LABEL : undefined)
        break
    }
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
