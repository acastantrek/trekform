import { ArrowRight } from 'lucide-react'
import { news } from '../../data/news'

export function NewsSection() {
  return (
    <section className="news-section">
      <div className="section-heading">
        <div>
          <span className="kicker">BLOG TREKFORM</span>
          <h2>Últimas noticias</h2>
        </div>
        <button type="button" disabled className="disabled-link">
          Visita nuestro blog <ArrowRight size={18} />
        </button>
      </div>
      <div className="news-grid">
        {news.slice(0, 3).map((item) => (
          <article key={item.slug}>
            <img src={item.image} alt="" />
            <span>
              {item.date} · {item.category}
            </span>
            <h3>{item.title}</h3>
            <button type="button" disabled className="read-more disabled-link">
              Leer artículo <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
