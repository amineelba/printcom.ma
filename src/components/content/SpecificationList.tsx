export interface SpecificationItem {
  label: string
  value: string
}

export function SpecificationList({ items }: { items: SpecificationItem[] }) {
  if (!items.length) return null

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="border-t border-(--pc-color-border-subtle) pt-3">
          <dt className="pc-text-footnote uppercase tracking-wide text-tertiary">{item.label}</dt>
          <dd className="mt-1 text-[0.9375rem] text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
