import type { ElementType, ReactNode } from 'react'

const widthClass = {
  narrow: 'max-w-(--container-narrow)',
  reading: 'max-w-(--container-reading)',
  standard: 'max-w-(--container-standard)',
  wide: 'max-w-(--container-wide)',
  ultra: 'max-w-(--container-ultra)',
} as const

export function Container({
  children,
  width = 'wide',
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode
  width?: keyof typeof widthClass
  as?: ElementType
  className?: string
}) {
  return (
    <Tag
      className={`mx-auto w-full px-(--pc-page-gutter-small) md:px-(--pc-page-gutter-medium) lg:px-(--pc-page-gutter-large) ${widthClass[width]} ${className}`}
    >
      {children}
    </Tag>
  )
}
