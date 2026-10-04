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
  isPopulated,
  toConfiguratorMedia,
  uniqueByValue,
  type CatalogueRefs,
  type ProductConfiguratorModel,
} from './configuratorShared'
import {
  CORE_DIMENSION_KEYS as KEYS,
  CUSTOM_FORMAT_VALUE,
  type ConfiguratorGroup,
  type ConfiguratorGroupKey,
  type ConfiguratorMedia,
  type ConfiguratorOption,
} from './types'

/**
 * Legacy adapter (Sprint 2–4 model). Reads the generic configuration fields
 * that sit directly on a `Product` (availableFormats, orientations, …) and
 * turns them into the same `ConfiguratorGroup[]` the product-specific
 * `configurationSchema` produces. It stays the fallback for every product
 * whose schema has no usable row, so nothing already configured regresses.
 */

/** One row of an image-capable option list (formats, page counts, grammages, quantities). */
interface VisualOptionRow {
  id?: string | null
  label?: string | null
  description?: string | null
  image?: Media | number | null
  previewImage?: Media | number | null
}

/**
 * Inline option arrays. The CMS label is the public value and the row `id`
 * is the DOM/React identity — neither is parsed or reinterpreted, and the
 * images are metadata only. A legacy label-only row yields a plain text
 * option.
 */
function labelOptions(key: ConfiguratorGroupKey, rows: VisualOptionRow[] | null | undefined): ConfiguratorOption[] {
  return uniqueByValue(
    (rows ?? []).flatMap((row, index) => {
      const label = row?.label?.trim()
      if (!label) return []
      const option: ConfiguratorOption = { id: `${key}-${row.id ?? index}`, value: label, label }
      const description = row.description?.trim()
      if (description) option.description = description
      const image = toConfiguratorMedia(row.image)
      if (image) option.image = image
      const previewImage = toConfiguratorMedia(row.previewImage)
      if (previewImage) option.previewImage = previewImage
      return [option]
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
  refs: CatalogueRefs,
): ConfiguratorOption[] {
  const options = uniqueByValue(
    (docs ?? []).flatMap((doc) => {
      if (!isPopulated(doc) || doc.status !== 'published') return []
      const option: ConfiguratorOption = {
        id: `${key}-${doc.id}`,
        value: doc.slug,
        label: doc.title,
        description: doc.shortDescription?.trim() || undefined,
        image: toConfiguratorMedia(doc.image),
      }
      refs[key] = { ...refs[key], [doc.slug]: { id: doc.id, slug: doc.slug, title: doc.title } }
      return [option]
    }),
  )
  return options
}

function group(
  key: ConfiguratorGroupKey,
  options: ConfiguratorOption[],
  extra: Partial<Pick<ConfiguratorGroup, 'selectionMode' | 'hint'>> = {},
): ConfiguratorGroup[] {
  if (!options.length) return []
  return [{ key, label: GROUP_LABELS[key], selectionMode: extra.selectionMode ?? 'single', hint: extra.hint, options }]
}

export function buildLegacyConfiguratorModel(product: Product): ProductConfiguratorModel {
  const customFormatAvailable = Boolean(product.customFormatAvailable)
  const refs: CatalogueRefs = {}

  const formatOptions = labelOptions(KEYS.format, product.availableFormats)
  if (customFormatAvailable) {
    formatOptions.push({
      id: 'format-custom',
      value: CUSTOM_FORMAT_VALUE,
      label: CUSTOM_FORMAT_LABEL,
      isCustom: true,
    })
  }

  const groups: ConfiguratorGroup[] = [
    ...group(KEYS.format, formatOptions),
    ...group(KEYS.orientation, enumOptions(KEYS.orientation, product.orientations, ORIENTATION_LABELS)),
    ...group(KEYS.pageCount, labelOptions(KEYS.pageCount, product.pageCountOptions)),
    ...group(KEYS.printSides, enumOptions(KEYS.printSides, product.printSides, PRINT_SIDES_LABELS)),
    ...group(KEYS.colorMode, enumOptions(KEYS.colorMode, product.colorModes, COLOR_MODE_LABELS)),
    ...group(KEYS.material, relationOptions(KEYS.material, product.materials, refs)),
    ...group(KEYS.grammage, labelOptions(KEYS.grammage, product.grammages)),
    // Finishes are multi-select: the quote model has always stored a list of
    // finishes (`quote-requests.configuration.finish` is hasMany).
    ...group(KEYS.finish, relationOptions(KEYS.finish, product.finishes, refs), {
      selectionMode: 'multiple',
      hint: MULTIPLE_CHOICE_HINT,
    }),
    ...group(KEYS.quantity, labelOptions(KEYS.quantity, product.quantities)),
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
    source: 'legacy',
    refs,
    data: {
      product: {
        id: String(product.id),
        slug: product.slug,
        title: product.title,
        categoryLabel: isPopulated(category) ? category.title : undefined,
      },
      media,
      groups,
      customFormatAvailable,
    },
  }
}
