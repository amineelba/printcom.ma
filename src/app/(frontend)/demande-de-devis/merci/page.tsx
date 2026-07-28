import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CTAGroup } from '@/components/ui/CTAGroup'

export const metadata: Metadata = { title: 'Demande envoyée', robots: { index: false, follow: false } }

export default async function QuoteThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>
}) {
  const { reference } = await searchParams

  return (
    <Container width="reading" className="py-[var(--pc-space-section)] text-center">
      <p className="pc-text-eyebrow">Demande envoyée</p>
      <h1 className="pc-text-page-title mt-2 text-primary">Merci, votre demande de devis a bien été reçue.</h1>
      {reference ? (
        <p className="pc-text-intro mt-4">
          Référence de votre demande : <strong>{reference}</strong>
        </p>
      ) : null}
      <p className="pc-text-intro mt-4">
        Notre équipe étudie votre projet et vous recontacte dans les meilleurs délais.
      </p>
      <div className="mt-8 flex justify-center">
        <CTAGroup items={[{ label: 'Retour à l’accueil', href: '/' }]} />
      </div>
    </Container>
  )
}
