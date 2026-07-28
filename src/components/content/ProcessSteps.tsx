export interface ProcessStepItem {
  title: string
  description?: string | null
}

export function ProcessSteps({ steps }: { steps: ProcessStepItem[] }) {
  if (!steps.length) return null

  return (
    <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-3">
          <span className="pc-text-eyebrow">{String(index + 1).padStart(2, '0')}</span>
          <p className="text-[1.0625rem] font-semibold text-primary">{step.title}</p>
          {step.description ? <p className="pc-text-body-small text-secondary">{step.description}</p> : null}
        </li>
      ))}
    </ol>
  )
}
