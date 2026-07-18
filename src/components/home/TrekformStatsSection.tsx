import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'

const stats = [
  { value: '+20', label: 'Años de experiencia' },
  { value: '+200.000', label: 'Alumnos formados' },
  { value: '+4.000', label: 'Empresas' },
  { value: '+18.000', label: 'Cursos impartidos' },
]

const statsBg =
  'https://trekform.com/trekform/uploads/assets/images/Sobre_nosotros/carretilla-trekform-2.jpg'

const dossierUrl =
  'https://wteagitvzdlujwgqgwog.supabase.co/storage/v1/object/public/cms-media/dossier/dossier-trekform-2024.pdf'

export function TrekformStatsSection() {
  return (
    <section
      className="stats-section"
      data-reveal
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(11,18,32,.94), rgba(15,26,45,.88) 55%, rgba(11,18,32,.94)), url(${statsBg})`,
      }}
    >
      <div className="stats-dossier">
        <span className="kicker">NUESTROS LOGROS</span>
        <a href={dossierUrl} target="_blank" rel="noreferrer">
          Dossier corporativo <ArrowRight size={16} />
        </a>
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
