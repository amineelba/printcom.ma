import { describe, expect, it } from 'vitest'
import { planProduct, planProducts } from '@/lib/configurator-schema/backfillPlan'
import { resolveProductSource, seedSources, type ProductSource } from '@/lib/configurator-schema/sources'
import { applyPlanToSnapshot, makeSnapshot } from './helpers'

const source = (dimensions: string[], kind: ProductSource['kind'] = 'seed-source'): ProductSource => ({
  title: 'Cartes de visite',
  slug: 'cartes-de-visite',
  dimensions,
  kind,
})
const plan = (snapshot: ReturnType<typeof makeSnapshot>, dimensions?: string[]) =>
  planProduct(snapshot, dimensions ? { source: source(dimensions) } : {})
const rowFor = (result: ReturnType<typeof plan>, key: string) => result.rows.find((row) => row.dimension.key === key)

describe('backfill — legacy values become product-specific rows', () => {
  const snapshot = makeSnapshot({
    legacy: {
      formats: [
        { label: 'A4', description: '210 × 297 mm', imageId: 61, previewImageId: 62 },
        { label: 'A5' },
      ],
      customFormatAvailable: true,
      orientations: ['portrait', 'landscape'],
      pageCounts: [{ label: '8 pages' }],
      printSides: ['single', 'double'],
      colorModes: ['cmyk'],
      materialIds: [21, 22],
      grammages: [{ label: '350 g' }, { label: '400 g' }],
      finishIds: [41],
      quantities: [{ label: '100' }, { label: '500' }],
    },
  })
  const result = plan(snapshot)

  it('creates a confirmed row per legacy dimension, in the historical order', () => {
    expect(result.rows.map((row) => `${row.dimension.key}:${row.dataStatus}`)).toEqual([
      'format:confirmed',
      'orientation:confirmed',
      'page-count:confirmed',
      'print-sides:confirmed',
      'color-mode:confirmed',
      'material:confirmed',
      'grammage:confirmed',
      'finish:confirmed',
      'quantity:confirmed',
    ])
  })

  it('migrates formats (order kept) and the custom-format capability', () => {
    const format = rowFor(result, 'format')!
    expect(format.options.map((option) => option.value)).toEqual(['A4', 'A5'])
    expect(format.allowCustomValue).toBe(true)
    expect(format.source).toBe('existing-product-field')
  })

  it('migrates enums, page counts, grammages and quantities verbatim', () => {
    expect(rowFor(result, 'orientation')!.enumOptions).toEqual(['portrait', 'landscape'])
    expect(rowFor(result, 'print-sides')!.enumOptions).toEqual(['single', 'double'])
    expect(rowFor(result, 'color-mode')!.enumOptions).toEqual(['cmyk'])
    expect(rowFor(result, 'page-count')!.options.map((o) => o.value)).toEqual(['8 pages'])
    expect(rowFor(result, 'grammage')!.options.map((o) => o.value)).toEqual(['350 g', '400 g'])
    expect(rowFor(result, 'quantity')!.options.map((o) => o.value)).toEqual(['100', '500'])
    expect(rowFor(result, 'orientation')!.source).toBe('existing-enum')
  })

  it('keeps existing material and finish relationships (no duplication of the collections)', () => {
    expect(rowFor(result, 'material')!.materialIds).toEqual([21, 22])
    expect(rowFor(result, 'material')!.source).toBe('shared-material')
    expect(rowFor(result, 'finish')!.finishIds).toEqual([41])
    expect(rowFor(result, 'finish')!.source).toBe('shared-finish')
  })

  it('preserves Sprint 3 description, image and previewImage on the product binding', () => {
    expect(rowFor(result, 'format')!.options[0]).toEqual({ value: 'A4', description: '210 × 297 mm', imageId: 61, previewImageId: 62 })
    expect(rowFor(result, 'format')!.options[1]).toEqual({ value: 'A5', description: undefined, imageId: undefined, previewImageId: undefined })
  })

  it('counts the migrated values and leaves nothing for review when there is no source', () => {
    expect(result.legacyValuesMigrated).toBe(2 + 2 + 1 + 2 + 1 + 2 + 2 + 1 + 2)
    expect(result.review.map((item) => item.status)).toEqual(['missing-product-source'])
  })

  it('de-duplicates repeated labels and drops blank ones', () => {
    const messy = makeSnapshot({ legacy: { formats: [{ label: 'A4' }, { label: ' A4 ' }, { label: '  ' }, { label: 'A5' }] } })
    expect(rowFor(plan(messy), 'format')!.options.map((option) => option.value)).toEqual(['A4', 'A5'])
  })
})

