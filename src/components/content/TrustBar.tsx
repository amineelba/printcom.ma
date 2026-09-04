import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { Client } from '@/payload-types'

/**
 * "Bande de confiance" (brief §7, anatomy item 5) — validated client
 * logos only. Callers must pre-filter to status=published AND
 * authorizationConfirmed=true (access control alone doesn't enforce the
 * confirmation flag) — see the query in page.tsx. Renders nothing if
 * empty, per rule 13.
 */
export function TrustBar({ clients }: { clients: Client[] }) {
  if (!clients.length) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6" aria-label="Ils nous font confiance">
      {clients.map((client) => (
        <div key={client.id} className="flex h-8 w-28 items-center justify-center">
          {client.logo ? (
            <ResponsiveImage
              media={client.logo}
              width={112}
              height={32}
              sizes="112px"
              className="h-full w-auto object-contain"
            />
          ) : (
            <span className="text-[0.9375rem] font-medium text-tertiary">{client.name}</span>
          )}
        </div>
      ))}
    </div>
  )
}
