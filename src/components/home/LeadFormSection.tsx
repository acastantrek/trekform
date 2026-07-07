import { Award, MapPinned, Puzzle, ShieldCheck } from 'lucide-react'

const benefits = [
  {
    icon: MapPinned,
    title: 'Presencia nacional',
    text: 'Centros y colaboradores en toda España',
  },
  {
    icon: Puzzle,
    title: 'Formación a medida',
    text: 'Programas adaptados a las necesidades de tu empresa',
  },
  {
    icon: Award,
    title: 'Calidad garantizada',
    text: 'Comprometidos con la excelencia y la mejora continua',
    featured: true,
  },
  {
    icon: ShieldCheck,
    title: 'Compromiso real',
    text: 'Formamos hoy para un trabajo más seguro mañana',
  },
]

export function LeadFormSection() {
  return (
    <section className="lead-section" aria-label="Ventajas Trekform">
      {benefits.map(({ icon: Icon, title, text, featured }) => (
        <article className={featured ? 'featured' : ''} key={title}>
          <Icon />
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
