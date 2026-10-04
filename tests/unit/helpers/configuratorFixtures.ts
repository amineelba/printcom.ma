import type { ConfiguratorDimension, ConfiguratorOption, Finish, Material, Media, Product, ProductCategory } from '@/payload-types'

const stamps = { updatedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' }

export function makeMedia(id: number, overrides: Partial<Media> = {}): Media {
  return {
    id,
    alt: `Image ${id}`,
    url: `/media/image-${id}.jpg`,
    width: 1200,
    height: 800,
    sizes: {
      thumbnail: { url: `/media/image-${id}-240.jpg` },
      card: { url: `/media/image-${id}-640.jpg` },
      listing: { url: `/media/image-${id}-960.jpg` },
    },
    ...stamps,
    ...overrides,
  }
}

export function makeMaterial(id: number, title: string, overrides: Partial<Material> = {}): Material {
  return {
    id,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    group: 'papier',
    status: 'published',
    ...stamps,
    ...overrides,
  }
}

export function makeFinish(id: number, title: string, overrides: Partial<Finish> = {}): Finish {
  return {
    id,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    group: 'vernis',
    status: 'published',
    ...stamps,
    ...overrides,
  }
}

export function makeCategory(title = 'Papeterie d’entreprise'): ProductCategory {
  return { id: 1, title, slug: 'papeterie-entreprise', status: 'published', ...stamps }
}

/** A product with no configuration data at all (like every seeded product today). */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 10,
    title: 'Cartes de visite',
    slug: 'cartes-de-visite',
    shortDescription: 'Des cartes de visite.',
    primaryCategory: makeCategory(),
    status: 'published',
    ...stamps,
    ...overrides,
  }
}

/** A product exercising every generic configuration group. */
export function makeFullProduct(overrides: Partial<Product> = {}): Product {
  return makeProduct({
    primaryImage: makeMedia(1),
    gallery: [makeMedia(1), makeMedia(2), makeMedia(3)],
    availableFormats: [
      { id: 'f1', label: 'A4' },
      { id: 'f2', label: 'A5' },
    ],
    customFormatAvailable: true,
    orientations: ['portrait', 'landscape'],
    pageCountOptions: [{ id: 'p1', label: '4 pages' }],
    printSides: ['single', 'double'],
    colorModes: ['cmyk', 'bw'],
    materials: [
      makeMaterial(21, 'Couché mat', { image: makeMedia(31), shortDescription: 'Surface lisse.' }),
      makeMaterial(22, 'Offset'),
    ],
    grammages: [
      { id: 'g1', label: '350 g' },
      { id: 'g2', label: '400 g' },
    ],
    finishes: [makeFinish(41, 'Soft Touch', { image: makeMedia(51) }), makeFinish(42, 'Vernis UV')],
    quantities: [
      { id: 'q1', label: '100' },
      { id: 'q2', label: '500' },
    ],
    ...overrides,
  })
}

/**
 * Product whose inline option rows carry visual metadata, one of each state:
 * thumbnail+preview (A4), thumbnail only (A5), preview only (A6), neither (A3).
 * Quantities/grammages/page counts get an image on one row to exercise the
 * compact-group path.
 */
export function makeVisualProduct(overrides: Partial<Product> = {}): Product {
  return makeProduct({
    primaryImage: makeMedia(1, { alt: 'Produit de base' }),
    gallery: [makeMedia(2, { alt: 'Vue de dos' })],
    availableFormats: [
      { id: 'a4', label: 'A4', description: '210 × 297 mm', image: makeMedia(61), previewImage: makeMedia(62, { alt: 'Aperçu A4' }) },
      { id: 'a5', label: 'A5', image: makeMedia(63) },
      { id: 'a6', label: 'A6', previewImage: makeMedia(64, { alt: 'Aperçu A6' }) },
      { id: 'a3', label: 'A3' },
    ],
    customFormatAvailable: true,
    grammages: [
      { id: 'g1', label: '300 g', image: makeMedia(65), previewImage: makeMedia(66, { alt: 'Aperçu 300 g' }) },
      { id: 'g2', label: '350 g' },
    ],
    quantities: [
      { id: 'q1', label: '100', image: makeMedia(67) },
      { id: 'q2', label: '500' },
    ],
    pageCountOptions: [{ id: 'p1', label: '8 pages' }, { id: 'p2', label: '12 pages' }],
    materials: [makeMaterial(21, 'Couché mat', { image: makeMedia(31) }), makeMaterial(22, 'Offset')],
    finishes: [makeFinish(41, 'Soft Touch', { image: makeMedia(51) }), makeFinish(42, 'Vernis UV', { image: makeMedia(52) })],
    ...overrides,
  })
}


