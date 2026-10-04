import { ENUM_LABELS_BY_DIMENSION } from '@/lib/configurator/labels'
import { CUSTOM_FORMAT_VALUE } from '@/lib/configurator/types'
import { DATA_STATUSES, type DataStatus, type DimensionOptionSource, type DimensionValueType } from './constants'
import type { ProductPlan, ProductSnapshot, ReviewItem } from './types'

/**
 * Bulk review workflow: one spreadsheet-friendly dataset (CSV or JSON)
 * replaces clicking through every product in the admin.
 *
 *   export  → one row per (product, dimension, allowed value), plus one row
 *             with an empty `value` for every dimension still waiting for
 *             values, carrying the reason in `notes`;
 *   import  → validates every row against the registry/catalogues, shows a
 *             diff, and (only with --write) applies *additive* changes.
 *
 * Stable slugs are used everywhere (product, dimension, material, finish);
 * no database ids appear in the file.
 */

export const REVIEW_COLUMNS = [
  'category',
  'product_slug',
  'product_title',
  'dimension_key',
  'dimension_label',
  'value',
  'value_label',
  'status',
  'notes',
] as const
export type ReviewColumn = (typeof REVIEW_COLUMNS)[number]
export type ReviewRow = Record<ReviewColumn, string>

/** `value` of a row that says "the customer may type their own value". */
export const CUSTOM_VALUE = CUSTOM_FORMAT_VALUE

