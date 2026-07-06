import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    title: 'Líderes en formación de maquinaria industrial y PRL',
    text: 'Más de 20 años de trayectoria formando a particulares y empresas en maquinaria industrial y PRL.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Formación de calidad al alcance de todos.',
    text: 'Especialistas en formación PRL y maquinaria industrial con más de 200.000 alumnos formados.',
    image:
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Formación para particulares y empresas.',
    text: 'Presentes en las principales ciudades de España, formando a miles de profesionales cada año.',
    image:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1800&q=90',
  },
]

export function TrekformHeroSection() {
  const [current, setCurrent] = useState(0)
  const slide = slides[current]
  const move = (step: number) =>
    setCurrent((index) => (index + step + slides.length) % slides.length)

  return (
    <section
      className="home-slider"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(4,22,38,.9), rgba(4,22,38,.18)), url(${slide.image})`,
      }}
    >
      <div className="slider-content">
        <span className="eyebrow">
          <i /> TREKFORM · FORMACIÓN PROFESIONAL
        </span>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="hero-actions">
          <Link to="/cursos-trekform" className="primary">
            Descubre nuestros cursos <ArrowRight size={20} />
          </Link>
          <Link to="/contacto" className="hero-secondary">
            Contacta con nosotros
          </Link>
        </div>
      </div>
      <div className="slider-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Anterior">
          <ArrowLeft />
        </button>
        <span>
          0{current + 1} / 0{slides.length}
        </span>
        <button type="button" onClick={() => move(1)} aria-label="Siguiente">
          <ArrowRight />
        </button>
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
