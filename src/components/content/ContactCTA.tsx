import { Button } from '@/components/ui/Button'

export function ContactCTA({
  title = 'Une question avant de vous décider ?',
  description = 'Notre équipe vous répond directement, sans engagement.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-border-subtle p-8">
      <h3 className="text-[1.0625rem] font-semibold text-primary">{title}</h3>
      <p className="pc-text-body-small text-secondary">{description}</p>
      <Button href="/contact" variant="secondary" className="mt-2">
        Nous contacter
      </Button>
    </div>
  )
}
