import { ArrowRight } from 'lucide-react'
import { news } from '../data/news'

export function BlogPage() {
  return <section className="news-section blog-page"><div className="page-hero"><span className="kicker">ACTUALIDAD Y RECURSOS</span><h1>Blog Nexo</h1><p>Consejos, normativa y novedades sobre formación industrial y prevención.</p></div><div className="news-grid">{news.map(item => <article key={item.slug}><img src={item.image} alt=""/><span>{item.date} · {item.category}</span><h3>{item.title}</h3><a className="read-more" href="#articulo">Leer artículo <ArrowRight size={16}/></a></article>)}</div></section>
}
