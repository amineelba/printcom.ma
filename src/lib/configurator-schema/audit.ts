import type { DataStatus } from './constants'
import type { SourceKind } from './sources'
import type { ProductPlan, ProductSnapshot, ReviewItem } from './types'

export type AuditState = 'complete' | 'partial' | 'review' | 'no-source'

export interface ProductAuditEntry {
  productId: number
  slug: string
  title: string
  category: string
  status?: string | null
  sourceKind?: SourceKind
  authoritativeDimensions: {
    sourceText: string
    canonicalKey: string
    displayLabel: string
    provenance: SourceKind
    /** `confirmed` = the wording maps to a dimension without ambiguity; `unverified` = ambiguous. */
    confidence: 'confirmed' | 'unverified'
    mapping: 'mapped' | 'exact' | 'ambiguous'
  }[]
  existingConfiguration: {
    formats: string[]
    customFormatAvailable: boolean
    orientations: string[]
    pageCounts: string[]
    printSides: string[]
    colorModes: string[]
    materials: number
    grammages: string[]
    finishes: number
    quantities: string[]
  }
  existingSchemaRows: { dimensionKey: string; dataStatus: DataStatus; valueCount: number }[]
  /** Rows a backfill would add or fill. */
  plannedRows: { dimensionKey: string; action: 'create' | 'fill-existing'; dataStatus: DataStatus; valueCount: number }[]
  /** Source dimensions that still have no confirmed values after the planned backfill. */
  missingDimensions: string[]
  /** Ambiguous source terms: not rendered until a human resolves them. */
  unsupportedDimensions: string[]
  conflicts: string[]
  /** Always empty: no source declares a dimension "not applicable" to a product. */
  notApplicable: string[]
  reviewRequired: boolean
  state: AuditState
}

export interface AuditCounts {
  total: number
  withAuthoritativeSource: number
  completeUsableConfigurator: number
  partiallyBackfilled: number
  requiringReview: number
  withoutSource: number
}

export interface ProductAudit {
  summary: AuditCounts
  categories: Record<string, AuditCounts>
  products: ProductAuditEntry[]
  /** Registry usage: dimension key → label and number of products naming it. */
  dimensions: { key: string; label: string; products: number; ambiguous: boolean }[]
}

const valueCount = (row: { optionValues: string[]; materialIds: number[]; finishIds: number[]; enumValues: string[] }) =>
  row.optionValues.length + row.materialIds.length + row.finishIds.length + row.enumValues.length

const emptyCounts = (): AuditCounts => ({
  total: 0,
  withAuthoritativeSource: 0,
  completeUsableConfigurator: 0,
  partiallyBackfilled: 0,
  requiringReview: 0,
  withoutSource: 0,
})

/**
 * Deterministic audit of every product. `plans` must come from the same
 * snapshots (`planProducts`). Nothing is skipped: a product without a
 * source still gets an entry with state `no-source`.
 */