/* ---------- Sprint 5: product-specific schema fixtures ---------- */

export function makeDimension(
  id: number,
  key: string,
  label: string,
  overrides: Partial<ConfiguratorDimension> = {},
): ConfiguratorDimension {
  return {
    id,
    key,
    label,
    group: 'other',
    valueType: 'single-choice',
    optionSource: 'catalog',
    status: 'published',
    ...stamps,
    ...overrides,
  }
}

export function makeOption(
  id: number,
  dimension: ConfiguratorDimension | number,
  label: string,
  overrides: Partial<ConfiguratorOption> = {},
): ConfiguratorOption {
  return {
    id,
    dimension,
    label,
    machineValue: label,
    verificationStatus: 'confirmed',
    status: 'published',
    ...stamps,
    ...overrides,
  }
}

type SchemaRow = NonNullable<Product['configurationSchema']>[number]

/** One `configurationSchema` row; defaults to a confirmed row. */
export function schemaRow(dimension: ConfiguratorDimension | number, overrides: Partial<SchemaRow> = {}): SchemaRow {
  return { dimension, dataStatus: 'confirmed', ...overrides }
}

/** Binds catalog options to a row, in the given order. */
export function catalogBindings(...options: (ConfiguratorOption | [ConfiguratorOption, Partial<NonNullable<SchemaRow['options']>[number]>])[]) {
  return options.map((entry) => (Array.isArray(entry) ? { option: entry[0], ...entry[1] } : { option: entry }))
}

/** A product with no legacy fields and the given schema rows. */
export function makeSchemaProduct(rows: SchemaRow[], overrides: Partial<Product> = {}): Product {
  return makeProduct({ configurationSchema: rows, ...overrides })
}

/** Shared registry used by the structurally distinct fixtures below. */
export const REGISTRY = {
  format: makeDimension(101, 'format', 'Format', { group: 'size' }),
  orientation: makeDimension(102, 'orientation', 'Orientation', { optionSource: 'enum', group: 'print' }),
  pageCount: makeDimension(103, 'page-count', 'Nombre de pages', { group: 'construction' }),
  printSides: makeDimension(104, 'print-sides', 'Impression', { optionSource: 'enum', group: 'print' }),
  material: makeDimension(105, 'material', 'Support', { optionSource: 'materials', group: 'material' }),
  grammage: makeDimension(106, 'grammage', 'Grammage', { group: 'material' }),
  finish: makeDimension(107, 'finish', 'Finition', { optionSource: 'finishes', valueType: 'multi-choice', group: 'finishing' }),
  quantity: makeDimension(108, 'quantity', 'Quantité', { group: 'quantity' }),
  binding: makeDimension(109, 'reliure', 'Reliure', { group: 'construction' }),
  cover: makeDimension(110, 'couverture', 'Couverture', { group: 'construction' }),
  dimensions: makeDimension(111, 'dimensions', 'Dimensions', { valueType: 'dimensions', optionSource: 'custom', group: 'size' }),
  adhesive: makeDimension(112, 'adhesif', 'Adhésif', { group: 'application' }),
  window: makeDimension(113, 'fenetre', 'Fenêtre', { group: 'construction' }),
  sheets: makeDimension(114, 'nombre-de-feuilles', 'Nombre de feuilles', { valueType: 'number', optionSource: 'custom', unit: 'feuilles' }),
  elastic: makeDimension(115, 'elastique-eventuel', 'Élastique éventuel', { valueType: 'boolean', optionSource: 'custom' }),
  note: makeDimension(116, 'precision', 'Précision', { valueType: 'text', optionSource: 'custom' }),
} as const
