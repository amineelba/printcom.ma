'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadQuoteFile } from '@/app/(frontend)/demande-de-devis/actions'

interface UploadedFile {
  id: number
  filename: string
}

interface FailedFile {
  filename: string
  message: string
}

export function FileUpload({
  onFilesChange,
}: {
  onFilesChange: (fileIds: number[]) => void
}) {
  const [uploaded, setUploaded] = useState<UploadedFile[]>([])
  const [failed, setFailed] = useState<FailedFile[]>([])
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return

    startTransition(async () => {
      const nextUploaded: UploadedFile[] = []
      const nextFailed: FailedFile[] = []

      for (const file of Array.from(fileList)) {
        const formData = new FormData()
        formData.set('file', file)
        const result = await uploadQuoteFile(formData)
        if (result.status === 'success' && result.id) {
          nextUploaded.push({ id: result.id, filename: result.filename || file.name })
        } else {
          nextFailed.push({ filename: file.name, message: result.message || 'Échec du téléversement.' })
        }
      }

      setUploaded((prev) => {
        const combined = [...prev, ...nextUploaded]
        onFilesChange(combined.map((f) => f.id))
        return combined
      })
      setFailed((prev) => [...prev, ...nextFailed])
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  const removeFile = (id: number) => {
    setUploaded((prev) => {
      const next = prev.filter((f) => f.id !== id)
      onFilesChange(next.map((f) => f.id))
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="quote-file-input"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-default bg-alternate px-6 py-10 text-center"
      >
        <span className="text-[0.9375rem] font-medium text-primary">
          {isPending ? 'Téléversement en cours…' : 'Cliquez pour joindre vos fichiers'}
        </span>
        <span className="pc-text-footnote text-tertiary">PDF, JPG, PNG, TIFF, AI, EPS, INDD, ZIP — 15 Mo max par fichier</span>
        <input
          ref={inputRef}
          id="quote-file-input"
          type="file"
          multiple
          disabled={isPending}
          onChange={(event) => handleFiles(event.target.files)}
          className="sr-only"
        />
      </label>

      {uploaded.length ? (
        <ul className="flex flex-col gap-2">
          {uploaded.map((file) => (
            <li key={file.id} className="flex items-center justify-between rounded-[var(--pc-radius-sm)] border border-border-subtle px-4 py-2 text-[0.9375rem]">
              <span className="truncate text-primary">{file.filename}</span>
              <button type="button" onClick={() => removeFile(file.id)} className="pc-text-footnote text-link">
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {failed.length ? (
        <ul className="flex flex-col gap-1">
          {failed.map((file, index) => (
            <li key={`${file.filename}-${index}`} role="alert" className="pc-text-footnote text-error">
              {file.filename} — {file.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
