import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Access control', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('hides draft products from anonymous (non-overridden) reads', async () => {
    const created = await payload.create({
      collection: 'products',
      data: {
        title: `Test draft product ${Date.now()}`,
        slug: `test-draft-product-${Date.now()}`,
        shortDescription: 'x',
        primaryCategory: (
          await payload.find({ collection: 'product-categories', limit: 1, overrideAccess: true })
        ).docs[0]?.id,
        status: 'draft',
      },
      overrideAccess: true,
    })

    const anonymousResult = await payload.find({
      collection: 'products',
      where: { id: { equals: created.id } },
      overrideAccess: false,
      user: null,
    })

    expect(anonymousResult.docs).toHaveLength(0)

    await payload.delete({ collection: 'products', id: created.id, overrideAccess: true })
  })

  it('never allows anonymous reads of quote-requests', async () => {
    // salesRecordAccess returns a flat `false` for anonymous users, which
    // Payload enforces by throwing a Forbidden error (rather than an empty
    // page) when errors aren't explicitly disabled — the stricter of the
    // two behaviors, and the one we want for commercial data.
    await expect(
      payload.find({ collection: 'quote-requests', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  it('never allows anonymous reads of private-quote-files', async () => {
    await expect(
      payload.find({ collection: 'private-quote-files', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  // payload-invoicepdf (src/payload.config.ts, secureInvoicePdfAccess) ships
  // its collections/global with no `access` of its own, which would
  // otherwise default to Payload's public read/write — these documents hold
  // client PII, pricing and bank details, so this must never regress.
  it('never allows anonymous reads of invoices', async () => {
    await expect(
      payload.find({ collection: 'invoices', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  it('never allows anonymous reads of quotes (invoicepdf plugin)', async () => {
    await expect(
      payload.find({ collection: 'quotes', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  it('never allows anonymous reads of the shop-info global', async () => {
    await expect(
      payload.findGlobal({ slug: 'shop-info', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  // @payloadcms/plugin-import-export (src/payload.config.ts,
  // secureImportExportAccess) ships `imports`/`exports` with only
  // `access.update: () => false` set — read/create/delete default to
  // Payload's public behavior otherwise, which would let an anonymous
  // caller upload a CSV that bulk-writes into products/services/etc via
  // the import job. Must never regress.
  it('never allows anonymous reads of imports', async () => {
    await expect(
      payload.find({ collection: 'imports', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  it('never allows anonymous reads of exports', async () => {
    await expect(
      payload.find({ collection: 'exports', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  it('never allows anonymous creation of an import job', async () => {
    await expect(
      payload.create({
        collection: 'imports',
        data: { collectionSlug: 'products' },
        overrideAccess: false,
        user: null,
      }),
    ).rejects.toThrow('not allowed')
  })

  // @payloadcms/plugin-mcp's `payload-mcp-api-keys` collection ships with its
  // own `access` config (see node_modules source, reviewed before wiring the
  // plugin in), so it's exercised here mainly as a regression guard.
  it('never allows anonymous reads of payload-mcp-api-keys', async () => {
    await expect(
      payload.find({ collection: 'payload-mcp-api-keys', overrideAccess: false, user: null }),
    ).rejects.toThrow('not allowed')
  })

  // The MCP plugin gives `payload-mcp-api-keys` its own native Payload
  // API-key auth strategy (auth.useAPIKey), so a valid key authenticates
  // `req.user` directly against the plain REST/GraphQL/Local API — not just
  // the plugin's own /api/mcp endpoint — with a principal that has no
  // `role` field. src/lib/payload/access.ts's role-based checks must treat
  // that principal as unauthenticated (see `isStaffUser`), otherwise any MCP
  // key — however narrowly scoped in the MCP tool config — could read/write
  // staff-only data by calling the ordinary API directly. This was a real
  // gap introduced by the plugin upgrade and is the reason this test exists.
  it('never treats an MCP API key principal as a staff user', async () => {
    const apiKeyPrincipal = { id: 999999, collection: 'payload-mcp-api-keys' }

    await expect(
      payload.find({ collection: 'quote-requests', overrideAccess: false, user: apiKeyPrincipal }),
    ).rejects.toThrow('not allowed')

    await expect(
      payload.find({ collection: 'private-quote-files', overrideAccess: false, user: apiKeyPrincipal }),
    ).rejects.toThrow('not allowed')

    await expect(
      payload.find({ collection: 'users', overrideAccess: false, user: apiKeyPrincipal }),
    ).rejects.toThrow('not allowed')

    const draftProducts = await payload.find({
      collection: 'products',
      where: { status: { equals: 'draft' } },
      overrideAccess: false,
      user: apiKeyPrincipal,
    })
    expect(draftProducts.docs).toHaveLength(0)
  })

  it('allows anonymous reads of published products', async () => {
    const category = (await payload.find({ collection: 'product-categories', limit: 1, overrideAccess: true }))
      .docs[0]

    const published = await payload.create({
      collection: 'products',
      data: {
        title: `Test published product ${Date.now()}`,
        slug: `test-published-product-${Date.now()}`,
        shortDescription: 'x',
        primaryCategory: category?.id,
        status: 'published',
      },
      overrideAccess: true,
    })

    const anonymousResult = await payload.find({
      collection: 'products',
      where: { id: { equals: published.id } },
      overrideAccess: false,
      user: null,
    })

    expect(anonymousResult.docs).toHaveLength(1)

    await payload.delete({ collection: 'products', id: published.id, overrideAccess: true })
  })
})
