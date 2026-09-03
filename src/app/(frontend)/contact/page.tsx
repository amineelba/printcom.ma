import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { getSiteSettings } from '@/lib/payload/cachedGlobals'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ContactForm } from '@/components/forms/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l’équipe Printcom pour toute question générale.',
}

export default async function ContactPage() {
  const payload = await getPayload()
  const [siteSettings, contactSettings] = await Promise.all([
    getSiteSettings(),
    payload.findGlobal({ slug: 'contact-settings', depth: 0 }),
  ])

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Contact' }]} />
      <div className="mt-8 grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div>
          <h1 className="pc-text-page-title text-primary">Contact</h1>
          <p className="pc-text-intro mt-4 max-w-(--container-reading)">
            {contactSettings.contactIntro ||
              'Une question sur nos produits, nos services ou votre projet ? Écrivez-nous.'}
          </p>
          <div className="mt-10 max-w-(--container-reading)">
            <ContactForm />
          </div>
        </div>
        <aside className="rounded-card bg-alternate p-8">
          <p className="pc-text-footnote font-semibold uppercase tracking-wide text-tertiary">Coordonnées</p>
          <div className="mt-4 flex flex-col gap-3 text-[0.9375rem] text-primary">
            {siteSettings.phone ? <p>{siteSettings.phone}</p> : null}
            {siteSettings.email ? <p>{siteSettings.email}</p> : null}
            {siteSettings.address ? <p>{siteSettings.address}</p> : null}
            {siteSettings.city ? <p>{siteSettings.city}</p> : null}
          </div>
          <p className="pc-text-footnote mt-8 font-semibold uppercase tracking-wide text-tertiary">Devis personnalisé</p>
          <p className="pc-text-body-small mt-2 text-secondary">
            Pour une demande structurée avec spécifications de production, utilisez notre formulaire de devis.
          </p>
          <a href="/demande-de-devis" className="mt-3 inline-block text-[0.9375rem] font-medium text-link">
            Demander un devis ›
          </a>
        </aside>
      </div>
    </Container>
  )
}
