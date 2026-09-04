import type { Metadata } from 'next'
import { getSeoDefaults, getHomepageGlobal } from '@/lib/payload/cachedGlobals'
import { getPayload } from '@/lib/payload/client'
import { Hero } from '@/components/heroes/Hero'
import { HeroMediaSlider } from '@/components/heroes/HeroMediaSlider'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CTAGroup } from '@/components/ui/CTAGroup'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { CategoryCard } from '@/components/cards/CategoryCard'
import { SolutionCard } from '@/components/cards/SolutionCard'
import { ServiceCard } from '@/components/cards/ServiceCard'
import { ResourceCard } from '@/components/cards/ResourceCard'
import { MaterialCard } from '@/components/cards/MaterialCard'
import { FinishCard } from '@/components/cards/FinishCard'
import { TechnologyCard } from '@/components/cards/TechnologyCard'
import { ProcessSteps } from '@/components/content/ProcessSteps'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { TrustBar } from '@/components/content/TrustBar'
import { CollectionBoard, type CollectionBoardEntry } from '@/components/content/CollectionBoard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type {
  ProductCategory,
  Solution,
  Service,
  Material,
  Finish,
  Resource,
  Faq,
  Client,
  Technology,
  Product,
  ProductCollection,
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
  const payload = await getPayload()

  const categories = (homepage.featuredCategories ?? []).filter(
    (c): c is ProductCategory => typeof c === 'object',
  )
  const solutions = (homepage.featuredSolutions ?? []).filter((s): s is Solution => typeof s === 'object')
  const services = (homepage.featuredServices ?? []).filter((s): s is Service => typeof s === 'object')
  const resources = (homepage.featuredResources ?? []).filter((r): r is Resource => typeof r === 'object')
  const faqs = (homepage.featuredFAQs ?? []).filter((f): f is Faq => typeof f === 'object')
  const processSteps = homepage.process?.steps ?? []

  // Materials/finishes are curated on the homepage but must still be
  // re-checked for status here — their underlying collections are seeded
  // draft (brief §33 rule 2), so an editor could curate one before it's
  // actually published; access control alone doesn't re-check this on a
  // populated relationship the way it does a direct find().
  const materials = (homepage.featuredMaterials ?? []).filter(
    (m): m is Material => typeof m === 'object' && m.status === 'published',
  )
  const finishes = (homepage.featuredFinishes ?? []).filter(
    (f): f is Finish => typeof f === 'object' && f.status === 'published',
  )

  const heroSlides = (homepage.heroSlider?.enabled ? homepage.heroSlider.slides : [])?.filter((s) => s.media) ?? []

  const [clientsResult, technologiesResult] = await Promise.all([
    // Bande de confiance (brief §5) — validated data only. Access control
    // doesn't enforce authorizationConfirmed on its own, so it's filtered
    // explicitly here, same double-gate pattern as technologies below.
    payload.find({
      collection: 'clients',
      where: { and: [{ status: { equals: 'published' } }, { authorizationConfirmed: { equals: true } }] },
      limit: 24,
      depth: 1,
    }),
    // Technologies confirmées uniquement (brief §13).
    payload.find({
      collection: 'technologies',
      where: { and: [{ status: { equals: 'published' } }, { verificationStatus: { equals: 'confirmed' } }] },
      limit: 12,
      depth: 1,
    }),
  ])
  const clients = clientsResult.docs as Client[]
  const technologies = technologiesResult.docs as Technology[]

  // Collection Board (brief §5/§7) — products are fetched per curated
  // collection, server-side, so the client component only toggles which
  // pre-fetched list is visible (no client refetch, no /collections/*
  // route). Collections with 0 currently-published matching products are
  // dropped rather than shown as a dead pill.
  const collectionBoardCollections = homepage.collectionBoard?.enabled
    ? (homepage.collectionBoard.collections ?? []).filter(
        (c): c is ProductCollection => typeof c === 'object',
      )
    : []
  const collectionBoardEntries: CollectionBoardEntry[] = (
    await Promise.all(
      collectionBoardCollections.map(async (collection) => {
        const { docs } = await payload.find({
          collection: 'products',
          where: { and: [{ status: { equals: 'published' } }, { collections: { equals: collection.id } }] },
          limit: 12,
          depth: 1,
        })
        return { collection, products: docs as Product[] }
      }),
    )
  ).filter((entry) => entry.products.length > 0)

  return (
    <>
      <Hero
        eyebrow={homepage.hero?.eyebrow || undefined}
        title={homepage.hero?.title || 'Vos supports imprimés, structurés autour de vos objectifs commerciaux.'}
        description={homepage.hero?.description || undefined}
        media={
          homepage.hero?.media ? (
            <ResponsiveImage media={homepage.hero.media} fill sizes="(min-width: 1069px) 548px, 100vw" priority />
          ) : null
        }
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

      {clients.length ? (
        <section className="py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <TrustBar clients={clients} />
          </Container>
        </section>
      ) : null}

      {heroSlides.length ? <HeroMediaSlider slides={heroSlides} /> : null}

      {collectionBoardEntries.length ? (
        <section className="bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader eyebrow="Sélections" title={homepage.collectionBoard?.title || 'Collections'} />
            <div className="mt-10">
              <CollectionBoard entries={collectionBoardEntries} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-[var(--pc-space-section-small)]">
        <Container width="wide">
          <SectionHeader
            eyebrow="Catalogue"
            title="Un format pour chaque idée."
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
              title="Commencez par ce que vous voulez accomplir."
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

      {materials.length ? (
        <section className="py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader eyebrow="Supports" title="Des matières pensées pour chaque usage." />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {finishes.length ? (
        <section className="bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader eyebrow="Finitions" title="Le détail qui termine le produit." />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {finishes.map((finish) => (
                <FinishCard key={finish.id} finish={finish} />
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

      {technologies.length ? (
        <section className="bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <SectionHeader
              eyebrow="Technologies"
              title="Des technologies confirmées."
              action={<CTAGroup items={[{ label: 'Voir toutes les technologies', href: '/technologies', variant: 'secondary' }]} />}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {technologies.map((technology) => (
                <TechnologyCard key={technology.id} technology={technology} />
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
              title="Les détails qui évitent les retours."
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
          <h2 className="pc-text-section-title">{homepage.finalCTA?.title || 'Votre projet commence par une configuration claire.'}</h2>
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
