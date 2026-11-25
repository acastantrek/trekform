import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, UserCheck } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { submitContactRequest } from '../../services/contact'

type SubmitState = 'idle' | 'sending' | 'success' | 'error'

// Background photos the hero rotates through, one every HERO_SLIDE_MS. Each change is a diagonal
// wipe led by three bars in the logo's cube colours (see .home-hero-slides in trekform-home.css).
const HERO_SLIDES = [
  { src: '/imagenes/home_espacios_confinados_trekform.jpg', position: '58% center' },
  { src: '/imagenes/carretillero_trekform_en_baleares.jpg', position: '45% center' },
  {
    src: '/imagenes/conoce_un_poco_mejor_los_trabajos_en_altura_trekform.jpg',
    position: '65% center',
  },
]
const HERO_SLIDE_MS = 5000

export function TrekformHeroSection() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: '',
    website: '', // honeypot
  })
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')
  // `cycle` counts changes so the sweep bars remount (and replay) on each one, never on first load.
  const [slides, setSlides] = useState({ active: 0, previous: -1, cycle: 0 })

  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setSlides(({ active, cycle }) => ({
          active: (active + 1) % HERO_SLIDES.length,
          previous: active,
          cycle: cycle + 1,
        })),
      HERO_SLIDE_MS,
    )
    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formState.website) {
      setSubmitState('success')
      return
    }

    setSubmitState('sending')
    setError('')

    try {
      await submitContactRequest({
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        subject: formState.course,
        message: formState.message,
      })
      setFormState({ name: '', email: '', phone: '', course: '', message: '', website: '' })
      setSubmitState('success')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la consulta.')
      setSubmitState('error')
    }
  }

  return (
    <section className="home-slider">
      <div className="home-hero-slides" aria-hidden="true">
        {HERO_SLIDES.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            className={
              index === slides.active
                ? slides.cycle > 0
                  ? 'is-active is-entering'
                  : 'is-active'
                : index === slides.previous
                  ? 'is-leaving'
                  : ''
            }
            style={{ objectPosition: slide.position }}
            fetchPriority={index === 0 ? 'high' : 'low'}
          />
        ))}
        {slides.cycle > 0 ? (
          <div key={slides.cycle} className="home-hero-sweep">
            <i />
            <i />
            <i />
          </div>
        ) : null}
      </div>
      <div className="slider-content" data-reveal>
        <span className="eyebrow" data-reveal data-reveal-delay="0.02">
          <i /> LÍDERES EN FORMACIÓN A NIVEL NACIONAL
        </span>
        <h1 data-reveal data-reveal-delay="0.08">
          Formación en maquinaria industrial <span>y PRL</span>
        </h1>
        <p data-reveal data-reveal-delay="0.14">
          Formación teórico-práctica y certificada para particulares, profesionales y empresas, con
          convocatorias en toda España.
        </p>
        <div className="hero-proof-row" data-reveal data-reveal-delay="0.26">
          <article data-reveal data-reveal-delay="0.06">
            <ShieldCheck />
            <strong>Formación certificada</strong>
            <span>Homologada y válida en toda España</span>
          </article>
          <article data-reveal data-reveal-delay="0.1">
            <Clock3 />
            <strong>Respuesta rápida</strong>
            <span>Te contactamos con una propuesta clara</span>
          </article>
          <article data-reveal data-reveal-delay="0.14">
            <UserCheck />
            <strong>Para empresas y particulares</strong>
            <span>Planes abiertos o a medida</span>
          </article>
        </div>
      </div>

      <div className="home-hero-panel" data-reveal data-reveal-delay="0.18">
        {submitState === 'success' ? (
          <div className="home-hero-form home-hero-success" role="status">
            <CheckCircle2 size={32} />
            <h2>¡Solicitud enviada!</h2>
            <p>Hemos recibido tu consulta. Nuestro equipo te contactará en breve.</p>
            <button
              type="button"
              className="home-hero-submit"
              onClick={() => setSubmitState('idle')}
            >
              Enviar otra consulta
            </button>
          </div>
        ) : (
          <form className="home-hero-form" id="hero-form" onSubmit={handleSubmit}>
            <span className="home-hero-form-kicker">SOLICITA INFORMACIÓN</span>
            <h2>Cuéntanos qué formación necesitas</h2>
            <p>Te respondemos con la opción más adecuada para tu caso.</p>
            <label>
              <span>Nombre</span>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Tu nombre"
                autoComplete="name"
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />
            </label>
            <div className="home-hero-form-grid">
              <label>
                <span>Teléfono</span>
                <input
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="600 000 000"
                  autoComplete="tel"
                />
              </label>
              <label>
                <span>Curso</span>
                <select
                  value={formState.course}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, course: event.target.value }))
                  }
                >
                  <option value="">Selecciona</option>
                  <option>Carretillas elevadoras</option>
                  <option>Trabajos en altura</option>
                  <option>Espacios confinados</option>
                  <option>Riesgo eléctrico</option>
                </select>
              </label>
            </div>
            <label className="home-hero-message">
              <span>Mensaje</span>
              <textarea
                value={formState.message}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="Cuéntanos qué necesitas"
                rows={3}
                required
              />
            </label>
            <label className="home-hero-honeypot" aria-hidden="true">
              <span>Website</span>
              <input
                value={formState.website}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, website: event.target.value }))
                }
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
            {submitState === 'error' && (
              <p className="home-hero-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="home-hero-submit" disabled={submitState === 'sending'}>
              {submitState === 'sending' ? 'Enviando...' : 'Pedir información'}{' '}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>

      <div className="home-hero-overlay" aria-hidden="true" />
      {/* <div className="home-hero-badge">
        <CheckCircle2 size={18} />
        <span>Asesoramiento rápido y formación certificada</span>
      </div>
      */}
    </section>
  )
}
