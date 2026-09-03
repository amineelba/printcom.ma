import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { ProductCollections } from '@/collections/ProductCollections'

const frontendDir = path.resolve(__dirname, '../../src/app/(frontend)')
const sitemapSource = fs.readFileSync(path.resolve(__dirname, '../../src/app/sitemap.ts'), 'utf-8')

describe('ProductCollections stays headless (no public page)', () => {
  it('has no /collections route directory', () => {
    expect(fs.existsSync(path.join(frontendDir, 'collections'))).toBe(false)
  })

  it('is never referenced by the sitemap generator', () => {
    expect(sitemapSource).not.toContain('product-collections')
  })

  it('defines no seoFields/canonical field — it is not a publishable page entity', () => {
    const fieldNames = ProductCollections.fields.map((f) => ('name' in f ? f.name : undefined))
    expect(fieldNames).not.toContain('seo')
    expect(fieldNames).not.toContain('canonicalUrl')
  })

  it('uses "key" as its internal identifier, not "slug" (never implies a public URL)', () => {
    const fieldNames = ProductCollections.fields.map((f) => ('name' in f ? f.name : undefined))
    expect(fieldNames).toContain('key')
    expect(fieldNames).not.toContain('slug')
  })
})
