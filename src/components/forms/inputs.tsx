import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const fieldClass =
  'h-[var(--pc-field-height)] w-full rounded-[var(--pc-field-radius)] border border-[var(--pc-field-border-color)] bg-canvas px-[var(--pc-field-padding-inline)] text-[0.9375rem] text-primary outline-none transition-colors focus:border-[var(--pc-field-border-color-focus)] disabled:bg-alternate disabled:text-disabled aria-[invalid=true]:border-error'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className = '', ...rest } = props
  return <input className={`${fieldClass} ${className}`} aria-invalid={invalid || undefined} {...rest} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  const { invalid, className = '', ...rest } = props
  return (
    <textarea
      className={`min-h-32 w-full rounded-[var(--pc-field-radius)] border border-[var(--pc-field-border-color)] bg-canvas p-[var(--pc-field-padding-inline)] text-[0.9375rem] text-primary outline-none transition-colors focus:border-[var(--pc-field-border-color-focus)] aria-[invalid=true]:border-error ${className}`}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  const { invalid, className = '', children, ...rest } = props
  return (
    <select className={`${fieldClass} ${className}`} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  )
}
