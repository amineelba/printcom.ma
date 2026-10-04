import type { ConfiguratorDimension, ConfiguratorOption as OptionDoc, Finish, Material, Product } from '@/payload-types'
import { ENUM_LABELS_BY_DIMENSION, CUSTOM_FORMAT_LABEL, MULTIPLE_CHOICE_HINT } from './labels'
import {
  isPopulated,
  toConfiguratorMedia,
  uniqueByValue,
  type CatalogueRefs,
} from './configuratorShared'
import {
  CORE_DIMENSION_KEYS,
  CUSTOM_FORMAT_VALUE,
  type ConfiguratorGroup,
  type ConfiguratorOption,
} from './types'

type SchemaRow = NonNullable<Product['configurationSchema']>[number]

export interface NormalizedSchema {
  groups: ConfiguratorGroup[]
  refs: CatalogueRefs
}

/**
 * Product-specific configuration schema → `ConfiguratorGroup[]`.
 *
 * The product's `configurationSchema` is the only authority: each row names
 * one technical dimension and carries that product's own allowlist. Nothing
 * is inherited from the category or from other products, and a dimension
 * only becomes a control when the data behind it is confirmed:
 *
 *  - the row's `dataStatus` must be `confirmed` (needs-review / unsupported
 *    rows never render — a known dimension with unknown values stays hidden);
 *  - the dimension document must be `published`;
 *  - catalog options must be `published` AND `verificationStatus: confirmed`
 *    and belong to the row's own dimension;
 *  - materials / finishes must be `published` (a populated relationship
 *    doesn't re-check access control);
 *  - typed-answer dimensions (dimensions / number / text) need the row's
 *    explicit `allowCustomValue`; a boolean needs only the confirmed row.
 *
 * Rows keep array order (the UI order). A second row for an already-used
 * dimension is ignored.
 */
export function normalizeProductConfigurationSchema(product: Product): NormalizedSchema {
  const groups: ConfiguratorGroup[] = []
  const refs: CatalogueRefs = {}
  const used = new Set<string>()

  for (const row of product.configurationSchema ?? []) {
    const dimension = row.dimension
    if (!isPopulated(dimension) || dimension.status !== 'published') continue
    if (row.dataStatus !== 'confirmed') continue
    if (used.has(dimension.key)) continue

    const group = buildGroup(row, dimension, refs)
    if (!group) continue
    used.add(dimension.key)
    groups.push(group)
  }

  return { groups, refs }
}

function buildGroup(row: SchemaRow, dimension: ConfiguratorDimension, refs: CatalogueRefs): ConfiguratorGroup | undefined {
  const key = dimension.key
  const label = row.labelOverride?.trim() || dimension.label
  const hint = row.helpTextOverride?.trim() || dimension.publicHelpText?.trim() || undefined
  const base = { key, label }

  switch (dimension.valueType) {
    case 'dimensions':
    case 'number':
    case 'text': {
      if (!row.allowCustomValue) return undefined
      return {
        ...base,
        hint,
        valueType: dimension.valueType,
        selectionMode: 'single',
        unit: dimension.valueType === 'number' ? dimension.unit?.trim() || undefined : undefined,
        options: [],
      }
    }
    case 'boolean':
      return { ...base, hint, valueType: 'boolean', selectionMode: 'single', options: [] }
    case 'multi-choice':
    case 'single-choice': {
      const multiple = dimension.valueType === 'multi-choice'
      const options = uniqueByValue(choiceOptions(row, dimension, refs))
      if (key === CORE_DIMENSION_KEYS.format && !multiple && row.allowCustomValue) {
        options.push({ id: 'format-custom', value: CUSTOM_FORMAT_VALUE, label: CUSTOM_FORMAT_LABEL, isCustom: true })
      }
      if (!options.length) return undefined
      return {
        ...base,
        hint: hint ?? (multiple ? MULTIPLE_CHOICE_HINT : undefined),
        valueType: dimension.valueType,
        selectionMode: multiple ? 'multiple' : 'single',
        options,
      }
    }
    default:
      return undefined
  }
}

function choiceOptions(row: SchemaRow, dimension: ConfiguratorDimension, refs: CatalogueRefs): ConfiguratorOption[] {
  const key = dimension.key
  switch (dimension.optionSource) {
    case 'catalog':
      return (row.options ?? []).flatMap((binding) => {
        const option = binding.option
        if (!isPopulated<OptionDoc>(option)) return []
        if (option.status !== 'published' || option.verificationStatus !== 'confirmed') return []
        const owner = option.dimension
        const ownerId = isPopulated(owner) ? owner.id : owner
        if (ownerId !== dimension.id) return [] // an option of another dimension is never offered here
        const result: ConfiguratorOption = {
          id: `${key}-${option.id}`,
          value: option.machineValue,
          label: option.label,
        }
        const description = binding.descriptionOverride?.trim() || option.description?.trim()
        if (description) result.description = description
        const image = toConfiguratorMedia(binding.imageOverride) ?? toConfiguratorMedia(option.image)
        if (image) result.image = image
        const previewImage = toConfiguratorMedia(binding.previewImage)
        if (previewImage) result.previewImage = previewImage
        return [result]
      })
    case 'materials':
      return catalogueOptions(key, row.materialOptions, refs)
    case 'finishes':
      return catalogueOptions(key, row.finishOptions, refs)
    case 'enum': {
      const labels = ENUM_LABELS_BY_DIMENSION[key] ?? {}
      return (row.enumOptions ?? []).flatMap((value) => {
        const label = labels[value]
        return label ? [{ id: `${key}-${value}`, value, label }] : []
      })
    }
    default:
      return []
  }
}

function catalogueOptions(
  key: string,
  docs: (Material | Finish | number)[] | null | undefined,
  refs: CatalogueRefs,
): ConfiguratorOption[] {
  return (docs ?? []).flatMap((doc) => {
    if (!isPopulated(doc) || doc.status !== 'published') return []
    refs[key] = { ...refs[key], [doc.slug]: { id: doc.id, slug: doc.slug, title: doc.title } }
    return [
      {
        id: `${key}-${doc.id}`,
        value: doc.slug,
        label: doc.title,
        description: doc.shortDescription?.trim() || undefined,
        image: toConfiguratorMedia(doc.image),
      },
    ]
  })
}
