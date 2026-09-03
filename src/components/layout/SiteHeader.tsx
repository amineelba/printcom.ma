import Link from 'next/link'
import { getHeaderGlobal, getSiteSettings } from '@/lib/payload/cachedGlobals'
import { DesktopNavigation } from '@/components/navigation/DesktopNavigation'
import { MobileNavigation } from '@/components/navigation/MobileNavigation'
import { SearchOverlay } from '@/components/navigation/SearchOverlay'

export async function SiteHeader() {
  const [header, siteSettings] = await Promise.all([getHeaderGlobal(), getSiteSettings(1)])

  const menus = header.menus ?? []
  const quoteCTA = header.quoteCTA

  return (
    <header
      className="sticky top-0 z-(--pc-nav-z) h-[var(--pc-nav-height)] border-b border-(--pc-color-border-subtle)"
      style={{
        background: 'var(--pc-material-nav-background)',
        backdropFilter: `saturate(var(--pc-material-nav-saturate)) blur(var(--pc-material-nav-blur))`,
        WebkitBackdropFilter: `saturate(var(--pc-material-nav-saturate)) blur(var(--pc-material-nav-blur))`,
      }}
    >
      <div className="mx-auto flex h-full max-w-(--pc-nav-max-width) items-center justify-between px-(--pc-page-gutter-small) md:px-(--pc-page-gutter-medium)">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={`${siteSettings.siteName || 'Printcom'} — Accueil`}>
          <span className="text-[1.0625rem] font-semibold tracking-tight text-primary">
            {siteSettings.siteName || 'Printcom'}
          </span>
        </Link>

        <DesktopNavigation menus={menus} />

        <div className="flex items-center gap-2">
          <SearchOverlay />
          <Link
            href={quoteCTA?.href || '/demande-de-devis'}
            className="hidden lg:inline-flex h-[var(--pc-control-sm)] items-center rounded-control bg-action px-5 text-[0.9375rem] font-medium text-action-content transition-colors hover:bg-action-hover"
          >
            {quoteCTA?.label || 'Demander un devis'}
          </Link>
          <MobileNavigation menus={menus} quoteCTA={quoteCTA} />
        </div>
      </div>
    </header>
  )
}
