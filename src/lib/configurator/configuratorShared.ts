import type { Media } from '@/payload-types'
import type { ConfiguratorMedia, ConfiguratorOption } from './types'

/** A relationship value that Payload actually populated (not a bare id). */
export function isPopulated<T extends { id: number }>(value: T | number | null | undefined): value is T {
  return typeof value === 'object' && value !== null
}

export function toConfiguratorMedia(media: Media | number | null | undefined): ConfiguratorMedia | undefined {
  if (!isPopulated(media) || !media.url) return undefined
  return {
    id: String(media.id),
    url: media.url,
    alt: media.alt ?? null,
    width: media.width ?? null,
    height: media.height ?? null,
    sizes: {
      thumbnail: media.sizes?.thumbnail?.url ? { url: media.sizes.thumbnail.url } : undefined,
      card: media.sizes?.card?.url ? { url: media.sizes.card.url } : undefined,
      listing: media.sizes?.listing?.url ? { url: media.sizes.listing.url } : undefined,
      hero: media.sizes?.hero?.url ? { url: media.sizes.hero.url } : undefined,
    },
  }
}

/** Keeps the first option for each machine value, preserving CMS order. */
export function uniqueByValue(options: ConfiguratorOption[]): ConfiguratorOption[] {
  const seen = new Set<string>()
  return options.filter((option) => {
    if (seen.has(option.value)) return false
    seen.add(option.value)
    return true
  })
}

/** Catalogue document behind a material/finish-sourced option (server-side only). */
export interface CatalogueRef {
  id: number
  slug: string
  title: string
}

/** group key → option value → catalogue document. */
export type CatalogueRefs = Record<string, Record<string, CatalogueRef>>

/**
 * A group plus the server-only facts the resolver needs. `data` is what
 * reaches the browser; `refs` never does.
 */
export interface ProductConfiguratorModel {
  data: import('./types').ProductConfiguratorData
  refs: CatalogueRefs
  /** Which definition produced the groups. */
  source: 'schema' | 'legacy'
}