export function auditProducts(snapshots: ProductSnapshot[], plans: ProductPlan[]): ProductAudit {
  const planBySlug = new Map(plans.map((plan) => [plan.slug, plan]))
  const products: ProductAuditEntry[] = []

  for (const snapshot of [...snapshots].sort((a, b) => (a.categorySlug ?? '').localeCompare(b.categorySlug ?? '') || a.slug.localeCompare(b.slug))) {
    const plan = planBySlug.get(snapshot.slug)
    if (!plan) throw new Error(`No plan for product "${snapshot.slug}" — audit must cover every product.`)

    const sourceKind = plan.sourceKind
    const confirmedKeys = new Set<string>([
      ...snapshot.schema.filter((row) => row.dataStatus === 'confirmed' && (valueCount(row) > 0 || row.allowCustomValue)).map((row) => row.dimensionKey),
      ...plan.rows.filter((row) => row.dataStatus === 'confirmed').map((row) => row.dimension.key),
    ])

    const authoritativeDimensions = plan.authoritative.map((entry) => ({
      sourceText: entry.raw,
      canonicalKey: entry.key,
      displayLabel: entry.label,
      provenance: sourceKind as SourceKind,
      confidence: entry.confidence === 'ambiguous' ? ('unverified' as const) : ('confirmed' as const),
      mapping: entry.confidence,
    }))

    const missingDimensions = plan.authoritative.filter((entry) => !confirmedKeys.has(entry.key)).map((entry) => entry.key)
    const unsupportedDimensions = plan.authoritative.filter((entry) => entry.confidence === 'ambiguous').map((entry) => entry.key)
    const conflicts = plan.review.filter((item) => item.status === 'conflicting-source' || item.status === 'unmapped-legacy-value').map(describe)
    const reviewRequired = plan.review.length > 0 || missingDimensions.length > 0

    let state: AuditState
    if (!sourceKind) state = 'no-source'
    else if (!reviewRequired) state = 'complete'
    else if (confirmedKeys.size > 0) state = 'partial'
    else state = 'review'

    products.push({
      productId: snapshot.id,
      slug: snapshot.slug,
      title: snapshot.title,
      category: plan.category,
      status: snapshot.status,
      sourceKind,
      authoritativeDimensions,
      existingConfiguration: {
        formats: snapshot.legacy.formats.map((row) => row.label),
        customFormatAvailable: snapshot.legacy.customFormatAvailable,
        orientations: snapshot.legacy.orientations,
        pageCounts: snapshot.legacy.pageCounts.map((row) => row.label),
        printSides: snapshot.legacy.printSides,
        colorModes: snapshot.legacy.colorModes,
        materials: snapshot.legacy.materialIds.length,
        grammages: snapshot.legacy.grammages.map((row) => row.label),
        finishes: snapshot.legacy.finishIds.length,
        quantities: snapshot.legacy.quantities.map((row) => row.label),
      },
      existingSchemaRows: snapshot.schema.map((row) => ({ dimensionKey: row.dimensionKey, dataStatus: row.dataStatus, valueCount: valueCount(row) })),
      plannedRows: plan.rows.map((row) => ({
        dimensionKey: row.dimension.key,
        action: row.action,
        dataStatus: row.dataStatus,
        valueCount: row.options.length + row.materialIds.length + row.finishIds.length + row.enumOptions.length,
      })),
      missingDimensions,
      unsupportedDimensions,
      conflicts,
      notApplicable: [],
      reviewRequired,
      state,
    })
  }

  const summary = emptyCounts()
  const categories: Record<string, AuditCounts> = {}
  for (const entry of products) {
    const counts = (categories[entry.category] ??= emptyCounts())
    for (const target of [summary, counts]) {
      target.total += 1
      if (entry.sourceKind) target.withAuthoritativeSource += 1
      else target.withoutSource += 1
      if (entry.state === 'complete') target.completeUsableConfigurator += 1
      if (entry.state === 'partial') target.partiallyBackfilled += 1
      if (entry.reviewRequired) target.requiringReview += 1
    }
  }

  const usage = new Map<string, { label: string; products: number; ambiguous: boolean }>()
  for (const entry of products) {
    for (const dimension of entry.authoritativeDimensions) {
      const current = usage.get(dimension.canonicalKey) ?? { label: dimension.displayLabel, products: 0, ambiguous: false }
      current.products += 1
      current.ambiguous = current.ambiguous || dimension.mapping === 'ambiguous'
      usage.set(dimension.canonicalKey, current)
    }
  }

  return {
    summary,
    categories: Object.fromEntries(Object.entries(categories).sort(([a], [b]) => a.localeCompare(b))),
    products,
    dimensions: [...usage.entries()]
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.products - a.products || a.key.localeCompare(b.key)),
  }
}

function describe(item: ReviewItem): string {
  return [item.dimensionLabel ?? item.productTitle, item.notes ?? item.action].filter(Boolean).join(' — ')
}

/** Review queue: every review item, grouped category → product. */
export function collectReviewItems(plans: ProductPlan[]): ReviewItem[] {
  return plans
    .flatMap((plan) => plan.review)
    .sort(
      (a, b) =>
        a.category.localeCompare(b.category) ||
        a.productSlug.localeCompare(b.productSlug) ||
        (a.dimensionKey ?? '').localeCompare(b.dimensionKey ?? '') ||
        a.status.localeCompare(b.status),
    )
}

