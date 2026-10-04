import type { Product } from '@/payload-types'
import { buildLegacyConfiguratorModel } from './legacyConfigurator'
import { normalizeProductConfigurationSchema } from './normalizeProductConfigurationSchema'
import type { ProductConfiguratorModel } from './configuratorShared'
import type { ProductConfiguratorData } from './types'

export { toConfiguratorMedia } from './configuratorShared'
export type { ProductConfiguratorModel } from './configuratorShared'

/**
 * Normalizes a Payload product (fetched at depth 2) into the serializable
 * configurator view-model plus the server-only catalogue references the
 * resolver needs. Pure: no I/O, no Payload runtime.
 */
export function buildProductConfiguratorModel(product: Product): ProductConfiguratorModel {
  // Schema first: when the product's own `configurationSchema` yields at
  // least one usable group it is the single definition. Otherwise the legacy
  // adapter reads the historical generic fields, exactly as before.
  const legacy = buildLegacyConfiguratorModel(product)
  const schema = normalizeProductConfigurationSchema(product)
  if (!schema.groups.length) return legacy

  return {
    source: 'schema',
    refs: schema.refs,
    data: {
      ...legacy.data,
      groups: schema.groups,
      customFormatAvailable: schema.groups.some((group) => group.options.some((option) => option.isCustom)),
    },
  }
}

/** The browser-facing half of the model. */
export function buildProductConfiguratorData(product: Product): ProductConfiguratorData {
  return buildProductConfiguratorModel(product).data
}
