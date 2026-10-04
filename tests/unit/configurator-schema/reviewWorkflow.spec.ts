import { describe, expect, it } from 'vitest'
import { planProducts } from '@/lib/configurator-schema/backfillPlan'
import {
  CUSTOM_VALUE,
  REVIEW_COLUMNS,
  buildExportRows,
  parseCsv,
  parseReviewFile,
  planImport,
  renderImportDiff,
  toCsv,
  type ImportContext,
  type ReviewRow,
} from '@/lib/configurator-schema/reviewWorkflow'
import { makeSnapshot } from './helpers'

const row = (partial: Partial<ReviewRow>): ReviewRow => ({
  category: '',
  product_slug: 'cartes-de-visite',
  product_title: 'Cartes de visite',
  dimension_key: 'format',
  dimension_label: 'Format',
  value: '',
  value_label: '',
  status: '',
  notes: '',
  ...partial,
})

const context = (): ImportContext => ({
  products: new Map([
    ['cartes-de-visite', { id: 1, title: 'Cartes de visite', rows: new Map() }],
    [
      'enveloppes',
      {
        id: 2,
        title: 'Enveloppes',
        rows: new Map([
          ['format', { dimensionKey: 'format', dataStatus: 'confirmed' as const, source: 'manual' as const, allowCustomValue: false, optionValues: ['C5'], materialIds: [], finishIds: [], enumValues: [] }],
        ]),
      },
    ],
  ]),
  dimensions: new Map([
    ['format', { optionSource: 'catalog' as const, valueType: 'single-choice' as const, label: 'Format' }],
    ['material', { optionSource: 'materials' as const, valueType: 'single-choice' as const, label: 'Support' }],
    ['finish', { optionSource: 'finishes' as const, valueType: 'multi-choice' as const, label: 'Finition' }],
    ['orientation', { optionSource: 'enum' as const, valueType: 'single-choice' as const, label: 'Orientation' }],
    ['dimensions', { optionSource: 'custom' as const, valueType: 'dimensions' as const, label: 'Dimensions' }],
    ['fenetre', { optionSource: 'catalog' as const, valueType: 'single-choice' as const, label: 'Fenêtre' }],
  ]),
  catalogOptions: new Map([['format|C5', 'C5']]),
  materials: new Map([['couche-mat', { id: 21, title: 'Couché mat' }]]),
  finishes: new Map([['soft-touch', { id: 41, title: 'Soft Touch' }]]),
})

describe('CSV', () => {
  it('round-trips cells with commas, quotes, newlines and accents', () => {
    const rows = [row({ notes: 'a, "b"\nc', value: 'Sur mesure é', value_label: 'x' })]
    const parsed = parseCsv(toCsv(rows))
    expect(parsed[0]).toEqual([...REVIEW_COLUMNS])
    expect(parsed[1][REVIEW_COLUMNS.indexOf('notes')]).toBe('a, "b"\nc')
    expect(parseReviewFile(toCsv(rows), 'csv').rows[0]).toEqual(rows[0])
  })

  it('tolerates a BOM and CRLF (spreadsheet exports)', () => {
    const csv = `﻿${REVIEW_COLUMNS.join(',')}\r\n,cartes-de-visite,Cartes,format,Format,A4,,,\r\n`
    expect(parseReviewFile(csv, 'csv').rows[0]).toMatchObject({ product_slug: 'cartes-de-visite', value: 'A4' })
  })

  it('rejects unknown and missing columns', () => {
    expect(parseReviewFile('a,b\n1,2', 'csv').errors.join(' ')).toMatch(/inconnue/)
    expect(parseReviewFile(`${REVIEW_COLUMNS.slice(0, 5).join(',')}\n`, 'csv').errors.join(' ')).toMatch(/manquante/)
  })

  it('parses JSON and rejects unknown keys', () => {
    expect(parseReviewFile(JSON.stringify([{ product_slug: 'x', value: 'A4' }]), 'json').rows[0].value).toBe('A4')
    expect(parseReviewFile(JSON.stringify([{ product_slug: 'x', extra: 1 }]), 'json').errors.join(' ')).toMatch(/inconnue/)
    expect(parseReviewFile('{', 'json').errors).toEqual(['JSON invalide.'])
  })
})

