import { describe, it, expect } from 'vitest'
import {
  quoteNeedSchema,
  quoteContactSchema,
  quoteRequestSchema,
} from '@/lib/validation/quote'

describe('quoteNeedSchema', () => {
  it('rejects a missing description', () => {
    const result = quoteNeedSchema.safeParse({ requestType: 'product-printing', description: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown requestType', () => {
    const result = quoteNeedSchema.safeParse({ requestType: 'not-a-real-type', description: 'Un besoin' })
    expect(result.success).toBe(false)
  })

  it('accepts a minimal valid payload', () => {
    const result = quoteNeedSchema.safeParse({ requestType: 'advisory', description: 'Un besoin de conseil.' })
    expect(result.success).toBe(true)
  })
})

describe('quoteContactSchema', () => {
  const base = {
    company: 'Printcom Test SARL',
    fullName: 'Amine Test',
    email: 'amine@example.com',
    phone: '+212600000000',
    consentConfirmed: true as const,
  }

  it('rejects an invalid email', () => {
    const result = quoteContactSchema.safeParse({ ...base, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects consentConfirmed: false', () => {
    const result = quoteContactSchema.safeParse({ ...base, consentConfirmed: false })
    expect(result.success).toBe(false)
  })

  it('accepts a valid contact payload', () => {
    const result = quoteContactSchema.safeParse(base)
    expect(result.success).toBe(true)
  })
})

describe('quoteRequestSchema', () => {
  it('rejects a request missing the idempotency key', () => {
    const result = quoteRequestSchema.safeParse({
      need: { requestType: 'advisory', description: 'x' },
      configuration: {},
      productionAndDelivery: { urgencyLevel: 'standard' },
      files: {},
      contact: {
        company: 'A',
        fullName: 'B',
        email: 'a@b.com',
        phone: '0600000000',
        consentConfirmed: true,
      },
    })
    expect(result.success).toBe(false)
  })
})
