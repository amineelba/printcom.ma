import { describe, it, expect } from 'vitest'
import { buildProductWhere } from '@/lib/catalog/buildProductWhere'

describe('buildProductWhere', () => {
  it('always constrains to published status', () => {
    const where = buildProductWhere({})
    expect(where.and).toContainEqual({ status: { equals: 'published' } })
    expect(where.and).toHaveLength(1)
  })

  it('adds a category filter across primary and secondary categories', () => {
    const where = buildProductWhere({ categorie: 'papeterie-entreprise' })
    expect(where.and).toContainEqual({
      or: [
        { 'primaryCategory.slug': { equals: 'papeterie-entreprise' } },
        { 'secondaryCategories.slug': { equals: 'papeterie-entreprise' } },
      ],
    })
  })

  it('combines multiple filters cumulatively (AND)', () => {
    const where = buildProductWhere({ categorie: 'packaging', support: 'kraft', finition: 'vernis-uv' })
    expect(where.and).toHaveLength(4) // status + 3 filters
  })

  it('adds a search filter across title and shortDescription', () => {
    const where = buildProductWhere({ q: 'carte de visite' })
    expect(where.and).toContainEqual({
      or: [{ title: { like: 'carte de visite' } }, { shortDescription: { like: 'carte de visite' } }],
    })
  })

  it('ignores empty/undefined params', () => {
    const where = buildProductWhere({ categorie: undefined, q: '' })
    expect(where.and).toHaveLength(1)
  })
})