describe('export', () => {
  const snapshots = [
    makeSnapshot({ id: 1, slug: 'cartes-de-visite', legacy: { formats: [{ label: 'A4' }], materialIds: [21], orientations: ['portrait'] } }),
    makeSnapshot({ id: 2, slug: 'enveloppes', title: 'Enveloppes' }),
  ]
  const plans = planProducts(snapshots, {
    seed: [
      { title: 'Cartes de visite', slug: 'cartes-de-visite', dimensions: ['format', 'orientation', 'support', 'fenêtre'], kind: 'seed-source' },
      { title: 'Enveloppes', slug: 'enveloppes', dimensions: ['format', 'fermeture'], kind: 'seed-source' },
    ],
  })
  const lookup = { materials: new Map([[21, { slug: 'couche-mat', title: 'Couché mat' }]]), finishes: new Map() }
  const labels = new Map<string, string>([['format', 'Format']])
  const rows = buildExportRows(snapshots, plans, lookup, labels)

  it('has one row per allowed value, using stable slugs (no ids)', () => {
    const forCards = rows.filter((entry) => entry.product_slug === 'cartes-de-visite')
    expect(forCards.filter((entry) => entry.dimension_key === 'format' && entry.value)).toEqual([
      expect.objectContaining({ value: 'A4', value_label: 'A4', status: 'confirmed' }),
    ])
    expect(forCards.find((entry) => entry.dimension_key === 'material')).toMatchObject({ value: 'couche-mat', value_label: 'Couché mat' })
    expect(forCards.find((entry) => entry.dimension_key === 'orientation')).toMatchObject({ value: 'portrait', value_label: 'Portrait' })
  })

  it('has one empty-value row per dimension still waiting, with the reason', () => {
    const waiting = rows.find((entry) => entry.dimension_key === 'fenetre')!
    expect(waiting).toMatchObject({ value: '', status: 'needs-review' })
    expect(waiting.notes).toContain('missing-values')
    expect(rows.find((entry) => entry.product_slug === 'enveloppes' && entry.dimension_key === 'format')).toMatchObject({ value: '', status: 'needs-review' })
  })

  it('uses only the documented columns and never leaks ids', () => {
    for (const entry of rows) expect(Object.keys(entry)).toEqual([...REVIEW_COLUMNS])
    expect(toCsv(rows)).not.toMatch(/"id"|_id/)
  })

  it('exporting then importing the unchanged file changes nothing (round trip)', () => {
    const ctx = context()
    ctx.products.set('cartes-de-visite', {
      id: 1,
      title: 'Cartes de visite',
      rows: new Map([['format', { dimensionKey: 'format', dataStatus: 'confirmed', source: 'existing-product-field', allowCustomValue: false, optionValues: ['A4'], materialIds: [], finishIds: [], enumValues: [] }]]),
    })
    ctx.catalogOptions.set('format|A4', 'A4')
    const onlyFormat = rows.filter((entry) => entry.dimension_key === 'format' && entry.product_slug === 'cartes-de-visite')
    const plan = planImport(onlyFormat, ctx)
    expect(plan.errors).toEqual([])
    expect(plan.products).toEqual([])
  })
})