export function renderAuditMarkdown(audit: ProductAudit): string {
  const { summary } = audit
  const lines: string[] = [
    '# Audit du configurateur produit',
    '',
    'Généré par `pnpm configurator:audit`. Aucune valeur technique n’est inventée : une dimension connue sans valeur confirmée est signalée, jamais remplie.',
    '',
    '## Synthèse',
    '',
    '| Indicateur | Produits |',
    '|---|---:|',
    `| Total produits | ${summary.total} |`,
    `| Avec une source de dimensions | ${summary.withAuthoritativeSource} |`,
    `| Configurateur complet et exploitable | ${summary.completeUsableConfigurator} |`,
    `| Partiellement renseignés | ${summary.partiallyBackfilled} |`,
    `| À revoir | ${summary.requiringReview} |`,
    `| Sans source | ${summary.withoutSource} |`,
    '',
    '## Par catégorie',
    '',
    '| Catégorie | Produits | Avec source | Complets | Partiels | À revoir | Sans source |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...Object.entries(audit.categories).map(
      ([name, c]) => `| ${name} | ${c.total} | ${c.withAuthoritativeSource} | ${c.completeUsableConfigurator} | ${c.partiallyBackfilled} | ${c.requiringReview} | ${c.withoutSource} |`,
    ),
    '',
    '## Produits',
    '',
  ]

  let category = ''
  for (const entry of audit.products) {
    if (entry.category !== category) {
      category = entry.category
      lines.push(`### ${category}`, '')
    }
    lines.push(`#### ${entry.title} (\`${entry.slug}\`)`, '')
    lines.push(`- État : **${entry.state}** — source : ${entry.sourceKind ?? 'aucune'}`)
    if (entry.authoritativeDimensions.length) {
      lines.push('- Dimensions de la source :')
      for (const dimension of entry.authoritativeDimensions) {
        const flags = [dimension.mapping === 'mapped' ? 'synonyme révisé' : dimension.mapping === 'ambiguous' ? 'ambigu' : 'terme propre']
        const state = entry.missingDimensions.includes(dimension.canonicalKey) ? 'valeurs à confirmer' : 'valeurs confirmées'
        lines.push(`  - « ${dimension.sourceText} » → \`${dimension.canonicalKey}\` (${flags.join(', ')}) — ${state}`)
      }
    }
    const existing = entry.existingConfiguration
    const present = [
      existing.formats.length && `formats : ${existing.formats.join(', ')}`,
      existing.customFormatAvailable && 'format sur mesure',
      existing.orientations.length && `orientations : ${existing.orientations.join(', ')}`,
      existing.pageCounts.length && `pages : ${existing.pageCounts.join(', ')}`,
      existing.printSides.length && `impression : ${existing.printSides.join(', ')}`,
      existing.colorModes.length && `couleur : ${existing.colorModes.join(', ')}`,
      existing.materials && `${existing.materials} support(s)`,
      existing.grammages.length && `grammages : ${existing.grammages.join(', ')}`,
      existing.finishes && `${existing.finishes} finition(s)`,
      existing.quantities.length && `quantités : ${existing.quantities.join(', ')}`,
    ].filter(Boolean)
    lines.push(`- Configuration existante : ${present.length ? present.join(' ; ') : 'aucune'}`)
    if (entry.conflicts.length) lines.push(`- Conflits : ${entry.conflicts.join(' | ')}`)
    lines.push('')
  }

  lines.push('## Registre de dimensions (usage)', '', '| Clé | Libellé | Produits | Ambigu |', '|---|---|---:|---|')
  for (const dimension of audit.dimensions) {
    lines.push(`| \`${dimension.key}\` | ${dimension.label} | ${dimension.products} | ${dimension.ambiguous ? 'oui' : ''} |`)
  }
  lines.push('')
  return lines.join('\n')
}

export function renderReviewMarkdown(items: ReviewItem[]): string {
  const lines: string[] = [
    '# File de revue — configuration technique',
    '',
    'Liste de travail unique : chaque ligne est une information à confirmer. Rien ici n’a été deviné.',
    '',
    `Total : **${items.length}** point(s).`,
    '',
  ]
  const byStatus = new Map<string, number>()
  for (const item of items) byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + 1)
  lines.push('| Statut | Points |', '|---|---:|', ...[...byStatus.entries()].sort().map(([status, count]) => `| ${status} | ${count} |`), '')

  let category = ''
  let product = ''
  for (const item of items) {
    if (item.category !== category) {
      category = item.category
      product = ''
      lines.push(`## ${category}`, '')
    }
    if (item.productSlug !== product) {
      product = item.productSlug
      lines.push(`### ${item.productTitle}`, '')
    }
    lines.push(
      `- **${item.dimensionLabel ?? 'Produit'}** — \`${item.status}\``,
      `  - Source : ${item.source}`,
      `  - Valeurs existantes : ${item.existingValues.length ? item.existingValues.join(', ') : 'aucune'}`,
      `  - Action : ${item.action}`,
      ...(item.notes ? [`  - Note : ${item.notes}`] : []),
    )
  }
  lines.push('')
  return lines.join('\n')
}

