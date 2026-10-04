import { describe, expect, it } from 'vitest'
import { buildProductConfiguratorData, buildProductConfiguratorModel } from '@/lib/configurator/buildProductConfiguratorData'
import { resolveProductConfiguration } from '@/lib/configurator/resolveConfiguration'
import { buildConfigurationSummary, createInitialConfigurationState } from '@/lib/configurator/state'
import { parseConfigurationTransport, serializeConfiguration } from '@/lib/configurator/transport'
import { resolvePreviewMedia } from '@/lib/configurator/preview'
import { CUSTOM_FORMAT_VALUE, emptyConfigurationState, type ProductConfigurationState } from '@/lib/configurator/types'
import {
  REGISTRY as R,
  catalogBindings,
  makeDimension,
  makeFinish,
  makeFullProduct,
  makeMaterial,
  makeMedia,
  makeOption,
  makeProduct,
  makeSchemaProduct,
  schemaRow,
} from './helpers/configuratorFixtures'

const keys = (product: Parameters<typeof buildProductConfiguratorData>[0]) =>
  buildProductConfiguratorData(product).groups.map((group) => group.key)

const A4 = makeOption(1, R.format, 'A4')
const A5 = makeOption(2, R.format, 'A5')
const A6 = makeOption(3, R.format, 'A6')
const G350 = makeOption(4, R.grammage, '350 g')
const SPIRAL = makeOption(5, R.binding, 'Spirale')
const AGRAFE = makeOption(6, R.binding, 'Agrafage')
const PAGES16 = makeOption(7, R.pageCount, '16 pages')
const PERMANENT = makeOption(8, R.adhesive, 'Permanent')
const COUCHE = makeMaterial(21, 'Couché mat')
const OFFSET = makeMaterial(22, 'Offset')
const SOFT = makeFinish(41, 'Soft Touch')
const UV = makeFinish(42, 'Vernis UV')

/** Card-like, document-like and label-like products: structurally different on purpose. */
const card = makeSchemaProduct(
  [
    schemaRow(R.format, { options: catalogBindings(A4, A5) }),
    schemaRow(R.orientation, { enumOptions: ['portrait', 'landscape'] }),
    schemaRow(R.material, { materialOptions: [COUCHE, OFFSET] }),
    schemaRow(R.grammage, { options: catalogBindings(G350) }),
    schemaRow(R.finish, { finishOptions: [SOFT, UV] }),
  ],
  { title: 'Cartes de visite', slug: 'cartes-de-visite' },
)
const document = makeSchemaProduct(
  [
    schemaRow(R.format, { options: catalogBindings(A4) }),
    schemaRow(R.pageCount, { options: catalogBindings(PAGES16) }),
    schemaRow(R.cover, { options: catalogBindings(makeOption(9, R.cover, 'Souple')) }),
    schemaRow(R.binding, { options: catalogBindings(SPIRAL, AGRAFE) }),
  ],
  { title: 'Carnets personnalisés', slug: 'carnets' },
)
const label = makeSchemaProduct(
  [
    schemaRow(R.dimensions, { allowCustomValue: true }),
    schemaRow(R.material, { materialOptions: [COUCHE] }),
    schemaRow(R.adhesive, { options: catalogBindings(PERMANENT) }),
    schemaRow(R.finish, { finishOptions: [UV] }),
  ],
  { title: 'Étiquettes produits', slug: 'etiquettes-produits' },
)

