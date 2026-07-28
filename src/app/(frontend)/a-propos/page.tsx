import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { CTAGroup } from '@/components/ui/CTAGroup'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Printcom, entreprise marocaine d’impression commerciale au service des entreprises.',
}

export default async function AboutPage() {
  const payload = await getPayload()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'À propos' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">À propos de Printcom</h1>
      <p className="pc-text-intro mt-6">
        Printcom est une entreprise marocaine d’impression commerciale qui accompagne les entreprises dans la
        préparation, la production et le déploiement de leurs supports imprimés — de la papeterie d’entreprise
        au grand format, en passant par le packaging et la signalétique.
      </p>
      <p className="mt-6 text-[1.0625rem] leading-[1.6] text-secondary">
        Notre approche associe conseil, studio graphique, prépresse et production pour livrer des supports
        conformes aux objectifs commerciaux de chaque client, quelle que soit la taille du projet.
      </p>
      {siteSettings.city || siteSettings.address ? (
        <p className="mt-6 text-[1.0625rem] leading-[1.6] text-secondary">
          {siteSettings.address ? `${siteSettings.address} ` : ''}
          {siteSettings.city ? `— ${siteSettings.city}` : ''}
        </p>
      ) : null}
      <div className="mt-10">
        <CTAGroup
          items={[
            { label: 'Notre savoir-faire', href: '/notre-savoir-faire', variant: 'secondary' },
            { label: 'Nous contacter', href: '/contact', variant: 'secondary' },
          ]}
        />
      </div>
    </Container>
  )
}
