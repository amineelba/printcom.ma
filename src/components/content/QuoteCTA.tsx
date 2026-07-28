import { Button } from '@/components/ui/Button'

export function QuoteCTA({
  title = 'Prêt à démarrer votre projet ?',
  description = 'Décrivez votre besoin, nous établissons un devis adapté à votre production.',
  href = '/demande-de-devis',
  label = 'Demander un devis',
}: {
  title?: string
  description?: string
  href?: string
  label?: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card-large bg-alternate px-8 py-14 text-center">
      <h2 className="pc-text-section-title text-primary">{title}</h2>
      <p className="pc-text-intro max-w-(--container-reading)">{description}</p>
      <Button href={href} className="mt-2">
        {label}
      </Button>
    </div>
  )
}
