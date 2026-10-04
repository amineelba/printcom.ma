import { describe, expect, it } from 'vitest'
import { auditProducts, collectReviewItems, renderAuditMarkdown, renderReviewMarkdown } from '@/lib/configurator-schema/audit'
import { planProducts } from '@/lib/configurator-schema/backfillPlan'
import { seedSources } from '@/lib/configurator-schema/sources'
import { PRODUCTS } from '@/lib/seed/content/products'
import { GOODIES_PRODUCTS } from '@/lib/seed/content/goodiesProducts'
import { makeSnapshot } from './helpers'
import type { ProductSnapshot } from '@/lib/configurator-schema/types'

const categoryTitles: Record<string, string> = {
  'goodies-objets-publicitaires': 'Goodies & objets publicitaires',
}

function catalogueSnapshots(): ProductSnapshot[] {
  return [...PRODUCTS, ...GOODIES_PRODUCTS].map((product, index) =>
    makeSnapshot({
      id: index + 1,
      slug: product.slug,
      title: product.title,
      categorySlug: product.category,
      categoryTitle: categoryTitles[product.category] ?? product.category,
      description: product.longDescription,
    }),
  )
}

describe('audit — every product, nothing skipped', () => {
  const snapshots = catalogueSnapshots()
  const plans = planProducts(snapshots)
  const audit = auditProducts(snapshots, plans)

  it('covers all 94 products (79 catalogue + 15 goodies)', () => {
    expect(snapshots).toHaveLength(94)
    expect(audit.products).toHaveLength(94)
    expect(audit.summary.total).toBe(94)
    expect(new Set(audit.products.map((entry) => entry.slug)).size).toBe(94)
  })

  it('splits sourced / unsourced products exactly', () => {
    expect(audit.summary.withAuthoritativeSource).toBe(79)
    expect(audit.summary.withoutSource).toBe(15)
    expect(audit.products.filter((entry) => !entry.sourceKind).every((entry) => entry.category === 'Goodies & objets publicitaires')).toBe(true)
  })

  it('without confirmed CMS values nothing is complete: everything awaits review', () => {
    expect(audit.summary.completeUsableConfigurator).toBe(0)
    expect(audit.summary.partiallyBackfilled).toBe(0)
    expect(audit.summary.requiringReview).toBe(94)
  })

  it('per-category counts add up to the totals', () => {
    const categories = Object.values(audit.categories)
    expect(categories.reduce((total, counts) => total + counts.total, 0)).toBe(94)
    expect(categories.reduce((total, counts) => total + counts.withAuthoritativeSource, 0)).toBe(79)
    expect(Object.keys(audit.categories)).toHaveLength(9)
  })

  it('every entry records its source dimensions with provenance and mapping confidence', () => {
    const cards = audit.products.find((entry) => entry.slug === 'cartes-de-visite')!
    expect(cards.sourceKind).toBe('seed-source')
    expect(cards.authoritativeDimensions.map((dimension) => [dimension.sourceText, dimension.canonicalKey])).toEqual([
      ['format', 'format'],
      ['orientation', 'orientation'],
      ['support', 'material'],
      ['grammage', 'grammage'],
      ['recto-verso', 'print-sides'],
      ['finition', 'finish'],
    ])
    expect(cards.authoritativeDimensions.every((dimension) => dimension.provenance === 'seed-source' && dimension.confidence === 'confirmed')).toBe(true)
    const envelopes = audit.products.find((entry) => entry.slug === 'enveloppes')!
    expect(envelopes.unsupportedDimensions).toEqual(expect.arrayContaining(['papier', 'impression']))
    expect(envelopes.authoritativeDimensions.find((dimension) => dimension.canonicalKey === 'papier')?.confidence).toBe('unverified')
  })

  it('never marks anything "not applicable" (no source declares it)', () => {
    expect(audit.products.every((entry) => entry.notApplicable.length === 0)).toBe(true)
  })

  it('the audit and the review queue are deterministic', () => {
    expect(JSON.stringify(auditProducts(snapshots, planProducts(snapshots)))).toBe(JSON.stringify(audit))
    expect(collectReviewItems(planProducts(snapshots))).toEqual(collectReviewItems(plans))
  })

  it('the review queue is grouped category → product and each item is actionable', () => {
    const items = collectReviewItems(plans)
    expect(items.length).toBeGreaterThan(300)
    const sorted = [...items].sort((a, b) => a.category.localeCompare(b.category) || a.productSlug.localeCompare(b.productSlug))
    expect(items.map((item) => item.productSlug)).toEqual(sorted.map((item) => item.productSlug))
    for (const item of items) {
      expect(item.action.length).toBeGreaterThan(0)
      expect(['missing-values', 'ambiguous-dimension', 'conflicting-source', 'unmapped-legacy-value', 'missing-product-source']).toContain(item.status)
    }
    expect(items.filter((item) => item.status === 'missing-product-source')).toHaveLength(15)
  })

  it('renders Markdown with the summary, per-category table and no secrets', () => {
    const markdown = renderAuditMarkdown(audit)
    expect(markdown).toContain('| Total produits | 94 |')
    expect(markdown).toContain('Goodies & objets publicitaires')
    expect(renderReviewMarkdown(collectReviewItems(plans))).toContain('missing-product-source')
    expect(markdown).not.toMatch(/DATABASE_URL|password|secret/i)
  })

  it('every source dimension of the catalogue is accounted for in the registry usage table', () => {
    const used = new Set(audit.dimensions.map((dimension) => dimension.key))
    for (const source of seedSources()) {
      const entry = audit.products.find((product) => product.slug === source.slug)!
      for (const dimension of entry.authoritativeDimensions) expect(used.has(dimension.canonicalKey)).toBe(true)
    }
  })
})

describe('audit states', () => {
  it('complete / partial / review / no-source', () => {
    const full = makeSnapshot({ slug: 'cartes-de-visite', legacy: { formats: [{ label: 'A4' }], orientations: ['portrait'], materialIds: [1], grammages: [{ label: '350 g' }], printSides: ['single'], finishIds: [2] } })
    const partial = makeSnapshot({ id: 2, slug: 'papier-a-en-tete', title: 'Papier à en-tête', legacy: { formats: [{ label: 'A4' }] } })
    const none = makeSnapshot({ id: 3, slug: 'enveloppes', title: 'Enveloppes' })
    const orphan = makeSnapshot({ id: 4, slug: 'orphelin', title: 'Orphelin' })
    const snapshots = [full, partial, none, orphan]
    const audit = auditProducts(snapshots, planProducts(snapshots))
    const state = (slug: string) => audit.products.find((entry) => entry.slug === slug)?.state
    expect(state('cartes-de-visite')).toBe('complete')
    expect(state('papier-a-en-tete')).toBe('partial')
    expect(state('enveloppes')).toBe('review')
    expect(state('orphelin')).toBe('no-source')
    expect(audit.summary).toMatchObject({ total: 4, completeUsableConfigurator: 1, partiallyBackfilled: 1, withoutSource: 1 })
  })

  it('throws instead of silently skipping a product without a plan', () => {
    expect(() => auditProducts([makeSnapshot()], [])).toThrow(/every product/)
  })
})