export interface CatalogueLookup {
  materials: Map<number, { slug: string; title: string }>
  finishes: Map<number, { slug: string; title: string }>
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

const blankRow = (): ReviewRow => ({
  category: '',
  product_slug: '',
  product_title: '',
  dimension_key: '',
  dimension_label: '',
  value: '',
  value_label: '',
  status: '',
  notes: '',
})

/**
 * Rows for every product: the allowlists that exist (schema rows already in
 * the database, plus the rows a backfill would create) and the dimensions
 * still waiting for values. `dimensionLabels` maps registry key → label.
 */
export function buildExportRows(
  snapshots: ProductSnapshot[],
  plans: ProductPlan[],
  lookup: CatalogueLookup,
  dimensionLabels: Map<string, string>,
  /** Option labels by `${dimensionKey}|${machineValue}` (catalog options keep label = value unless told otherwise). */
  optionLabels: Map<string, string> = new Map(),
): ReviewRow[] {
  const planBySlug = new Map(plans.map((plan) => [plan.slug, plan]))
  const rows: ReviewRow[] = []
  const sorted = [...snapshots].sort((a, b) => (a.categorySlug ?? '').localeCompare(b.categorySlug ?? '') || a.slug.localeCompare(b.slug))

  for (const snapshot of sorted) {
    const plan = planBySlug.get(snapshot.slug)
    const category = snapshot.categoryTitle ?? snapshot.categorySlug ?? ''
    const reviewByKey = new Map<string, ReviewItem[]>()
    for (const item of plan?.review ?? []) {
      if (!item.dimensionKey) continue
      reviewByKey.set(item.dimensionKey, [...(reviewByKey.get(item.dimensionKey) ?? []), item])
    }

    type Effective = {
      key: string
      label: string
      status: DataStatus
      values: { value: string; label: string }[]
      allowCustom: boolean
    }
    const effective: Effective[] = []

    for (const row of snapshot.schema) {
      effective.push({
        key: row.dimensionKey,
        label: dimensionLabels.get(row.dimensionKey) ?? row.dimensionKey,
        status: row.dataStatus,
        values: [
          ...row.optionValues.map((value) => ({ value, label: optionLabels.get(`${row.dimensionKey}|${value}`) ?? value })),
          ...row.materialIds.flatMap((id) => {
            const doc = lookup.materials.get(id)
            return doc ? [{ value: doc.slug, label: doc.title }] : []
          }),
          ...row.finishIds.flatMap((id) => {
            const doc = lookup.finishes.get(id)
            return doc ? [{ value: doc.slug, label: doc.title }] : []
          }),
          ...row.enumValues.map((value) => ({ value, label: ENUM_LABELS_BY_DIMENSION[row.dimensionKey]?.[value] ?? value })),
        ],
        allowCustom: row.allowCustomValue,
      })
    }
    for (const planned of plan?.rows ?? []) {
      if (planned.action !== 'create') continue
      effective.push({
        key: planned.dimension.key,
        label: planned.labelOverride ?? planned.dimension.label,
        status: planned.dataStatus,
        values: [
          ...planned.options.map((option) => ({ value: option.value, label: option.value })),
          ...planned.materialIds.flatMap((id) => {
            const doc = lookup.materials.get(id)
            return doc ? [{ value: doc.slug, label: doc.title }] : []
          }),
          ...planned.finishIds.flatMap((id) => {
            const doc = lookup.finishes.get(id)
            return doc ? [{ value: doc.slug, label: doc.title }] : []
          }),
          ...planned.enumOptions.map((value) => ({ value, label: ENUM_LABELS_BY_DIMENSION[planned.dimension.key]?.[value] ?? value })),
        ],
        allowCustom: planned.allowCustomValue,
      })
    }

    const base = { category, product_slug: snapshot.slug, product_title: snapshot.title }
    for (const entry of effective) {
      const notes = (reviewByKey.get(entry.key) ?? []).map((item) => `${item.status}: ${item.action}${item.notes ? ` (${item.notes})` : ''}`).join(' | ')
      const common = { ...blankRow(), ...base, dimension_key: entry.key, dimension_label: entry.label, status: entry.status }
      const values = [...entry.values]
      if (entry.allowCustom) values.push({ value: CUSTOM_VALUE, label: 'Sur mesure' })
      if (!values.length) rows.push({ ...common, notes })
      for (const value of values) rows.push({ ...common, value: value.value, value_label: value.label, notes })
    }

    for (const item of plan?.review ?? []) {
      if (item.dimensionKey) continue // dimension-level items are already attached above
      rows.push({ ...blankRow(), ...base, status: 'needs-review', notes: `${item.status}: ${item.action}${item.notes ? ` (${item.notes})` : ''}` })
    }
  }
  return rows
}

/* ------------------------------------------------------------------ */
/* CSV / JSON                                                          */
/* ------------------------------------------------------------------ */

const escapeCell = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

export function toCsv(rows: ReviewRow[]): string {
  return [REVIEW_COLUMNS.join(','), ...rows.map((row) => REVIEW_COLUMNS.map((column) => escapeCell(row[column] ?? '')).join(','))].join('\n') + '\n'
}

/** Minimal RFC 4180 parser (quotes, doubled quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const records: string[][] = []
  let record: string[] = []
  let cell = ''
  let quoted = false
  const source = text.replace(/^﻿/, '')
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      record.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index += 1
      record.push(cell)
      cell = ''
      if (record.some((value) => value !== '')) records.push(record)
      record = []
    } else cell += char
  }
  record.push(cell)
  if (record.some((value) => value !== '')) records.push(record)
  return records
}

export interface ParsedReviewFile {
  rows: ReviewRow[]
  errors: string[]
}

/** Parses a CSV or JSON review file. Unknown or missing columns are errors. */
export function parseReviewFile(text: string, format: 'csv' | 'json'): ParsedReviewFile {
  const errors: string[] = []
  const rows: ReviewRow[] = []

  const accept = (raw: Record<string, unknown>, label: string) => {
    const unknown = Object.keys(raw).filter((key) => !(REVIEW_COLUMNS as readonly string[]).includes(key))
    if (unknown.length) errors.push(`${label}: colonne(s) inconnue(s) « ${unknown.join(', ')} ».`)
    const row = blankRow()
    for (const column of REVIEW_COLUMNS) {
      const value = raw[column]
      row[column] = typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value).trim()
    }
    rows.push(row)
  }

