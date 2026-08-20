'use client'

import { useConfig, useDocumentInfo } from '@payloadcms/ui'

/**
 * Sidebar "ui" field on QuoteRequests — a plain link to the export
 * endpoint. A GET request rides on the admin's existing session cookie,
 * so no fetch/blob dance is needed (unlike payload-invoicepdf's POST-based
 * generate button, which this deliberately doesn't imitate — this is a
 * read-only export, not a document-mutating action).
 */
export function DownloadQuoteRequestPdfButtonField() {
  const { id, savedDocumentData } = useDocumentInfo()
  const { config } = useConfig()

  if (!id) return null

  const isNew = !savedDocumentData
  if (isNew) {
    return <p style={{ fontSize: 12, color: 'var(--theme-elevation-500)' }}>Enregistrez la demande pour activer l’export PDF.</p>
  }

  const href = `${config.routes.api}/quote-requests/${id}/pdf`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn--style-secondary btn--size-medium"
      style={{ display: 'inline-block', textAlign: 'center', width: '100%' }}
    >
      Télécharger en PDF
    </a>
  )
}
