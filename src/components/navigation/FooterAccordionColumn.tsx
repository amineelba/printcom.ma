'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import type { Footer } from '@/payload-types'

type Column = NonNullable<Footer['columns']>[number]

export function FooterAccordionColumn({ column }: { column: Column }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const id = useId()

  return (
    <div className="border-b border-(--pc-color-border-subtle) py-4 md:hidden">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={id}
        className="flex w-full items-center justify-between text-left text-[0.875rem] font-semibold text-primary"
        onClick={() => setIsExpanded((v) => !v)}
      >
        {column.heading}
        <span aria-hidden="true" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ⌄
        </span>
      </button>
      {isExpanded ? (
        <ul id={id} className="mt-3 flex flex-col gap-2">
          {column.links?.map((link) => (
            <li key={link.id ?? link.label}>
              <Link href={link.href} className="text-[0.875rem] text-tertiary hover:text-primary">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
