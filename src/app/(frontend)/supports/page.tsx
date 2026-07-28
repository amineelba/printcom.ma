import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { MaterialCard } from '@/components/cards/MaterialCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Material } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Supports et matériaux',
  description: 'Papiers, cartons, supports souples et rigides disponibles chez Printcom.',
}

const GROUP_LABELS: Record<string, string> = {
  papier: 'Papier',
  carton: 'Carton',
  'supports-souples': 'Supports souples',
  'supports-rigides': 'Supports rigides',
}

export default async function SupportsArchivePage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'materials',
    where: { status: { equals: 'published' } },
    limit: 200,
    sort: 'title',
  })

  const materials = result.docs as Material[]
  const grouped = materials.reduce<Record<string, Material[]>>((acc, material) => {
    const group = material.group
    acc[group] = acc[group] ? [...acc[group], material] : [material]
    return acc
  }, {})

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Supports' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Supports et matériaux</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Le choix du support conditionne le rendu, la tenue et l’usage final de votre support imprimé.
      </p>

      {materials.length ? (
        <div className="mt-12 flex flex-col gap-12">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h2 className="pc-text-section-title text-primary">{GROUP_LABELS[group] || group}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Supports en cours de documentation" description="Cette page sera complétée prochainement." />
        </div>
      )}
    </Container>
  )
}
