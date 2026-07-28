import { describe, it, expect } from 'vitest'
import { Products } from '@/collections/Products'
import { ProductCategories } from '@/collections/ProductCategories'
import { Solutions } from '@/collections/Solutions'
import { Sectors } from '@/collections/Sectors'
import { Services } from '@/collections/Services'

const FORBIDDEN_SLUGS = ['realisations', 'réalisations', 'projects', 'portfolio', 'case-studies', 'work']

describe('taxonomy guardrails', () => {
  it('never defines a forbidden collection slug', () => {
    const definedSlugs = [Products, ProductCategories, Solutions, Sectors, Services].map((c) => c.slug)
    for (const forbidden of FORBIDDEN_SLUGS) {
      expect(definedSlugs).not.toContain(forbidden)
    }
  })

  it('Products collection has no cart/checkout-shaped fields', () => {
    const fieldNames = Products.fields.map((f) => ('name' in f ? f.name : undefined)).filter(Boolean)
    for (const forbidden of ['addToCart', 'price', 'stock', 'inventory']) {
      expect(fieldNames).not.toContain(forbidden)
    }
  })
})
