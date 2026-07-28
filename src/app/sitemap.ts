import type { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload/client'

// See src/app/(frontend)/layout.tsx — this reads Payload, so it must not
// be evaluated at build time (no DB access guaranteed then).
export const dynamic = 'force-dynamic'

const STATIC_ROUTES = [
  '',
  '/produits',
  '/services',
  '/solutions/par-besoin',
  '/solutions/par-secteur',
  '/technologies',
  '/supports',
  '/finitions',
  '/ressources',
  '/a-propos',
  '/notre-savoir-faire',
  '/qualite-et-engagements',
  '/faq',
  '/contact',
  '/demande-de-devis',
  '/mentions-legales',
  '/politique-de-confidentialite',
  '/politique-des-cookies',
  '/sitemap',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payload = await getPayload()

  const [products, services, solutions, sectors, resources, materials, finishes, technologies] = await Promise.all([
    payload.find({ collection: 'products', where: { status: { equals: 'published' } }, limit: 2000, depth: 0 }),
    payload.find({ collection: 'services', where: { status: { equals: 'published' } }, limit: 2000, depth: 0 }),
    payload.find({ collection: 'solutions', where: { status: { equals: 'published' } }, limit: 2000, depth: 0 }),
    payload.find({ collection: 'sectors', where: { status: { equals: 'published' } }, limit: 2000, depth: 0 }),
    payload.find({ collection: 'resources', where: { status: { equals: 'published' } }, limit: 2000, depth: 0 }),
    payload.find({ collection: 'materials', where: { status: { equals: 'published' } }, limit: 2000, depth: 0 }),
    payload.find({ collection: 'finishes', where: { status: { equals: 'published' } }, limit: 2000, depth: 0 }),
    payload.find({
      collection: 'technologies',
      where: { status: { equals: 'published' }, verificationStatus: { equals: 'confirmed' } },
      limit: 2000,
      depth: 0,
    }),
  ])

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))

  const dynamicSections: Array<{ prefix: string; docs: { slug: string; updatedAt?: string }[] }> = [
    { prefix: '/produits', docs: products.docs },
    { prefix: '/services', docs: services.docs },
    { prefix: '/solutions', docs: solutions.docs },
    { prefix: '/solutions/par-secteur', docs: sectors.docs },
    { prefix: '/ressources', docs: resources.docs },
    { prefix: '/supports', docs: materials.docs },
    { prefix: '/finitions', docs: finishes.docs },
    { prefix: '/technologies', docs: technologies.docs },
  ]

  for (const section of dynamicSections) {
    for (const doc of section.docs) {
      entries.push({
        url: `${baseUrl}${section.prefix}/${doc.slug}`,
        lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
      })
    }
  }

  return entries
}