  if (format === 'json') {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return { rows, errors: ['JSON invalide.'] }
    }
    if (!Array.isArray(parsed)) return { rows, errors: ['Le JSON doit être un tableau de lignes.'] }
    parsed.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) errors.push(`ligne ${index + 1}: objet attendu.`)
      else accept(entry as Record<string, unknown>, `ligne ${index + 1}`)
    })
    return { rows, errors }
  }

  const records = parseCsv(text)
  if (!records.length) return { rows, errors: ['Fichier vide.'] }
  const [header, ...body] = records
  const unknownColumns = header.filter((column) => !(REVIEW_COLUMNS as readonly string[]).includes(column.trim()))
  const missingColumns = REVIEW_COLUMNS.filter((column) => !header.map((value) => value.trim()).includes(column))
  if (unknownColumns.length) errors.push(`Colonne(s) inconnue(s) : ${unknownColumns.join(', ')}.`)
  if (missingColumns.length) errors.push(`Colonne(s) manquante(s) : ${missingColumns.join(', ')}.`)
  if (errors.length) return { rows, errors }
  body.forEach((record, index) => {
    if (record.length > header.length) {
      errors.push(`ligne ${index + 2}: ${record.length} cellules pour ${header.length} colonnes.`)
      return
    }
    accept(Object.fromEntries(header.map((column, position) => [column.trim(), record[position] ?? ''])), `ligne ${index + 2}`)
  })
  return { rows, errors }
}

/* ------------------------------------------------------------------ */
/* Import planning                                                     */
/* ------------------------------------------------------------------ */

export interface ImportContext {
  products: Map<string, { id: number; title: string; rows: Map<string, import('./types').ExistingSchemaRow> }>
  dimensions: Map<string, { optionSource: DimensionOptionSource; valueType: DimensionValueType; label: string }>
  /** `${dimensionKey}|${machineValue}` → label of an existing catalog option. */
  catalogOptions: Map<string, string>
  materials: Map<string, { id: number; title: string }>
  finishes: Map<string, { id: number; title: string }>
}

export interface ImportIssue {
  row: number
  message: string
}

export interface ImportRowChange {
  dimensionKey: string
  action: 'create' | 'update'
  statusChange?: { from?: DataStatus; to: DataStatus }
  setAllowCustomValue?: boolean
  addOptions: string[]
  addMaterialSlugs: string[]
  addFinishSlugs: string[]
  addEnumValues: string[]
}

export interface ImportProductChange {
  productSlug: string
  productId: number
  rows: ImportRowChange[]
}

export interface ImportPlan {
  errors: ImportIssue[]
  warnings: ImportIssue[]
  products: ImportProductChange[]
  newCatalogOptions: { dimensionKey: string; machineValue: string; label: string }[]
  /** Rows read / rows that carried a value / rows ignored (no value). */
  counts: { rows: number; withValue: number; ignored: number; duplicates: number }
}

const isStatus = (value: string): value is DataStatus => (DATA_STATUSES as readonly string[]).includes(value)

interface ValueRow {
  index: number
  row: ReviewRow
  status: DataStatus
}

/**
 * Validates review rows against the registry and catalogues and computes the
 * additive changes. With any error the plan must not be applied. Re-planning
 * after an apply yields no changes (idempotent).
 */
