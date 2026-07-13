import { CheckCircle2, MapPin, Phone, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { submitContactRequest } from '../../services/contact'
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

function getAccreditationPoints(session: RegistrationSession) {
  const fromObjectives = session.objectives
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)

  if (fromObjectives.length > 0) return fromObjectives

  return [
    session.certificationName,
    'Formación práctica orientada a la seguridad en el puesto de trabajo.',
    'Grupos reducidos con instructores especializados.',
  ]
}

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
      await submitContactRequest({
        name: `${data.get('name')} ${data.get('lastName')}`.trim(),
        email: String(data.get('email') ?? ''),
        subject: `Inscripción particular: ${session.courseTitle}`,
        message: [
          `Solicitud de inscripción como particular a "${session.courseTitle}".`,
          `Convocatoria: ${sessionDate}, ${sessionSchedule} · ${session.venue}, ${session.city}.`,
          `DNI/NIE/Pasaporte: ${data.get('docId')}`,
          price ? `Precio de la convocatoria: ${price}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
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

          <div className="enrollment-modal-footer">
            <button type="button" onClick={onClose}>
              Cerrar
            </button>
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
            <span className="enrollment-modal-hero-tag">{session.category}</span>
            <p>
              Por tu seguridad, escoge <span>Trekform</span>
            </p>
          </div>

          <div className="enrollment-modal-content">
            <div className="enrollment-modal-main">
              <section>
                <h3>Descripción</h3>
                <p>{session.excerpt}</p>
              </section>

              <section>
                <h3>Acreditación y titulación incluida</h3>
                <div className="enrollment-modal-checks">
                  {accreditationPoints.map((point) => (
                    <div key={point}>
                      <CheckCircle2 size={16} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              {step === 'choose' && (
                <section>
                  <h3>Selecciona el tipo de inscripción</h3>
                  <div className="enrollment-modal-type-cards">
                    <button type="button" onClick={() => setStep('company')}>
                      <strong>Soy empresa</strong>
                      <span>Solicita información para inscribir trabajadores.</span>
                    </button>
                    <button type="button" onClick={() => setStep('individual')}>
                      <strong>Soy particular</strong>
                      <span>Inscríbete a título personal en esta convocatoria.</span>
                    </button>
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
                      <span>He leído y acepto la política de privacidad.</span>
                    </label>
                  </form>
                </section>
              )}

              {step === 'individual-success' && (
                <section className="enrollment-modal-success">
                  <CheckCircle2 size={34} />
                  <h3>¡Solicitud enviada!</h3>
                  <p>
                    Hemos recibido tu solicitud para "{session.courseTitle}". Nuestro equipo se
                    pondrá en contacto contigo en breve para confirmar la plaza y el pago.
                  </p>
                </section>
              )}
            </div>

            {step !== 'individual-success' && (
              <aside className="enrollment-modal-sidebar">
                <h4>{session.courseTitle}</h4>
                <div className="enrollment-modal-sidebar-block">
                  <span className="enrollment-modal-sidebar-label">Instalaciones</span>
                  <strong>{session.venue}</strong>
                  <p>
                    <MapPin size={14} /> {session.address || session.city}
                  </p>
                </div>
                <div className="enrollment-modal-sidebar-block">
                  <span className="enrollment-modal-sidebar-label">Fecha | Horario</span>
                  <p>
                    {sessionDate} · {sessionSchedule}
                  </p>
                </div>
                {price && <div className="enrollment-modal-price">{price}</div>}

                {step === 'individual' && (
                  <button
                    type="submit"
                    form="enrollment-individual-form"
                    className="enrollment-modal-cta"
                    disabled={sending}
                  >
                    {sending ? 'Enviando...' : 'Enviar solicitud de inscripción'}
                  </button>
                )}
                {error && <p className="enrollment-modal-error">{error}</p>}

                {step === 'individual' && (
                  <p className="enrollment-modal-note">
                    <ShieldCheck size={14} /> Nos pondremos en contacto para confirmar la plaza y
                    gestionar el pago de forma segura.
                  </p>
                )}

                <p className="enrollment-modal-phone">
                  <Phone size={14} /> ¿Prefieres que hablemos? Llámanos al{' '}
                  <a href="tel:+34932640532">93 264 05 32</a>
                </p>
              </aside>
            )}
          </div>
        </div>

        <div className="enrollment-modal-footer">
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
