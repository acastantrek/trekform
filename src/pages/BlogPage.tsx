import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Search } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getBlogPost, getBlogPosts, type BlogPost } from '../services/blog'

const pageSize = 12
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(value)).replace('.', '')
}

function accentedTitle(text: string) {
  const words = text.split(' ')
  const splitAt = Math.max(1, Math.ceil(words.length / 2))
  return (
    <>
      {words.slice(0, splitAt).join(' ')} <span>{words.slice(splitAt).join(' ')}</span>
    </>
  )
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error inesperado.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    return posts.filter(
      (post) => !term || `${post.title} ${post.excerpt}`.toLocaleLowerCase('es').includes(term),
    )
  }, [posts, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visiblePosts = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-copy">
          <h1>
            El Blog <span>de trekform</span>
          </h1>
          <p>
            Inicio <i /> <span>Blog</span>
          </p>
        </div>
        <div className="blog-hero-media" aria-hidden="true">
          <img src="/brand/blog-hero-blogging.svg" alt="" />
        </div>
      </section>

      <section className="blog-content" aria-labelledby="blog-title">
        <label className="blog-search">
          <span className="sr-only">Buscar artículos</span>
          <input
            type="search"
            placeholder="introduce la busqueda aqui..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <Search size={20} />
        </label>

        {loading ? (
          <div className="blog-loading" aria-label="Cargando artículos">
            <i />
            <i />
            <i />
            <i />
          </div>
        ) : error ? (
          <div className="blog-empty">
            <h3>No hemos podido cargar el blog.</h3>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="blog-empty">
            <Search size={34} />
            <h3>No hay artículos con estos filtros.</h3>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
            >
              Mostrar todos
            </button>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {visiblePosts.map((post) => (
                <BlogCard post={post} key={post.id} />
              ))}
            </div>
            <div className="blog-pagination">
              <span>
                {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, filtered.length)} de{' '}
                {filtered.length}
              </span>
              <div>
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1).map(
                  (item) => (
                    <button
                      type="button"
                      className={page === item ? 'active' : ''}
                      onClick={() => setPage(item)}
                      key={item}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      <Link className="blog-card-image" to={`/blog/${post.slug}`}>
        <img src={post.image} alt="" />
      </Link>
      <div className="blog-meta">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </div>
      <h3>
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
    </article>
  )
}

export function BlogPostPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBlogPost(slug)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="blog-article-loading">Cargando artículo...</div>
  if (!post) {
    return (
      <section className="blog-article-missing">
        <span>404</span>
        <h1>
          Este artículo <span>no está disponible.</span>
        </h1>
        <Link to="/blog">Volver al blog</Link>
      </section>
    )
  }

  return (
    <article className="blog-article">
      <header>
        <Link to="/blog" className="blog-back">
          <ArrowLeft size={17} /> Volver al blog
        </Link>
        <div className="blog-meta">
          <span>{post.category}</span>
          <time dateTime={post.publishedAt}>
            <CalendarDays size={15} /> {formatDate(post.publishedAt)}
          </time>
        </div>
        <h1>{accentedTitle(post.title)}</h1>
        <p>{post.excerpt}</p>
      </header>
      <img className="blog-article-cover" src={post.image} alt="" />
      <div className="blog-article-body">
        {post.content.split(/\n\s*\n/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <aside>
          <span>¿QUIERES FORMARTE?</span>
          <h2>
            Consulta las próximas <span>convocatorias.</span>
          </h2>
          <Link to="/inscripciones">
            Ver inscripciones <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </article>
  )
}