export function planImport(rows: ReviewRow[], context: ImportContext): ImportPlan {
  const errors: ImportIssue[] = []
  const warnings: ImportIssue[] = []
  const counts = { rows: rows.length, withValue: 0, ignored: 0, duplicates: 0 }
  const error = (index: number, message: string) => errors.push({ row: index + 2, message })

  const grouped = new Map<string, ValueRow[]>()
  const seen = new Map<string, { label: string; status: DataStatus; index: number }>()

  rows.forEach((row, index) => {
    if (!row.value) {
      counts.ignored += 1
      if (row.product_slug && !context.products.has(row.product_slug)) error(index, `Produit inconnu « ${row.product_slug} ».`)
      return
    }
    counts.withValue += 1

    const product = context.products.get(row.product_slug)
    if (!product) return error(index, `Produit inconnu « ${row.product_slug} ».`)
    if (row.product_title && normalizeCompare(row.product_title) !== normalizeCompare(product.title)) {
      warnings.push({ row: index + 2, message: `Titre « ${row.product_title} » différent du titre actuel « ${product.title} » (le slug fait foi).` })
    }

    const dimension = context.dimensions.get(row.dimension_key)
    if (!dimension) return error(index, `Dimension inconnue « ${row.dimension_key} ».`)

    if (row.status && !isStatus(row.status)) return error(index, `Statut inconnu « ${row.status} » (attendu : ${DATA_STATUSES.join(', ')}).`)
    const status: DataStatus = isStatus(row.status) ? row.status : 'confirmed'

    const problem = validateValue(row, dimension, context)
    if (problem) return error(index, problem)

    const identity = `${row.product_slug}|${row.dimension_key}|${row.value}`
    const previous = seen.get(identity)
    if (previous) {
      counts.duplicates += 1
      if ((row.value_label && previous.label && row.value_label !== previous.label) || previous.status !== status) {
        error(index, `Ligne en conflit avec la ligne ${previous.index + 2} (même produit, dimension et valeur).`)
      }
      return
    }
    seen.set(identity, { label: row.value_label, status, index })

    const key = `${row.product_slug}|${row.dimension_key}`
    grouped.set(key, [...(grouped.get(key) ?? []), { index, row, status }])
  })

  const products = new Map<string, ImportProductChange>()
  const newOptions = new Map<string, { dimensionKey: string; machineValue: string; label: string }>()

  for (const entries of grouped.values()) {
    const { row: first } = entries[0]
    const statuses = new Set(entries.map((entry) => entry.status))
    if (statuses.size > 1) {
      error(entries[0].index, `Statuts contradictoires pour ${first.product_slug} / ${first.dimension_key}.`)
      continue
    }
    const status = entries[0].status
    const product = context.products.get(first.product_slug)!
    const dimension = context.dimensions.get(first.dimension_key)!
    const existing = product.rows.get(first.dimension_key)

    const change: ImportRowChange = {
      dimensionKey: first.dimension_key,
      action: existing ? 'update' : 'create',
      addOptions: [],
      addMaterialSlugs: [],
      addFinishSlugs: [],
      addEnumValues: [],
    }
    if (!existing || existing.dataStatus !== status) change.statusChange = { from: existing?.dataStatus, to: status }

    for (const { row } of entries) {
      if (row.value === CUSTOM_VALUE) {
        if (!existing?.allowCustomValue) change.setAllowCustomValue = true
        continue
      }
      switch (dimension.optionSource) {
        case 'materials':
          if (!existing?.materialIds.includes(context.materials.get(row.value)!.id)) change.addMaterialSlugs.push(row.value)
          break
        case 'finishes':
          if (!existing?.finishIds.includes(context.finishes.get(row.value)!.id)) change.addFinishSlugs.push(row.value)
          break
        case 'enum':
          if (!existing?.enumValues.includes(row.value)) change.addEnumValues.push(row.value)
          break
        default: {
          if (!existing?.optionValues.includes(row.value)) change.addOptions.push(row.value)
          const optionKey = `${row.dimension_key}|${row.value}`
          if (!context.catalogOptions.has(optionKey)) {
            newOptions.set(optionKey, { dimensionKey: row.dimension_key, machineValue: row.value, label: row.value_label || row.value })
          }
        }
      }
    }

    const changed =
      change.action === 'create' ||
      change.statusChange ||
      change.setAllowCustomValue ||
      change.addOptions.length ||
      change.addMaterialSlugs.length ||
      change.addFinishSlugs.length ||
      change.addEnumValues.length
    if (!changed) continue

    const entry = products.get(first.product_slug) ?? { productSlug: first.product_slug, productId: product.id, rows: [] }
    entry.rows.push(change)
    products.set(first.product_slug, entry)
  }

  return {
    errors,
    warnings,
    products: [...products.values()].sort((a, b) => a.productSlug.localeCompare(b.productSlug)),
    newCatalogOptions: [...newOptions.values()],
    counts,
  }
}

