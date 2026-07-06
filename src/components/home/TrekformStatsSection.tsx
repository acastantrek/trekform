import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  { value: '20+', label: 'Años de experiencia' },
  { value: '200K+', label: 'Alumnos formados' },
  { value: '4.000+', label: 'Empresas' },
  { value: '18.000+', label: 'Cursos impartidos' },
]

export function TrekformStatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-heading">
        <div>
          <span className="kicker light">NUESTROS LOGROS</span>
          <h2>Trekform en números</h2>
        </div>
        <p>La calidad en las formaciones es nuestra diferencia.</p>
        <Link to="/contacto">
          Dossier corporativo <ArrowRight size={18} />
        </Link>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
