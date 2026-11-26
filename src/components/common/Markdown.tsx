import { useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getYoutubeId } from '../../lib/youtube'
import './Markdown.css'

interface MarkdownProps {
  content: string
  className?: string
}

// Marks links written with the CTA shorthand so they can be rendered as buttons.
const CTA_TITLE = '__cta__'

/**
 * Extra syntax on top of Markdown (raw HTML stays disabled):
 * - `[[cta: Texto del botón | /url]]` on its own line → call-to-action button.
 * - A YouTube URL alone on its own line → embedded player.
 */
function expandShortcodes(content: string) {
  return content.replace(
    /^[ \t]*\[\[\s*cta\s*:\s*([^|\]\n]+?)\s*\|\s*([^\]\s]+)\s*\]\][ \t]*$/gim,
    (_match, label: string, url: string) =>
      `[${label.replace(/[[\]]/g, '\\$&')}](${url} "${CTA_TITLE}")`,
  )
}

function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

type HastNode = NonNullable<ExtraProps['node']>
type HastChild = HastNode['children'][number]

function textOf(node: HastChild): string {
  if (node.type === 'text') return node.value
  if ('children' in node) return node.children.map(textOf).join('')
  return ''
}

// The paragraph's only content, when it is a single link (ignoring surrounding whitespace).
function soleLink(node: HastNode | undefined) {
  if (!node) return null
  const meaningful = node.children.filter(
    (child) => !(child.type === 'text' && !child.value.trim()),
  )
  const [child] = meaningful
  if (meaningful.length !== 1 || child.type !== 'element' || child.tagName !== 'a') return null
  return {
    href: String(child.properties.href ?? ''),
    title: child.properties.title ? String(child.properties.title) : null,
    text: textOf(child).trim(),
  }
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  if (isInternal(href)) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    )
  }
  const external = /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

// Shows the thumbnail first and only loads YouTube when the reader presses play.
function YoutubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="md-video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button type="button" className="md-video__poster" onClick={() => setPlaying(true)}>
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="md-video__play" aria-hidden="true">
            <Play size={26} fill="currentColor" />
          </span>
          <span className="sr-only">Reproducir vídeo: {title}</span>
        </button>
      )}
    </div>
  )
}

const components: Components = {
  p({ node, children }) {
    const link = soleLink(node)
    if (link?.title === CTA_TITLE) {
      return (
        <div className="md-cta">
          <SmartLink href={link.href} className="md-cta__button">
            {link.text}
            <ArrowRight size={18} aria-hidden="true" />
          </SmartLink>
        </div>
      )
    }
    // A bare YouTube URL on its own line becomes a player; "[texto](youtube…)" stays a link.
    const videoId = link && link.text === link.href ? getYoutubeId(link.href) : null
    if (videoId) return <YoutubeEmbed videoId={videoId} title="Vídeo de YouTube" />
    return <p>{children}</p>
  },
  a({ href = '', title, children }) {
    // A CTA written inside a sentence still renders as a (smaller) button.
    const className = title === CTA_TITLE ? 'md-cta__button md-cta__button--inline' : undefined
    return (
      <SmartLink href={href} className={className}>
        {children}
      </SmartLink>
    )
  },
  img({ src, alt }) {
    return (
      <img
        className="md-image"
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        loading="lazy"
      />
    )
  },
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {expandShortcodes(content)}
      </ReactMarkdown>
    </div>
  )
}
