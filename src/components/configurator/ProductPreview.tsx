import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { ConfiguratorMedia } from '@/lib/configurator/types'

/**
 * Large product image plus, only when there is more than one image, a row
 * of keyboard-operable thumbnails. Controlled by ProductConfigurator:
 * `shownMedia` is whatever the preview resolver picked (a selected option's
 * preview image, or the current gallery image), and `activeIndex` is the
 * gallery thumbnail to mark as active — -1 while an option's preview image
 * is overriding the gallery, so no thumbnail claims to be showing.
 */
export function ProductPreview({
  media,
  shownMedia,
  activeIndex,
  onSelect,
  title,
}: {
  media: ConfiguratorMedia[]
  shownMedia: ConfiguratorMedia | undefined
  activeIndex: number
  onSelect: (index: number) => void
  title: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-large bg-alternate">
        {shownMedia ? (
          <ResponsiveImage
            key={shownMedia.id}
            media={shownMedia}
            payloadSize="listing"
            fill
            sizes="(min-width: 1069px) 50vw, 100vw"
            priority={shownMedia.id === media[0]?.id}
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
                  onClick={() => onSelect(index)}
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
