'use client'

import { useState } from 'react'
import { ProductGrid } from '@/components/cards/ProductGrid'
import type { Product, ProductCollection } from '@/payload-types'

export interface CollectionBoardEntry {
  collection: ProductCollection
  products: Product[]
}

/**
 * "Collection Board" (brief §5, anatomy item 7) — pills/tabs that switch
 * the visible product selection. Products are pre-fetched server-side per
 * collection (see page.tsx); this only toggles which pre-fetched list is
 * shown, no client refetch. Cards are always Product cards linking to
 * /produits/<slug> — there is no /collections/... route.
 */
export function CollectionBoard({ entries }: { entries: CollectionBoardEntry[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!entries.length) return null

  const active = entries[activeIndex] ?? entries[0]

  return (
    <div>
      <div role="tablist" aria-label="Collections" className="flex flex-wrap gap-2">
        {entries.map((entry, index) => (
          <button
            key={entry.collection.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={`shrink-0 rounded-control px-5 py-2 text-[0.9375rem] font-medium transition-colors ${
              index === activeIndex ? 'bg-action text-action-content' : 'bg-alternate text-secondary hover:text-primary'
            }`}
          >
            {entry.collection.title}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <ProductGrid products={active.products} />
      </div>
    </div>
  )
}
