import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { submitContactRequest } from '../services/contact'

const offices = [
  { city: 'Barcelona', phone: '93 264 05 32', href: 'tel:+34932640532' },
  { city: 'Madrid', phone: '91 737 61 66', href: 'tel:+34917376166' },
  { city: 'Sevilla', phone: '95 544 15 23', href: 'tel:+34955441523' },
  { city: 'Valencia', phone: '96 066 15 25', href: 'tel:+34960661525' },
  { city: 'Zaragoza', phone: '87 666 00 75', href: 'tel:+34876660075' },
  { city: 'Bilbao', phone: '94 477 06 15', href: 'tel:+34944770615' },
  { city: 'Vigo', phone: '88 606 00 78', href: 'tel:+34886060078' },
  { city: 'Gran Canaria', phone: '82 815 00 08', href: 'tel:+34828150008' },
]

type SubmitState = 'idle' | 'sending' | 'success' | 'error'

export function ContactPage() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    if (data.get('website')) {
      setSubmitState('success')
      form.reset()
      return
    }

    setSubmitState('sending')
    setError('')

    try {
      await submitContactRequest({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        companyName: String(data.get('company') ?? ''),
        subject: String(data.get('subject') ?? ''),
        message: String(data.get('message') ?? ''),
      })
      form.reset()
      setSubmitState('success')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la consulta.')
      setSubmitState('error')
    }
  }

  return (
    <div className="contact-v2">
      <section className="contact-v2-hero">
        <div className="contact-v2-hero-copy">
          <span>HABLEMOS</span>
          <h1>Tu próxima formación empieza con una conversación.</h1>
          <p>
            Cuéntanos qué necesitas y nuestro equipo te ayudará a encontrar el curso, la fecha y la
            modalidad adecuada.
          </p>
        </div>
        <div className="contact-v2-hero-image" aria-hidden="true">
          <div>
            <strong>20+</strong>
            <span>años formando profesionales</span>
          </div>
        </div>
      </section>

      <section className="contact-v2-main" aria-labelledby="contact-form-title">
        <div className="contact-v2-info">
          <span className="contact-v2-kicker">CONTACTO DIRECTO</span>
          <h2>Estamos para ayudarte.</h2>
          <p>
            Atendemos consultas de particulares, empresas y entidades en todo el territorio
            nacional.
          </p>

          <div className="contact-v2-channels">
            <a href="tel:+34932640532">
              <i><Phone size={21} /></i>
              <span><small>LLÁMANOS</small><strong>93 264 05 32</strong></span>
              <ArrowRight size={18} />
            </a>
            <a href="mailto:comercial@trekform.com">
              <i><Mail size={21} /></i>
              <span><small>ESCRÍBENOS</small><strong>comercial@trekform.com</strong></span>
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="contact-v2-hours">
            <Clock3 size={20} />
            <div>
              <strong>Horario de atención</strong>
              <span>Lunes a jueves, 09:00–18:00</span>
              <span>Viernes, 09:00–15:00</span>
            </div>
          </div>
        </div>

        <div className="contact-v2-form-wrap">
          {submitState === 'success' ? (
            <div className="contact-v2-success" role="status">
              <CheckCircle2 size={48} />
              <span>CONSULTA ENVIADA</span>
              <h2>Gracias por contactar.</h2>
              <p>Hemos recibido tu mensaje. Nuestro equipo responderá lo antes posible.</p>
              <button type="button" onClick={() => setSubmitState('idle')}>
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form className="contact-v2-form" onSubmit={handleSubmit}>
              <div className="contact-v2-form-heading">
                <MessageSquareText size={24} />
                <div>
                  <span>FORMULARIO DE CONTACTO</span>
                  <h2 id="contact-form-title">¿En qué podemos ayudarte?</h2>
                </div>
              </div>

              <div className="contact-v2-fields">
                <label>
                  <span>Nombre y apellidos *</span>
                  <input name="name" autoComplete="name" placeholder="Tu nombre" required />
                </label>
                <label>
                  <span>Email *</span>
                  <input name="email" type="email" autoComplete="email" placeholder="tu@email.com" required />
                </label>
                <label>
                  <span>Teléfono</span>
                  <input name="phone" type="tel" autoComplete="tel" placeholder="600 000 000" />
                </label>
                <label>
                  <span>Empresa</span>
                  <input name="company" autoComplete="organization" placeholder="Nombre de empresa" />
                </label>
                <label className="contact-v2-subject">
                  <span>Motivo de la consulta *</span>
                  <select name="subject" defaultValue="" required>
                    <option value="" disabled>Selecciona una opción</option>
                    <option value="Información sobre un curso">Información sobre un curso</option>
                    <option value="Formación para empresas">Formación para empresas</option>
                    <option value="Convocatorias e inscripciones">Convocatorias e inscripciones</option>
                    <option value="Otra consulta">Otra consulta</option>
                  </select>
                </label>
                <label className="contact-v2-message">
                  <span>Mensaje *</span>
                  <textarea name="message" rows={5} placeholder="Cuéntanos qué formación buscas…" minLength={10} required />
                </label>
                <label className="contact-v2-honeypot" aria-hidden="true">
                  <span>Website</span>
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                <label className="contact-v2-consent">
                  <input type="checkbox" required />
                  <span>
                    He leído y acepto la política de privacidad y el tratamiento de mis datos para
                    responder a esta consulta.
                  </span>
                </label>
              </div>

              {submitState === 'error' && <p className="contact-v2-error" role="alert">{error}</p>}

              <button className="contact-v2-submit" type="submit" disabled={submitState === 'sending'}>
                {submitState === 'sending' ? 'Enviando…' : 'Enviar consulta'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="contact-v2-offices" aria-labelledby="offices-title">
        <div>
          <span className="contact-v2-kicker">COBERTURA NACIONAL</span>
          <h2 id="offices-title">Más cerca de ti.</h2>
        </div>
        <p>Contacta con el equipo de tu zona o consulta otras poblaciones disponibles.</p>
        <div className="contact-v2-office-grid">
          {offices.map((office, index) => (
            <a href={office.href} key={office.city}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <MapPin size={17} />
              <strong>{office.city}</strong>
              <small>{office.phone}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="contact-v2-company">
        <Building2 size={35} />
        <div>
          <span>FORMACIÓN PARA EMPRESAS</span>
          <h2>Diseñamos un plan adaptado a tu equipo.</h2>
        </div>
        <Link to="/cursos-trekform">
          Explorar cursos <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
