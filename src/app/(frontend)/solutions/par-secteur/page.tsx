import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { SectorCard } from '@/components/cards/SectorCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Sector } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Solutions par secteur',
  description: 'Printcom étudie les contraintes d’impression propres à chaque secteur d’activité.',
}

export default async function SolutionsBySectorArchivePage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'sectors',
    where: { status: { equals: 'published' } },
    limit: 100,
    sort: 'title',
  })

  const sectors = result.docs as Sector[]

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Solutions', href: '/solutions/par-besoin' }, { label: 'Par secteur' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Solutions par secteur</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Printcom étudie les contraintes d’impression propres à chaque secteur d’activité.
      </p>

      {sectors.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <SectorCard key={sector.id} sector={sector} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Secteurs en cours de publication" />
        </div>
      )}
    </Container>
  )
}
