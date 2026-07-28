import { Button } from './Button'

export interface CTAGroupItem {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'text'
}

export function CTAGroup({ items, className = '' }: { items: CTAGroupItem[]; className?: string }) {
  if (!items.length) return null

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {items.map((item, index) => (
        <Button key={item.href + item.label} href={item.href} variant={item.variant ?? (index === 0 ? 'primary' : 'secondary')}>
          {item.label}
        </Button>
      ))}
    </div>
  )
}
