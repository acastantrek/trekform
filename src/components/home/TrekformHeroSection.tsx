import { ArrowRight, CalendarDays, ShieldCheck, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    title: 'Líderes en formación de maquinaria industrial y PRL',
    text: 'En Trekform capacitamos a profesionales y empresas con formación práctica y certificada en prevención de riesgos laborales y manejo de maquinaria.',
    image:
      'https://trekform.com/trekform/uploads/assets/images/backgrounds/home_operario_carretillas_elevadoras_trekform.jpg',
  },
  {
    title: 'Formación de calidad al alcance de todos.',
    text: 'Especialistas en formación PRL y maquinaria industrial con más de 200.000 alumnos formados.',
    image:
      'https://trekform.com/trekform/uploads/assets/images/backgrounds/home_trabajos_en_altura_trekform.jpg',
  },
  {
    title: 'Formación para particulares y empresas.',
    text: 'Presentes en las principales ciudades de España, formando a miles de profesionales cada año.',
    image:
      'https://trekform.com/trekform/uploads/assets/images/backgrounds/home_espacios_confinados_trekform.jpg',
  },
]

export function TrekformHeroSection() {
  const [current, setCurrent] = useState(0)
  const slide = slides[current]

  return (
    <section className="home-slider">
      <div className="slider-content">
        <span className="eyebrow">
          <i /> FORMACIÓN QUE TE LLEVA MÁS LEJOS
        </span>
        <h1>
          Formación en maquinaria industrial y PRL <span>para un entorno laboral más seguro</span>
        </h1>
        <p>{slide.text}</p>
        <div className="hero-actions">
          <Link to="/cursos-trekform" className="primary">
            Ver cursos destacados <ArrowRight size={20} />
          </Link>
          <Link to="/contacto" className="hero-secondary">
            Para empresas <UserCheck size={18} />
          </Link>
        </div>
        <div className="hero-proof-row">
          <article>
            <ShieldCheck />
            <strong>Formación certificada</strong>
            <span>Homologada y válida en toda España</span>
          </article>
          <article>
            <UserCheck />
            <strong>Instructores expertos</strong>
            <span>Profesionales en activo con amplia experiencia</span>
          </article>
          <article>
            <CalendarDays />
            <strong>Modalidad flexible</strong>
            <span>Presencial, online y mixta adaptada a ti</span>
          </article>
        </div>
      </div>
      <div className="home-hero-media">
        <img src={slide.image} alt="" />
      </div>
      <div className="slider-dots">
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={index === current ? 'active' : ''}
            onClick={() => setCurrent(index)}
            aria-label={`Mostrar diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