describe('backfill — source dimensions without values never get invented options', () => {
  const result = plan(makeSnapshot(), ['format', 'fenêtre', 'fermeture', 'papier', 'position des éléments'])

  it('creates needs-review rows with no values at all', () => {
    expect(result.rows).toHaveLength(5)
    for (const row of result.rows) {
      expect(row.dataStatus).toBe('needs-review')
      expect(row.options).toEqual([])
      expect(row.materialIds).toEqual([])
      expect(row.finishIds).toEqual([])
      expect(row.enumOptions).toEqual([])
      expect(row.allowCustomValue).toBe(false)
    }
    expect(result.legacyValuesMigrated).toBe(0)
  })

  it('follows the source order and records provenance', () => {
    expect(result.rows.map((row) => row.dimension.key)).toEqual(['format', 'fenetre', 'fermeture', 'papier', 'position-des-elements'])
    expect(result.rows.every((row) => row.source === 'seed-source')).toBe(true)
  })

  it('queues one review item per dimension: missing-values, or ambiguous-dimension for overlapping wording', () => {
    const statuses = Object.fromEntries(result.review.map((item) => [item.dimensionKey, item.status]))
    expect(statuses).toEqual({
      format: 'missing-values',
      fenetre: 'missing-values',
      fermeture: 'missing-values',
      papier: 'ambiguous-dimension',
      'position-des-elements': 'missing-values',
    })
  })

  it('takes the display wording from the source when it differs from the registry label', () => {
    const withWording = plan(makeSnapshot(), ['recto-verso', 'pagination', 'support', 'quantité'])
    const byKey = Object.fromEntries(withWording.rows.map((row) => [row.dimension.key, row.labelOverride]))
    expect(byKey).toEqual({ 'print-sides': 'Recto-verso', 'page-count': 'Pagination', material: undefined, quantity: undefined })
  })

  it('is hidden by construction: needs-review rows never render (see the normalizer tests)', () => {
    expect(result.rows.some((row) => row.dataStatus === 'confirmed')).toBe(false)
  })
})

describe('backfill — idempotence and respect for reviewed data', () => {
  const snapshot = makeSnapshot({
    legacy: { formats: [{ label: 'A4' }], orientations: ['portrait'] },
  })
  const dimensions = ['format', 'orientation', 'fenêtre']

  it('running the plan twice changes nothing the second time', () => {
    const first = plan(snapshot, dimensions)
    expect(first.noop).toBe(false)
    const second = plan(applyPlanToSnapshot(snapshot, first), dimensions)
    expect(second.rows).toEqual([])
    expect(second.noop).toBe(true)
  })

  it('the review queue survives a backfill: waiting dimensions are listed again, nothing is hidden by idempotence', () => {
    const first = plan(snapshot, dimensions)
    const second = plan(applyPlanToSnapshot(snapshot, first), dimensions)
    const signature = (items: typeof first.review) => items.map((entry) => `${entry.dimensionKey}:${entry.status}`).sort()
    expect(signature(first.review)).toEqual(['fenetre:missing-values'])
    expect(signature(second.review)).toEqual(signature(first.review))
  })

  it('a conflicting-source flag on legacy-only values persists until a human settles the row', () => {
    const legacyOnly = makeSnapshot({ legacy: { grammages: [{ label: '350 g' }] } })
    const first = plan(legacyOnly, ['format'])
    const afterBackfill = applyPlanToSnapshot(legacyOnly, first)
    expect(plan(afterBackfill, ['format']).review.map((item) => item.status)).toContain('conflicting-source')
    const settled = {
      ...afterBackfill,
      schema: afterBackfill.schema.map((row) => (row.dimensionKey === 'grammage' ? { ...row, source: 'manual' as const } : row)),
    }
    expect(plan(settled, ['format']).review.map((item) => item.status)).not.toContain('conflicting-source')
  })

  it('never overwrites a manually reviewed row, even when legacy values differ', () => {
    const reviewed = makeSnapshot({
      legacy: { formats: [{ label: 'A4' }, { label: 'A5' }] },
      schema: [{ dimensionKey: 'format', dataStatus: 'confirmed', source: 'manual', allowCustomValue: false, optionValues: ['A4'], materialIds: [], finishIds: [], enumValues: [] }],
    })
    const result = plan(reviewed, ['format'])
    expect(rowFor(result, 'format')).toBeUndefined()
    expect(result.noop).toBe(true)
  })

  it('never reorders or touches existing rows: new dimensions are only appended', () => {
    const existing = makeSnapshot({
      schema: [{ dimensionKey: 'reliure', dataStatus: 'confirmed', source: 'manual', allowCustomValue: false, optionValues: ['Spirale'], materialIds: [], finishIds: [], enumValues: [] }],
    })
    const result = plan(existing, ['reliure', 'format'])
    expect(result.rows.map((row) => row.dimension.key)).toEqual(['format'])
  })

  it('fills a still-empty needs-review row created by an earlier backfill once legacy values exist', () => {
    const earlier = makeSnapshot({
      legacy: { formats: [{ label: 'A4' }] },
      schema: [{ dimensionKey: 'format', dataStatus: 'needs-review', source: 'seed-source', allowCustomValue: false, optionValues: [], materialIds: [], finishIds: [], enumValues: [] }],
    })
    const result = plan(earlier, ['format'])
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toMatchObject({ action: 'fill-existing', dataStatus: 'confirmed' })
  })

  it('does not fill a needs-review row a human edited (source manual)', () => {
    const edited = makeSnapshot({
      legacy: { formats: [{ label: 'A4' }] },
      schema: [{ dimensionKey: 'format', dataStatus: 'needs-review', source: 'manual', allowCustomValue: false, optionValues: [], materialIds: [], finishIds: [], enumValues: [] }],
    })
    expect(plan(edited, ['format']).rows).toEqual([])
  })
})

