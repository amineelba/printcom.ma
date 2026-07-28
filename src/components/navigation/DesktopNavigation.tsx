'use client'

import Link from 'next/link'
import { useState, useRef, useId } from 'react'
import type { Header } from '@/payload-types'

type Menu = NonNullable<Header['menus']>[number]

export function DesktopNavigation({ menus }: { menus: Menu[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const baseId = useId()

  const open = (index: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenIndex(index)
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenIndex(null), 120)
  }

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden lg:flex items-center gap-[var(--pc-nav-item-gap)]"
      onMouseLeave={() => setOpenIndex(null)}
    >
      {menus.map((menu, index) => {
        const hasColumns = Boolean(menu.columns?.length)
        const panelId = `${baseId}-panel-${index}`

        if (!hasColumns && menu.href) {
          return (
            <Link
              key={menu.id ?? menu.label}
              href={menu.href}
              className="text-[length:var(--pc-type-global-nav-size)] text-primary/90 hover:text-primary transition-colors duration-[var(--pc-duration-fast)]"
            >
              {menu.label}
            </Link>
          )
        }

        return (
          <div key={menu.id ?? menu.label} className="relative" onMouseEnter={() => open(index)} onMouseLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={openIndex === index}
              aria-controls={panelId}
              className="text-[length:var(--pc-type-global-nav-size)] text-primary/90 hover:text-primary transition-colors duration-[var(--pc-duration-fast)]"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {menu.label}
            </button>
            {openIndex === index && hasColumns ? (
              <div
                id={panelId}
                role="menu"
                className="absolute left-1/2 top-full mt-3 w-max -translate-x-1/2 rounded-card border border-border-subtle bg-elevated p-8 shadow-floating"
                onMouseEnter={() => open(index)}
                onMouseLeave={scheduleClose}
              >
                <div className="flex gap-12">
                  {menu.columns?.map((column, columnIndex) => (
                    <div key={column.id ?? columnIndex} className="min-w-[11rem]">
                      {column.heading ? (
                        <p className="pc-text-footnote mb-3 font-semibold uppercase tracking-wide text-tertiary">
                          {column.heading}
                        </p>
                      ) : null}
                      <ul className="flex flex-col gap-2">
                        {column.links?.map((link) => (
                          <li key={link.id ?? link.label}>
                            <Link
                              href={link.href}
                              role="menuitem"
                              className="text-[0.9375rem] text-secondary hover:text-primary transition-colors"
                              onClick={() => setOpenIndex(null)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
