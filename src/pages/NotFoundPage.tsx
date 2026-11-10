import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="not-found">
      {/* The SPA rewrite always answers 200, so this keeps unknown URLs out of search results. */}
      <meta name="robots" content="noindex" />
      <span>404</span>
      <h1>Página no encontrada</h1>
      <Link to="/">
        <ArrowLeft size={17} /> Volver al inicio
      </Link>
    </section>
  )
}
