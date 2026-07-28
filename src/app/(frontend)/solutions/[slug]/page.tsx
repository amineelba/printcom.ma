import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { CTAGroup } from '@/components/ui/CTAGroup'
import { ProcessSteps } from '@/components/content/ProcessSteps'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { ProductCard } from '@/components/cards/ProductCard'
import { ServiceCard } from '@/components/cards/ServiceCard'
import type { Product, Service, Faq } from '@/payload-types'

async function getSolution(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'solutions',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const solution = await getSolution(slug)
  if (!solution) return {}
  return {
    title: solution.seo?.metaTitle || solution.title,
    description: solution.seo?.metaDescription || solution.shortDescription || undefined,
  }
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const solution = await getSolution(slug)
  if (!solution) notFound()

  const products = (solution.recommendedProducts ?? []).filter((p): p is Product => typeof p === 'object')
  const services = (solution.recommendedServices ?? []).filter((s): s is Service => typeof s === 'object')
  const faqs = (solution.relatedFAQs ?? []).filter((f): f is Faq => typeof f === 'object')
  const steps = (solution.process ?? []).map((s) => ({ title: s.title, description: s.description }))

  return (
    <>
      <Container width="wide" className="py-[var(--pc-space-section-small)]">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Solutions', href: '/solutions/par-besoin' }, { label: solution.title }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="pc-text-page-title text-primary">{solution.title}</h1>
            {solution.shortDescription ? <p className="pc-text-intro mt-4">{solution.shortDescription}</p> : null}
            <CTAGroup className="mt-8" items={[{ label: solution.quoteCTA || 'Demander un devis', href: '/demande-de-devis' }]} />
          </div>
          {solution.image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-large bg-alternate">
              <ResponsiveImage media={solution.image} fill sizes="(min-width: 1069px) 50vw, 100vw" priority />
            </div>
          ) : null}
        </div>
      </Container>

      {solution.problem || solution.desiredOutcome ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide" className="grid gap-10 md:grid-cols-2">
            {solution.problem ? (
              <div>
                <h2 className="pc-text-section-title text-primary">Le problème</h2>
                <p className="pc-text-intro mt-4">{solution.problem}</p>
              </div>
            ) : null}
            {solution.desiredOutcome ? (
              <div>
                <h2 className="pc-text-section-title text-primary">L’objectif</h2>
                <p className="pc-text-intro mt-4">{solution.desiredOutcome}</p>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {steps.length ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Le processus</h2>
            <div className="mt-10">
              <ProcessSteps steps={steps} />
            </div>
          </Container>
        </section>
      ) : null}

      {products.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Produits adaptés</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {services.length ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Services adaptés</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="reading">
            <h2 className="pc-text-section-title text-primary">Questions fréquentes</h2>
            <div className="mt-8">
              <FAQAccordion faqs={faqs} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
        <Container width="reading" className="text-center">
          <h2 className="pc-text-section-title text-primary">Prêt à lancer ce projet ?</h2>
          <div className="mt-8 flex justify-center">
            <CTAGroup items={[{ label: solution.quoteCTA || 'Demander un devis', href: '/demande-de-devis' }]} />
          </div>
        </Container>
      </section>
    </>
  )
}
