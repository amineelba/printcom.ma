import type { Payload } from 'payload'
import type { Product } from '@/payload-types'
import type { DimensionOptionSource, DimensionValueType, Provenance } from './constants'
import { BUILT_IN_DEFINITIONS, type DimensionDefinition } from './dimensionCatalog'
import type { CatalogueLookup, ImportContext, ImportPlan } from './reviewWorkflow'
import type { ExistingSchemaRow, LegacyOptionRow, PlannedRow, ProductPlan, ProductSnapshot } from './types'

/**
 * Database layer of the configurator-schema tooling. Everything here talks
 * to Payload's Local API; the planning logic it feeds is pure
 * (backfillPlan.ts / reviewWorkflow.ts).
 *
 * Safety model for writes: idempotent find-or-create for dimensions and
 * options, then **one atomic update per product** that only appends rows
 * (or fills a still-empty needs-review row). Nothing is ever deleted and
 * existing rows are passed back unchanged, so an interrupted run can simply
 * be re-run.
 */

const idOf = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : value && typeof value === 'object' && 'id' in value ? (value as { id: number }).id : undefined

interface RegistryDimension {
  id: number
  key: string
  label: string
  optionSource: DimensionOptionSource
  valueType: DimensionValueType
}

export interface Registry {
  dimensionsByKey: Map<string, RegistryDimension>
  dimensionsById: Map<number, RegistryDimension>
  /** `${dimensionKey}|${machineValue}` → option */
  options: Map<string, { id: number; label: string }>
  optionsById: Map<number, { dimensionKey: string; machineValue: string; label: string }>
}

