import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { CountUp } from '../common/CountUp'
import { trekformStats } from './trekformStats'

const statsBg = '/imagenes/carretilla-trekform-2.jpg'

const dossierUrl =
  'https://wteagitvzdlujwgqgwog.supabase.co/storage/v1/object/public/cms-media/dossier/dossier-trekform-2024.pdf'

export function TrekformStatsSection() {
  return (
    <section
      className="stats-section"
      data-reveal
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(46,46,46,.94), rgba(46,46,46,.88) 55%, rgba(46,46,46,.94)), url(${statsBg})`,
      }}
    >
      <div className="stats-dossier">
        <span className="kicker">NUESTROS LOGROS</span>
        <a href={dossierUrl} target="_blank" rel="noreferrer">
          Dossier corporativo <ArrowRight size={16} />
        </a>
      </div>
      <div className="stats-grid">
        {trekformStats.map((stat, index) => (
          <div
            key={stat.label}
            data-reveal
            style={{ '--reveal-delay': `${0.05 + index * 0.06}s` } as CSSProperties}
          >
            <CountUp value={stat.value} />
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
