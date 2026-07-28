import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { CTAGroup } from '@/components/ui/CTAGroup'
import type { Technology } from '@/payload-types'

async function getTechnology(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'technologies',
    where: { slug: { equals: slug }, status: { equals: 'published' }, verificationStatus: { equals: 'confirmed' } },
    limit: 1,
  })
  return result.docs[0] as Technology | undefined
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const technology = await getTechnology(slug)
  if (!technology) return {}
  return {
    title: technology.seo?.metaTitle || technology.title,
    description: technology.seo?.metaDescription || technology.shortDescription,
  }
}

export default async function TechnologyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const technology = await getTechnology(slug)
  if (!technology) notFound()

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Technologies', href: '/technologies' }, { label: technology.title }]} />
      {technology.image ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card-large bg-alternate">
          <ResponsiveImage media={technology.image} fill sizes="(min-width: 1069px) 60vw, 100vw" />
        </div>
      ) : null}
      <h1 className="pc-text-page-title mt-8 text-primary">{technology.title}</h1>
      {technology.shortDescription ? <p className="pc-text-intro mt-4">{technology.shortDescription}</p> : null}
      {technology.description ? (
        <div className="mt-8">
          <RichTextRenderer content={technology.description} />
        </div>
      ) : null}
      <div className="mt-8 flex justify-start">
        <CTAGroup items={[{ label: 'Demander un devis', href: '/demande-de-devis' }]} />
      </div>
    </Container>
  )
}
