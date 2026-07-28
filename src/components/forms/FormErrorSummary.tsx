export function FormErrorSummary({ errors }: { errors: Record<string, string | undefined> }) {
  const entries = Object.entries(errors).filter(([, message]) => Boolean(message))
  if (!entries.length) return null

  return (
    <div role="alert" className="rounded-card-small border border-border-error bg-(--pc-color-error-subtle) p-4">
      <p className="text-[0.9375rem] font-medium text-primary">Veuillez corriger les champs suivants :</p>
      <ul className="mt-2 flex flex-col gap-1">
        {entries.map(([field, message]) => (
          <li key={field} className="pc-text-body-small text-secondary">
            {message}
          </li>
        ))}
      </ul>
    </div>
  )
}
