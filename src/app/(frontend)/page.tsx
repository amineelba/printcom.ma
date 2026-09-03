import type { Metadata } from 'next'
import { getSeoDefaults, getHomepageGlobal } from '@/lib/payload/cachedGlobals'
import { Hero } from '@/components/heroes/Hero'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CTAGroup } from '@/components/ui/CTAGroup'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { CategoryCard } from '@/components/cards/CategoryCard'
import { SolutionCard } from '@/components/cards/SolutionCard'
import { ServiceCard } from '@/components/cards/ServiceCard'
import { SectorCard } from '@/components/cards/SectorCard'
import { ResourceCard } from '@/components/cards/ResourceCard'
import { ProcessSteps } from '@/components/content/ProcessSteps'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { EmptyState } from '@/components/feedback/EmptyState'
import type {
  ProductCategory,
  Solution,
  Service,
  Sector,
  Resource,
  Faq,
} from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const seoDefaults = await getSeoDefaults()
  return {
    title: seoDefaults.defaultMetaTitle || 'Printcom — Impression commerciale B2B au Maroc',
    description: seoDefaults.defaultMetaDescription || undefined,
  }
}

export default async function HomePage() {
  const homepage = await getHomepageGlobal()

  const categories = (homepage.featuredCategories ?? []).filter(
    (c): c is ProductCategory => typeof c === 'object',
  )
  const solutions = (homepage.featuredSolutions ?? []).filter((s): s is Solution => typeof s === 'object')
  const services = (homepage.featuredServices ?? []).filter((s): s is Service => typeof s === 'object')
  const sectors = (homepage.featuredSectors ?? []).filter((s): s is Sector => typeof s === 'object')
  const resources = (homepage.featuredResources ?? []).filter((r): r is Resource => typeof r === 'object')
  const faqs = (homepage.featuredFAQs ?? []).filter((f): f is Faq => typeof f === 'object')
  const processSteps = homepage.process?.steps ?? []

  return (
    <>
      <Hero
        eyebrow={homepage.hero?.eyebrow || undefined}
        title={homepage.hero?.title || 'Vos supports imprimés, structurés autour de vos objectifs commerciaux.'}
        description={homepage.hero?.description || undefined}
        media={homepage.hero?.media ? <ResponsiveImage media={homepage.hero.media} fill sizes="(min-width: 1069px) 50vw, 100vw" priority /> : null}
        ctas={[
          { label: homepage.hero?.primaryCtaLabel || 'Demander un devis', href: homepage.hero?.primaryCtaHref || '/demande-de-devis' },
          { label: homepage.hero?.secondaryCtaLabel || 'Explorer les produits', href: homepage.hero?.secondaryCtaHref || '/produits', variant: 'secondary' },
        ]}
      />

      {homepage.valueProposition?.points?.length ? (
        <section className="py-[var(--pc-space-section-small)]">
          <Container width="wide">
            {homepage.valueProposition.title ? (
              <SectionHeader title={homepage.valueProposition.title} />
            ) : null}
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {homepage.valueProposition.points.map((point) => (
                <div key={point.title}>
                  <p className="text-[1.0625rem] font-semibold text-primary">{point.title}</p>
                  {point.description ? <p className="pc-text-body-small mt-2 text-secondary">{point.description}</p> : null}
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-[var(--pc-space-section-small)]">
        <Container width="wide">
          <SectionHeader
            eyebrow="Catalogue"
            title="Nos familles de produits"
            description="Neuf familles de produits imprimés, structurées pour répondre à chaque usage commercial."
            action={<CTAGroup items={[{ label: 'Explorer tous les produits', href: '/produits', variant: 'secondary' }]} />}
          />
          <div className="mt-10">
            {categories.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <EmptyState title="Catalogue en cours de préparation" description="Les familles de produits seront publiées prochainement." />
            )}
          </div>
        </Container>
      </section>

      {solutions.length ? (
        <section className="bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader
              eyebrow="Solutions"
              title="Des solutions pensées par besoin"
              action={<CTAGroup items={[{ label: 'Voir toutes les solutions', href: '/solutions/par-besoin', variant: 'secondary' }]} />}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {solutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {services.length ? (
        <section className="py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader
              eyebrow="Services"
              title="De la conception à la livraison"
              action={<CTAGroup items={[{ label: 'Découvrir nos services', href: '/services', variant: 'secondary' }]} />}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {sectors.length ? (
        <section className="bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader
              eyebrow="Secteurs"
              title="Adapté aux contraintes de votre secteur"
              action={<CTAGroup items={[{ label: 'Voir tous les secteurs', href: '/solutions/par-secteur', variant: 'secondary' }]} />}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sectors.map((sector) => (
                <SectorCard key={sector.id} sector={sector} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {processSteps.length ? (
        <section className="py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader title={homepage.process?.title || 'Le processus Printcom'} />
            <div className="mt-10">
              <ProcessSteps steps={processSteps} />
            </div>
          </Container>
        </section>
      ) : null}

      {resources.length ? (
        <section className="bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader
              eyebrow="Ressources"
              title="Guides et ressources pratiques"
              action={<CTAGroup items={[{ label: 'Toutes les ressources', href: '/ressources', variant: 'secondary' }]} />}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="py-[var(--pc-space-section-small)]">
          <Container width="reading">
            <SectionHeader title="Questions fréquentes" align="left" />
            <div className="mt-10">
              <FAQAccordion faqs={faqs} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-(--pc-color-border-subtle) bg-inverse py-[var(--pc-space-section-small)] text-inverse-text">
        <Container width="reading" className="text-center">
          <h2 className="pc-text-section-title">{homepage.finalCTA?.title || 'Prêt à démarrer votre projet ?'}</h2>
          {homepage.finalCTA?.description ? (
            <p className="pc-text-intro mt-4 text-(--pc-color-gray-300)">{homepage.finalCTA.description}</p>
          ) : null}
          <div className="mt-8 flex justify-center">
            <CTAGroup items={[{ label: homepage.finalCTA?.ctaLabel || 'Demander un devis', href: homepage.finalCTA?.ctaHref || '/demande-de-devis' }]} />
          </div>
        </Container>
      </section>
    </>
  )
}