describe('import — validation (rejects, never guesses)', () => {
  const plan = (rows: ReviewRow[]) => planImport(rows, context())
  const messages = (rows: ReviewRow[]) => plan(rows).errors.map((issue) => issue.message)

  it('rejects an unknown product slug', () => {
    expect(messages([row({ product_slug: 'inconnu', value: 'A4' })])[0]).toMatch(/Produit inconnu/)
  })

  it('rejects an unknown dimension key', () => {
    expect(messages([row({ dimension_key: 'nope', value: 'x' })])[0]).toMatch(/Dimension inconnue/)
  })

  it('rejects an unknown material or finish slug', () => {
    expect(messages([row({ dimension_key: 'material', value: 'inconnu' })])[0]).toMatch(/Support inconnu/)
    expect(messages([row({ dimension_key: 'finish', value: 'inconnue' })])[0]).toMatch(/Finition inconnue/)
  })

  it('rejects an enum value that is not allowed for the dimension', () => {
    expect(messages([row({ dimension_key: 'orientation', value: 'diagonale' })])[0]).toMatch(/non autorisée/)
  })

  it('rejects typed dimensions that are not given the custom marker', () => {
    expect(messages([row({ dimension_key: 'dimensions', value: '120x80' })])[0]).toMatch(/saisie libre/)
    expect(plan([row({ dimension_key: 'dimensions', value: CUSTOM_VALUE })]).errors).toEqual([])
  })

  it('rejects a label that contradicts an existing shared option', () => {
    expect(messages([row({ product_slug: 'enveloppes', value: 'C5', value_label: 'C5 modifié' })])[0]).toMatch(/diffère/)
  })

  it('rejects an unknown status', () => {
    expect(messages([row({ value: 'A4', status: 'maybe' })])[0]).toMatch(/Statut inconnu/)
  })

  it('rejects conflicting duplicate rows but tolerates identical ones', () => {
    const conflicting = messages([row({ value: 'A4', value_label: 'A4' }), row({ value: 'A4', value_label: 'A4 bis' })])
    expect(conflicting[0]).toMatch(/conflit/)
    const identical = plan([row({ value: 'A4' }), row({ value: 'A4' })])
    expect(identical.errors).toEqual([])
    expect(identical.counts.duplicates).toBe(1)
  })

  it('rejects contradictory statuses for one product dimension', () => {
    expect(messages([row({ value: 'A4', status: 'confirmed' }), row({ value: 'A5', status: 'needs-review' })])[0]).toMatch(/contradictoires/)
  })

  it('flags (without rejecting) a title that differs from the current one — the slug is authoritative', () => {
    const result = plan([row({ value: 'A4', product_title: 'Autre titre' })])
    expect(result.errors).toEqual([])
    expect(result.warnings[0].message).toMatch(/slug/)
  })
})

describe('import — planned changes', () => {
  it('adds options, a shared option is created once and reused', () => {
    const result = planImport(
      [
        row({ value: 'A4', value_label: 'A4' }),
        row({ product_slug: 'enveloppes', product_title: 'Enveloppes', value: 'A4', value_label: 'A4' }),
        row({ product_slug: 'enveloppes', product_title: 'Enveloppes', value: 'C5' }),
      ],
      context(),
    )
    expect(result.errors).toEqual([])
    expect(result.newCatalogOptions).toEqual([{ dimensionKey: 'format', machineValue: 'A4', label: 'A4' }])
    const cards = result.products.find((product) => product.productSlug === 'cartes-de-visite')!
    expect(cards.rows[0]).toMatchObject({ action: 'create', addOptions: ['A4'], statusChange: { to: 'confirmed' } })
    const envelopes = result.products.find((product) => product.productSlug === 'enveloppes')!
    expect(envelopes.rows[0]).toMatchObject({ action: 'update', addOptions: ['A4'] }) // C5 already there: untouched
  })

  it('maps materials, finishes, enums and custom values', () => {
    const result = planImport(
      [
        row({ dimension_key: 'material', value: 'couche-mat' }),
        row({ dimension_key: 'finish', value: 'soft-touch' }),
        row({ dimension_key: 'orientation', value: 'portrait' }),
        row({ dimension_key: 'format', value: CUSTOM_VALUE }),
      ],
      context(),
    )
    expect(result.errors).toEqual([])
    const byKey = Object.fromEntries(result.products[0].rows.map((change) => [change.dimensionKey, change]))
    expect(byKey.material.addMaterialSlugs).toEqual(['couche-mat'])
    expect(byKey.finish.addFinishSlugs).toEqual(['soft-touch'])
    expect(byKey.orientation.addEnumValues).toEqual(['portrait'])
    expect(byKey.format.setAllowCustomValue).toBe(true)
  })

  it('rows without a value are ignored (informational export rows)', () => {
    const result = planImport([row({ dimension_key: 'fenetre', status: 'needs-review' })], context())
    expect(result.products).toEqual([])
    expect(result.counts.ignored).toBe(1)
  })

  it('an already-satisfied row changes nothing (idempotent)', () => {
    const result = planImport([row({ product_slug: 'enveloppes', product_title: 'Enveloppes', value: 'C5', status: 'confirmed' })], context())
    expect(result.products).toEqual([])
  })

  it('renders a readable diff, and nothing but the errors when invalid', () => {
    const valid = renderImportDiff(planImport([row({ value: 'A4' })], context()))
    expect(valid).toContain('cartes-de-visite')
    expect(valid).toContain('+options A4')
    const invalid = renderImportDiff(planImport([row({ product_slug: 'x', value: 'A4' })], context()))
    expect(invalid).toContain('✖')
    expect(invalid).not.toContain('Produits modifiés')
  })
})
