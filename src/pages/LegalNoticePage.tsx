import { Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'

export function LegalNoticePage() {
  useScrollReveal()

  return (
    <div className="legal-page">
      <section className="legal-page-hero" data-reveal>
        <span data-reveal data-reveal-delay="0.04">
          <Scale size={16} /> Información legal
        </span>
        <h1 data-reveal data-reveal-delay="0.08">
          Aviso <span>legal</span>
        </h1>
      </section>

      <section className="legal-page-content">
        <article>
          <section>
            <h2>Identificación del responsable del Sitio Web</h2>
            <p>
              En cumplimiento con lo dispuesto en el artículo 10 de la Ley 34/2002, de 11 de julio, de
              Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa
              que la entidad responsable del sitio web www.trekform.com (en adelante, el «Sitio Web»)
              es:
            </p>
            <dl>
              <div>
                <dt>Nombre Comercial</dt>
                <dd>Trekform</dd>
              </div>
              <div>
                <dt>Razón Social</dt>
                <dd>TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL</dd>
              </div>
              <div>
                <dt>NIF/CIF</dt>
                <dd>B-63695662</dd>
              </div>
              <div>
                <dt>Domicilio Social</dt>
                <dd>Carretera de Esplugues, nº66, 08940 Cornellà de Llobregat (Barcelona)</dd>
              </div>
              <div>
                <dt>Teléfono de Contacto</dt>
                <dd>93 264 05 32</dd>
              </div>
              <div>
                <dt>Correo Electrónico de Contacto</dt>
                <dd>direccioncomercial@trekform.com</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>Condiciones de uso del Sitio Web</h2>
            <p>
              El acceso al Sitio Web atribuye la condición de usuario e implica la aceptación plena y sin
              reservas de las disposiciones incluidas en este Aviso Legal, vigentes en el momento de
              acceso. Si el usuario no está de acuerdo con las condiciones, debe abstenerse de utilizar
              el Sitio Web.
            </p>
            <p>
              El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que
              www.trekform.com ofrece en el Sitio Web y a no emplearlos para actividades ilícitas,
              contrarias a la buena fe o al orden público.
            </p>
          </section>

          <section>
            <h2>Propiedad intelectual e industrial</h2>
            <p>
              Todos los contenidos del Sitio Web (incluyendo, entre otros, textos, imágenes, gráficos,
              logotipos, iconos, software, diseño y estructura) son propiedad exclusiva de
              www.trekform.com o de terceros que han autorizado su uso. Queda prohibida su reproducción,
              distribución, modificación, comunicación pública o cualquier otro uso, salvo autorización
              expresa por escrito del titular.
            </p>
          </section>

          <section>
            <h2>Responsabilidad</h2>
            <p>
              Www.trekform.com no se responsabiliza de los daños o perjuicios derivados del uso del Sitio
              Web. Esto incluye posibles errores en los contenidos, interrupciones del servicio o
              presencia de virus informáticos, aunque se tomen todas las medidas técnicas necesarias para
              prevenirlos.
            </p>
          </section>

          <section>
            <h2>Protección de datos personales</h2>
            <p>
              De conformidad con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica
              3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD),
              www.trekform.com informa:
            </p>
            <dl>
              <div>
                <dt>Responsable del Tratamiento</dt>
                <dd>TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL</dd>
              </div>
              <div>
                <dt>Finalidad</dt>
                <dd>
                  La recogida y tratamiento de datos personales a través del Sitio Web tiene como
                  finalidad gestionar las solicitudes, consultas y servicios ofrecidos.
                </dd>
              </div>
              <div>
                <dt>Legitimación</dt>
                <dd>Consentimiento del interesado o, en su caso, ejecución de un contrato.</dd>
              </div>
              <div>
                <dt>Destinatarios</dt>
                <dd>
                  Los datos no se cederán a terceros, salvo obligación legal o consentimiento expreso del
                  usuario.
                </dd>
              </div>
              <div>
                <dt>Derechos del Usuario</dt>
                <dd>
                  Los usuarios pueden ejercer sus derechos de acceso, rectificación, supresión,
                  limitación, oposición y portabilidad enviando un correo electrónico a
                  direccioncomercial@trekform.com o escribiendo al domicilio social indicado.
                </dd>
              </div>
            </dl>
            <p>
              Para más información, consulte nuestra <Link to="/politica-de-privacidad">Política de Privacidad</Link>.
            </p>
          </section>

          <section>
            <h2>Uso de Cookies</h2>
            <p>
              El Sitio Web utiliza cookies propias y de terceros con fines técnicos, analíticos y
              publicitarios. El usuario puede aceptar o rechazar su uso mediante la configuración
              disponible en la <Link to="/politica-de-cookies">Política de Cookies</Link>.
            </p>
          </section>

          <section>
            <h2>Enlaces externos</h2>
            <p>
              El Sitio Web puede contener enlaces a sitios web de terceros. www.trekform.com no se hace
              responsable de los contenidos, políticas de privacidad o prácticas de dichos sitios
              externos.
            </p>
          </section>

          <section>
            <h2>Legislación Aplicable y Jurisdicción</h2>
            <p>
              El presente Aviso Legal se rige íntegramente por la legislación española. Para cualquier
              controversia que pudiera derivarse del acceso o uso del Sitio Web, las partes se someten a
              los juzgados y tribunales del domicilio del usuario, siempre que se encuentre en territorio
              español.
            </p>
          </section>
        </article>
      </section>
    </div>
  )
}
