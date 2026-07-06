import { ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TrekformAboutSection() {
  return (
    <section className="about-section">
      <div className="about-collage">
        <div className="about-image-main" />
        <div className="about-image-small" />
        <span className="about-years">
          <strong>20</strong> años
          <br />
          de experiencia
        </span>
      </div>
      <div className="about-copy">
        <span className="kicker">SOBRE TREKFORM</span>
        <h2>Líderes en formación de maquinaria industrial y prevención de riesgos laborales.</h2>
        <div className="about-values">
          <article>
            <CheckCircle2 />
            <div>
              <strong>Compromiso</strong>
              <span>
                Proyectos personalizados y adaptados a las necesidades formativas reales de cada
                cliente.
              </span>
            </div>
          </article>
          <article>
            <CheckCircle2 />
            <div>
              <strong>Excelencia</strong>
              <span>
                Equipo técnico altamente cualificado para garantizar la calidad de cada formación.
              </span>
            </div>
          </article>
        </div>
        <div className="about-actions">
          <Link to="/cursos-trekform" className="primary">
            Quiero saber más <ArrowRight size={18} />
          </Link>
          <Link to="/contacto" className="video-link">
            <Play size={15} fill="currentColor" /> Vídeo corporativo Trekform
          </Link>
        </div>
      </div>
    </section>
  )
}
