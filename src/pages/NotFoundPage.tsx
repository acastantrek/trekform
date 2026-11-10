import { ArrowRight, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

const suggestions = [
  { label: 'Inscripciones', to: '/inscripciones' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contacto', to: '/contacto' },
]

export function NotFoundPage() {
  return (
    <section className="not-found">
      {/* The SPA rewrite always answers 200, so this keeps unknown URLs out of search results. */}
      <meta name="robots" content="noindex" />
      <div className="not-found-icon" aria-hidden="true">
        <Compass size={40} />
      </div>
      <p className="not-found-code">Error 404</p>
      <h1>Te has salido de la ruta</h1>
      <p className="not-found-text">
        No encontramos esta página. Puede que haya cambiado de dirección o que el enlace no sea
        correcto. No te preocupes, te ayudamos a volver al camino.
      </p>
      <div className="not-found-actions">
        <Link to="/cursos-trekform" className="not-found-primary">
          Ver cursos <ArrowRight size={18} />
        </Link>
        <Link to="/" className="not-found-secondary">
          Ir al inicio
        </Link>
      </div>
      <nav className="not-found-links" aria-label="Otras secciones">
        <span>¿Buscabas otra cosa?</span>
        {suggestions.map((item) => (
          <Link key={item.to} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
