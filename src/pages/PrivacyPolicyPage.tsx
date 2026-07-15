import { ShieldCheck } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const paragraphs = [
  'A efectos de lo dispuesto en la Ley Orgánica 15/1999 de Protección de Datos de Carácter Personal, TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL informa al CLIENTE, que los datos de carácter personal necesarios como consecuencia de la solicitud de compra, transacciones, y/o contratación de productos y/o servicios que tengan lugar por cualquier medio, así como los procesos informáticos respecto de datos ya registrados, van a ser incorporados a un fichero creado bajo la responsabilidad de TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL, autorizando a esta sociedad para el tratamiento de dichos datos. La recogida y el citado tratamiento tienen por finalidad el mantenimiento de la relación contractual establecida entre las partes, la gestión, administración, prestación, ampliación y mejora de los servicios prestados, la adecuación de los mismos a las preferencias y gustos de los usuarios, el diseño de nuestros servicios, el envío de información técnica, operativa o comercial acerca de productos y servicios ofrecidos por TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL actualmente y en el futuro, a través de dicha compañía o de terceros.',
  'El CLIENTE podrá ejercitar los derechos de acceso, rectificación y cancelación de sus datos conforme a lo establecido en la instrucción 1/1998 de la Agencia de Protección de Datos, accediendo desde la web de la compañía, dirigiéndose por correo postal al responsable del tratamiento, Trekform, cuya dirección es Carretera de Esplugues Núm.66, Cornellá de Llobregat (Barcelona) o bien por correo electrónico a direccioncomercial@trekform.com.',
  'La respuesta a las cuestiones que se le han planteado y a los datos solicitados para formalizar su relación con TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL es totalmente potestativa, no existiendo obligación por parte de TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL de solicitar al CLIENTE su consentimiento para la recogida de los datos al referirse éstos a las partes del contrato o precontrato de la relación negocial y siendo necesarios para el mantenimiento y cumplimiento del mismo. De esta forma, la negativa del CLIENTE a facilitar los datos mínimos de carácter personal que se le hayan podido solicitar, determinará la falta de validez del contrato en cuanto son necesarios para la finalidad antes mencionada.',
  'Para la utilización de nuestro sitio web es necesario la utilización de cookies. Las cookies se utilizan con la finalidad de analizar el uso que hacen los usuarios de nuestro sitio web. Si usted lo desea puede configurar su navegador para ser avisado en pantalla de la recepción de cookies y para impedir la instalación de cookies en su disco duro. Por favor consulte las instrucciones y manuales de su navegador para ampliar esta información.',
  'El CLIENTE acepta que TREKFORM SERVICIOS INTEGRALES DE LA EMPRESA, SL puede proceder al envío al CLIENTE de comunicaciones comerciales, publicitarias y promocionales por correo electrónico, fax o por otros medios de comunicación electrónica equivalentes, por lo que los datos referentes a los mismos serán utilizados para llevar a cabo dichas comunicaciones, y ello al amparo de lo establecido en la Ley 34/2002 de 11 de Julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, y a la Ley 32/2003, de 3 de Noviembre, General de Telecomunicaciones. No obstante, le informamos que podrá revocar el consentimiento, en cada comunicado comercial o publicitario que se le haga llegar, y en cualquier momento, mediante notificación a esta compañía por correo postal o por correo electrónico a direccioncomercial@trekform.com.',
]

export function PrivacyPolicyPage() {
  useScrollReveal()

  return (
    <div className="legal-page">
      <section className="legal-page-hero" data-reveal>
        <span data-reveal data-reveal-delay="0.04">
          <ShieldCheck size={16} /> Protección de datos
        </span>
        <h1 data-reveal data-reveal-delay="0.08">
          Política de <span>privacidad</span>
        </h1>
      </section>

      <section className="legal-page-content">
        <article>
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
      </section>
    </div>
  )
}
