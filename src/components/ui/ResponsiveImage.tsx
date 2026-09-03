import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'

type MediaLike = MediaType | number | null | undefined

/** Matches the `imageSizes` names configured in src/collections/Media.ts. */
type PayloadImageSize = 'thumbnail' | 'card' | 'listing' | 'hero' | 'openGraph'

export function ResponsiveImage({
  media,
  sizes = '100vw',
  fill = false,
  width,
  height,
  className,
  priority,
  payloadSize,
}: {
  media: MediaLike
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  /**
   * Serve one of Payload's pre-generated image sizes instead of the
   * original upload. Falls back to the original `media.url` when the
   * given size wasn't generated for this document (e.g. it was uploaded
   * before that size existed in the config), so this never hides an image
   * that would otherwise render.
   */
  payloadSize?: PayloadImageSize
}) {
  if (!media || typeof media === 'number') return null

  const url = (payloadSize ? media.sizes?.[payloadSize]?.url : undefined) || media.url
  if (!url) return null

  const alt = media.alt || ''

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={width ?? media.width ?? 1200}
      height={height ?? media.height ?? 800}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  )
}
