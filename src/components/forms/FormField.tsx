import type { ReactNode } from 'react'

export function FormField({
  label,
  htmlFor,
  error,
  description,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  description?: string
  required?: boolean
  children: ReactNode
}) {
  const errorId = error ? `${htmlFor}-error` : undefined
  const descId = description ? `${htmlFor}-description` : undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[0.9375rem] font-medium text-primary">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-error">
            *
          </span>
        ) : null}
      </label>
      {description ? (
        <p id={descId} className="pc-text-footnote text-tertiary">
          {description}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} role="alert" className="pc-text-footnote text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
