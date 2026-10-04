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

import { makeVisualProduct } from './helpers/configuratorFixtures'

describe('buildProductConfiguratorData — visual option metadata (Sprint 3)', () => {
  const data = buildProductConfiguratorData(makeVisualProduct())
  const format = (value: string) => groupOf(data, 'format')?.options.find((o) => o.value === value)

  it('keeps a legacy label-only row as a plain text option', () => {
    expect(format('A3')).toEqual({ id: 'format-a3', value: 'A3', label: 'A3' })
    const legacy = buildProductConfiguratorData(makeProduct({ availableFormats: [{ id: 'x', label: 'A4', description: null, image: null, previewImage: null }] }))
    expect(groupOf(legacy, 'format')?.options).toEqual([{ id: 'format-x', value: 'A4', label: 'A4' }])
  })

  it('normalizes the description only when populated', () => {
    expect(format('A4')?.description).toBe('210 × 297 mm')
    expect(format('A5')).not.toHaveProperty('description')
    const blank = buildProductConfiguratorData(makeProduct({ availableFormats: [{ label: 'A4', description: '   ' }] }))
    expect(groupOf(blank, 'format')?.options[0]).not.toHaveProperty('description')
  })

  it('exposes thumbnail and preview media separately', () => {
    expect(format('A4')?.image?.id).toBe('61')
    expect(format('A4')?.previewImage?.id).toBe('62')
    expect(format('A4')?.previewImage?.alt).toBe('Aperçu A4')
  })

  it('supports thumbnail only, preview only, both and neither', () => {
    const states = ['A4', 'A5', 'A6', 'A3'].map((v) => [Boolean(format(v)?.image), Boolean(format(v)?.previewImage)])
    expect(states).toEqual([[true, true], [true, false], [false, true], [false, false]])
  })

  it('reads visual metadata on every inline group, not just formats', () => {
    const g = groupOf(data, 'grammage')?.options[0]
    expect([g?.image?.id, g?.previewImage?.id]).toEqual(['65', '66'])
    expect(groupOf(data, 'quantity')?.options[0].image?.id).toBe('67')
    expect(groupOf(data, 'quantity')?.options[1].image).toBeUndefined()
    expect(groupOf(data, 'pageCount')?.options.every((o) => !o.image && !o.previewImage)).toBe(true)
  })

  it('omits unresolved or url-less media instead of breaking the option', () => {
    const product = makeProduct({
      availableFormats: [
        { label: 'A4', image: 999, previewImage: makeMedia(70, { url: null }) },
        { label: 'A5', image: makeMedia(71) },
      ],
    })
    const options = groupOf(buildProductConfiguratorData(product), 'format')?.options
    expect(options?.[0]).toEqual({ id: 'format-0', value: 'A4', label: 'A4' })
    expect(options?.[1].image?.id).toBe('71')
  })

  it('maps shared material and finish thumbnails; they never carry a preview image', () => {
    expect(groupOf(data, 'material')?.options[0].image?.id).toBe('31')
    expect(groupOf(data, 'finish')?.options[0].image?.id).toBe('51')
    const shared = [...(groupOf(data, 'material')?.options ?? []), ...(groupOf(data, 'finish')?.options ?? [])]
    expect(shared.every((o) => o.previewImage === undefined)).toBe(true)
  })

  it('keeps option identity (id/value) unchanged by adding images', () => {
    const plain = buildProductConfiguratorData(
      makeVisualProduct({
        availableFormats: [{ id: 'a4', label: 'A4' }, { id: 'a5', label: 'A5' }, { id: 'a6', label: 'A6' }, { id: 'a3', label: 'A3' }],
      }),
    )
    const ids = (d: typeof data) => groupOf(d, 'format')?.options.filter((o) => !o.isCustom).map((o) => [o.id, o.value])
    expect(ids(data)).toEqual(ids(plain))
    for (const option of data.groups.flatMap((g) => g.options)) {
      expect(option.value).not.toMatch(/\.(png|jpe?g|webp)|\/media\//)
    }
  })

  it('exposes no raw CMS data in the public DTO (timestamps, filenames, relationships)', () => {
    const json = JSON.stringify(data)
    for (const leaked of ['updatedAt', 'createdAt', 'filename', 'mimeType', 'filesize', 'focalX']) {
      expect(json).not.toContain(leaked)
    }
  })
})
