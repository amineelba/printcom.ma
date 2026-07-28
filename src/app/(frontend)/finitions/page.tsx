import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { FinishCard } from '@/components/cards/FinishCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Finish } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Finitions',
  description: 'Pelliculage, vernis, ennoblissement, découpe et reliure disponibles chez Printcom.',
}

const GROUP_LABELS: Record<string, string> = {
  pelliculage: 'Pelliculage',
  vernis: 'Vernis',
  ennoblissement: 'Ennoblissement',
  decoupe: 'Découpe',
  reliure: 'Reliure',
}

export default async function FinishesArchivePage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'finishes',
    where: { status: { equals: 'published' } },
    limit: 200,
    sort: 'title',
  })

  const finishes = result.docs as Finish[]
  const grouped = finishes.reduce<Record<string, Finish[]>>((acc, finish) => {
    const group = finish.group
    acc[group] = acc[group] ? [...acc[group], finish] : [finish]
    return acc
  }, {})

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Finitions' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Finitions</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Les finitions donnent leur caractère final à vos supports imprimés — protection, texture, éclat.
      </p>

      {finishes.length ? (
        <div className="mt-12 flex flex-col gap-12">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h2 className="pc-text-section-title text-primary">{GROUP_LABELS[group] || group}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((finish) => (
                  <FinishCard key={finish.id} finish={finish} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Finitions en cours de documentation" description="Cette page sera complétée prochainement." />
        </div>
      )}
    </Container>
  )
}
