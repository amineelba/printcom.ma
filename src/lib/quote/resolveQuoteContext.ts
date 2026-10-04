import type { Payload } from 'payload'
import type { Product } from '@/payload-types'
import { parseConfigurationTransport } from '@/lib/configurator/transport'
import { resolveProductConfiguration, type ResolvedConfiguration } from '@/lib/configurator/resolveConfiguration'

export interface QuoteContextItem {
  id: number
  slug: string
  title: string
}

export interface ResolvedQuoteContext {
  product?: QuoteContextItem
  material?: QuoteContextItem
  finish?: QuoteContextItem
  /**
   * Canonical product configuration, present only when the product resolved.
   * It already folds in the legacy `?support=` / `?finition=` slugs, and when
   * it exists `material` / `finish` above are derived from it.
   */
  configuration?: ResolvedConfiguration
}

export interface QuoteContextSlugs {
  productSlug?: string
  materialSlug?: string
  finishSlug?: string
  /** Opaque `cfg` transport from the product page (see configurator/transport). */
  configurationTransport?: string
}

async function findPublishedBySlug(
  payload: Payload,
  collection: 'materials' | 'finishes',
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

async function findPublishedProduct(payload: Payload, slug: string | undefined): Promise<Product | undefined> {
  if (!slug) return undefined
  // depth 2: the configuration is validated against the product's *own*
  // published materials/finishes, so the relationships must be populated.
  const result = await payload.find({
    collection: 'products',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })
  return result.docs[0] as Product | undefined
}

/**
 * Resolves the quote's catalogue context. Unknown, unpublished or absent
 * slugs resolve to `undefined` — never an error, never a placeholder. Used by
 * both the page (to render the summary) and the submit action (to attach the
 * context to the lead), so the two always agree.
 *
 * With a published product, the transported configuration (and the legacy
 * `?support=` / `?finition=` slugs) are canonicalized against *that
 * product's* options — a material from another product is dropped. Without a
 * product there is nothing to validate against, so the legacy slugs fall back
 * to the plain "published material/finish" lookup.
 */
export async function resolveQuoteContext(payload: Payload, slugs: QuoteContextSlugs | undefined): Promise<ResolvedQuoteContext> {
  const productDoc = await findPublishedProduct(payload, slugs?.productSlug)

  if (productDoc) {
    const configuration = resolveProductConfiguration({
      product: productDoc,
      transport: parseConfigurationTransport(slugs?.configurationTransport),
      legacy: { materialSlug: slugs?.materialSlug, finishSlug: slugs?.finishSlug },
    })
    const { material, finishes } = configuration.selections
    return {
      product: { id: productDoc.id, slug: productDoc.slug, title: productDoc.title },
      material,
      finish: finishes[0],
      configuration,
    }
  }

  const [material, finish] = await Promise.all([
    findPublishedBySlug(payload, 'materials', slugs?.materialSlug),
    findPublishedBySlug(payload, 'finishes', slugs?.finishSlug),
  ])
  return { material, finish }
}
