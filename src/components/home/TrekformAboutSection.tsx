import { ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TrekformAboutSection() {
  return (
    <section className="about-section">
      <div className="about-collage">
        <div className="about-image-main" />
        <div className="about-image-small" />
        <div className="about-image-accent" />
        <span className="about-years">
          <strong>20</strong> años
          <br />
          de experiencia
        </span>
      </div>
      <div className="about-copy">
        <span className="kicker">SOBRE TREKFORM</span>
        <h2>
          Líderes en formación de maquinaria industrial{' '}
          <span>y prevención de riesgos laborales.</span>
        </h2>
        <div className="about-values">
          <article>
            <CheckCircle2 />
            <div>
              <strong>Compromiso</strong>
              <span>
                Ofrecemos proyectos totalmente personalizados para todos nuestros clientes,
                adaptándonos a sus necesidades formativas reales.
              </span>
            </div>
          </article>
          <article>
            <CheckCircle2 />
            <div>
              <strong>Excelencia</strong>
              <span>
                Contamos con un equipo técnico altamente cualificado, lo que nos permite ofrecer la
                mejor calidad en todas nuestras formaciones.
              </span>
            </div>
          </article>
        </div>
        <div className="about-actions">
          <Link to="/cursos-trekform" className="primary">
            Quiero saber más <ArrowRight size={18} />
          </Link>
          <Link to="/contacto" className="video-link">
            <Play size={15} fill="currentColor" /> Video Corporativo Trekform
          </Link>
        </div>
      </div>
    </section>
  )
}