describe('backfill — product-specific allowlists, no category inheritance', () => {
  it('two products of the same category get different rows from their own source and values', () => {
    const cards = planProduct(
      makeSnapshot({ id: 1, slug: 'cartes', legacy: { formats: [{ label: 'A6' }], orientations: ['portrait'] } }),
      { source: { ...source(['format', 'orientation']), slug: 'cartes' } },
    )
    const letterhead = planProduct(
      makeSnapshot({ id: 2, slug: 'en-tete', legacy: { formats: [{ label: 'A4' }] } }),
      { source: { ...source(['format', 'marges']), slug: 'en-tete' } },
    )
    expect(cards.category).toBe(letterhead.category)
    expect(cards.rows.map((row) => row.dimension.key)).toEqual(['format', 'orientation'])
    expect(letterhead.rows.map((row) => row.dimension.key)).toEqual(['format', 'marges'])
    expect(rowFor(cards, 'format')!.options.map((o) => o.value)).toEqual(['A6'])
    expect(rowFor(letterhead, 'format')!.options.map((o) => o.value)).toEqual(['A4'])
  })

  it('a product with no values gets no values just because a sibling has some', () => {
    const rich = makeSnapshot({ id: 1, slug: 'riche', legacy: { formats: [{ label: 'A4' }], materialIds: [21] } })
    const bare = makeSnapshot({ id: 2, slug: 'nue' })
    const plans = planProducts([rich, bare], { seed: [] })
    const richPlan = plans.find((entry) => entry.slug === 'riche')!
    const barePlan = plans.find((entry) => entry.slug === 'nue')!
    expect(richPlan.rows.length).toBeGreaterThan(0)
    expect(barePlan.rows).toEqual([])
  })

  it('legacy values for a dimension the source does not name are kept and flagged conflicting-source', () => {
    const result = plan(makeSnapshot({ legacy: { grammages: [{ label: '350 g' }] } }), ['format'])
    expect(rowFor(result, 'grammage')).toMatchObject({ dataStatus: 'confirmed' })
    expect(result.review.find((item) => item.dimensionKey === 'grammage')?.status).toBe('conflicting-source')
  })

  it('an ambiguous source term overlapping existing legacy values gets an explanatory review note', () => {
    const result = plan(makeSnapshot({ legacy: { materialIds: [21] } }), ['papier'])
    const note = result.review.find((item) => item.dimensionKey === 'papier')?.notes ?? ''
    expect(note).toContain('Support')
    expect(result.rows.find((row) => row.dimension.key === 'material')?.materialIds).toEqual([21])
  })

  it('a product without a source and without values yields only a missing-product-source item', () => {
    const result = plan(makeSnapshot({ slug: 'goodie' }))
    expect(result.rows).toEqual([])
    expect(result.review.map((item) => item.status)).toEqual(['missing-product-source'])
  })

  it('a disagreement between two sources is surfaced', () => {
    const resolved = resolveProductSource({
      slug: 'cartes-de-visite',
      title: 'Cartes de visite',
      master: [{ title: 'Cartes de visite', slug: 'cartes-de-visite', dimensions: ['format'], kind: 'master-content' }],
      seed: [{ title: 'Cartes de visite', slug: 'cartes-de-visite', dimensions: ['format', 'support'], kind: 'seed-source' }],
    })
    const result = planProduct(makeSnapshot(), resolved)
    expect(result.review.some((item) => item.status === 'conflicting-source' && !item.dimensionKey)).toBe(true)
    expect(result.sourceKind).toBe('master-content')
  })
})

