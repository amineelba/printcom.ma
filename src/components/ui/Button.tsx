import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonSizeClass, buttonVariantClass } from '@/lib/design-system/theme'
import type { ButtonSize, ButtonVariant } from '@/lib/design-system/types'

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
  iconAfter?: ReactNode
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium leading-none transition-colors duration-[var(--pc-duration-standard)] ease-[var(--pc-easing-standard)] disabled:opacity-[var(--pc-opacity-disabled)] disabled:pointer-events-none whitespace-nowrap'

export function Button({ variant = 'primary', size = 'medium', className = '', children, iconAfter, ...props }: ButtonProps) {
  const classes = `${base} ${buttonVariantClass[variant]} ${buttonSizeClass[size]} ${className}`

  if ('href' in props && props.href) {
    const { href, ...anchorProps } = props
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
        {iconAfter}
      </Link>
    )
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={classes} {...buttonProps}>
      {children}
      {iconAfter}
    </button>
  )
}