describe('normalizeProductConfigurationSchema — product-specific dimensions', () => {
  it('each product renders exactly its own dimensions, in schema order', () => {
    expect(keys(card)).toEqual(['format', 'orientation', 'material', 'grammage', 'finish'])
    expect(keys(document)).toEqual(['format', 'page-count', 'couverture', 'reliure'])
    expect(keys(label)).toEqual(['dimensions', 'material', 'adhesif', 'finish'])
  })

  it('no product shows another product’s dimensions', () => {
    expect(keys(card)).not.toContain('reliure')
    expect(keys(card)).not.toContain('adhesif')
    expect(keys(document)).not.toContain('material')
    expect(keys(document)).not.toContain('grammage')
    expect(keys(label)).not.toContain('format')
    expect(keys(label)).not.toContain('reliure')
  })

  it('the same shared option can sit in one allowlist and not in another', () => {
    const valuesOf = (product: typeof card, key: string) =>
      buildProductConfiguratorData(product)
        .groups.find((group) => group.key === key)
        ?.options.map((option) => option.value)
    expect(valuesOf(card, 'format')).toEqual(['A4', 'A5'])
    expect(valuesOf(document, 'format')).toEqual(['A4'])
    expect(valuesOf(makeSchemaProduct([schemaRow(R.format, { options: catalogBindings(A6) })]), 'format')).toEqual(['A6'])
  })

  it('product allowlists are authoritative: a material only appears where it is listed', () => {
    const materials = (product: typeof card) =>
      buildProductConfiguratorData(product).groups.find((group) => group.key === 'material')?.options.map((o) => o.label)
    expect(materials(card)).toEqual(['Couché mat', 'Offset'])
    expect(materials(label)).toEqual(['Couché mat'])
    expect(materials(document)).toBeUndefined()
  })

  it('a category never injects options (same category, different schemas)', () => {
    // makeProduct attaches the same category to all three fixtures.
    expect(card.primaryCategory).toEqual(document.primaryCategory)
    expect(keys(card)).not.toEqual(keys(document))
  })

  it('finishes stay multi-choice; enums resolve French labels; materials keep their relationship', () => {
    const data = buildProductConfiguratorData(card)
    expect(data.groups.find((g) => g.key === 'finish')?.selectionMode).toBe('multiple')
    expect(data.groups.find((g) => g.key === 'orientation')?.options.map((o) => o.label)).toEqual(['Portrait', 'Paysage'])
    expect(buildProductConfiguratorModel(card).refs.material['couché-mat']).toMatchObject({ id: 21 })
  })

  it('uses schema-first and records the source', () => {
    expect(buildProductConfiguratorModel(card).source).toBe('schema')
    expect(buildProductConfiguratorModel(makeFullProduct()).source).toBe('legacy')
  })
})

describe('no fake controls', () => {
  it('a known dimension with no options renders nothing', () => {
    expect(keys(makeSchemaProduct([schemaRow(R.window, { options: [] })]))).toEqual([])
  })

  it('needs-review and unsupported rows are hidden even with options', () => {
    const rows = [
      schemaRow(R.format, { dataStatus: 'needs-review', options: catalogBindings(A4) }),
      schemaRow(R.binding, { dataStatus: 'unsupported', options: catalogBindings(SPIRAL) }),
    ]
    expect(keys(makeSchemaProduct(rows))).toEqual([])
  })

  it('unverified, unpublished and foreign-dimension catalog options are not offered', () => {
    const rows = [
      schemaRow(R.format, {
        options: catalogBindings(
          A4,
          makeOption(10, R.format, 'A3', { verificationStatus: 'unverified' }),
          makeOption(11, R.format, 'A2', { status: 'draft' }),
          makeOption(12, R.binding, 'Spirale étrangère'),
        ),
      }),
    ]
    const group = buildProductConfiguratorData(makeSchemaProduct(rows)).groups[0]
    expect(group.options.map((option) => option.value)).toEqual(['A4'])
  })

  it('draft dimensions never render', () => {
    const draft = makeDimension(150, 'format', 'Format', { status: 'draft' })
    expect(keys(makeSchemaProduct([schemaRow(draft, { options: catalogBindings(makeOption(13, draft, 'A4')) })]))).toEqual([])
  })

  it('typed dimensions need explicit allowCustomValue; booleans need only a confirmed row', () => {
    expect(keys(makeSchemaProduct([schemaRow(R.dimensions), schemaRow(R.sheets), schemaRow(R.note)]))).toEqual([])
    expect(
      keys(
        makeSchemaProduct([
          schemaRow(R.dimensions, { allowCustomValue: true }),
          schemaRow(R.sheets, { allowCustomValue: true }),
          schemaRow(R.note, { allowCustomValue: true }),
          schemaRow(R.elastic),
        ]),
      ),
    ).toEqual(['dimensions', 'nombre-de-feuilles', 'precision', 'elastique-eventuel'])
  })

  it('unpublished materials/finishes are dropped', () => {
    const product = makeSchemaProduct([
      schemaRow(R.material, { materialOptions: [COUCHE, makeMaterial(23, 'Brouillon', { status: 'draft' })] }),
    ])
    expect(buildProductConfiguratorData(product).groups[0].options.map((o) => o.label)).toEqual(['Couché mat'])
  })

  it('the format dimension adds "Sur mesure" only when the row allows it', () => {
    const withCustom = makeSchemaProduct([schemaRow(R.format, { allowCustomValue: true, options: catalogBindings(A4) })])
    const group = buildProductConfiguratorData(withCustom).groups[0]
    expect(group.options.map((o) => o.value)).toEqual(['A4', CUSTOM_FORMAT_VALUE])
    expect(buildProductConfiguratorData(withCustom).customFormatAvailable).toBe(true)
  })

  it('a duplicate dimension row is ignored (first wins)', () => {
    const product = makeSchemaProduct([
      schemaRow(R.format, { options: catalogBindings(A4) }),
      schemaRow(R.format, { options: catalogBindings(A5) }),
    ])
    expect(buildProductConfiguratorData(product).groups[0].options.map((o) => o.value)).toEqual(['A4'])
  })
})