describe('representative catalogue products have genuinely distinct schemas (from the real source)', () => {
  const titles = [
    'Cartes de visite',
    'Papier à en-tête',
    'Enveloppes',
    'Chemises à rabats',
    'Blocs-notes',
    'Carnets personnalisés',
    'Boîtes pliantes',
    'Étiquettes produits',
    'Étiquettes alimentaires',
    'Étiquettes cosmétiques',
    'Étiquettes en rouleau',
  ]
  const seeds = seedSources()
  const plans = titles.map((title) => {
    const found = seeds.find((entry) => entry.title === title)
    expect(found, title).toBeDefined()
    return planProduct(makeSnapshot({ slug: found!.slug, title }), { source: found })
  })
  const keysOf = (title: string) => plans[titles.indexOf(title)].rows.map((row) => row.dimension.key)

  it('every product keeps exactly the dimensions its own source lists, in source order', () => {
    expect(keysOf('Cartes de visite')).toEqual(['format', 'orientation', 'material', 'grammage', 'print-sides', 'finish'])
    expect(keysOf('Enveloppes')).toEqual(['format', 'fenetre', 'fermeture', 'papier', 'impression', 'position-des-elements'])
    expect(keysOf('Chemises à rabats')).toEqual(['format-ferme', 'rabats', 'encoche-carte', 'material', 'pelliculage', 'decoupe'])
    expect(keysOf('Blocs-notes')).toEqual(['format', 'nombre-de-feuilles', 'papier-interieur', 'dos', 'collage', 'couverture'])
    expect(keysOf('Boîtes pliantes')).toEqual(['dimensions', 'carton', 'decoupe', 'collage', 'impression', 'finish'])
    expect(keysOf('Étiquettes en rouleau')).toEqual(['laize', 'mandrin', 'sens-d-enroulement', 'forme', 'espacement', 'quantity'])
  })

  it('no two representative products share the same dimension set', () => {
    const signatures = plans.map((entry) => [...entry.rows.map((row) => row.dimension.key)].sort().join('|'))
    expect(new Set(signatures).size).toBe(titles.length)
  })

  it('specialized dimensions appear only on the products whose source lists them', () => {
    expect(keysOf('Cartes de visite')).not.toContain('fenetre')
    expect(keysOf('Enveloppes')).toContain('fenetre')
    expect(keysOf('Boîtes pliantes')).not.toContain('adhesif')
    expect(keysOf('Étiquettes produits')).toContain('adhesif')
    expect(keysOf('Étiquettes alimentaires')).toEqual(expect.arrayContaining(['humidite', 'froid']))
    expect(keysOf('Étiquettes cosmétiques')).toContain('courbure')
    expect(keysOf('Carnets personnalisés')).toEqual(expect.arrayContaining(['reliure', 'couverture']))
  })

  it('all of them start needs-review: no option value exists, none is invented', () => {
    for (const entry of plans) {
      expect(entry.rows.every((row) => row.dataStatus === 'needs-review' && row.options.length === 0)).toBe(true)
      expect(entry.legacyValuesMigrated).toBe(0)
    }
  })
})

describe('the whole seeded catalogue is covered (no silent skip)', () => {
  it('every source-backed product plans one row per distinct source dimension', () => {
    for (const entry of seedSources()) {
      const result = planProduct(makeSnapshot({ slug: entry.slug, title: entry.title }), { source: entry })
      const distinct = new Set(result.authoritative.map((dimension) => dimension.key))
      expect(result.rows).toHaveLength(distinct.size)
      expect(result.authoritative.length).toBeGreaterThan(0)
    }
  })
})
