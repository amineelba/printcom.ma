import type { ButtonSize, ButtonVariant, CardRadius } from './types'

export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-action text-action-content border border-action hover:bg-action-hover hover:border-action-hover active:bg-action-active',
  secondary:
    'bg-transparent text-link border border-action hover:bg-selected',
  text: 'bg-transparent text-link border-0 underline-offset-4 hover:underline',
  compact: 'bg-action text-action-content border border-action hover:bg-action-hover',
  icon: 'bg-white/85 text-primary border border-border-subtle shadow-subtle hover:bg-white',
  destructive: 'bg-error text-white border border-error hover:opacity-90',
}

export const buttonSizeClass: Record<ButtonSize, string> = {
  small: 'h-[var(--pc-control-sm)] px-[var(--pc-button-padding-inline-small)] text-[0.875rem]',
  medium: 'h-[var(--pc-control-md)] px-[var(--pc-button-padding-inline-medium)] text-[1rem]',
  large: 'h-[var(--pc-control-lg)] px-[var(--pc-button-padding-inline-large)] text-[1.0625rem]',
}

export const cardRadiusClass: Record<CardRadius, string> = {
  small: 'rounded-[var(--pc-radius-card-small)]',
  default: 'rounded-[var(--pc-radius-card)]',
  large: 'rounded-[var(--pc-radius-card-large)]',
}
