import type { ConfiguratorGroupKey } from './types'

/**
 * Groups where a physical close-up/silhouette genuinely helps, so an option
 * thumbnail renders as a large image card. Every other group keeps compact
 * controls even when an editor adds an image (it becomes a small inline
 * thumbnail). Presentation is inferred from data + this list — editors never
 * pick a layout.
 */
export const LARGE_IMAGE_GROUPS: ReadonlySet<ConfiguratorGroupKey> = new Set(['format', 'material', 'finish'])

export type OptionPresentation = 'media' | 'inline' | 'text'

export function optionPresentation(groupKey: ConfiguratorGroupKey, hasImage: boolean): OptionPresentation {
  if (!hasImage) return 'text'
  return LARGE_IMAGE_GROUPS.has(groupKey) ? 'media' : 'inline'
}
