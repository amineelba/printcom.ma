import { RichText } from '@payloadcms/richtext-lexical/react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export function RichTextRenderer({
  content,
  className = '',
}: {
  content: DefaultTypedEditorState | null | undefined
  className?: string
}) {
  if (!content) return null

  return (
    <div
      className={`pc-prose max-w-(--container-reading) text-[1.0625rem] leading-[1.6] text-primary [&_h2]:pc-text-section-title [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-[1.3125rem] [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_a]:text-link [&_a]:underline [&_a]:underline-offset-4 ${className}`}
    >
      <RichText data={content} />
    </div>
  )
}
