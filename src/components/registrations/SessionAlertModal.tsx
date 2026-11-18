import { ArrowRight, BellRing, CheckCircle2, MapPin, Phone, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useModalDismiss } from '../../hooks/useModalDismiss'
import { spanishProvinces } from '../../lib/provinces'
import { createSessionAlert } from '../../services/sessionAlerts'

const anyProvince = ''

/**
 * Shown when a course has no open session (or none in the province the visitor picked): lets
 * them leave their details to be told when one opens. `otherProvincesLink` is set when the
 * course does have open sessions elsewhere, so they can go and look at those instead.
 */
export function SessionAlertModal({
  courseId,
  courseTitle,
  province,
  otherProvincesLink,
  onClose,
}: {
  courseId: string
  courseTitle: string
  province: string | null
  otherProvincesLink?: string | null
  onClose: () => void
}) {
  useModalDismiss(onClose)
  const [selectedProvince, setSelectedProvince] = useState(province ?? anyProvince)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // A venue province spelled differently from the list (or "Online") must still be selectable.
  const provinceOptions =
    province && !spanishProvinces.includes(province)
      ? [province, ...spanishProvinces]
      : spanishProvinces

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSending(true)
    setError(null)
    try {
      await createSessionAlert({
        courseId,
        province: selectedProvince || null,
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
      })
      setDone(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar tu solicitud.')
    } finally {
      setSending(false)
    }
  }

  const title = province
    ? `Todavía no hay fechas en ${province}`
    : 'Todavía no hay fechas para este curso'

  return (
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div
        className="no-sessions-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-alert-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="no-sessions-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="no-sessions-hero">
          <div className="no-sessions-icon">
            <BellRing size={32} />
          </div>
          <p className="no-sessions-kicker">Próximamente</p>
          <h2 id="session-alert-title">{title}</h2>
        </div>

        <div className="no-sessions-body">
          {done ? (
            <div className="session-alert-success" role="status">
              <CheckCircle2 size={34} />
              <h3>¡Apuntado!</h3>
              <p>
                Te avisaremos en cuanto abramos una convocatoria de <strong>{courseTitle}</strong>
                {selectedProvince ? ` en ${selectedProvince}` : ''}.
              </p>
              <button type="button" className="no-sessions-secondary" onClick={onClose}>
                Seguir explorando cursos
              </button>
            </div>
          ) : (
            <>
              <p className="no-sessions-intro">
                Déjanos tus datos y te avisaremos en cuanto abramos una convocatoria de{' '}
                <strong>{courseTitle}</strong>.
              </p>

              {otherProvincesLink ? (
                <Link to={otherProvincesLink} className="session-alert-elsewhere" onClick={onClose}>
                  <MapPin size={18} aria-hidden="true" />
                  <span>
                    <strong>Hay convocatorias en otras provincias</strong>
                    <span>Ver convocatorias en otras provincias</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : null}

              <form className="enrollment-modal-form session-alert-form" onSubmit={handleSubmit}>
                <label>
                  <span>Nombre y apellidos</span>
                  <input name="name" autoComplete="name" minLength={2} maxLength={120} required />
                </label>
                <div className="enrollment-modal-form-grid">
                  <label>
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      maxLength={254}
                      required
                    />
                  </label>
                  <label>
                    <span>
                      Teléfono <em>(opcional)</em>
                    </span>
                    <input name="phone" type="tel" autoComplete="tel" maxLength={30} />
                  </label>
                </div>
                <label>
                  <span>
                    Provincia <em>(opcional)</em>
                  </span>
                  <select
                    value={selectedProvince}
                    onChange={(event) => setSelectedProvince(event.target.value)}
                  >
                    <option value={anyProvince}>Cualquier provincia</option>
                    {provinceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="enrollment-modal-consent">
                  <input type="checkbox" required />
                  <span>
                    Acepto que Trekform use mis datos para avisarme de nuevas convocatorias, según
                    la{' '}
                    <Link to="/politica-de-privacidad" target="_blank" rel="noopener noreferrer">
                      política de privacidad
                    </Link>
                    .
                  </span>
                </label>
                {error ? <p className="enrollment-modal-error">{error}</p> : null}
                <button type="submit" className="no-sessions-primary" disabled={sending}>
                  {sending ? 'Enviando…' : 'Avísame cuando haya fechas'}
                  {sending ? null : <BellRing size={18} aria-hidden="true" />}
                </button>
              </form>
            </>
          )}

          <p className="no-sessions-phone">
            <Phone size={14} /> ¿Prefieres llamarnos? <a href="tel:+34932640532">93 264 05 32</a>
          </p>
        </div>
      </div>
    </div>
  )
}
