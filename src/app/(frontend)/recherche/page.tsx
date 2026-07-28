import type { Metadata } from 'next'
import Link from 'next/link'
import type { Where } from 'payload'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { EmptyState } from '@/components/feedback/EmptyState'

export const metadata: Metadata = { title: 'Recherche', robots: { index: false, follow: true } }

interface SearchHit {
  title: string
  href: string
  description?: string | null
  type: string
}

async function search(query: string): Promise<SearchHit[]> {
  if (!query.trim()) return []
  const payload = await getPayload()
  const where: Where = {
    and: [
      { status: { equals: 'published' } },
      { or: [{ title: { like: query } }, { shortDescription: { like: query } }] },
    ],
  }

  const [products, services, solutions, sectors, resources] = await Promise.all([
    payload.find({ collection: 'products', where, limit: 10, depth: 0 }),
    payload.find({ collection: 'services', where, limit: 10, depth: 0 }),
    payload.find({ collection: 'solutions', where, limit: 10, depth: 0 }),
    payload.find({ collection: 'sectors', where, limit: 10, depth: 0 }),
    payload.find({
      collection: 'resources',
      where: {
        and: [
          { status: { equals: 'published' } },
          { or: [{ title: { like: query } }, { introduction: { like: query } }] },
        ],
      } satisfies Where,
      limit: 10,
      depth: 0,
    }),
  ])

  return [
    ...products.docs.map((p) => ({ title: p.title, href: `/produits/${p.slug}`, description: p.shortDescription, type: 'Produit' })),
    ...services.docs.map((s) => ({ title: s.title, href: `/services/${s.slug}`, description: s.shortDescription, type: 'Service' })),
    ...solutions.docs.map((s) => ({ title: s.title, href: `/solutions/${s.slug}`, description: s.shortDescription, type: 'Solution' })),
    ...sectors.docs.map((s) => ({ title: s.title, href: `/solutions/par-secteur/${s.slug}`, description: s.shortDescription, type: 'Secteur' })),
    ...resources.docs.map((r) => ({ title: r.title, href: `/ressources/${r.slug}`, description: r.introduction, type: 'Ressource' })),
  ]
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const results = await search(q)

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Recherche' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Recherche</h1>

      <form role="search" method="get" className="mt-8 flex gap-2">
        <label htmlFor="q" className="sr-only">Rechercher</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Produits, services, ressources…"
          className="h-[var(--pc-field-height)] flex-1 rounded-control border border-border-default px-4 text-[0.9375rem]"
        />
        <button type="submit" className="h-[var(--pc-field-height)] rounded-control bg-action px-6 text-[0.9375rem] font-medium text-action-content">
          Rechercher
        </button>
      </form>

      {q ? (
        <p className="pc-text-body-small mt-6 text-secondary">
          {results.length} résultat{results.length > 1 ? 's' : ''} pour « {q} »
        </p>
      ) : null}

      <div className="mt-8">
        {q && !results.length ? (
          <EmptyState title="Aucun résultat" description="Essayez un autre terme ou contactez-nous directement." />
        ) : (
          <ul className="flex flex-col divide-y divide-(--pc-color-border-subtle)">
            {results.map((hit) => (
              <li key={hit.href} className="py-5">
                <Link href={hit.href} className="group">
                  <span className="pc-text-footnote uppercase tracking-wide text-tertiary">{hit.type}</span>
                  <p className="mt-1 text-[1.0625rem] font-semibold text-primary group-hover:text-link">{hit.title}</p>
                  {hit.description ? <p className="pc-text-body-small mt-1 text-secondary">{hit.description}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}
