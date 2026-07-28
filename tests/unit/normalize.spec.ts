import { describe, it, expect } from 'vitest'
import { normalizeForSearch } from '@/lib/formatting/normalize'

describe('normalizeForSearch', () => {
  it('strips accents', () => {
    expect(normalizeForSearch('Étiquettes prédécoupées')).toBe('etiquettes predecoupees')
  })

  it('lowercases and trims', () => {
    expect(normalizeForSearch('  Carte De Visite  ')).toBe('carte de visite')
  })
})
