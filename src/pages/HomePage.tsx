import { ArrowRight, CheckCircle2, Star } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CourseCatalog } from '../components/courses/CourseCatalog'
import { TrekformHeroSection } from '../components/home/TrekformHeroSection'
import { TrekformStatsSection } from '../components/home/TrekformStatsSection'
import { homeFeaturedCourses } from '../data/homeFeaturedCourses'
import { news } from '../data/news'

export function HomePage() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (elements.length === 0) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <TrekformHeroSection />
      <section className="course-section" data-reveal>
        <div className="section-heading" data-reveal data-reveal-delay="0.05">
          <div>
            <span className="kicker">NUESTROS CURSOS DESTACADOS</span>
            <h2>
              Aprende. <span>Certifícate. Avanza.</span>
            </h2>
          </div>
          <Link to="/cursos-trekform">
            Ver todos los cursos <ArrowRight size={18} />
          </Link>
        </div>
        <CourseCatalog staticCourses={homeFeaturedCourses.slice(0, 7)} />
      </section>
      <TrekformStatsSection />
      <section className="home-info-grid" data-reveal>
        <article data-reveal data-reveal-delay="0.05">
          <span className="kicker">SOBRE TREKFORM</span>
          <h2>
            Tu partner en formación <span>y seguridad laboral</span>
          </h2>
          <p>
            En Trekform llevamos más de 20 años ofreciendo formación práctica y de calidad en
            maquinaria industrial y prevención de riesgos laborales.
          </p>
          <ul>
            <li>
              <CheckCircle2 /> Formación homologada y certificada
            </li>
            <li>
              <CheckCircle2 /> Instructores en activo y cualificados
            </li>
            <li>
              <CheckCircle2 /> Instalaciones propias y equipos de última generación
            </li>
            <li>
              <CheckCircle2 /> Atención personalizada a empresas y particulares
            </li>
          </ul>
          <Link to="/quienes-somos" className="home-info-cta">
            Conócenos más <ArrowRight size={16} />
          </Link>
        </article>
        <article data-reveal data-reveal-delay="0.12">
          <span className="kicker">LO QUE DICEN NUESTROS ALUMNOS</span>
          <div className="home-stars">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} size={17} fill="currentColor" />
            ))}
          </div>
          <blockquote>
            “La formación fue muy práctica y los instructores increíbles. Gracias a Trekform obtuve
            mi certificado y ahora trabajo con total seguridad.”
          </blockquote>
          <div className="home-review-author">
            <img
              src="https://trekform.com/trekform/uploads/assets/images/testimonial/testimonial-1-2.jpg"
              alt=""
            />
            <div>
              <strong>Carlos M.</strong>
              <span>Operador de carretillas</span>
            </div>
          </div>
        </article>
        <article data-reveal data-reveal-delay="0.19">
          <span className="kicker">ÚLTIMAS NOTICIAS</span>
          <div className="home-news-list">
            {news.slice(0, 3).map((item) => (
              <Link to={`/blog/${item.slug}`} key={item.slug} data-reveal data-reveal-delay="0.1">
                <img src={item.image} alt="" />
                <span>{item.title}</span>
                <small>
                  Leer más <ArrowRight size={12} />
                </small>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
