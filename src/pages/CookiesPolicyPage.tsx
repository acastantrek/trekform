import { Cookie } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

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
            <h2>¿Qué es una cookie?</h2>
            <p>
              Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas
              web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar
              información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de
              la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para
              reconocer al usuario.
            </p>
          </section>

          <section>
            <h2>¿Qué tipos de cookies utiliza www.trekform.com?</h2>
            <p>Según el plazo de tiempo que permanecen activas las cookies pueden ser:</p>
            <dl>
              <div>
                <dt>Cookies de sesión</dt>
                <dd>
                  Diseñadas para recabar y almacenar datos mientras el usuario accede a una página web. Se
                  suelen emplear para almacenar información que sólo interesa conservar para la
                  prestación del servicio solicitado por el usuario en una sola ocasión (por ejemplo, una
                  lista de productos adquiridos).
                </dd>
              </div>
              <div>
                <dt>Cookies persistentes</dt>
                <dd>
                  Son un tipo de cookies por las que los datos siguen almacenados en el terminal y puede
                  accederse a ellos y ser tratados durante un periodo definido. Tienen fecha de borrado.
                  Se utilizan por ejemplo en el proceso de compra o registro para evitar tener que
                  introducir nuestros datos constantemente.
                </dd>
              </div>
            </dl>

            <p>
              Según quien sea la entidad que gestione el equipo o dominio desde donde se envían las
              cookies y trate los datos que se obtengan, podemos distinguir:
            </p>
            <dl>
              <div>
                <dt>Cookies propias</dt>
                <dd>
                  Son aquellas que se envían al dispositivo del usuario gestionado exclusivamente por
                  nosotros para el mejor funcionamiento del sitio.
                </dd>
              </div>
              <div>
                <dt>Cookies de terceros</dt>
                <dd>
                  Son aquellas que se envían al dispositivo del usuario desde un equipo o dominio que no
                  es gestionado por nosotros sino por otra entidad, que tratará los datos obtenidos.
                </dd>
              </div>
            </dl>

            <p>
              Cuando navegues por www.trekform.com se pueden instalar en tu dispositivo las siguientes
              cookies:
            </p>
            <dl>
              <div>
                <dt>Cookies de registro</dt>
                <dd>
                  Cuando el usuario entra en nuestra web e inicia sesión se instala una cookie propia y
                  temporal para que pueda navegar por su zona de usuario sin tener que introducir sus
                  datos continuamente. Esta cookie desaparecerá cuando cierre sesión.
                </dd>
              </div>
              <div>
                <dt>Cookies de análisis</dt>
                <dd>
                  Sirven para estudiar el comportamiento de los usuarios de forma anónima al navegar por
                  nuestra web. Así podremos conocer los contenidos más vistos, el número de visitantes,
                  etc. Una información que utilizaremos para mejorar la experiencia de navegación y
                  optimizar nuestros servicios. Pueden ser propias pero también de terceros. Entre éstas
                  últimas se encuentran las cookies de Google Analytics (Google), Google AdWords (Google),
                  Alexa Metrics (Alexa Internet, Inc), las de Iadvice (iAdvize SAS).
                </dd>
              </div>
              <div>
                <dt>Cookies publicitarias de terceros</dt>
                <dd>
                  El objetivo es optimizar la exposición de anuncios publicitarios. Para gestionar estos
                  servicios utilizamos la plataforma de Doubleclick de Google que almacena información
                  sobre los anuncios que han sido mostrados a un usuario, los que le interesan y si visita
                  la web del anunciante.
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>Configuración, consulta y desactivación de cookies</h2>
            <p>
              Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la
              configuración de las opciones del navegador instalado en su ordenador:
            </p>
            <ul className="legal-link-list">
              <li>
                <strong>Chrome</strong>, desde{' '}
                <a
                  href="https://support.google.com/chrome/bin/answer.py?hl=es&answer=95647"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support.google.com/chrome
                </a>
              </li>
              <li>
                <strong>Safari</strong>, desde{' '}
                <a href="https://support.apple.com/kb/ph5042" target="_blank" rel="noopener noreferrer">
                  support.apple.com/kb/ph5042
                </a>
              </li>
              <li>
                <strong>Explorer</strong>, desde{' '}
                <a
                  href="http://windows.microsoft.com/es-es/windows7/how-to-manage-cookies-in-internet-explorer-9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  windows.microsoft.com
                </a>
              </li>
              <li>
                <strong>Firefox</strong>, desde{' '}
                <a
                  href="http://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-que-los-sitios-we"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support.mozilla.org
                </a>
              </li>
            </ul>

            <p>
              Todo lo relativo a las cookies de Google, tanto analíticas como publicitarias, así como su
              administración y configuración se puede consultar en:
            </p>
            <ul className="legal-link-list">
              <li>
                <a
                  href="https://www.google.es/intl/es/policies/technologies/types/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  google.es/intl/es/policies/technologies/types
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.es/policies/technologies/ads/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  google.es/policies/technologies/ads
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  developers.google.com/analytics/.../cookie-usage
                </a>
              </li>
            </ul>

            <p>
              Si decide deshabilitar las Cookies no podremos ofrecerle algunos de nuestros servicios como,
              por ejemplo, permanecer identificado o mantener las compras en su carrito.
            </p>
          </section>

          <section>
            <h2>Actualización de cookies</h2>
            <p>
              Las cookies de www.trekform.com pueden ser actualizadas por lo que aconsejamos que revisen
              nuestra política de forma periódica.
            </p>
          </section>
        </article>
      </section>
    </div>
  )
}
