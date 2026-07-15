import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CourseCatalog } from '../components/courses/CourseCatalog'
import { LatestNews } from '../components/home/LatestNews'
import { TestimonialsCarousel } from '../components/home/TestimonialsCarousel'
import { TrekformHeroSection } from '../components/home/TrekformHeroSection'
import { TrekformStatsSection } from '../components/home/TrekformStatsSection'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollReveal } from '../hooks/useScrollReveal'

export function HomePage() {
  useScrollReveal()
  const isMobile = useMediaQuery('(max-width: 680px)')

  return (
    <>
      <TrekformHeroSection />
      <section className="course-section" data-reveal={isMobile ? undefined : true}>
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
        <CourseCatalog />
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
          <TestimonialsCarousel />
        </article>
        <article data-reveal data-reveal-delay="0.19">
          <span className="kicker">ÚLTIMAS NOTICIAS</span>
          <LatestNews />
        </article>
      </section>
    </>
  )
}
