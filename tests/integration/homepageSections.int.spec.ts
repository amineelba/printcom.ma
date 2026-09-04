import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { runSeed } from '@/lib/seed/runSeed'
import { PRODUCT_COLLECTIONS } from '@/lib/seed/content/productCollections'
import { describe, it, beforeAll, expect } from 'vitest'

/**
 * Coverage for the new homepage sections added per
 * PRINTCOM-HOMEPAGE-UI-UX-BRIEF-UNIQUE.md: the Collection Board seed data,
 * the nav's category data shape, and the verification-gated queries (trust
 * bar, technologies) that must stay empty on the current (draft/
 * unconfirmed) seed — proving the "hide empty sections" gate is real, not
 * just visually absent.
 */
let payload: Payload

describe('homepage sections', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await runSeed(payload)
  }, 60_000)

  it('seeds all 6 Collection Board entries and each resolves at least one tagged product', async () => {
    const collections = await payload.find({
      collection: 'product-collections',
      limit: 20,
      overrideAccess: true,
    })
    expect(collections.totalDocs).toBe(PRODUCT_COLLECTIONS.length)

    for (const collection of collections.docs) {
      expect(collection.status).toBe('active')
      const members = await payload.find({
        collection: 'products',
        where: { collections: { equals: collection.id } },
        limit: 1,
        overrideAccess: true,
      })
      expect(members.totalDocs).toBeGreaterThan(0)
    }
  })

  it('category-bar data source returns exactly the 9 canonical published categories', async () => {
    const categories = await payload.find({
      collection: 'product-categories',
      where: { status: { equals: 'published' } },
      limit: 20,
      overrideAccess: true,
    })
    expect(categories.totalDocs).toBe(9)
  })

  it('trust bar query (status=published AND authorizationConfirmed=true) is empty on the current seed', async () => {
    const clients = await payload.find({
      collection: 'clients',
      where: { and: [{ status: { equals: 'published' } }, { authorizationConfirmed: { equals: true } }] },
      overrideAccess: true,
    })
    expect(clients.totalDocs).toBe(0)
  })

  it('technologies-confirmed query (status=published AND verificationStatus=confirmed) is empty on the current seed', async () => {
    const technologies = await payload.find({
      collection: 'technologies',
      where: { and: [{ status: { equals: 'published' } }, { verificationStatus: { equals: 'confirmed' } }] },
      overrideAccess: true,
    })
    expect(technologies.totalDocs).toBe(0)
  })

  it('homepage collectionBoard is enabled and references the seeded collections', async () => {
    const homepage = await payload.findGlobal({ slug: 'homepage', depth: 0, overrideAccess: true })
    expect(homepage.collectionBoard?.enabled).toBe(true)
    expect(homepage.collectionBoard?.collections?.length).toBe(PRODUCT_COLLECTIONS.length)
  })
})
