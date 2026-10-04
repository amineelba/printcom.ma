import { describe, it, expect } from 'vitest'
import { buildProductConfiguratorData } from '@/lib/configurator/buildProductConfiguratorData'
import { COLOR_MODE_LABELS, ORIENTATION_LABELS, PRINT_SIDES_LABELS } from '@/lib/configurator/labels'
import { CUSTOM_FORMAT_VALUE } from '@/lib/configurator/types'
import { Products } from '@/collections/Products'
import { makeFinish, makeFullProduct, makeMaterial, makeMedia, makeProduct } from './helpers/configuratorFixtures'

const groupOf = (data: ReturnType<typeof buildProductConfiguratorData>, key: string) =>
  data.groups.find((group) => group.key === key)

describe('buildProductConfiguratorData — groups', () => {
  it('omits every group when the CMS has no configuration values', () => {
    const data = buildProductConfiguratorData(makeProduct())
    expect(data.groups).toEqual([])
    expect(data.customFormatAvailable).toBe(false)
  })

  it('omits individual empty groups and keeps the rest', () => {
    const data = buildProductConfiguratorData(
      makeProduct({ availableFormats: [{ label: 'A4' }], orientations: [], quantities: [], grammages: [{ label: '  ' }] }),
    )
    expect(data.groups.map((g) => g.key)).toEqual(['format'])
  })

  it('emits groups in the fixed configurator order', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    expect(data.groups.map((g) => g.key)).toEqual([
      'format',
      'orientation',
      'pageCount',
      'printSides',
      'colorMode',
      'material',
      'grammage',
      'finish',
      'quantity',
    ])
    expect(data.groups.map((g) => g.label)).toEqual([
      'Format',
      'Orientation',
      'Nombre de pages',
      'Impression',
      'Couleur',
      'Support',
      'Grammage',
      'Finition',
      'Quantité',
    ])
  })

  it('preserves the CMS option order inside a group', () => {
    const data = buildProductConfiguratorData(
      makeProduct({ quantities: [{ label: '500' }, { label: '100' }, { label: '250' }] }),
    )
    expect(groupOf(data, 'quantity')?.options.map((o) => o.label)).toEqual(['500', '100', '250'])
  })

  it('keeps label-only options as-is: the CMS label is the value, nothing is parsed', () => {
    const data = buildProductConfiguratorData(makeProduct({ availableFormats: [{ id: 'abc', label: 'A4 (210 × 297 mm)' }] }))
    expect(groupOf(data, 'format')?.options).toEqual([
      { id: 'format-abc', value: 'A4 (210 × 297 mm)', label: 'A4 (210 × 297 mm)' },
    ])
  })

  it('drops blank and duplicate labels', () => {
    const data = buildProductConfiguratorData(
      makeProduct({ grammages: [{ label: '350 g' }, { label: ' ' }, { label: '350 g' }, { label: '400 g' }] }),
    )
    expect(groupOf(data, 'grammage')?.options.map((o) => o.value)).toEqual(['350 g', '400 g'])
  })

  it('normalizes enum values to French labels while keeping machine values', () => {
    const data = buildProductConfiguratorData(
      makeProduct({
        orientations: ['portrait', 'landscape', 'square'],
        printSides: ['single', 'double'],
        colorModes: ['cmyk', 'bw', 'pantone'],
      }),
    )
    const pairs = (key: string) => groupOf(data, key)?.options.map((o) => [o.value, o.label])
    expect(pairs('orientation')).toEqual([
      ['portrait', 'Portrait'],
      ['landscape', 'Paysage'],
      ['square', 'Carré'],
    ])
    expect(pairs('printSides')).toEqual([
      ['single', 'Recto'],
      ['double', 'Recto-verso'],
    ])
    expect(pairs('colorMode')).toEqual([
      ['cmyk', 'Quadrichromie (CMJN)'],
      ['bw', 'Noir et blanc'],
      ['pantone', 'Pantone'],
    ])
  })

  it('keeps the enum label maps in sync with the Products collection options', () => {
    const optionsOf = (name: string) => {
      const field = Products.fields
        .flatMap((f) => ('fields' in f && f.type === 'collapsible' ? f.fields : [f]))
        .find((f) => 'name' in f && f.name === name)
      if (!field || field.type !== 'select') throw new Error(`select field ${name} not found`)
      return Object.fromEntries(
        field.options.map((o) => (typeof o === 'string' ? [o, o] : [o.value, o.label])),
      )
    }
    expect(ORIENTATION_LABELS).toEqual(optionsOf('orientations'))
    expect(PRINT_SIDES_LABELS).toEqual(optionsOf('printSides'))
    expect(COLOR_MODE_LABELS).toEqual(optionsOf('colorModes'))
  })

  it('never exposes a raw enum value as a label', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    const labels = data.groups.flatMap((g) => g.options.map((o) => o.label))
    for (const raw of ['landscape', 'single', 'cmyk', 'bw']) expect(labels).not.toContain(raw)
  })
})

