import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

const stats = [
  { value: '+20', label: 'Años de experiencia' },
  { value: '+200.000', label: 'Alumnos formados' },
  { value: '+4.000', label: 'Empresas' },
  { value: '+18.000', label: 'Cursos impartidos' },
]

const statsBg =
  'https://trekform.com/trekform/uploads/assets/images/Sobre_nosotros/carretilla-trekform-2.jpg'

export function TrekformStatsSection() {
  return (
    <section
      className="stats-section"
      data-reveal
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(11,18,32,.94), rgba(15,26,45,.88) 55%, rgba(11,18,32,.94)), url(${statsBg})`,
      }}
    >
      <div className="stats-heading">
        <div>
          <span className="kicker light">NUESTROS LOGROS</span>
          <h2>
            Trekform <span>en números</span>
          </h2>
        </div>
        <p>La calidad en las formaciones es nuestra diferencia.</p>
        <Link to="/contacto">
          DOSSIER CORPORATIVO <ArrowRight size={18} />
        </Link>
      </div>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            data-reveal
            style={{ '--reveal-delay': `${0.05 + index * 0.06}s` } as CSSProperties}
          >
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
