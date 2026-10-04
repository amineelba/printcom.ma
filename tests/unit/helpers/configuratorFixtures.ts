import type { Finish, Material, Media, Product, ProductCategory } from '@/payload-types'

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
