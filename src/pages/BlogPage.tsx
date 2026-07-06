import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Search } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getBlogPost, getBlogPosts, type BlogPost } from '../services/blog'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(value)).replace('.', '')
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error inesperado.'))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['Todos', ...new Set(posts.map((post) => post.category))]
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    return posts.filter(
      (post) =>
        (category === 'Todos' || post.category === category) &&
        (!term || `${post.title} ${post.excerpt}`.toLocaleLowerCase('es').includes(term)),
    )
  }, [category, posts, search])

  const featured = category === 'Todos' && !search ? filtered[0] : null
  const gridPosts = featured ? filtered.slice(1) : filtered

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-index">TF / JOURNAL</div>
        <div>
          <span>CONOCIMIENTO · PREVENCIÓN · INDUSTRIA</span>
          <h1>Ideas que hacen el trabajo más seguro.</h1>
        </div>
        <p>
          Actualidad, guías prácticas y conocimiento técnico para profesionales que quieren hacer
          mejor su trabajo.
        </p>
      </section>

      <section className="blog-content" aria-labelledby="blog-title">
        <div className="blog-heading">
          <div>
            <span>EL BLOG DE TREKFORM</span>
            <h2 id="blog-title">Últimos artículos</h2>
          </div>
          <p>
            Contenidos elaborados para resolver dudas reales sobre maquinaria, prevención y
            formación profesional.
          </p>
        </div>

        <div className="blog-toolbar">
          <div className="blog-categories" aria-label="Filtrar por categoría">
            {categories.map((item) => (
              <button
                className={category === item ? 'active' : ''}
                key={item}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="blog-search">
            <span className="sr-only">Buscar artículos</span>
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar en el blog"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="blog-loading" aria-label="Cargando artículos">
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
                setCategory('Todos')
                setSearch('')
              }}
            >
              Mostrar todos
            </button>
          </div>
        ) : (
          <>
            {featured && <FeaturedPost post={featured} />}
            <div className="blog-grid">
              {gridPosts.map((post, index) => (
                <BlogCard post={post} index={featured ? index + 2 : index + 1} key={post.id} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="blog-cta">
        <span>FORMACIÓN QUE SE APLICA</span>
        <h2>Da el siguiente paso.</h2>
        <p>Consulta nuestros cursos y encuentra tu próxima convocatoria.</p>
        <Link to="/cursos-trekform">
          Ver todos los cursos <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="blog-featured">
      <Link className="blog-featured-image" to={`/blog/${post.slug}`}>
        <img src={post.image} alt="" />
        <span>DESTACADO</span>
      </Link>
      <div>
        <div className="blog-meta">
          <span>{post.category}</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <Link className="blog-read" to={`/blog/${post.slug}`}>
          Leer artículo <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  )
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <article className="blog-card">
      <Link className="blog-card-image" to={`/blog/${post.slug}`}>
        <img src={post.image} alt="" />
        <span>{String(index).padStart(2, '0')}</span>
      </Link>
      <div className="blog-meta">
        <span>{post.category}</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </div>
      <h3>
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.excerpt}</p>
      <Link className="blog-read" to={`/blog/${post.slug}`} aria-label={`Leer ${post.title}`}>
        Leer artículo <ArrowUpRight size={17} />
      </Link>
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

  if (loading) return <div className="blog-article-loading">Cargando artículo…</div>
  if (!post) {
    return (
      <section className="blog-article-missing">
        <span>404</span>
        <h1>Este artículo no está disponible.</h1>
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
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </header>
      <img className="blog-article-cover" src={post.image} alt="" />
      <div className="blog-article-body">
        {post.content.split(/\n\s*\n/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <aside>
          <span>¿QUIERES FORMARTE?</span>
          <h2>Consulta las próximas convocatorias.</h2>
          <Link to="/inscripciones">
            Ver inscripciones <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </article>
  )
}
