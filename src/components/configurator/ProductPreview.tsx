'use client'

import { useState } from 'react'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { ConfiguratorMedia } from '@/lib/configurator/types'

/**
 * Large product image plus, only when there is more than one image, a row
 * of keyboard-operable thumbnails. Driven purely by the product's own media
 * (primary image first, then gallery) — option thumbnails never replace it.
 */
export function ProductPreview({ media, title }: { media: ConfiguratorMedia[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = media[activeIndex] ?? media[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-large bg-alternate">
        {active ? (
          <ResponsiveImage
            key={active.id}
            media={active}
            payloadSize="listing"
            fill
            sizes="(min-width: 1069px) 50vw, 100vw"
            priority={activeIndex === 0}
          />
        ) : null}
      </div>

      {media.length > 1 ? (
        <ul aria-label={`Images de ${title}`} className="flex flex-wrap gap-3">
          {media.map((item, index) => {
            const isActive = index === activeIndex
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  aria-label={item.alt || `${title} — image ${index + 1} sur ${media.length}`}
                  className={`relative block h-[var(--pc-touch-target-min)] w-16 overflow-hidden rounded-card-small border bg-alternate transition-opacity duration-[var(--pc-duration-fast)] motion-reduce:transition-none sm:h-14 sm:w-20 ${
                    isActive ? 'border-action opacity-100' : 'border-border-default opacity-70 hover:opacity-100'
                  }`}
                >
                  <ResponsiveImage media={{ ...item, alt: '' }} payloadSize="thumbnail" fill sizes="80px" />
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-1 bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-action text-action-content"
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
