import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'

type MediaLike = MediaType | number | null | undefined

export function ResponsiveImage({
  media,
  sizes = '100vw',
  fill = false,
  width,
  height,
  className,
  priority,
}: {
  media: MediaLike
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
}) {
  if (!media || typeof media === 'number') return null

  const url = media.url
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