describe('legacy fallback', () => {
  it('products without usable schema rows keep the Sprint 2–4 behaviour', () => {
    const product = makeFullProduct({ configurationSchema: [schemaRow(R.window, { dataStatus: 'needs-review' })] })
    const model = buildProductConfiguratorModel(product)
    expect(model.source).toBe('legacy')
    expect(model.data.groups.map((g) => g.key)).toEqual([
      'format',
      'orientation',
      'page-count',
      'print-sides',
      'color-mode',
      'material',
      'grammage',
      'finish',
      'quantity',
    ])
  })

  it('a product with neither schema nor legacy values has no groups', () => {
    expect(buildProductConfiguratorData(makeProduct()).groups).toEqual([])
  })
})

describe('Sprint 3 metadata survives in the schema path', () => {
  it('overrides win over the catalog; previewImage drives the preview resolver', () => {
    const base = makeMedia(1)
    const optionImage = makeMedia(2)
    const override = makeMedia(3)
    const preview = makeMedia(4, { alt: 'Aperçu A4' })
    const a4 = makeOption(20, R.format, 'A4', { description: 'catalogue', image: optionImage })
    const product = makeSchemaProduct(
      [schemaRow(R.format, { options: [{ option: a4, descriptionOverride: 'produit', imageOverride: override, previewImage: preview }] })],
      { primaryImage: base },
    )
    const data = buildProductConfiguratorData(product)
    const option = data.groups[0].options[0]
    expect(option.description).toBe('produit')
    expect(option.image?.id).toBe('3')
    expect(option.previewImage?.id).toBe('4')

    const state: ProductConfigurationState = { ...emptyConfigurationState(), single: { format: 'A4' } }
    expect(resolvePreviewMedia({ baseMedia: data.media[0], groups: data.groups, selection: state })).toMatchObject({
      source: 'option',
      media: { id: '4' },
    })
  })

  it('falls back to the catalog description and image', () => {
    const a4 = makeOption(21, R.format, 'A4', { description: 'catalogue', image: makeMedia(2) })
    const option = buildProductConfiguratorData(makeSchemaProduct([schemaRow(R.format, { options: catalogBindings(a4) })])).groups[0].options[0]
    expect(option.description).toBe('catalogue')
    expect(option.image?.id).toBe('2')
  })
})

const stateOf = (partial: Partial<ProductConfigurationState>) => ({ ...emptyConfigurationState(), ...partial })
const resolve = (product: typeof card, partial: Partial<ProductConfigurationState>) =>
  resolveProductConfiguration({ product, transport: parseConfigurationTransport(serializeConfiguration(stateOf(partial))) })

