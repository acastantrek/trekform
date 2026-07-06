import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { news } from '../../data/news'

export function NewsSection() {
  return (
    <section className="news-section">
      <div className="section-heading">
        <div>
          <span className="kicker">BLOG TREKFORM</span>
          <h2>Últimas noticias</h2>
        </div>
        <Link to="/blog">
          Visita nuestro blog <ArrowRight size={18} />
        </Link>
      </div>
      <div className="news-grid">
        {news.slice(0, 3).map((item) => (
          <article key={item.slug}>
            <img src={item.image} alt="" />
            <span>
              {item.date} · {item.category}
            </span>
            <h3>{item.title}</h3>
            <Link to={`/blog/${item.slug}`} className="read-more">
              Leer artículo <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
