import type { Where } from 'payload'

export interface ProductFilterParams {
  categorie?: string
  besoin?: string
  secteur?: string
  support?: string
  finition?: string
  technologie?: string
  q?: string
}

/**
 * Translates URL search params into a Payload `where` clause for the
 * products collection. Pure function — safe to unit test without a DB.
 * All filters are cumulative (AND).
 */
export function buildProductWhere(params: ProductFilterParams): Where {
  const and: Where[] = [{ status: { equals: 'published' } }]

  if (params.categorie) {
    and.push({
      or: [
        { 'primaryCategory.slug': { equals: params.categorie } },
        { 'secondaryCategories.slug': { equals: params.categorie } },
      ],
    })
  }

  if (params.besoin) {
    and.push({ 'needs.slug': { equals: params.besoin } })
  }

  if (params.secteur) {
    and.push({ 'sectors.slug': { equals: params.secteur } })
  }

  if (params.support) {
    and.push({ 'materials.slug': { equals: params.support } })
  }

  if (params.finition) {
    and.push({ 'finishes.slug': { equals: params.finition } })
  }

  if (params.technologie) {
    and.push({ 'recommendedTechnologies.slug': { equals: params.technologie } })
  }

  if (params.q) {
    and.push({
      or: [
        { title: { like: params.q } },
        { shortDescription: { like: params.q } },
      ],
    })
  }

  return { and }
}
