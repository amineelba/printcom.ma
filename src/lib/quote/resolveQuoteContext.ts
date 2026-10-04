import type { Payload } from 'payload'

export interface QuoteContextItem {
  id: number
  slug: string
  title: string
}

export interface ResolvedQuoteContext {
  product?: QuoteContextItem
  material?: QuoteContextItem
  finish?: QuoteContextItem
}

export interface QuoteContextSlugs {
  productSlug?: string
  materialSlug?: string
  finishSlug?: string
}

async function findPublishedBySlug(
  payload: Payload,
  collection: 'products' | 'materials' | 'finishes',
  slug: string | undefined,
): Promise<QuoteContextItem | undefined> {
  if (!slug) return undefined
  // Only published documents are ever resolved: a draft catalogue entry must
  // not become publicly visible just because someone guessed its slug in the
  // URL (same rule as every other public read).
  const result = await payload.find({
    collection,
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  return doc ? { id: doc.id, slug: doc.slug, title: doc.title } : undefined
}

/**
 * Resolves product/support/finition slugs (from `?produit=`, `?support=`,
 * `?finition=`) to published catalogue documents. Unknown, unpublished or
 * absent slugs resolve to `undefined` — never an error, never a placeholder.
 * Used by both the page (to render the summary) and the submit action (to
 * attach the context to the lead), so the two always agree.
 */
export async function resolveQuoteContext(payload: Payload, slugs: QuoteContextSlugs | undefined): Promise<ResolvedQuoteContext> {
  const [product, material, finish] = await Promise.all([
    findPublishedBySlug(payload, 'products', slugs?.productSlug),
    findPublishedBySlug(payload, 'materials', slugs?.materialSlug),
    findPublishedBySlug(payload, 'finishes', slugs?.finishSlug),
  ])
  return { product, material, finish }
}
