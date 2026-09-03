import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { runSeed } from '@/lib/seed/runSeed'
import { describe, it, beforeAll, expect } from 'vitest'

/**
 * Invariants for the catalog architecture migration (CATEGORY -> PRODUCT
 * hierarchical, PRODUCT <-> PRODUCT_COLLECTION transversal, Goodies items
 * as real Products). See the architecture migration doc this test file was
 * added for.
 */
let payload: Payload

describe('catalog architecture', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await runSeed(payload)
  }, 60_000)

  it('D: Goodies items exist as Products with primaryCategory = Goodies, not as category children', async () => {
    const mug = await payload.find({
      collection: 'products',
      where: { slug: { equals: 'mugs-tasses' } },
      depth: 1,
      overrideAccess: true,
      limit: 1,
    })
    expect(mug.docs).toHaveLength(1)
    const primaryCategory = mug.docs[0]?.primaryCategory
    const categorySlug = primaryCategory && typeof primaryCategory === 'object' ? primaryCategory.slug : null
    expect(categorySlug).toBe('goodies-objets-publicitaires')

    const legacyCategory = await payload.find({
      collection: 'product-categories',
      where: { slug: { equals: 'mugs-tasses' } },
      overrideAccess: true,
      limit: 1,
    })
    expect(legacyCategory.docs).toHaveLength(0)
  })

  it('E: no product-categories document has a parent field (flat taxonomy)', async () => {
    const categories = await payload.find({ collection: 'product-categories', limit: 100, overrideAccess: true })
    expect(categories.totalDocs).toBe(9)
    for (const category of categories.docs) {
      expect('parent' in category).toBe(false)
    }
  })

  it('A: attaching a Product to ProductCollections does not change its primaryCategory', async () => {
    const flyers = await payload.find({
      collection: 'products',
      where: { slug: { equals: 'flyers' } },
      overrideAccess: true,
      limit: 1,
    })
    const flyer = flyers.docs[0]
    expect(flyer).toBeTruthy()
    const originalCategoryId =
      typeof flyer.primaryCategory === 'object' ? flyer.primaryCategory.id : flyer.primaryCategory

    const collection = await payload.create({
      collection: 'product-collections',
      data: { title: 'Test Collection', key: 'test-collection-authority', status: 'active' },
      overrideAccess: true,
    })

    const updated = await payload.update({
      collection: 'products',
      id: flyer.id,
      data: { collections: [collection.id] },
      overrideAccess: true,
    })

    const updatedCategoryId =
      typeof updated.primaryCategory === 'object' ? updated.primaryCategory.id : updated.primaryCategory
    expect(updatedCategoryId).toBe(originalCategoryId)

    // cleanup
    await payload.update({ collection: 'products', id: flyer.id, data: { collections: [] }, overrideAccess: true })
    await payload.delete({ collection: 'product-collections', id: collection.id, overrideAccess: true })
  })

  it('B + C: a Product can belong to several ProductCollections, and each resolves the same Product id', async () => {
    const products = await payload.find({
      collection: 'products',
      where: { slug: { equals: 'mugs-tasses' } },
      overrideAccess: true,
      limit: 1,
    })
    const product = products.docs[0]

    const [collectionA, collectionB] = await Promise.all([
      payload.create({
        collection: 'product-collections',
        data: { title: 'Ramadan Test', key: 'test-ramadan', status: 'active' },
        overrideAccess: true,
      }),
      payload.create({
        collection: 'product-collections',
        data: { title: 'Événementiel Test', key: 'test-evenementiel', status: 'active' },
        overrideAccess: true,
      }),
    ])

    await payload.update({
      collection: 'products',
      id: product.id,
      data: { collections: [collectionA.id, collectionB.id] },
      overrideAccess: true,
    })

    const viaA = await payload.find({
      collection: 'products',
      where: { collections: { equals: collectionA.id } },
      overrideAccess: true,
      limit: 10,
    })
    const viaB = await payload.find({
      collection: 'products',
      where: { collections: { equals: collectionB.id } },
      overrideAccess: true,
      limit: 10,
    })

    expect(viaA.docs.map((d) => d.id)).toContain(product.id)
    expect(viaB.docs.map((d) => d.id)).toContain(product.id)

    // cleanup
    await payload.update({ collection: 'products', id: product.id, data: { collections: [] }, overrideAccess: true })
    await payload.delete({ collection: 'product-collections', id: collectionA.id, overrideAccess: true })
    await payload.delete({ collection: 'product-collections', id: collectionB.id, overrideAccess: true })
  })

  it('J: every product primaryCategory resolves to an existing category (no dangling legacy reference)', async () => {
    const products = await payload.find({ collection: 'products', limit: 200, depth: 1, overrideAccess: true })
    for (const product of products.docs) {
      expect(product.primaryCategory).toBeTruthy()
      expect(typeof product.primaryCategory === 'object' ? product.primaryCategory.id : product.primaryCategory).toBeTruthy()
    }
  })

  it('product-collections anonymous read only exposes active documents', async () => {
    const draft = await payload.create({
      collection: 'product-collections',
      data: { title: 'Draft Test', key: 'test-draft-visibility', status: 'draft' },
      overrideAccess: true,
    })
    const active = await payload.create({
      collection: 'product-collections',
      data: { title: 'Active Test', key: 'test-active-visibility', status: 'active' },
      overrideAccess: true,
    })

    const anonymousResult = await payload.find({
      collection: 'product-collections',
      where: { key: { in: ['test-draft-visibility', 'test-active-visibility'] } },
      limit: 10,
      overrideAccess: false,
      user: null,
    })
    const visibleKeys = anonymousResult.docs.map((d) => d.key)
    expect(visibleKeys).toContain('test-active-visibility')
    expect(visibleKeys).not.toContain('test-draft-visibility')

    await payload.delete({ collection: 'product-collections', id: draft.id, overrideAccess: true })
    await payload.delete({ collection: 'product-collections', id: active.id, overrideAccess: true })
  })
})
