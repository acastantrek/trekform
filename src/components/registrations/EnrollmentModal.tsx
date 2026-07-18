import {
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { submitContactRequest } from '../../services/contact'
import { submitSimulatedPayment } from '../../services/enrollments'
import type { RegistrationSession } from '../../services/registrations'

type Step = 'choose' | 'individual' | 'individual-success' | 'company' | 'company-success'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const priceFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

function formatPrice(cents: number | null) {
  if (cents === null) return null
  return priceFormatter.format(cents / 100)
}

function splitLines(value: string | null) {
  return (value ?? '')
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function getAccreditationPoints(session: RegistrationSession) {
  const fromField = splitLines(session.accreditationItems)
  if (fromField.length > 0) return fromField

  const fromObjectives = splitLines(session.objectives).slice(0, 3)
  if (fromObjectives.length > 0) return fromObjectives

  return [
    'Diploma acreditativo Trekform',
    'Formación práctica orientada a la seguridad en el puesto de trabajo.',
    'Grupos reducidos con instructores especializados.',
  ]
}

const benefitIcons = [CreditCard, Award, ShieldCheck]

export function EnrollmentModal({
  session,
  onClose,
}: {
  session: RegistrationSession
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>('choose')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const accreditationPoints = getAccreditationPoints(session)
  const accreditationTitle = session.accreditationTitle?.trim() || 'Acreditación y titulación incluida'
  const benefitsPoints = splitLines(session.benefitsItems)
  const price = formatPrice(session.priceCents)
  const sessionDate = dateFormatter.format(new Date(session.startsAt))
  const sessionShortDate = shortDateFormatter.format(new Date(session.startsAt)).replace(/\//g, '-')
  const sessionSchedule = `${timeFormatter.format(new Date(session.startsAt))} - ${timeFormatter.format(new Date(session.endsAt))}`

  async function handleIndividualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    setSending(true)
    setError('')
    try {
      await submitSimulatedPayment({
        courseSessionId: session.id,
        firstName: String(data.get('name') ?? ''),
        lastName: String(data.get('lastName') ?? ''),
        email: String(data.get('email') ?? ''),
        identityDocument: String(data.get('docId') ?? ''),
        amountPaidCents: session.priceCents,
      })
      setStep('individual-success')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la solicitud.')
    } finally {
      setSending(false)
    }
  }

  async function handleCompanySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    setSending(true)
    setError('')
    try {
      await submitContactRequest({
        name: String(data.get('contactName') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        companyName: String(data.get('company') ?? ''),
        subject: `Inscripción para empresa: ${session.courseTitle}`,
        message: [
          `Solicitud de información para inscribir trabajadores en "${session.courseTitle}".`,
          `Convocatoria: ${sessionDate}, ${sessionSchedule} · ${session.venue}, ${session.city}.`,
        ].join('\n'),
      })
      setStep('company-success')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la solicitud.')
    } finally {
      setSending(false)
    }
  }

  if (step === 'company' || step === 'company-success') {
    return (
      <div className="enrollment-modal-overlay" onClick={onClose}>
        <div
          className="enrollment-modal enrollment-modal--compact"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enrollment-company-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="enrollment-modal-topbar">
            <span id="enrollment-company-modal-title">Solicita información</span>
            <button type="button" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>

          <div className="enrollment-modal-compact-body">
            {step === 'company-success' ? (
              <section className="enrollment-modal-success">
                <CheckCircle2 size={34} />
                <h3>¡Solicitud enviada!</h3>
                <p>
                  Hemos recibido tu solicitud para "{session.courseTitle}". Nuestro equipo se
                  pondrá en contacto contigo en breve.
                </p>
              </section>
            ) : (
              <>
                <h3>
                  {session.courseTitle} en <strong>{session.city}</strong> el{' '}
                  <strong>{sessionShortDate}</strong>
                </h3>
                <p>
                  En breve podrás inscribir a los trabajadores directamente, estamos trabajando en
                  ello. De momento completa el formulario y nos pondremos en contacto contigo lo
                  antes posible.
                </p>
                <form
                  className="enrollment-modal-form"
                  id="enrollment-company-form"
                  onSubmit={handleCompanySubmit}
                >
                  <label>
                    <span>Empresa</span>
                    <input name="company" placeholder="Empresa" required />
                  </label>
                  <label>
                    <span>Persona de contacto</span>
                    <input name="contactName" placeholder="Persona de contacto" required />
                  </label>
                  <div className="enrollment-modal-form-grid">
                    <label>
                      <span>Teléfono</span>
                      <input name="phone" type="tel" placeholder="Teléfono" required />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        name="email"
                        type="email"
                        placeholder="E-mail"
                        autoComplete="email"
                        required
                      />
                    </label>
                  </div>
                  <button type="submit" className="enrollment-modal-cta-compact" disabled={sending}>
                    {sending ? 'Enviando...' : 'Solicitar más información'}
                  </button>
                  {error && <p className="enrollment-modal-error">{error}</p>}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div
        className="enrollment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="enrollment-modal-topbar">
          <span id="enrollment-modal-title">¡Estás a un solo paso de avanzar en tu futuro profesional!</span>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="enrollment-modal-body">
          <div
            className="enrollment-modal-hero"
            style={{ backgroundImage: `url(${session.image})` }}
          >
            <img className="enrollment-modal-logo" src="/brand/logo-trekform-white.png" alt="" />
            <h2>{session.courseTitle}</h2>
            <p>
              Por tu seguridad, escoge <span>Trekform</span>
            </p>
          </div>

          <div
            className={`enrollment-modal-content${step === 'individual' ? ' enrollment-modal-content--individual' : ' enrollment-modal-content--full'}`}
          >
            <div className="enrollment-modal-main">
              <section className="enrollment-modal-description">
                <h3>Descripción</h3>
                <p>{session.excerpt}</p>
              </section>

              {step === 'choose' && (
                <section>
                  <h3>Selecciona el tipo de inscripción</h3>
                  <div className="enrollment-modal-type-cards">
                    <button
                      type="button"
                      className="enrollment-modal-type-card"
                      onClick={() => setStep('company')}
                    >
                      <span className="enrollment-modal-type-icon" aria-hidden="true">
                        <Building2 size={22} />
                      </span>
                      <span className="enrollment-modal-type-text">
                        <strong>Soy empresa</strong>
                        <span>Solicita información para inscribir trabajadores.</span>
                      </span>
                      <ArrowRight
                        size={18}
                        className="enrollment-modal-type-arrow"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      className="enrollment-modal-type-card"
                      onClick={() => setStep('individual')}
                    >
                      <span className="enrollment-modal-type-icon" aria-hidden="true">
                        <User size={22} />
                      </span>
                      <span className="enrollment-modal-type-text">
                        <strong>Soy particular</strong>
                        <span>Inscríbete a título personal en esta convocatoria.</span>
                      </span>
                      <ArrowRight
                        size={18}
                        className="enrollment-modal-type-arrow"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </section>
              )}

              <section className="enrollment-modal-accreditation">
                <h3>{accreditationTitle}</h3>
                <div className="enrollment-modal-checks">
                  {accreditationPoints.map((point) => (
                    <div key={point}>
                      <CheckCircle2 size={16} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              {benefitsPoints.length > 0 && (
                <section className="enrollment-modal-benefits">
                  <h3>Qué recibirás</h3>
                  <div className="enrollment-modal-checks">
                    {benefitsPoints.map((point, index) => {
                      const Icon = benefitIcons[index % benefitIcons.length]
                      return (
                        <div key={point}>
                          <Icon size={16} />
                          <span>{point}</span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {step === 'individual' && (
                <section>
                  <h3>Datos del alumno</h3>
                  <form
                    className="enrollment-modal-form"
                    id="enrollment-individual-form"
                    onSubmit={handleIndividualSubmit}
                  >
                    <div className="enrollment-modal-form-grid">
                      <label>
                        <span>Nombre</span>
                        <input name="name" placeholder="Nombre" autoComplete="given-name" required />
                      </label>
                      <label>
                        <span>Apellidos</span>
                        <input
                          name="lastName"
                          placeholder="Apellidos"
                          autoComplete="family-name"
                          required
                        />
                      </label>
                      <label>
                        <span>DNI/NIE/Pasaporte</span>
                        <input name="docId" placeholder="DNI/NIE/Pasaporte" required />
                      </label>
                      <label>
                        <span>Email</span>
                        <input
                          name="email"
                          type="email"
                          placeholder="tu@email.com"
                          autoComplete="email"
                          required
                        />
                      </label>
                    </div>
                    <label className="enrollment-modal-consent">
                      <input type="checkbox" required />
                      <span>
                        He leído y acepto la{' '}
                        <Link to="/politica-de-privacidad" target="_blank" rel="noopener noreferrer">
                          política de privacidad
                        </Link>
                        .
                      </span>
                    </label>
                  </form>
                </section>
              )}

              {step === 'individual-success' && (
                <section className="enrollment-modal-success">
                  <CheckCircle2 size={34} />
                  <h3>¡Pago realizado!</h3>
                  <p>
                    Hemos registrado tu inscripción y el pago para "{session.courseTitle}". Nuestro
                    equipo se pondrá en contacto contigo en breve para confirmar la plaza.
                  </p>
                </section>
              )}
            </div>

            {step === 'individual' && (
              <aside className="enrollment-modal-sidebar">
                <h4>{session.courseTitle}</h4>
                <div className="enrollment-modal-sidebar-block">
                  <span className="enrollment-modal-sidebar-label">Fecha | Horario</span>
                  <p>
                    {sessionDate} · {sessionSchedule}
                  </p>
                </div>
                <div className="enrollment-modal-sidebar-block">
                  <span className="enrollment-modal-sidebar-label">Instalaciones</span>
                  <strong>{session.venue}</strong>
                  <p>
                    <MapPin size={14} /> {session.address || session.city}
                  </p>
                </div>
                <Link
                  to={`/inscripciones?curso=${encodeURIComponent(session.courseTitle)}#registration-results`}
                  className="enrollment-modal-other-dates"
                  onClick={onClose}
                >
                  <CalendarDays size={14} /> Buscar otras fechas de este curso
                </Link>
                {price && <div className="enrollment-modal-price">{price}</div>}

                <button
                  type="submit"
                  form="enrollment-individual-form"
                  className="enrollment-modal-cta"
                  disabled={sending}
                >
                  {sending ? 'Enviando...' : 'Realizar pago'}
                </button>
                {error && <p className="enrollment-modal-error">{error}</p>}

                <div className="enrollment-modal-trust">
                  <p className="enrollment-modal-trust-title">
                    <ShieldCheck size={14} /> Pago 100% seguro con STRIPE
                  </p>
                  <p className="enrollment-modal-trust-label">Aceptamos</p>
                  <div className="enrollment-modal-payment-icons">
                    <span className="payment-badge payment-badge--visa">VISA</span>
                    <span className="payment-badge payment-badge--mastercard" aria-label="Mastercard">
                      <i /> <i />
                    </span>
                    <span className="payment-badge payment-badge--card" aria-hidden="true">
                      <CreditCard size={16} />
                    </span>
                    <span className="payment-badge payment-badge--gpay">
                      <b>G</b> Pay
                    </span>
                  </div>
                  <p className="enrollment-modal-phone">
                    <Phone size={14} />
                    <span>
                      ¿Prefieres que hablemos?
                      <br />
                      Llámanos al <a href="tel:+34932640532">93 264 05 32</a> o{' '}
                      <a href="tel:+34917376166">91 737 61 66</a>
                    </span>
                  </p>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
