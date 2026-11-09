import { ArrowRight, Building2, CalendarClock, MessageCircle, Phone, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useModalDismiss } from '../../hooks/useModalDismiss'

export function NoSessionsModal({
  courseTitle,
  onClose,
}: {
  courseTitle: string
  onClose: () => void
}) {
  useModalDismiss(onClose)

  return (
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div
        className="no-sessions-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="no-sessions-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="no-sessions-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="no-sessions-hero">
          <div className="no-sessions-icon">
            <CalendarClock size={34} />
          </div>
          <p className="no-sessions-kicker">Próximamente</p>
          <h2 id="no-sessions-title">Todavía no hay fechas para este curso</h2>
        </div>

        <div className="no-sessions-body">
          <p className="no-sessions-intro">
            Ahora mismo no tenemos convocatorias abiertas para <strong>{courseTitle}</strong>. ¡Pero
            no te preocupes! Estaremos encantados de ayudarte a encontrar la mejor opción.
          </p>

          <ul className="no-sessions-tips">
            <li>
              <MessageCircle size={20} />
              <div>
                <strong>Cuéntanos qué necesitas</strong>
                <span>Te orientamos sin compromiso sobre fechas y alternativas.</span>
              </div>
            </li>
            <li>
              <Building2 size={20} />
              <div>
                <strong>¿Es para tu empresa?</strong>
                <span>Podemos organizar la formación en tus propias instalaciones.</span>
              </div>
            </li>
          </ul>

          <div className="no-sessions-actions">
            <Link to="/contacto" className="no-sessions-primary">
              Hablar con un asesor <ArrowRight size={18} />
            </Link>
            <button type="button" className="no-sessions-secondary" onClick={onClose}>
              Seguir explorando cursos
            </button>
          </div>

          <p className="no-sessions-phone">
            <Phone size={14} /> ¿Prefieres llamarnos? <a href="tel:+34932640532">93 264 05 32</a>
          </p>
        </div>
      </div>
    </div>
  )
}
