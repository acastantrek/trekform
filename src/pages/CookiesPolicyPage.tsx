import { Cookie } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { openCookieSettings } from '../lib/cookieConsent'

// Keep this page in sync with what the site really stores. If an analytics or
// advertising script is ever added, it must load only after hasConsent() and be
// listed here with its provider, purpose and duration.
export function CookiesPolicyPage() {
  useScrollReveal()

  return (
    <div className="legal-page">
      <section className="legal-page-hero" data-reveal>
        <span data-reveal data-reveal-delay="0.04">
          <Cookie size={16} /> Uso de cookies
        </span>
        <h1 data-reveal data-reveal-delay="0.08">
          Política de <span>cookies</span>
        </h1>
      </section>

      <section className="legal-page-content">
        <article>
          <section>
            <h2>¿Qué son las cookies?</h2>
            <p>
              Las cookies y tecnologías similares (como el almacenamiento local del navegador) son
              pequeños ficheros o datos que una web guarda en tu dispositivo para recordar
              información entre visitas o mientras navegas. Algunas son imprescindibles para que la
              web funcione; otras sirven para analizar el uso del sitio o mostrar publicidad, y solo
              pueden utilizarse con tu consentimiento.
            </p>
            <p>
              El responsable de este sitio web es TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL
              (NIF B-63695662). Puedes consultar el resto de sus datos en el{' '}
              <Link to="/aviso-legal">aviso legal</Link>.
            </p>
          </section>

          <section>
            <h2>¿Qué utiliza www.trekform.com?</h2>
            <p>
              <strong>Esta web no utiliza cookies de análisis ni de publicidad.</strong> No usamos
              Google Analytics, píxeles publicitarios ni herramientas de seguimiento. Lo único que
              se guarda en tu navegador es lo estrictamente necesario para que la web funcione:
            </p>
            <dl>
              <div>
                <dt>Preferencias de cookies</dt>
                <dd>
                  <strong>trekform-cookie-consent</strong> · Propia · Almacenamiento local del
                  navegador · 24 meses. Recuerda la opción que elegiste en el aviso de cookies para
                  no volver a preguntarte en cada visita.
                </dd>
              </div>
              <div>
                <dt>Sesión del área de administración</dt>
                <dd>
                  <strong>sb-…-auth-token</strong> · Propia (servicio Supabase) · Almacenamiento
                  local del navegador · Hasta cerrar sesión. Solo se crea si inicias sesión en el
                  panel de administración de Trekform, para mantener la sesión abierta. Los
                  visitantes de la web no la reciben.
                </dd>
              </div>
            </dl>
            <p>
              Estas tecnologías son técnicas y necesarias, por lo que no requieren consentimiento
              según el artículo 22.2 de la Ley 34/2002 (LSSI).
            </p>
          </section>

          <section>
            <h2>Contenido de terceros: vídeos de YouTube</h2>
            <p>
              Algunas páginas incluyen vídeos de YouTube (Google). Los cargamos en modo de
              privacidad mejorada (<strong>youtube-nocookie.com</strong>) y solo cuando pulsas el
              botón de reproducir: hasta entonces no se establece ninguna conexión con YouTube. Al
              reproducir un vídeo, YouTube puede guardar datos en tu navegador conforme a su propia{' '}
              <a
                href="https://policies.google.com/technologies/cookies?hl=es"
                target="_blank"
                rel="noopener noreferrer"
              >
                política de cookies
              </a>
              .
            </p>
            <p>
              Los enlaces a nuestras redes sociales (Facebook, Instagram, LinkedIn, X y YouTube) son
              enlaces normales: no cargan nada de esas plataformas hasta que haces clic en ellos.
            </p>
          </section>

          <section>
            <h2>Gestionar tus preferencias</h2>
            <p>
              Puedes revisar o cambiar tu elección en cualquier momento desde el enlace «Configurar
              cookies» del pie de página o con este botón:
            </p>
            <p>
              <button type="button" className="legal-cookie-settings" onClick={openCookieSettings}>
                <Cookie size={16} aria-hidden="true" /> Configurar cookies
              </button>
            </p>
            <p>
              Si en el futuro incorporamos cookies de análisis o publicidad, solo se activarán si
              las aceptas expresamente, y las detallaremos en esta página.
            </p>
            <p>
              También puedes borrar o bloquear las cookies y el almacenamiento local desde la
              configuración de tu navegador:
            </p>
            <ul className="legal-link-list">
              <li>
                <strong>Chrome</strong>:{' '}
                <a
                  href="https://support.google.com/chrome/answer/95647?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support.google.com/chrome
                </a>
              </li>
              <li>
                <strong>Firefox</strong>:{' '}
                <a
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support.mozilla.org
                </a>
              </li>
              <li>
                <strong>Safari</strong>:{' '}
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support.apple.com
                </a>
              </li>
              <li>
                <strong>Edge</strong>:{' '}
                <a
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support.microsoft.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2>Actualizaciones de esta política</h2>
            <p>
              Podemos actualizar esta política si cambian las tecnologías que utiliza la web. Te
              recomendamos revisarla periódicamente.
            </p>
            <p>Última actualización: noviembre de 2026.</p>
          </section>
        </article>
      </section>
    </div>
  )
}