describe('generic resolver (transport v2)', () => {
  it('accepts values the product allows and keeps schema order in the summary', () => {
    const resolved = resolve(document, {
      single: { reliure: 'Spirale', format: 'A4', couverture: 'Souple', 'page-count': '16 pages' },
    })
    expect(resolved.rows.map((row) => row.label)).toEqual(['Format', 'Nombre de pages', 'Couverture', 'Reliure'])
    expect(resolved.rejectedCount).toBe(0)
  })

  it('rejects a dimension the product does not have', () => {
    const resolved = resolve(card, { single: { format: 'A4', reliure: 'Spirale' } })
    expect(resolved.rows.map((row) => row.key)).toEqual(['format'])
    expect(resolved.rejectedCount).toBe(1)
  })

  it('rejects an option that is not on this product’s allowlist (even if valid elsewhere)', () => {
    const resolved = resolve(document, { single: { format: 'A5' } }) // A5 is on cards, not on carnets
    expect(resolved.rows).toEqual([])
    expect(resolved.rejectedCount).toBe(1)
  })

  it('rejects a kind mismatch (single value for a multi-choice dimension and vice versa)', () => {
    expect(resolve(card, { single: { finish: 'soft-touch' } }).rows).toEqual([])
    expect(resolve(card, { multiple: { format: ['A4'] } }).rows).toEqual([])
  })

  it('rejects typed values for dimensions that are not typed', () => {
    const resolved = resolve(card, {
      measures: { format: { width: '1', height: '1', depth: '', unit: 'mm' } },
      numbers: { grammage: '350' },
      texts: { material: 'x' },
      flags: { orientation: true },
    })
    expect(resolved.rows).toEqual([])
    expect(resolved.rejectedCount).toBe(4)
  })

  it('resolves a typed measure and persists it as a technical selection', () => {
    const resolved = resolve(label, {
      measures: { dimensions: { width: '120,5', height: '80', depth: '40', unit: 'mm' } },
      single: { adhesif: 'Permanent' },
      multiple: { finish: ['vernis-uv'] },
    })
    expect(resolved.rows.map((row) => `${row.label}=${row.value}`)).toEqual([
      'Dimensions=120.5 × 80 × 40 mm',
      'Adhésif=Permanent',
      'Finition=Vernis UV',
    ])
    expect(resolved.selections.technical).toEqual([
      { key: 'dimensions', label: 'Dimensions', valueLabel: '120.5 × 80 × 40 mm', unit: 'mm' },
      { key: 'adhesif', label: 'Adhésif', valueLabel: 'Permanent' },
    ])
    expect(resolved.selections.finishes.map((f) => f.slug)).toEqual(['vernis-uv'])
  })

  it('rejects non-numeric / non-positive measures and numbers rather than storing NaN', () => {
    const typed = makeSchemaProduct([
      schemaRow(R.dimensions, { allowCustomValue: true }),
      schemaRow(R.sheets, { allowCustomValue: true }),
    ])
    const resolved = resolve(typed, {
      measures: { dimensions: { width: 'abc', height: '-3', depth: '', unit: 'mm' } },
      numbers: { 'nombre-de-feuilles': '12x' },
    })
    expect(resolved.rows).toEqual([])
    expect(resolved.rejectedCount).toBe(2)
  })

  it('numbers keep their unit and numericValue; texts are sanitized; flags are true-only', () => {
    const typed = makeSchemaProduct([
      schemaRow(R.sheets, { allowCustomValue: true }),
      schemaRow(R.note, { allowCustomValue: true }),
      schemaRow(R.elastic),
    ])
    const resolved = resolve(typed, {
      numbers: { 'nombre-de-feuilles': '50' },
      texts: { precision: '  coins\u0000 arrondis  ' },
      flags: { 'elastique-eventuel': true },
    })
    expect(resolved.rows.map((r) => r.value)).toEqual(['50 feuilles', 'coins arrondis', 'Oui'])
    expect(resolved.selections.technical).toEqual([
      { key: 'nombre-de-feuilles', label: 'Nombre de feuilles', valueLabel: '50 feuilles', numericValue: 50, unit: 'feuilles' },
      { key: 'precision', label: 'Précision', valueLabel: 'coins arrondis' },
      { key: 'elastique-eventuel', label: 'Élastique éventuel', valueLabel: 'Oui' },
    ])
  })

  it('core dimensions stay out of technicalSelections (they map to the structured fields)', () => {
    const resolved = resolve(card, { single: { format: 'A4', orientation: 'portrait', grammage: '350 g' } })
    expect(resolved.selections.technical).toEqual([])
    expect(resolved.selections).toMatchObject({ format: 'A4', orientation: 'portrait', grammage: '350 g' })
  })

  it('the canonical transport re-serializes as v2 and is stable', () => {
    const first = resolve(card, { single: { format: 'A5' }, multiple: { finish: ['vernis-uv', 'soft-touch'] } })
    expect(first.transport?.startsWith('2.')).toBe(true)
    const second = resolveProductConfiguration({ product: card, transport: parseConfigurationTransport(first.transport) })
    expect(second.transport).toBe(first.transport)
    expect(second.state).toEqual(first.state)
  })
})

