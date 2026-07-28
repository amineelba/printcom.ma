'use client'

import { useId, useState } from 'react'
import { RichTextRenderer } from './RichTextRenderer'
import type { Faq } from '@/payload-types'

export function FAQAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<number | null>(null)
  const baseId = useId()

  if (!faqs.length) return null

  return (
    <div className="divide-y divide-(--pc-color-border-subtle) border-t border-b border-(--pc-color-border-subtle)">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id
        const panelId = `${baseId}-panel-${faq.id}`
        const buttonId = `${baseId}-button-${faq.id}`

        return (
          <div key={faq.id} className="py-[var(--pc-accordion-padding-block)]">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex min-h-[var(--pc-accordion-header-min-height)] w-full items-center justify-between gap-4 text-left text-[1.0625rem] font-medium text-primary"
              >
                {faq.question}
                <span aria-hidden="true" className={`shrink-0 transition-transform duration-[var(--pc-duration-fast)] ${isOpen ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>
            </h3>
            {isOpen ? (
              <div id={panelId} role="region" aria-labelledby={buttonId} className="pb-[var(--pc-accordion-content-padding-bottom)]">
                <RichTextRenderer content={faq.answer} />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
