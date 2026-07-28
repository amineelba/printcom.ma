import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { SolutionCard } from '@/components/cards/SolutionCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Solution } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Solutions par besoin',
  description: 'Des solutions d’impression organisées autour de vos objectifs commerciaux.',
}

export default async function SolutionsByNeedArchivePage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'solutions',
    where: { status: { equals: 'published' } },
    limit: 100,
    sort: 'title',
  })

  const solutions = result.docs as Solution[]

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Solutions', href: '/solutions/par-besoin' }, { label: 'Par besoin' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Solutions par besoin</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Chaque solution associe produits, services et technologies au besoin commercial qu’elle résout.
      </p>

      {solutions.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Solutions en cours de publication" />
        </div>
      )}
    </Container>
  )
}
