import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import type { ProductionSite } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Qualité et engagements',
  description: 'Le contrôle qualité et les engagements de production de Printcom.',
}

export default async function QualityPage() {
  const payload = await getPayload()
  const productionSites = await payload.find({
    collection: 'production-sites',
    where: { status: { equals: 'published' }, verificationStatus: { equals: 'confirmed' } },
    limit: 20,
  })

  const sites = productionSites.docs as ProductionSite[]

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Qualité et engagements' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Qualité et engagements</h1>
      <p className="pc-text-intro mt-6">
        Chaque commande suit un contrôle qualité avant production : vérification des fichiers, contrôle
        colorimétrique et validation d’un bon à tirer avec le client lorsque nécessaire.
      </p>
      <p className="mt-6 text-[1.0625rem] leading-[1.6] text-secondary">
        Aucune certification n’est affichée sur ce site tant qu’elle n’a pas été formellement confirmée par
        Printcom.
      </p>

      {sites.length ? (
        <div className="mt-12">
          <h2 className="pc-text-section-title text-primary">Sites de production</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {sites.map((site) => (
              <li key={site.id} className="rounded-card-small border border-border-subtle p-5">
                <p className="text-[1.0625rem] font-semibold text-primary">{site.name}</p>
                {site.city ? <p className="pc-text-body-small mt-1 text-secondary">{site.city}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Container>
  )
}
