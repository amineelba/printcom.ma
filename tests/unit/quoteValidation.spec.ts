import { describe, it, expect } from 'vitest'
import { quoteCheckoutSchema } from '@/lib/validation/quote'

const valid = {
  fullName: 'Amine Test',
  phone: '+212600000000',
  email: 'amine@example.com',
  designSource: 'client' as const,
  consentConfirmed: true as const,
  idempotencyKey: 'key-1',
}

const issueFor = (input: unknown, field: string) => {
  const result = quoteCheckoutSchema.safeParse(input)
  return result.success ? undefined : result.error.issues.find((i) => i.path.join('.') === field)
}

describe('quoteCheckoutSchema — required fields', () => {
  it('accepts the minimal valid payload', () => {
    expect(quoteCheckoutSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a missing full name', () => {
    expect(issueFor({ ...valid, fullName: '' }, 'fullName')).toBeDefined()
    expect(issueFor({ ...valid, fullName: '   ' }, 'fullName')).toBeDefined()
    const { fullName: _omitted, ...withoutName } = valid
    expect(issueFor(withoutName, 'fullName')).toBeDefined()
  })

  it('rejects an invalid email', () => {
    expect(issueFor({ ...valid, email: 'not-an-email' }, 'email')?.message).toBe('Adresse e-mail invalide.')
    expect(issueFor({ ...valid, email: '' }, 'email')).toBeDefined()
  })

  it('rejects a missing phone', () => {
    expect(issueFor({ ...valid, phone: '' }, 'phone')).toBeDefined()
    expect(issueFor({ ...valid, phone: '  ' }, 'phone')).toBeDefined()
  })

  it('accepts Moroccan and international phone formats', () => {
    for (const phone of ['0661 23 45 67', '+212 661-234567', '+33 6 12 34 56 78', '(212) 5 22 00 00 00']) {
      expect(quoteCheckoutSchema.safeParse({ ...valid, phone }).success).toBe(true)
    }
  })

  it('rejects a missing designSource', () => {
    const { designSource: _omitted, ...withoutDesign } = valid
    expect(issueFor(withoutDesign, 'designSource')?.message).toBe('Indiquez qui fournit le design.')
  })

  it('rejects an unknown designSource value', () => {
    expect(issueFor({ ...valid, designSource: 'both' }, 'designSource')).toBeDefined()
    expect(issueFor({ ...valid, designSource: '' }, 'designSource')).toBeDefined()
  })

  it('accepts exactly client and printcom', () => {
    expect(quoteCheckoutSchema.safeParse({ ...valid, designSource: 'client' }).success).toBe(true)
    expect(quoteCheckoutSchema.safeParse({ ...valid, designSource: 'printcom' }).success).toBe(true)
  })

  it('rejects unchecked or missing consent', () => {
    expect(issueFor({ ...valid, consentConfirmed: false }, 'consentConfirmed')).toBeDefined()
    const { consentConfirmed: _omitted, ...withoutConsent } = valid
    expect(issueFor(withoutConsent, 'consentConfirmed')).toBeDefined()
  })

  it('rejects a missing idempotency key', () => {
    const { idempotencyKey: _omitted, ...withoutKey } = valid
    expect(issueFor(withoutKey, 'idempotencyKey')).toBeDefined()
  })
})

describe('quoteCheckoutSchema — optional fields', () => {
  it('lets company be omitted or blank (normalized to undefined)', () => {
    const omitted = quoteCheckoutSchema.safeParse(valid)
    expect(omitted.success && omitted.data.company).toBeUndefined()
    const blank = quoteCheckoutSchema.safeParse({ ...valid, company: '   ' })
    expect(blank.success && blank.data.company).toBeUndefined()
  })

  it('trims company and comments when provided', () => {
    const result = quoteCheckoutSchema.safeParse({ ...valid, company: '  Printcom SARL ', comments: '  Bonjour  ' })
    expect(result.success && result.data.company).toBe('Printcom SARL')
    expect(result.success && result.data.comments).toBe('Bonjour')
  })

  it('lets comments be omitted', () => {
    const result = quoteCheckoutSchema.safeParse(valid)
    expect(result.success && result.data.comments).toBeUndefined()
  })

  it('caps comment length', () => {
    expect(issueFor({ ...valid, comments: 'x'.repeat(2001) }, 'comments')).toBeDefined()
  })

  it('keeps the honeypot field', () => {
    const result = quoteCheckoutSchema.safeParse({ ...valid, honeypot: 'bot' })
    expect(result.success && result.data.honeypot).toBe('bot')
  })

  it('accepts an optional product context and trims its slug', () => {
    const result = quoteCheckoutSchema.safeParse({
      ...valid,
      productContext: { productSlug: '  cartes-de-visite ', configurationTransport: '1.abc' },
    })
    expect(result.success && result.data.productContext).toEqual({
      productSlug: 'cartes-de-visite',
      configurationTransport: '1.abc',
    })
    expect(quoteCheckoutSchema.safeParse(valid).success).toBe(true)
  })

  it('caps the transported configuration size', () => {
    expect(
      issueFor({ ...valid, productContext: { configurationTransport: 'x'.repeat(2001) } }, 'productContext.configurationTransport'),
    ).toBeDefined()
  })
})
