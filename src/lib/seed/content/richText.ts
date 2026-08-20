/**
 * Minimal Lexical JSON builder for seed content. Payload's richtext-lexical
 * field stores a serialized editor state; hand-authoring that tree for every
 * paragraph/list in the seed data would be unreadable, so this translates a
 * short block DSL into the shape @payloadcms/richtext-lexical expects.
 */

type TextNode = {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: string
  style: string
  version: number
}

type ParagraphNode = {
  type: 'paragraph'
  children: TextNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  version: number
  textFormat?: number
}

type HeadingNode = {
  type: 'heading'
  tag: 'h2' | 'h3'
  children: TextNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  version: number
}

type ListItemNode = {
  type: 'listitem'
  value: number
  children: TextNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  version: number
}

type ListNode = {
  type: 'list'
  tag: 'ul' | 'ol'
  listType: 'bullet' | 'number'
  start: number
  children: ListItemNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  version: number
}

const text = (value: string, bold = false): TextNode => ({
  type: 'text',
  text: value,
  format: bold ? 1 : 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

/**
 * `p`: plain paragraph. `pb`: paragraph starting with a bold lead-in
 * ("**Label :** rest of sentence"). `h2`/`h3`: headings. `ul`: bullet list.
 */
export type RichBlock =
  | { p: string }
  | { pb: string; text: string }
  | { h2: string }
  | { h3: string }
  | { ul: string[] }

function paragraph(children: TextNode[]): ParagraphNode {
  return { type: 'paragraph', children, direction: 'ltr', format: '', indent: 0, version: 1 }
}

function heading(tag: 'h2' | 'h3', value: string): HeadingNode {
  return { type: 'heading', tag, children: [text(value)], direction: 'ltr', format: '', indent: 0, version: 1 }
}

function list(items: string[]): ListNode {
  return {
    type: 'list',
    tag: 'ul',
    listType: 'bullet',
    start: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: items.map((item, index) => ({
      type: 'listitem',
      value: index + 1,
      children: [text(item)],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })),
  }
}

type RootNode = {
  root: {
    type: 'root'
    children: (ParagraphNode | HeadingNode | ListNode)[]
    direction: 'ltr'
    format: ''
    indent: number
    version: number
  }
}

export function richText(blocks: RichBlock[]): RootNode {
  const children = blocks.map((block) => {
    if ('h2' in block) return heading('h2', block.h2)
    if ('h3' in block) return heading('h3', block.h3)
    if ('ul' in block) return list(block.ul)
    if ('pb' in block) return paragraph([text(block.pb, true), text(` ${block.text}`)])
    return paragraph([text(block.p)])
  })

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
