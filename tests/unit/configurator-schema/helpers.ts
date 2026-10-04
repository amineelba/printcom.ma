import type { ProductSnapshot } from '@/lib/configurator-schema/types'

export function makeSnapshot(overrides: Omit<Partial<ProductSnapshot>, 'legacy'> & { legacy?: Partial<ProductSnapshot['legacy']> } = {}): ProductSnapshot {
  const { legacy, ...rest } = overrides
  return {
    id: 1,
    slug: 'cartes-de-visite',
    title: 'Cartes de visite',
    status: 'draft',
    categorySlug: 'papeterie-entreprise',
    categoryTitle: 'Papeterie d’entreprise',
    legacy: {
      formats: [],
      customFormatAvailable: false,
      orientations: [],
      pageCounts: [],
      printSides: [],
      colorModes: [],
      materialIds: [],
      grammages: [],
      finishIds: [],
      quantities: [],
      ...legacy,
    },
    schema: [],
    ...rest,
  }
}

import type { ExistingSchemaRow, ProductPlan } from '@/lib/configurator-schema/types'

/** What the database would hold after applying a plan (create rows, fill existing ones). */
export function applyPlanToSnapshot(snapshot: ProductSnapshot, plan: ProductPlan): ProductSnapshot {
  const schema = [...snapshot.schema]
  for (const row of plan.rows) {
    const next: ExistingSchemaRow = {
      dimensionKey: row.dimension.key,
      dataStatus: row.dataStatus,
      source: row.source,
      allowCustomValue: row.allowCustomValue,
      optionValues: row.options.map((option) => option.value),
      materialIds: row.materialIds,
      finishIds: row.finishIds,
      enumValues: row.enumOptions,
    }
    const index = schema.findIndex((existing) => existing.dimensionKey === next.dimensionKey)
    if (index >= 0) schema[index] = next
    else schema.push(next)
  }
  return { ...snapshot, schema }
}
