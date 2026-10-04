import { DESIGN_SOURCES, type DesignSource } from '@/lib/validation/quote'

const OPTIONS: Record<DesignSource, { title: string; helper: string }> = {
  client: { title: 'J’ai déjà mon design', helper: 'Je fournis mon propre fichier.' },
  printcom: { title: 'Printcom réalise le design', helper: 'Je souhaite confier la création à Printcom.' },
}

/**
 * "Qui fournit le design ?" — a native radio group (one answer, arrow-key
 * navigable, announced as a radio group) dressed as two selectable cards.
 * The selected state is carried by the filled indicator, not by colour alone.
 */
export function DesignSourceSelector({
  value,
  onChange,
  error,
  name = 'designSource',
}: {
  value?: DesignSource
  onChange: (value: DesignSource) => void
  error?: string
  name?: string
}) {
  const errorId = error ? `${name}-error` : undefined

  return (
    <fieldset aria-describedby={errorId} className="flex flex-col gap-3">
      <legend className="mb-3 text-[1.0625rem] font-semibold text-primary">
        Qui fournit le design ?
        <span aria-hidden="true" className="ml-1 text-error">
          *
        </span>
        <span className="sr-only"> (obligatoire)</span>
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {DESIGN_SOURCES.map((option) => {
          const id = `${name}-${option}`
          const copy = OPTIONS[option]
          return (
            <label key={option} htmlFor={id} className="relative block cursor-pointer">
              <input
                id={id}
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                aria-labelledby={`${id}-title`}
                aria-describedby={`${id}-helper`}
                aria-invalid={error ? true : undefined}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-[var(--pc-touch-target-min)] items-start gap-3 rounded-card-small border bg-canvas p-4 transition-colors duration-[var(--pc-duration-fast)] hover:border-border-strong peer-checked:border-action peer-checked:bg-selected peer-focus-visible:outline-solid peer-focus-visible:outline-(length:--pc-border-focus) peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--pc-color-focus) motion-reduce:transition-none ${
                  error ? 'border-border-error' : 'border-border-default'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    value === option ? 'border-action' : 'border-border-strong'
                  }`}
                >
                  {value === option ? <span className="h-2.5 w-2.5 rounded-full bg-action" /> : null}
                </span>
                <span className="flex flex-col gap-1">
                  <span id={`${id}-title`} className="text-[0.9375rem] font-medium text-primary">
                    {copy.title}
                  </span>
                  <span id={`${id}-helper`} className="pc-text-footnote text-secondary">
                    {copy.helper}
                  </span>
                </span>
              </span>
            </label>
          )
        })}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="pc-text-footnote text-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
