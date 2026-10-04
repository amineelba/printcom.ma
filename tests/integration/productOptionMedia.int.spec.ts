// @vitest-environment node
import { getPayload, type Field, type Payload } from 'payload'
import sharp from 'sharp'
import config from '@/payload.config'
import { Finishes } from '@/collections/Finishes'
import { Materials } from '@/collections/Materials'
import { runSeed } from '@/lib/seed/runSeed'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Schema/persistence coverage for the image-capable product option rows
 * (formats, page counts, grammages, quantities): legacy label-only rows stay
 * valid, thumbnails/previews persist, and nothing commercial leaks.
 */
let payload: Payload
let categoryId: number
const slugs = ['int-visual-legacy', 'int-visual-images', 'int-visual-long']
const mediaIds: number[] = []

async function png(name: string, rgb: [number, number, number]) {
  const data = await sharp({ create: { width: 64, height: 48, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } })
    .png()
    .toBuffer()
  const doc = await payload.create({
    collection: 'media',
    data: { alt: name },
    file: { data, mimetype: 'image/png', name: `${name}.png`, size: data.length },
    overrideAccess: true,
  })
  mediaIds.push(doc.id)
  return doc
}

const base = (slug: string) => ({
  title: slug,
  slug,
  shortDescription: 'Produit de test.',
  primaryCategory: categoryId,
  status: 'published' as const,
})

describe('product option media schema', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await runSeed(payload)
    categoryId = (await payload.find({ collection: 'product-categories', limit: 1, overrideAccess: true })).docs[0].id
  }, 60_000)

  afterAll(async () => {
    await payload.delete({ collection: 'products', where: { slug: { in: slugs } }, overrideAccess: true })
    for (const id of mediaIds) await payload.delete({ collection: 'media', id, overrideAccess: true })
  })

  it('keeps label-only rows valid in all four option lists (legacy shape)', async () => {
    const doc = await payload.create({
      collection: 'products',
      data: {
        ...base('int-visual-legacy'),
        availableFormats: [{ label: 'A4' }, { label: 'A5' }],
        pageCountOptions: [{ label: '8 pages' }],
        grammages: [{ label: '350 g' }],
        quantities: [{ label: '100' }, { label: '500' }],
      },
      overrideAccess: true,
    })
    const read = await payload.findByID({ collection: 'products', id: doc.id, depth: 2, overrideAccess: true })
    for (const row of [
      ...(read.availableFormats ?? []),
      ...(read.pageCountOptions ?? []),
      ...(read.grammages ?? []),
      ...(read.quantities ?? []),
    ]) {
      expect(row.label).toBeTruthy()
      expect(row.description ?? null).toBeNull()
      expect(row.image ?? null).toBeNull()
      expect(row.previewImage ?? null).toBeNull()
    }
    expect(read.availableFormats?.map((r) => r.label)).toEqual(['A4', 'A5'])
  })

  it('persists a thumbnail and a distinct preview image on a format row, and image-only rows elsewhere', async () => {
    const [thumb, preview, grammageThumb] = await Promise.all([png('thumb', [200, 0, 0]), png('preview', [0, 200, 0]), png('gram', [0, 0, 200])])
    const doc = await payload.create({
      collection: 'products',
      data: {
        ...base('int-visual-images'),
        availableFormats: [
          { label: 'A4', description: '210 × 297 mm', image: thumb.id, previewImage: preview.id },
          { label: 'A5' },
        ],
        grammages: [{ label: '300 g', image: grammageThumb.id }, { label: '350 g' }],
        pageCountOptions: [{ label: '8 pages' }],
        quantities: [{ label: '100' }],
      },
      overrideAccess: true,
    })
    const read = await payload.findByID({ collection: 'products', id: doc.id, depth: 2, overrideAccess: true })
    const a4 = read.availableFormats?.[0]
    expect(a4?.description).toBe('210 × 297 mm')
    expect(typeof a4?.image === 'object' && a4.image?.id).toBe(thumb.id)
    expect(typeof a4?.previewImage === 'object' && a4.previewImage?.id).toBe(preview.id)
    expect(a4?.image).not.toEqual(a4?.previewImage)
    expect(read.availableFormats?.[1].image ?? null).toBeNull()
    expect(typeof read.grammages?.[0].image === 'object' && read.grammages?.[0].image?.id).toBe(grammageThumb.id)
    expect(read.grammages?.[0].previewImage ?? null).toBeNull()
    expect(read.pageCountOptions?.[0].image ?? null).toBeNull()
    expect(read.quantities?.[0].image ?? null).toBeNull()
  })

  it('keeps the description short (admin validation) while leaving it optional', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: { ...base('int-visual-long'), availableFormats: [{ label: 'A4', description: 'x'.repeat(121) }] },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('materials and finishes stay shared relationships and gained no preview field', () => {
    const fieldNames = (fields: Field[]) => fields.flatMap((f) => ('name' in f ? [f.name] : []))
    expect(fieldNames(Materials.fields)).toContain('image')
    expect(fieldNames(Finishes.fields)).toContain('image')
    expect(fieldNames(Materials.fields)).not.toContain('previewImage')
    expect(fieldNames(Finishes.fields)).not.toContain('previewImage')
  })

  it('does not expose pricing through the public product read', async () => {
    const result = await payload.find({
      collection: 'products',
      where: { slug: { equals: 'int-visual-images' } },
      overrideAccess: false,
      user: null,
      depth: 0,
    })
    expect(result.docs).toHaveLength(1)
    const json = JSON.stringify(result.docs[0])
    expect(json).not.toMatch(/indicativePrice"\s*:\s*"[^"]/)
    expect(Object.keys(result.docs[0])).not.toContain('price')
  })
})
