import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { FilterBar, type FilterDefinition } from '@/components/filters/FilterBar'
import { ProductGrid } from '@/components/cards/ProductGrid'
import { Pagination } from '@/components/filters/Pagination'
import { buildProductWhere } from '@/lib/catalog/buildProductWhere'
import type { ProductCategory, Solution, Sector, Material, Finish, Technology } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Produits',
  description: 'Catalogue de produits imprimés Printcom, structuré par famille, besoin et secteur.',
}

const PAGE_SIZE = 12

export default async function ProductsArchivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const getParam = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : undefined)
  const page = Number(getParam('page') || '1') || 1

  const payload = await getPayload()

  const where = buildProductWhere({
    categorie: getParam('categorie'),
    besoin: getParam('besoin'),
    secteur: getParam('secteur'),
    support: getParam('support'),
    finition: getParam('finition'),
    technologie: getParam('technologie'),
    q: getParam('q'),
  })

  const [productsResult, categories, needs, sectors, materials, finishes, technologies] = await Promise.all([
    payload.find({ collection: 'products', where, page, limit: PAGE_SIZE, depth: 1, sort: '-featured,title' }),
    payload.find({ collection: 'product-categories', where: { status: { equals: 'published' }, parent: { exists: false } }, limit: 100 }),
    payload.find({ collection: 'solutions', where: { status: { equals: 'published' } }, limit: 100 }),
    payload.find({ collection: 'sectors', where: { status: { equals: 'published' } }, limit: 100 }),
    payload.find({ collection: 'materials', where: { status: { equals: 'published' } }, limit: 100 }),
    payload.find({ collection: 'finishes', where: { status: { equals: 'published' } }, limit: 100 }),
    payload.find({
      collection: 'technologies',
      where: { status: { equals: 'published' }, verificationStatus: { equals: 'confirmed' } },
      limit: 100,
    }),
  ])

  const filters: FilterDefinition[] = [
    {
      key: 'categorie',
      label: 'Catégorie',
      options: (categories.docs as ProductCategory[]).map((c) => ({ label: c.title, value: c.slug })),
    },
    {
      key: 'besoin',
      label: 'Besoin',
      options: (needs.docs as Solution[]).map((s) => ({ label: s.title, value: s.slug })),
    },
    {
      key: 'secteur',
      label: 'Secteur',
      options: (sectors.docs as Sector[]).map((s) => ({ label: s.title, value: s.slug })),
    },
    {
      key: 'support',
      label: 'Support',
      options: (materials.docs as Material[]).map((m) => ({ label: m.title, value: m.slug })),
    },
    {
      key: 'finition',
      label: 'Finition',
      options: (finishes.docs as Finish[]).map((f) => ({ label: f.title, value: f.slug })),
    },
    {
      key: 'technologie',
      label: 'Technologie',
      options: (technologies.docs as Technology[]).map((t) => ({ label: t.title, value: t.slug })),
    },
  ].filter((f) => f.options.length > 0)

  const searchString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => typeof v === 'string') as [string, string][],
  )

  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams(searchString)
    next.set('page', String(targetPage))
    return `/produits?${next.toString()}`
  }

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Produits' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Produits</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Neuf familles de produits imprimés, structurées par usage, secteur et support. Toutes nos
        réalisations sont établies sur devis.
      </p>

      <div className="mt-10 border-b border-(--pc-color-border-subtle) pb-6">
        <FilterBar filters={filters} />
      </div>

      <div className="mt-10">
        <ProductGrid products={productsResult.docs} />
      </div>

      <Pagination currentPage={productsResult.page ?? 1} totalPages={productsResult.totalPages ?? 1} buildHref={buildHref} />
    </Container>
  )
}
