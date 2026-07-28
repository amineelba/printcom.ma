import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { Machine, Technology } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Parc machines',
  description: 'Machines de production confirmées chez Printcom.',
}

/**
 * Hidden route (section 9): renders 404 until at least one machine is both
 * status=published and verificationStatus=confirmed.
 */
export default async function MachineParkPage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'machines',
    where: { status: { equals: 'published' }, verificationStatus: { equals: 'confirmed' } },
    limit: 100,
    depth: 1,
  })

  if (!result.docs.length) notFound()

  const machines = result.docs as Machine[]

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Parc machines' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Parc machines</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Les équipements présentés ci-dessous sont confirmés par l’équipe Printcom.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => {
          const technology = machine.technology as Technology | number | null | undefined
          return (
            <div key={machine.id} className="overflow-hidden rounded-card bg-elevated shadow-[var(--pc-card-shadow)]">
              {machine.image ? (
                <div className="relative aspect-[4/3] w-full bg-alternate">
                  <ResponsiveImage media={machine.image} fill sizes="(min-width: 1069px) 33vw, 50vw" />
                </div>
              ) : null}
              <div className="p-[var(--pc-card-padding-small)]">
                <p className="text-[1.0625rem] font-semibold text-primary">{machine.name}</p>
                {technology && typeof technology === 'object' ? (
                  <p className="pc-text-footnote mt-1 text-tertiary">{technology.title}</p>
                ) : null}
                {machine.maxFormat ? (
                  <p className="pc-text-body-small mt-2 text-secondary">Format maximal : {machine.maxFormat}</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}
