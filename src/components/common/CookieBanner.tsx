import { Cookie } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCookieConsent,
  OPEN_SETTINGS_EVENT,
  saveCookieConsent,
  type ConsentCategory,
} from '../../lib/cookieConsent'

const CATEGORIES: { id: ConsentCategory | 'technical'; title: string; text: string }[] = [
  {
    id: 'technical',
    title: 'Técnicas',
    text: 'Necesarias para que la web funcione (navegación, inscripciones, seguridad). No se pueden desactivar.',
  },
  {
    id: 'analytics',
    title: 'Análisis',
    text: 'Nos ayudan a saber qué contenidos se visitan más para mejorar la web, de forma anónima.',
  },
  {
    id: 'marketing',
    title: 'Publicidad',
    text: 'Permiten mostrarte anuncios relevantes de Trekform en otras webs.',
  },
]

export function CookieBanner() {
  const [visible, setVisible] = useState(() => getCookieConsent() === null)
  const [showSettings, setShowSettings] = useState(false)
  const [choice, setChoice] = useState(() => {
    const saved = getCookieConsent()
    return { analytics: saved?.analytics ?? false, marketing: saved?.marketing ?? false }
  })

  useEffect(() => {
    const open = () => {
      const saved = getCookieConsent()
      setChoice({ analytics: saved?.analytics ?? false, marketing: saved?.marketing ?? false })
      setShowSettings(true)
      setVisible(true)
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, open)
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open)
  }, [])

  if (!visible) return null

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    saveCookieConsent(next)
    setVisible(false)
    setShowSettings(false)
  }

  return (
    <section className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner__body">
        <h2 id="cookie-banner-title">
          <Cookie size={18} aria-hidden="true" /> Usamos cookies
        </h2>
        <p>
          Utilizamos cookies técnicas para que la web funcione y, solo si nos lo permites, cookies
          de análisis y publicidad. Puedes aceptarlas, rechazarlas o elegir cuáles. Más información
          en nuestra <Link to="/politica-de-cookies">política de cookies</Link>.
        </p>

        {showSettings && (
          <ul className="cookie-banner__categories">
            {CATEGORIES.map((category) => {
              const locked = category.id === 'technical'
              const checked = locked || choice[category.id as ConsentCategory]
              return (
                <li key={category.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked}
                      onChange={(event) =>
                        setChoice((current) => ({
                          ...current,
                          [category.id]: event.target.checked,
                        }))
                      }
                    />
                    <span>
                      <strong>
                        {category.title}
                        {locked && <em> · Siempre activas</em>}
                      </strong>
                      {category.text}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="cookie-banner__actions">
        {showSettings ? (
          <button type="button" className="cookie-banner__btn" onClick={() => save(choice)}>
            Guardar preferencias
          </button>
        ) : (
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--ghost"
            onClick={() => setShowSettings(true)}
          >
            Configurar
          </button>
        )}
        <button
          type="button"
          className="cookie-banner__btn"
          onClick={() => save({ analytics: false, marketing: false })}
        >
          Rechazar
        </button>
        <button
          type="button"
          className="cookie-banner__btn"
          onClick={() => save({ analytics: true, marketing: true })}
        >
          Aceptar
        </button>
      </div>
    </section>
  )
}
