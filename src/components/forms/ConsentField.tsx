export function ConsentField({
  name = 'consentConfirmed',
  error,
  checked,
  onChange,
}: {
  name?: string
  error?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}) {
  const isControlled = onChange !== undefined

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-start gap-3 text-[0.9375rem] text-primary">
        <input
          type="checkbox"
          name={name}
          required
          aria-invalid={Boolean(error) || undefined}
          {...(isControlled ? { checked: checked ?? false, onChange: (e) => onChange(e.target.checked) } : {})}
          className="mt-1 h-5 w-5 shrink-0 rounded-[var(--pc-radius-xs)] border border-border-default"
        />
        <span>
          J’accepte que Printcom utilise ces informations pour traiter ma demande, conformément à la{' '}
          <a href="/politique-de-confidentialite" className="text-link underline underline-offset-4">
            politique de confidentialité
          </a>
          .
        </span>
      </label>
      {error ? (
        <p role="alert" className="pc-text-footnote text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
