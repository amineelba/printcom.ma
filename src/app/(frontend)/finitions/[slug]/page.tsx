import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { CTAGroup } from '@/components/ui/CTAGroup'
import type { Finish } from '@/payload-types'

async function getFinish(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'finishes',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0] as Finish | undefined
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const finish = await getFinish(slug)
  if (!finish) return {}
  return { title: finish.seo?.metaTitle || finish.title, description: finish.seo?.metaDescription || finish.shortDescription }
}

export default async function FinishDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const finish = await getFinish(slug)
  if (!finish) notFound()

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Finitions', href: '/finitions' }, { label: finish.title }]} />
      {finish.image ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card-large bg-alternate">
          <ResponsiveImage media={finish.image} fill sizes="(min-width: 1069px) 60vw, 100vw" />
        </div>
      ) : null}
      <h1 className="pc-text-page-title mt-8 text-primary">{finish.title}</h1>
      {finish.shortDescription ? <p className="pc-text-intro mt-4">{finish.shortDescription}</p> : null}
      <div className="mt-8 flex justify-start">
        <CTAGroup items={[{ label: 'Demander un devis', href: `/demande-de-devis?finition=${finish.slug}` }]} />
      </div>
    </Container>
  )
}
