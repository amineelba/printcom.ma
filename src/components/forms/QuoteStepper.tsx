const STEP_LABELS = ['Besoin', 'Configuration', 'Production', 'Fichiers', 'Contact', 'Récapitulatif']

export function QuoteStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol aria-label="Étapes de la demande de devis" className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1
        const isCurrent = step === currentStep
        const isDone = step < currentStep
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-medium ${
                isCurrent
                  ? 'bg-action text-action-content'
                  : isDone
                    ? 'bg-primary text-canvas'
                    : 'border border-border-default text-tertiary'
              }`}
            >
              {isDone ? '✓' : step}
            </span>
            <span className={`text-[0.875rem] ${isCurrent ? 'font-medium text-primary' : 'text-tertiary'}`}>{label}</span>
            {step < STEP_LABELS.length ? <span aria-hidden="true" className="mx-1 text-disabled">—</span> : null}
          </li>
        )
      })}
    </ol>
  )
}
