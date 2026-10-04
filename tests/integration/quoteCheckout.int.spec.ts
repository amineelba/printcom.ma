import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { runSeed } from '@/lib/seed/runSeed'
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'

/**
 * submitQuoteRequest reads the caller IP via next/headers, which only exists
 * inside a Next request. A distinct IP per test keeps the in-memory rate
 * limiter (3/min/IP) from coupling tests together.
 */
let currentIp = '203.0.113.1'
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': currentIp }),
}))

// Imported after vi.mock so the action picks up the mocked headers().
const { submitQuoteRequest } = await import('@/app/(frontend)/demande-de-devis/actions')

let payload: Payload
const createdReferences: string[] = []
let ipCounter = 10

const nextIp = () => {
  ipCounter += 1
  currentIp = `203.0.113.${ipCounter}`
}

const valid = () => ({
  fullName: 'Amine Test',
  phone: '+212600000000',
  email: 'amine@example.com',
  designSource: 'client' as const,
  consentConfirmed: true as const,
  idempotencyKey: crypto.randomUUID(),
})

const findByReference = async (reference: string) => {
  const result = await payload.find({
    collection: 'quote-requests',
    where: { reference: { equals: reference } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0]
}

const countQuotes = async () =>
  (await payload.find({ collection: 'quote-requests', limit: 0, overrideAccess: true })).totalDocs

describe('quote checkout submission', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await runSeed(payload)
  }, 60_000)

  afterAll(async () => {
    for (const reference of createdReferences) {
      await payload.delete({
        collection: 'quote-requests',
        where: { reference: { equals: reference } },
        overrideAccess: true,
      })
    }
  })

  it('creates a lead for "J’ai déjà mon design" with normalized values', async () => {
    nextIp()
    const result = await submitQuoteRequest({ ...valid(), company: 'ACME', comments: '  Merci  ' })
    expect(result.status).toBe('success')
    expect(result.reference).toMatch(/^PC-DEVIS-\d{4}-\d{6}$/)
    createdReferences.push(result.reference!)

    const doc = await findByReference(result.reference!)
    expect(doc.files?.designSource).toBe('client')
    expect(doc.files?.needsGraphicDesign).toBe(false)
    expect(doc.contact.company).toBe('ACME')
    expect(doc.contact.fullName).toBe('Amine Test')
    expect(doc.contact.comments).toBe('Merci')
    expect(doc.contact.consentConfirmed).toBe(true)
    expect(doc.contact.consentTimestamp).toBeTruthy()
    expect(doc.workflow?.status).toBe('new')
    expect(doc.workflow?.priority).toBe('normal')
    expect(doc.workflow?.source).toBe('website-quote-form')
    expect(doc.need.requestType).toBe('other')
    // Nothing the customer wasn't asked for is invented.
    expect(doc.need.description).toBeFalsy()
    expect(doc.files?.filesReady).toBeFalsy()
    expect(doc.productionAndDelivery?.city).toBeFalsy()
  })

  it('creates a lead for "Printcom réalise le design" without company or comment', async () => {
    nextIp()
    const result = await submitQuoteRequest({ ...valid(), designSource: 'printcom' })
    expect(result.status).toBe('success')
    createdReferences.push(result.reference!)

    const doc = await findByReference(result.reference!)
    expect(doc.files?.designSource).toBe('printcom')
    expect(doc.files?.needsGraphicDesign).toBe(true)
    expect(doc.contact.company).toBeFalsy()
    expect(doc.contact.comments).toBeFalsy()
  })

  it('attaches published product/support/finition context and ignores unpublished or unknown slugs', async () => {
    nextIp()
    const products = await payload.find({ collection: 'products', where: { slug: { equals: 'flyers' } }, limit: 1, overrideAccess: true })
    const product = products.docs[0]
    await payload.update({ collection: 'products', id: product.id, data: { status: 'published' }, overrideAccess: true })

    try {
      const withContext = await submitQuoteRequest({
        ...valid(),
        context: { productSlug: 'flyers', materialSlug: 'matiere-inexistante' },
      })
      createdReferences.push(withContext.reference!)
      const doc = await findByReference(withContext.reference!)
      const desired = doc.need.desiredProduct
      expect(typeof desired === 'number' ? desired : desired?.id).toBe(product.id)
      expect(doc.need.requestType).toBe('product-printing')
      expect(doc.configuration?.material).toBeFalsy()
    } finally {
      await payload.update({ collection: 'products', id: product.id, data: { status: 'draft' }, overrideAccess: true })
    }

    nextIp()
    const unpublished = await submitQuoteRequest({ ...valid(), context: { productSlug: 'flyers' } })
    createdReferences.push(unpublished.reference!)
    const doc = await findByReference(unpublished.reference!)
    expect(doc.need.desiredProduct).toBeFalsy()
  })

  it('honeypot short-circuits to a fake success and writes nothing', async () => {
    nextIp()
    const before = await countQuotes()
    const result = await submitQuoteRequest({ ...valid(), honeypot: 'i am a bot' })
    expect(result).toEqual({ status: 'success', reference: 'PC-DEVIS-0000-000000' })
    expect(await countQuotes()).toBe(before)
  })

  it('is idempotent: the same key returns the same reference and creates one lead', async () => {
    nextIp()
    const input = valid()
    const before = await countQuotes()
    const first = await submitQuoteRequest(input)
    const second = await submitQuoteRequest(input)
    createdReferences.push(first.reference!)
    expect(second.status).toBe('success')
    expect(second.reference).toBe(first.reference)
    expect(await countQuotes()).toBe(before + 1)
  })

  it('rejects malformed input server-side even if client validation is bypassed', async () => {
    nextIp()
    const before = await countQuotes()
    const bad = [
      { input: { ...valid(), fullName: '' }, field: 'fullName' },
      { input: { ...valid(), email: 'nope' }, field: 'email' },
      { input: { ...valid(), phone: '' }, field: 'phone' },
      { input: { ...valid(), designSource: undefined as never }, field: 'designSource' },
      { input: { ...valid(), designSource: 'both' as never }, field: 'designSource' },
      { input: { ...valid(), consentConfirmed: false as never }, field: 'consentConfirmed' },
      { input: { ...valid(), idempotencyKey: '' }, field: 'idempotencyKey' },
    ]
    for (const { input, field } of bad) {
      const result = await submitQuoteRequest(input)
      expect(result.status).toBe('error')
      expect(result.errors?.[field]).toBeTruthy()
    }
    expect(await submitQuoteRequest(null as never)).toMatchObject({ status: 'error' })
    expect(await countQuotes()).toBe(before)
  })

  it('rate-limits a single IP after 3 submissions in a minute', async () => {
    nextIp()
    for (let i = 0; i < 3; i++) {
      const ok = await submitQuoteRequest(valid())
      expect(ok.status).toBe('success')
      createdReferences.push(ok.reference!)
    }
    const limited = await submitQuoteRequest(valid())
    expect(limited.status).toBe('error')
    expect(limited.message).toMatch(/Trop de tentatives/)
  })

  it('keeps quote-requests unreadable to anonymous callers', async () => {
    await expect(
      payload.find({ collection: 'quote-requests', overrideAccess: false, user: null }),
    ).rejects.toThrow()
  })
})
