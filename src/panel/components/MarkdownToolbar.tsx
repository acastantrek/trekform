import type { RefObject } from 'react'
import { Bold, Heading2, ImageIcon, Link2, List, MousePointerClick, SquarePlay } from 'lucide-react'

interface Snippet {
  /** Text placed before and after the placeholder (or the current selection). */
  before: string
  after: string
  placeholder: string
  /** Block snippets go on their own paragraph. */
  block?: boolean
}

const snippets = {
  bold: { before: '**', after: '**', placeholder: 'texto en negrita' },
  heading: { before: '## ', after: '', placeholder: 'Subtítulo', block: true },
  list: { before: '- ', after: '\n- Otro elemento', placeholder: 'Elemento', block: true },
  link: { before: '[', after: '](https://)', placeholder: 'texto del enlace' },
  image: {
    before: '![',
    after: '](/imagenes/foto.jpg)',
    placeholder: 'descripción de la imagen',
    block: true,
  },
  video: {
    before: '',
    after: '',
    placeholder: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
    block: true,
  },
  cta: {
    before: '[[cta: ',
    after: ' | /cursos-trekform]]',
    placeholder: 'Ver cursos',
    block: true,
  },
} satisfies Record<string, Snippet>

// Formatting: icon-only, with the name as tooltip.
const formatButtons = [
  { key: 'bold', label: 'Negrita', icon: Bold },
  { key: 'heading', label: 'Subtítulo', icon: Heading2 },
  { key: 'list', label: 'Lista', icon: List },
] as const

const buttons = [
  { key: 'link', label: 'Enlace', icon: Link2 },
  { key: 'image', label: 'Imagen', icon: ImageIcon },
  { key: 'video', label: 'Vídeo YouTube', icon: SquarePlay },
  { key: 'cta', label: 'Botón CTA', icon: MousePointerClick },
] as const

/**
 * Buttons that insert the blog's rich-content syntax at the cursor, selecting the part the
 * author is expected to replace. Selected text is reused as the link/button label.
 */
export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}) {
  const insert = (snippet: Snippet) => {
    const textarea = textareaRef.current
    const start = textarea?.selectionStart ?? value.length
    const end = textarea?.selectionEnd ?? value.length
    const selected = value.slice(start, end)
    const inner = selected || snippet.placeholder

    let prefix = value.slice(0, start)
    let suffix = value.slice(end)
    if (snippet.block) {
      // Surround the block with blank lines so Markdown treats it as its own paragraph.
      if (prefix && !prefix.endsWith('\n\n')) prefix += prefix.endsWith('\n') ? '\n' : '\n\n'
      if (!suffix.startsWith('\n\n')) suffix = (suffix.startsWith('\n') ? '\n' : '\n\n') + suffix
    }

    const selectionStart = prefix.length + snippet.before.length
    onChange(prefix + snippet.before + inner + snippet.after + suffix)

    requestAnimationFrame(() => {
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionStart + inner.length)
    })
  }

  return (
    <div className="markdown-toolbar" role="toolbar" aria-label="Insertar en el contenido">
      {formatButtons.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          className="btn btn-secondary btn-sm markdown-toolbar__icon"
          title={label}
          aria-label={label}
          onClick={() => insert(snippets[key])}
        >
          <Icon size={15} />
        </button>
      ))}
      <span className="markdown-toolbar__divider" aria-hidden="true" />
      {buttons.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => insert(snippets[key])}
        >
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  )
}
