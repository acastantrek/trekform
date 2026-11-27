import { Download } from 'lucide-react'
import { CountUp } from '../common/CountUp'
import { trekformStats } from './trekformStats'

const dossierUrl =
  'https://wteagitvzdlujwgqgwog.supabase.co/storage/v1/object/public/cms-media/dossier/dossier-trekform-2024.pdf'

/** "Nuestros logros": same strip as on "Quiénes somos" (icon + figure + label), with the figures
 *  counting up when they scroll into view. */
export function TrekformStatsSection() {
  return (
    <section className="home-proof" data-reveal>
      <div className="about-proof-strip home-proof-strip">
        {trekformStats.map(({ icon: Icon, value, label }, index) => (
          <article key={label} data-reveal data-reveal-delay={0.04 * (index + 1)}>
            <Icon />
            <CountUp value={value} />
            <span>{label}</span>
          </article>
        ))}
      </div>
      <a className="home-proof-dossier" href={dossierUrl} target="_blank" rel="noreferrer">
        <Download size={17} /> Descargar dossier corporativo
      </a>
    </section>
  )
}
