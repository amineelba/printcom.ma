export function ErrorState({
  title = 'Une erreur est survenue',
  description = 'Veuillez réessayer dans quelques instants ou nous contacter directement.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div role="alert" className="rounded-card border border-border-error bg-(--pc-color-error-subtle) px-8 py-10 text-center">
      <p className="font-medium text-primary">{title}</p>
      <p className="pc-text-body-small mt-2 text-secondary">{description}</p>
    </div>
  )
}