export async function loadRegistry(payload: Payload): Promise<Registry> {
  const dimensions = await payload.find({ collection: 'configurator-dimensions', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  const options = await payload.find({ collection: 'configurator-options', limit: 0, pagination: false, depth: 0, overrideAccess: true })

  const dimensionsByKey = new Map<string, RegistryDimension>()
  const dimensionsById = new Map<number, RegistryDimension>()
  for (const doc of dimensions.docs) {
    const entry: RegistryDimension = { id: doc.id, key: doc.key, label: doc.label, optionSource: doc.optionSource, valueType: doc.valueType }
    dimensionsByKey.set(doc.key, entry)
    dimensionsById.set(doc.id, entry)
  }

  const optionMap = new Map<string, { id: number; label: string }>()
  const optionsById = new Map<number, { dimensionKey: string; machineValue: string; label: string }>()
  for (const doc of options.docs) {
    const dimension = dimensionsById.get(idOf(doc.dimension) ?? -1)
    if (!dimension) continue
    optionMap.set(`${dimension.key}|${doc.machineValue}`, { id: doc.id, label: doc.label })
    optionsById.set(doc.id, { dimensionKey: dimension.key, machineValue: doc.machineValue, label: doc.label })
  }
  return { dimensionsByKey, dimensionsById, options: optionMap, optionsById }
}

const rows = <T,>(value: T[] | null | undefined): T[] => value ?? []

type LegacyRowSource = { label?: string | null; description?: string | null; image?: unknown; previewImage?: unknown }
const legacyRows = (list: LegacyRowSource[] | null | undefined): LegacyOptionRow[] =>
  rows(list).flatMap((row) =>
    row.label?.trim()
      ? [{ label: row.label.trim(), description: row.description, imageId: idOf(row.image) ?? null, previewImageId: idOf(row.previewImage) ?? null }]
      : [],
  )

function toSnapshot(product: Product, registry: Registry, categories: Map<number, { slug: string; title: string }>): ProductSnapshot {
  const category = categories.get(idOf(product.primaryCategory) ?? -1)
  const schema: ExistingSchemaRow[] = rows(product.configurationSchema).flatMap((row) => {
    const dimension = registry.dimensionsById.get(idOf(row.dimension) ?? -1)
    if (!dimension) return []
    return [
      {
        dimensionKey: dimension.key,
        dataStatus: row.dataStatus,
        source: (row.source ?? null) as Provenance | null,
        allowCustomValue: Boolean(row.allowCustomValue),
        optionValues: rows(row.options).flatMap((binding) => {
          const option = registry.optionsById.get(idOf(binding.option) ?? -1)
          return option ? [option.machineValue] : []
        }),
        materialIds: rows(row.materialOptions).map((value) => idOf(value) as number),
        finishIds: rows(row.finishOptions).map((value) => idOf(value) as number),
        enumValues: rows(row.enumOptions),
      },
    ]
  })

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    status: product.status,
    categorySlug: category?.slug,
    categoryTitle: category?.title,
    description: product.longDescription,
    legacy: {
      formats: legacyRows(product.availableFormats),
      customFormatAvailable: Boolean(product.customFormatAvailable),
      orientations: rows(product.orientations),
      pageCounts: legacyRows(product.pageCountOptions),
      printSides: rows(product.printSides),
      colorModes: rows(product.colorModes),
      materialIds: rows(product.materials).map((value) => idOf(value) as number),
      grammages: legacyRows(product.grammages),
      finishIds: rows(product.finishes).map((value) => idOf(value) as number),
      quantities: legacyRows(product.quantities),
    },
    schema,
  }
}

export interface LoadedData {
  snapshots: ProductSnapshot[]
  registry: Registry
  lookup: CatalogueLookup
}

/** Read-only: every product (all statuses), the registry and the material/finish lookups. */
export async function loadData(payload: Payload): Promise<LoadedData> {
  const registry = await loadRegistry(payload)

  const categoryDocs = await payload.find({ collection: 'product-categories', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  const categories = new Map(categoryDocs.docs.map((doc) => [doc.id, { slug: doc.slug, title: doc.title }]))

  const products = await payload.find({ collection: 'products', limit: 0, pagination: false, depth: 0, overrideAccess: true })

  const materials = await payload.find({ collection: 'materials', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  const finishes = await payload.find({ collection: 'finishes', limit: 0, pagination: false, depth: 0, overrideAccess: true })

  return {
    snapshots: products.docs.map((product) => toSnapshot(product as Product, registry, categories)),
    registry,
    lookup: {
      materials: new Map(materials.docs.map((doc) => [doc.id, { slug: doc.slug, title: doc.title }])),
      finishes: new Map(finishes.docs.map((doc) => [doc.id, { slug: doc.slug, title: doc.title }])),
    },
  }
}

/* ------------------------------------------------------------------ */
/* Backfill                                                            */
/* ------------------------------------------------------------------ */

export interface BackfillSummary {
  productsScanned: number
  productsChanged: number
  rowsCreated: number
  rowsFilled: number
  legacyValuesMigrated: number
  dimensionsCreated: string[]
  dimensionsReused: number
  optionsCreated: number
  optionsReused: number
  reviewItems: number
  changedProducts: string[]
}

class RegistryWriter {
  created: string[] = []
  reused = 0
  optionsCreated = 0
  optionsReused = 0
  private pendingDimensionIds = new Map<string, number>()
  /** Dry-run placeholders live here, never in the shared registry. */
  private fakeOptions = new Map<string, { id: number; label: string }>()
  private nextFake = -1

  constructor(
    private payload: Payload,
    private registry: Registry,
    private write: boolean,
  ) {}

  async dimensionId(definition: DimensionDefinition): Promise<number> {
    const known = this.registry.dimensionsByKey.get(definition.key)
    if (known) {
      if (!this.pendingDimensionIds.has(definition.key)) this.reused += 1
      this.pendingDimensionIds.set(definition.key, known.id)
      return known.id
    }
    const pending = this.pendingDimensionIds.get(definition.key)
    if (pending !== undefined) return pending

    this.created.push(definition.key)
    if (!this.write) {
      const fake = this.nextFake--
      this.pendingDimensionIds.set(definition.key, fake)
      return fake
    }
    const doc = await this.payload.create({
      collection: 'configurator-dimensions',
      data: {
        key: definition.key,
        label: definition.label,
        group: definition.group,
        valueType: definition.valueType,
        optionSource: definition.optionSource,
        unit: definition.unit,
        sortOrder: definition.sortOrder,
        // Definitions describe a question, not an offer: publishing one exposes nothing by itself.
        status: 'published',
        notes: 'Créée par configurator:backfill.',
      },
      overrideAccess: true,
    })
    const entry: RegistryDimension = { id: doc.id, key: doc.key, label: doc.label, optionSource: doc.optionSource, valueType: doc.valueType }
    this.registry.dimensionsByKey.set(doc.key, entry)
    this.registry.dimensionsById.set(doc.id, entry)
    this.pendingDimensionIds.set(definition.key, doc.id)
    return doc.id
  }

  async optionId(dimensionKey: string, dimensionId: number, machineValue: string, label: string): Promise<number> {
    const key = `${dimensionKey}|${machineValue}`
    const known = this.registry.options.get(key) ?? this.fakeOptions.get(key)
    if (known) {
      this.optionsReused += 1
      return known.id
    }
    this.optionsCreated += 1
    if (!this.write) {
      const fake = this.nextFake--
      this.fakeOptions.set(key, { id: fake, label })
      return fake
    }
    const doc = await this.payload.create({
      collection: 'configurator-options',
      data: {
        dimension: dimensionId,
        label,
        machineValue,
        // The value already exists in the CMS (a product's own option list): it is confirmed data.
        verificationStatus: 'confirmed',
        status: 'published',
        notes: 'Créée par configurator:backfill à partir d’une valeur existante du produit.',
      },
      overrideAccess: true,
    })
    this.registry.options.set(key, { id: doc.id, label })
    this.registry.optionsById.set(doc.id, { dimensionKey, machineValue, label })
    return doc.id
  }
}

type StoredRow = NonNullable<Product['configurationSchema']>[number]

async function buildRowData(writer: RegistryWriter, planned: PlannedRow): Promise<Omit<StoredRow, 'id'>> {
  const dimensionId = await writer.dimensionId(planned.dimension)
  const options = []
  for (const option of planned.options) {
    options.push({
      option: await writer.optionId(planned.dimension.key, dimensionId, option.value, option.value),
      descriptionOverride: option.description ?? undefined,
      imageOverride: option.imageId ?? undefined,
      previewImage: option.previewImageId ?? undefined,
    })
  }
  return {
    dimension: dimensionId,
    labelOverride: planned.labelOverride,
    dataStatus: planned.dataStatus,
    source: planned.source,
    allowCustomValue: planned.allowCustomValue,
    requiredForConfiguration: false,
    options,
    materialOptions: planned.materialIds,
    finishOptions: planned.finishIds,
    enumOptions: planned.enumOptions as StoredRow['enumOptions'],
  }
}

/**
 * Applies backfill plans. `write: false` (the default everywhere) computes
 * the exact same summary without touching the database.
 */
export async function applyBackfill(
  payload: Payload,
  data: LoadedData,
  plans: ProductPlan[],
  options: { write: boolean },
): Promise<BackfillSummary> {
  const writer = new RegistryWriter(payload, data.registry, options.write)
  const summary: BackfillSummary = {
    productsScanned: plans.length,
    productsChanged: 0,
    rowsCreated: 0,
    rowsFilled: 0,
    legacyValuesMigrated: 0,
    dimensionsCreated: [],
    dimensionsReused: 0,
    optionsCreated: 0,
    optionsReused: 0,
    reviewItems: plans.reduce((total, plan) => total + plan.review.length, 0),
    changedProducts: [],
  }

  for (const plan of plans) {
    if (plan.noop) continue

    let current: StoredRow[] = []
    if (options.write) {
      const product = (await payload.findByID({ collection: 'products', id: plan.productId, depth: 0, overrideAccess: true })) as Product
      current = product.configurationSchema ?? []
    }

    const next: StoredRow[] = [...current]
    for (const planned of plan.rows) {
      const rowData = await buildRowData(writer, planned)
      summary.legacyValuesMigrated += planned.options.length + planned.materialIds.length + planned.finishIds.length + planned.enumOptions.length
      if (planned.action === 'create') {
        next.push(rowData as StoredRow)
        summary.rowsCreated += 1
      } else {
        const index = next.findIndex((row) => idOf(row.dimension) === rowData.dimension)
        if (index >= 0) next[index] = { ...next[index], ...rowData, id: next[index].id } as StoredRow
        summary.rowsFilled += 1
      }
    }

    summary.productsChanged += 1
    summary.changedProducts.push(plan.slug)
    if (options.write) {
      await payload.update({ collection: 'products', id: plan.productId, data: { configurationSchema: next }, overrideAccess: true, depth: 0 })
    }
  }

  summary.dimensionsCreated = writer.created
  summary.dimensionsReused = writer.reused
  summary.optionsCreated = writer.optionsCreated
  summary.optionsReused = writer.optionsReused
  return summary
}

/** Registers the built-in definitions (core 9 + `dimensions`) so imports can reference them. */
export async function ensureBuiltInDimensions(payload: Payload, registry: Registry, write: boolean): Promise<string[]> {
  const writer = new RegistryWriter(payload, registry, write)
  for (const definition of BUILT_IN_DEFINITIONS) await writer.dimensionId(definition)
  return writer.created
}

/* ------------------------------------------------------------------ */
/* Import                                                              */
/* ------------------------------------------------------------------ */

export async function loadImportContext(payload: Payload, data: LoadedData): Promise<ImportContext> {
  const products: ImportContext['products'] = new Map()
  for (const snapshot of data.snapshots) {
    products.set(snapshot.slug, { id: snapshot.id, title: snapshot.title, rows: new Map(snapshot.schema.map((row) => [row.dimensionKey, row])) })
  }
  const dimensions: ImportContext['dimensions'] = new Map()
  for (const dimension of data.registry.dimensionsByKey.values()) {
    dimensions.set(dimension.key, { optionSource: dimension.optionSource, valueType: dimension.valueType, label: dimension.label })
  }
  const catalogOptions = new Map([...data.registry.options.entries()].map(([key, option]) => [key, option.label]))
  const materials = new Map([...data.lookup.materials.entries()].map(([id, doc]) => [doc.slug, { id, title: doc.title }]))
  const finishes = new Map([...data.lookup.finishes.entries()].map(([id, doc]) => [doc.slug, { id, title: doc.title }]))
  return { products, dimensions, catalogOptions, materials, finishes }
}

export interface ImportSummary {
  productsChanged: number
  rowsCreated: number
  rowsUpdated: number
  optionsCreated: number
  optionsReused: number
}

/** Applies a validated import plan. Additive only. Throws if the plan has errors. */
export async function applyImport(payload: Payload, data: LoadedData, plan: ImportPlan, options: { write: boolean }): Promise<ImportSummary> {
  if (plan.errors.length) throw new Error('Import plan has errors; nothing applied.')
  const writer = new RegistryWriter(payload, data.registry, options.write)
  const summary: ImportSummary = { productsChanged: 0, rowsCreated: 0, rowsUpdated: 0, optionsCreated: 0, optionsReused: 0 }

  for (const option of plan.newCatalogOptions) {
    const dimension = data.registry.dimensionsByKey.get(option.dimensionKey)!
    await writer.optionId(option.dimensionKey, dimension.id, option.machineValue, option.label)
  }

  const materialIds = new Map([...data.lookup.materials.entries()].map(([id, doc]) => [doc.slug, id]))
  const finishIds = new Map([...data.lookup.finishes.entries()].map(([id, doc]) => [doc.slug, id]))

  for (const change of plan.products) {
    let next: StoredRow[] = []
    if (options.write) {
      const product = (await payload.findByID({ collection: 'products', id: change.productId, depth: 0, overrideAccess: true })) as Product
      next = [...(product.configurationSchema ?? [])]
    }

    for (const rowChange of change.rows) {
      const dimension = data.registry.dimensionsByKey.get(rowChange.dimensionKey)!
      const index = next.findIndex((row) => idOf(row.dimension) === dimension.id)
      const base: StoredRow =
        index >= 0
          ? next[index]
          : ({ dimension: dimension.id, dataStatus: rowChange.statusChange?.to ?? 'confirmed', source: 'import', allowCustomValue: false, requiredForConfiguration: false } as StoredRow)

      const addedOptions = []
      for (const value of rowChange.addOptions) {
        addedOptions.push({ option: await writer.optionId(rowChange.dimensionKey, dimension.id, value, value) })
      }
      const merged: StoredRow = {
        ...base,
        dataStatus: rowChange.statusChange?.to ?? base.dataStatus,
        allowCustomValue: rowChange.setAllowCustomValue ? true : base.allowCustomValue,
        options: [...(base.options ?? []), ...addedOptions],
        materialOptions: [...(base.materialOptions ?? []).map((value) => idOf(value) as number), ...rowChange.addMaterialSlugs.map((slug) => materialIds.get(slug) as number)],
        finishOptions: [...(base.finishOptions ?? []).map((value) => idOf(value) as number), ...rowChange.addFinishSlugs.map((slug) => finishIds.get(slug) as number)],
        enumOptions: [...(base.enumOptions ?? []), ...rowChange.addEnumValues] as StoredRow['enumOptions'],
      }
      if (index >= 0) next[index] = merged
      else next.push(merged)
      if (rowChange.action === 'update') summary.rowsUpdated += 1
      else summary.rowsCreated += 1
    }

    summary.productsChanged += 1
    if (options.write) {
      await payload.update({ collection: 'products', id: change.productId, data: { configurationSchema: next }, overrideAccess: true, depth: 0 })
    }
  }

  const added = plan.products.reduce((total, product) => total + product.rows.reduce((sum, row) => sum + row.addOptions.length, 0), 0)
  summary.optionsCreated = plan.newCatalogOptions.length
  summary.optionsReused = Math.max(0, added - plan.newCatalogOptions.length)
  return summary
}
