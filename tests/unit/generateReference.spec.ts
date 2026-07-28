import { describe, it, expect } from 'vitest'
import { formatReference, referencePrefix } from '@/lib/quote/generateReference'

describe('formatReference', () => {
  it('pads the sequence to 6 digits', () => {
    expect(formatReference(2026, 1)).toBe('PC-DEVIS-2026-000001')
  })

  it('does not truncate a sequence larger than 6 digits', () => {
    expect(formatReference(2026, 1234567)).toBe('PC-DEVIS-2026-1234567')
  })
})

describe('referencePrefix', () => {
  it('matches the prefix used by formatReference for the same year', () => {
    expect(formatReference(2026, 42)).toMatch(new RegExp(`^${referencePrefix(2026)}`))
  })
})