function normalizeCompare(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function validateValue(
  row: ReviewRow,
  dimension: { optionSource: DimensionOptionSource; valueType: DimensionValueType },
  context: ImportContext,
): string | undefined {
  if (row.value === CUSTOM_VALUE) {
    return dimension.valueType === 'boolean' ? 'Une dimension booléenne n’accepte pas de saisie libre.' : undefined
  }
  switch (dimension.optionSource) {
    case 'materials':
      return context.materials.has(row.value) ? undefined : `Support inconnu « ${row.value} ».`
    case 'finishes':
      return context.finishes.has(row.value) ? undefined : `Finition inconnue « ${row.value} ».`
    case 'enum':
      return ENUM_LABELS_BY_DIMENSION[row.dimension_key]?.[row.value] ? undefined : `Valeur « ${row.value} » non autorisée pour ${row.dimension_key}.`
    case 'custom':
      return `La dimension « ${row.dimension_key} » est en saisie libre : utilisez la valeur ${CUSTOM_VALUE}.`
    default: {
      if (row.value.length > 200) return 'Valeur trop longue (200 caractères maximum).'
      const existingLabel = context.catalogOptions.get(`${row.dimension_key}|${row.value}`)
      if (existingLabel !== undefined && row.value_label && row.value_label !== existingLabel) {
        return `Le libellé « ${row.value_label} » diffère de l’option existante « ${existingLabel} ».`
      }
      return undefined
    }
  }
}

export function renderImportDiff(plan: ImportPlan): string {
  const lines: string[] = []
  lines.push(
    `Lignes : ${plan.counts.rows} (avec valeur : ${plan.counts.withValue}, ignorées : ${plan.counts.ignored}, doublons : ${plan.counts.duplicates})`,
  )
  for (const warning of plan.warnings) lines.push(`⚠ ligne ${warning.row} : ${warning.message}`)
  for (const issue of plan.errors) lines.push(`✖ ligne ${issue.row} : ${issue.message}`)
  if (!plan.errors.length) {
    if (plan.newCatalogOptions.length) {
      lines.push(`Options de catalogue à créer : ${plan.newCatalogOptions.length}`)
      for (const option of plan.newCatalogOptions) lines.push(`  + ${option.dimensionKey} = ${option.machineValue} (« ${option.label} »)`)
    }
    lines.push(plan.products.length ? `Produits modifiés : ${plan.products.length}` : 'Aucun changement.')
    for (const product of plan.products) {
      lines.push(`  ${product.productSlug}`)
      for (const row of product.rows) {
        const parts = [
          row.action === 'create' ? 'nouvelle dimension' : 'mise à jour',
          row.statusChange ? `statut ${row.statusChange.from ?? '—'} → ${row.statusChange.to}` : '',
          row.setAllowCustomValue ? 'saisie libre autorisée' : '',
          row.addOptions.length ? `+options ${row.addOptions.join(', ')}` : '',
          row.addMaterialSlugs.length ? `+supports ${row.addMaterialSlugs.join(', ')}` : '',
          row.addFinishSlugs.length ? `+finitions ${row.addFinishSlugs.join(', ')}` : '',
          row.addEnumValues.length ? `+valeurs ${row.addEnumValues.join(', ')}` : '',
        ].filter(Boolean)
        lines.push(`    ${row.dimensionKey}: ${parts.join(' ; ')}`)
      }
    }
  }
  return lines.join('\n')
}
