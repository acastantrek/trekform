import { Quote, Star } from 'lucide-react'

const reviews = [
  {
    text: 'Curso muy claro y práctico. El instructor conocía perfectamente la maquinaria y resolvió todas las dudas.',
    name: 'Javier V.',
    role: 'Alumno · Carretillas',
  },
  {
    text: 'Organizamos la formación para todo el equipo sin detener la actividad. La gestión fue rápida y muy profesional.',
    name: 'Cristina C.',
    role: 'Responsable de RRHH',
  },
  {
    text: 'Las prácticas se parecen al trabajo real. Salí con confianza para manejar los equipos con seguridad.',
    name: 'Ángela D.',
    role: 'Alumna · Logística',
  },
]

export function TestimonialsSection() {
  return (
    <section className="reviews-section">
      <div className="reviews-heading">
        <span className="kicker">RESEÑAS</span>
        <h2>Lo que dicen de nosotros</h2>
        <p>Escuchar a quienes se forman con nosotros nos ayuda a mejorar cada día.</p>
      </div>
      <div className="reviews-grid">
        {reviews.map((review) => (
          <article key={review.name}>
            <Quote className="quote" />
            <div className="stars">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={15} fill="currentColor" />
              ))}
            </div>
            <p>“{review.text}”</p>
            <footer>
              <strong>{review.name}</strong>
              <span>{review.role}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
