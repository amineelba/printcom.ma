import {
  CORE_DIMENSION_KEYS,
  groupValueType,
  type ConfiguratorGroup,
  type ConfiguratorGroupKey,
  type ConfiguratorMedia,
  type ConfiguratorOption,
  type ProductConfigurationState,
} from './types'

/**
 * Which selected option's `previewImage` wins the main preview when several
 * are set. Fixed and independent of group order in the data and of click
 * order: the most "specific" physical choices first, quantity last. Within a
 * multiple-selection group (finishes) the first *selected* option in CMS
 * order wins. Groups without any `previewImage` simply never contribute —
 * today only the inline option lists (format, page count, grammage,
 * quantity) can carry one.
 */
export const PREVIEW_PRIORITY: readonly ConfiguratorGroupKey[] = [
  CORE_DIMENSION_KEYS.finish,
  CORE_DIMENSION_KEYS.material,
  CORE_DIMENSION_KEYS.format,
  CORE_DIMENSION_KEYS.orientation,
  CORE_DIMENSION_KEYS.pageCount,
  CORE_DIMENSION_KEYS.printSides,
  CORE_DIMENSION_KEYS.colorMode,
  CORE_DIMENSION_KEYS.grammage,
  CORE_DIMENSION_KEYS.quantity,
]

export interface ResolvedPreview {
  /** The image to show in the large preview, or undefined if there is none. */
  media: ConfiguratorMedia | undefined
  /** `option` when a selected option's previewImage is shown, otherwise the base media. */
  source: 'option' | 'base'
}

function selectedOptions(group: ConfiguratorGroup, state: ProductConfigurationState): ConfiguratorOption[] {
  const type = groupValueType(group)
  if (type === 'multi-choice') {
    const selected = new Set(state.multiple[group.key] ?? [])
    return group.options.filter((option) => selected.has(option.value))
  }
  if (type !== 'single-choice') return []
  const value = state.single[group.key]
  return group.options.filter((option) => option.value === value)
}

/**
 * Pure, deterministic main-preview resolution:
 *
 *   1. the first selected option (by PREVIEW_PRIORITY) that has a `previewImage`
 *   2. otherwise `baseMedia` (the current gallery/primary image)
 *
 * An option with only a thumbnail never overrides the preview, deselecting the
 * winner falls through to the next candidate, and clearing every override
 * returns to `baseMedia`. The synthetic "Sur mesure" option has no preview, so
 * switching to a custom format can never leave a stale standard-format image.
 */
export function resolvePreviewMedia({
  baseMedia,
  groups,
  selection,
}: {
  baseMedia: ConfiguratorMedia | undefined
  groups: ConfiguratorGroup[]
  selection: ProductConfigurationState
}): ResolvedPreview {
  // Core dimensions first (fixed priority), then product-specific dimensions in schema order.
  const orderedKeys = [
    ...PREVIEW_PRIORITY,
    ...groups.map((candidate) => candidate.key).filter((key) => !PREVIEW_PRIORITY.includes(key)),
  ]
  for (const key of orderedKeys) {
    const group = groups.find((candidate) => candidate.key === key)
    if (!group) continue
    const winner = selectedOptions(group, selection).find((option) => option.previewImage)
    if (winner?.previewImage) return { media: winner.previewImage, source: 'option' }
  }
  return { media: baseMedia, source: 'base' }
}
