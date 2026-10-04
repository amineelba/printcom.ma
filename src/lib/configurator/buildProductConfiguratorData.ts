import type { Finish, Material, Media, Product, ProductCategory } from '@/payload-types'
import {
  COLOR_MODE_LABELS,
  CUSTOM_FORMAT_LABEL,
  GROUP_LABELS,
  MULTIPLE_CHOICE_HINT,
  ORIENTATION_LABELS,
  PRINT_SIDES_LABELS,
} from './labels'
import {
  CUSTOM_FORMAT_VALUE,
  type ConfiguratorGroup,
  type ConfiguratorGroupKey,
  type ConfiguratorMedia,
  type ConfiguratorOption,
  type ProductConfiguratorData,
} from './types'

/** A relationship value that Payload actually populated (not a bare id). */
function isPopulated<T extends { id: number }>(value: T | number | null | undefined): value is T {
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
function uniqueByValue(options: ConfiguratorOption[]): ConfiguratorOption[] {
  const seen = new Set<string>()
  return options.filter((option) => {
    if (seen.has(option.value)) return false
    seen.add(option.value)
    return true
  })
}

/**
 * Label-only array fields (formats, page counts, grammages, quantities).
 * The CMS label is the public value — it is never parsed, slugified into a
 * business identifier, or reinterpreted.
 */
function labelOptions(
  key: ConfiguratorGroupKey,
  items: { id?: string | null; label?: string | null }[] | null | undefined,
): ConfiguratorOption[] {
  return uniqueByValue(
    (items ?? []).flatMap((item, index) => {
      const label = item?.label?.trim()
      if (!label) return []
      return [{ id: `${key}-${item.id ?? index}`, value: label, label }]
    }),
  )
}

/** Select-type fields: machine value stays the identity, French label is display only. */
function enumOptions(
  key: ConfiguratorGroupKey,
  values: readonly string[] | null | undefined,
  labels: Record<string, string>,
): ConfiguratorOption[] {
  return uniqueByValue(
    (values ?? []).flatMap((value) => {
      const label = labels[value]
      return label ? [{ id: `${key}-${value}`, value, label }] : []
    }),
  )
}

/**
 * Relationship options (materials, finishes). Only published documents are
 * exposed: a populated relationship doesn't re-check access control, and a
 * draft entry must never become public through a product page.
 */
function relationOptions(
  key: ConfiguratorGroupKey,
  docs: (Material | Finish | number)[] | null | undefined,
): ConfiguratorOption[] {
  return uniqueByValue(
    (docs ?? []).flatMap((doc) => {
      if (!isPopulated(doc) || doc.status !== 'published') return []
      const option: ConfiguratorOption = {
        id: `${key}-${doc.id}`,
        value: doc.slug,
        label: doc.title,
        description: doc.shortDescription?.trim() || undefined,
        image: toConfiguratorMedia(doc.image),
      }
      return [option]
    }),
  )
}

function group(
  key: ConfiguratorGroupKey,
  options: ConfiguratorOption[],
  extra: Partial<Pick<ConfiguratorGroup, 'selectionMode' | 'hint'>> = {},
): ConfiguratorGroup[] {
  if (!options.length) return []
  return [{ key, label: GROUP_LABELS[key], selectionMode: extra.selectionMode ?? 'single', hint: extra.hint, options }]
}

/**
 * Normalizes a Payload product (fetched at depth 2) into the serializable
 * configurator view-model. Pure: no I/O, no Payload runtime. Groups follow
 * a fixed order and are omitted when the CMS has no values for them; nothing
 * is invented, ranked or marked "recommended".
 *
 * Not modelled yet (see docs/product-configurator.md): dimensions specific to
 * a product family (packaging, labels, roll-ups…) and any dependency between
 * options.
 */
export function buildProductConfiguratorData(product: Product): ProductConfiguratorData {
  const customFormatAvailable = Boolean(product.customFormatAvailable)

  const formatOptions = labelOptions('format', product.availableFormats)
  if (customFormatAvailable) {
    formatOptions.push({
      id: 'format-custom',
      value: CUSTOM_FORMAT_VALUE,
      label: CUSTOM_FORMAT_LABEL,
      isCustom: true,
    })
  }

  const groups: ConfiguratorGroup[] = [
    ...group('format', formatOptions),
    ...group('orientation', enumOptions('orientation', product.orientations, ORIENTATION_LABELS)),
    ...group('pageCount', labelOptions('pageCount', product.pageCountOptions)),
    ...group('printSides', enumOptions('printSides', product.printSides, PRINT_SIDES_LABELS)),
    ...group('colorMode', enumOptions('colorMode', product.colorModes, COLOR_MODE_LABELS)),
    ...group('material', relationOptions('material', product.materials)),
    ...group('grammage', labelOptions('grammage', product.grammages)),
    // Finishes are multi-select: the quote model has always stored a list of
    // finishes (`quote-requests.configuration.finish` is hasMany). The
    // product's own `finishes` field is the set of *available* finishes and
    // says nothing about how many a customer may combine.
    ...group('finish', relationOptions('finish', product.finishes), {
      selectionMode: 'multiple',
      hint: MULTIPLE_CHOICE_HINT,
    }),
    ...group('quantity', labelOptions('quantity', product.quantities)),
  ]

  const seenMedia = new Set<string>()
  const media = [product.primaryImage, ...(product.gallery ?? [])]
    .map(toConfiguratorMedia)
    .filter((item): item is ConfiguratorMedia => {
      if (!item || seenMedia.has(item.id)) return false
      seenMedia.add(item.id)
      return true
    })

  const category = product.primaryCategory as ProductCategory | number | null | undefined

  return {
    product: {
      id: String(product.id),
      slug: product.slug,
      title: product.title,
      categoryLabel: isPopulated(category) ? category.title : undefined,
    },
    media,
    groups,
    customFormatAvailable,
  }
}
