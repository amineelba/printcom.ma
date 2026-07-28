import Link from 'next/link'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { FooterAccordionColumn } from '@/components/navigation/FooterAccordionColumn'

export async function SiteFooter() {
  const payload = await getPayload()
  const [footer, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'footer', depth: 0 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ])

  const columns = footer.columns ?? []
  const legalLinks = footer.legalLinks ?? []

  return (
    <footer className="border-t border-(--pc-color-border-subtle) bg-alternate">
      <Container width="wide" className="pt-[var(--pc-footer-padding-top)] pb-[var(--pc-footer-padding-bottom)]">
        {/* Desktop columns */}
        <div className="hidden md:grid md:grid-cols-4 md:gap-[var(--pc-footer-column-gap)] lg:grid-cols-6">
          {columns.map((column) => (
            <div key={column.id ?? column.heading}>
              <p className="pc-text-footnote mb-4 font-semibold text-primary">{column.heading}</p>
              <ul className="flex flex-col gap-2">
                {column.links?.map((link) => (
                  <li key={link.id ?? link.label}>
                    <Link href={link.href} className="text-[0.875rem] text-tertiary hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile accordions */}
        <div className="md:hidden">
          {columns.map((column) => (
            <FooterAccordionColumn key={column.id ?? column.heading} column={column} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-(--pc-color-border-subtle) pt-6 md:flex-row md:items-center md:justify-between">
          <p className="pc-text-footnote">{footer.copyrightNotice || `© Printcom. Tous droits réservés.`}</p>
          <nav aria-label="Liens légaux">
            <ul className="flex flex-wrap gap-4">
              {legalLinks.map((link) => (
                <li key={link.id ?? link.label}>
                  <Link href={link.href} className="pc-text-footnote hover:text-secondary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {siteSettings.address ? <p className="pc-text-footnote mt-4">{siteSettings.address}</p> : null}
      </Container>
    </footer>
  )
}