describe('buildProductConfiguratorData — relationships', () => {
  it('normalizes materials: slug as value, title as label, CMS description kept', () => {
    const data = buildProductConfiguratorData(
      makeProduct({ materials: [makeMaterial(21, 'Couché mat', { shortDescription: 'Surface lisse.' })] }),
    )
    expect(groupOf(data, 'material')?.options).toEqual([
      {
        id: 'material-21',
        value: 'couché-mat',
        label: 'Couché mat',
        description: 'Surface lisse.',
        image: undefined,
      },
    ])
  })

  it('normalizes finishes as a multiple-selection group', () => {
    const data = buildProductConfiguratorData(makeProduct({ finishes: [makeFinish(41, 'Soft Touch'), makeFinish(42, 'Vernis UV')] }))
    const finish = groupOf(data, 'finish')
    expect(finish?.selectionMode).toBe('multiple')
    expect(finish?.options.map((o) => o.label)).toEqual(['Soft Touch', 'Vernis UV'])
  })

  it('every other group is single-selection', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    for (const group of data.groups.filter((g) => g.key !== 'finish')) expect(group.selectionMode).toBe('single')
  })

  it('filters unresolved ids, drafts and archived entries out of relationship groups', () => {
    const data = buildProductConfiguratorData(
      makeProduct({
        materials: [99, makeMaterial(21, 'Couché mat'), makeMaterial(22, 'Brouillon', { status: 'draft' })],
        finishes: [makeFinish(41, 'Archivée', { status: 'archived' })],
      }),
    )
    expect(groupOf(data, 'material')?.options.map((o) => o.label)).toEqual(['Couché mat'])
    expect(groupOf(data, 'finish')).toBeUndefined()
  })
})

describe('buildProductConfiguratorData — images', () => {
  it('exposes existing material/finish images as trimmed serializable media', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    const couche = groupOf(data, 'material')?.options.find((o) => o.label === 'Couché mat')
    expect(couche?.image).toMatchObject({ id: '31', url: '/media/image-31.jpg', alt: 'Image 31' })
    expect(couche?.image?.sizes?.card?.url).toBe('/media/image-31-640.jpg')
    const softTouch = groupOf(data, 'finish')?.options.find((o) => o.label === 'Soft Touch')
    expect(softTouch?.image?.id).toBe('51')
  })

  it('does not break when options have no image or an unresolved image id', () => {
    const data = buildProductConfiguratorData(
      makeProduct({ materials: [makeMaterial(21, 'Offset'), makeMaterial(22, 'Kraft', { image: 77 })] }),
    )
    expect(groupOf(data, 'material')?.options.every((o) => o.image === undefined)).toBe(true)
  })

  it('lists the primary image first, then the gallery, without duplicates', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    expect(data.media.map((m) => m.id)).toEqual(['1', '2', '3'])
  })

  it('skips unresolved or url-less media and tolerates a missing primary image', () => {
    const data = buildProductConfiguratorData(
      makeProduct({ primaryImage: null, gallery: [5, makeMedia(6, { url: null }), makeMedia(7)] }),
    )
    expect(data.media.map((m) => m.id)).toEqual(['7'])
    expect(buildProductConfiguratorData(makeProduct()).media).toEqual([])
  })

  it('leaves the option-specific preview seam empty', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    expect(data.groups.flatMap((g) => g.options).every((o) => o.previewImage === undefined)).toBe(true)
  })
})

describe('buildProductConfiguratorData — custom format', () => {
  it('appends "Sur mesure" to the format group when enabled', () => {
    const data = buildProductConfiguratorData(makeProduct({ availableFormats: [{ label: 'A4' }], customFormatAvailable: true }))
    const options = groupOf(data, 'format')?.options ?? []
    expect(options.map((o) => o.label)).toEqual(['A4', 'Sur mesure'])
    expect(options[1]).toMatchObject({ value: CUSTOM_FORMAT_VALUE, isCustom: true })
    expect(data.customFormatAvailable).toBe(true)
  })

  it('does not add it when disabled', () => {
    const data = buildProductConfiguratorData(makeProduct({ availableFormats: [{ label: 'A4' }], customFormatAvailable: false }))
    expect(groupOf(data, 'format')?.options.map((o) => o.label)).toEqual(['A4'])
  })
})

describe('buildProductConfiguratorData — identity', () => {
  it('exposes only the product identity subset, and the category title when populated', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    expect(data.product).toEqual({ id: '10', slug: 'cartes-de-visite', title: 'Cartes de visite', categoryLabel: 'Papeterie d’entreprise' })
    expect(buildProductConfiguratorData(makeProduct({ primaryCategory: 3 })).product.categoryLabel).toBeUndefined()
  })

  it('is plain JSON-serializable (safe to cross the server → client boundary)', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    expect(JSON.parse(JSON.stringify(data))).toEqual(JSON.parse(JSON.stringify(data)))
    expect(JSON.stringify(data)).not.toContain('"updatedAt"')
  })
})
