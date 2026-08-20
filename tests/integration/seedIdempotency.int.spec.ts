import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { runSeed } from '@/lib/seed/runSeed'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('runSeed idempotency', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('does not duplicate documents when run twice', async () => {
    await runSeed(payload)
    const before = await payload.find({ collection: 'product-categories', limit: 0, overrideAccess: true })
    const beforeProducts = await payload.find({ collection: 'products', limit: 0, overrideAccess: true })

    await runSeed(payload)
    const after = await payload.find({ collection: 'product-categories', limit: 0, overrideAccess: true })
    const afterProducts = await payload.find({ collection: 'products', limit: 0, overrideAccess: true })

    expect(after.totalDocs).toBe(before.totalDocs)
    expect(afterProducts.totalDocs).toBe(beforeProducts.totalDocs)
  }, 60_000)

  it('seeds catalogue products as draft, never as published offers', async () => {
    const flyers = await payload.find({
      collection: 'products',
      where: { slug: { equals: 'flyers' } },
      overrideAccess: true,
      limit: 1,
    })
    expect(flyers.docs[0]?.status).toBe('draft')
  })

  it('seeds sectors as draft with the neutral positioning note (no invented client claims)', async () => {
    const sector = await payload.find({
      collection: 'sectors',
      limit: 1,
      overrideAccess: true,
    })
    expect(sector.docs[0]?.status).toBe('draft')
    expect(sector.docs[0]?.neutralPositioningNote).toContain('étudie les contraintes')
  })
})