describe('transport v1 URLs still resolve (Sprint 4 compatibility)', () => {
  const v1 = (wire: unknown) => `1.${Buffer.from(JSON.stringify(wire), 'utf8').toString('base64url')}`

  it('a v1 URL on a legacy product resolves exactly as in Sprint 4', () => {
    const product = makeFullProduct()
    const resolved = resolveProductConfiguration({
      product,
      transport: parseConfigurationTransport(v1({ f: 'A5', o: 'landscape', m: 'offset', q: '500', n: ['soft-touch', 'vernis-uv'] })),
    })
    expect(resolved.rows.map((r) => `${r.label}=${r.value}`)).toEqual([
      'Format=A5',
      'Orientation=Paysage',
      'Support=Offset',
      'Finition=Soft Touch, Vernis UV',
      'Quantité=500',
    ])
    expect(resolved.source).toBe('legacy')
  })

  it('a v1 URL against a schema-driven product is canonicalized by its allowlist', () => {
    const resolved = resolveProductConfiguration({
      product: card,
      transport: parseConfigurationTransport(v1({ f: 'A4', g: '350 g', m: 'offset', o: 'square', s: 'double' })),
    })
    expect(resolved.rows.map((r) => `${r.label}=${r.value}`)).toEqual([
      'Format=A4',
      'Support=Offset',
      'Grammage=350 g',
    ])
    expect(resolved.rejectedCount).toBe(2) // 'square' and print-sides are not on this product
    expect(resolved.source).toBe('schema')
  })

  it('an unknown version is ignored, never reinterpreted', () => {
    const resolved = resolveProductConfiguration({
      product: card,
      transport: parseConfigurationTransport(`3.${Buffer.from('{"f":"A4"}').toString('base64url')}`),
    })
    expect(resolved.rows).toEqual([])
    expect(resolved.transportIssue).toBe('unknown-version')
  })
})

describe('summary and initial state follow the schema', () => {
  it('singleton single-choice dimensions auto-select, typed dimensions never do', () => {
    const product = makeSchemaProduct([
      schemaRow(R.format, { options: catalogBindings(A4) }),
      schemaRow(R.dimensions, { allowCustomValue: true }),
    ])
    const data = buildProductConfiguratorData(product)
    const state = createInitialConfigurationState(data)
    expect(state.single).toEqual({ format: 'A4' })
    expect(buildConfigurationSummary(data, state)).toEqual([{ key: 'format', label: 'Format', value: 'A4' }])
  })

  it('labelOverride and helpTextOverride apply per product', () => {
    const product = makeSchemaProduct([
      schemaRow(R.material, { materialOptions: [COUCHE, OFFSET], labelOverride: 'Papier', helpTextOverride: 'Papier intérieur' }),
    ])
    const [group] = buildProductConfiguratorData(product).groups
    expect(group.label).toBe('Papier')
    expect(group.hint).toBe('Papier intérieur')
  })
})
