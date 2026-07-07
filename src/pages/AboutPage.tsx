import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  HardHat,
  MapPinned,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const strengths = [
  {
    icon: MapPinned,
    title: 'Cobertura nacional',
    text: 'Cursos abiertos y formación a medida en las principales ciudades del país.',
  },
  {
    icon: CalendarClock,
    title: 'Flexibilidad de fechas y horarios',
    text: 'Planes formativos adaptados al calendario y a las necesidades de cada cliente.',
  },
  {
    icon: Zap,
    title: 'Inmediatez',
    text: 'Capacidad de respuesta rápida incluso ante solicitudes formativas urgentes.',
  },
  {
    icon: Building2,
    title: 'Gran estructura profesional',
    text: 'Gestión simultánea de un alto volumen de cursos manteniendo estándares de calidad.',
  },
  {
    icon: HardHat,
    title: 'Equipo técnico cualificado',
    text: 'Profesionales especialistas en sus áreas y con amplia experiencia práctica.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Experiencia en empresas',
    text: 'Planes a medida para pymes, organizaciones y grandes cuentas.',
  },
]

const faqs = [
  {
    question: '¿Dónde puedo realizar el curso?',
    answer:
      'Impartimos formación abierta y a medida en todo el territorio nacional, incluyendo Barcelona, Madrid, Zaragoza, Valencia, Canarias, Sevilla, Bilbao y Pontevedra.',
  },
  {
    question: '¿Puedo bonificar mi formación si soy empresa?',
    answer:
      'Sí. Las empresas pueden utilizar su crédito FUNDAE y nuestro equipo puede encargarse de la gestión administrativa.',
  },
  {
    question: '¿Necesito el carnet de conducir B para manejar carretillas elevadoras?',
    answer:
      'No es necesario dentro de instalaciones privadas. Para circular por vías públicas sí se requiere el permiso correspondiente.',
  },
  {
    question: '¿Cuándo caduca el carnet de carretillero?',
    answer:
      'No tiene una caducidad legal fija, aunque se recomienda actualizar la formación cada cuatro o cinco años.',
  },
]

export function AboutPage() {
  return (
    <>
      <section className="about-page-hero">
        <div className="about-hero-copy">
          <span>Más de 20 años formando a profesionales</span>
          <h1>
            Tu partner en formación <span>y seguridad laboral</span>
          </h1>
          <p>
            Somos especialistas en prevención de riesgos laborales y manejo de maquinaria
            industrial. Formamos a particulares y empresas con una metodología práctica, certificada
            y orientada al trabajo real.
          </p>
          <div className="about-hero-actions">
            <Link to="/cursos-trekform">
              Ver cursos <ArrowRight size={18} />
            </Link>
            <Link to="/contacto">Solicitar información</Link>
          </div>
        </div>
        <div className="about-hero-media">
          <img
            src="https://trekform.com/trekform/uploads/assets/images/Sobre_nosotros/carretilla-trekform-2.jpg"
            alt="Formación Trekform"
          />
        </div>
      </section>

      <section className="about-proof-strip">
        <article>
          <Award />
          <strong>20+</strong>
          <span>Años de experiencia</span>
        </article>
        <article>
          <HardHat />
          <strong>200.000+</strong>
          <span>Alumnos formados</span>
        </article>
        <article>
          <Building2 />
          <strong>4.000+</strong>
          <span>Empresas cliente</span>
        </article>
        <article>
          <ShieldCheck />
          <strong>18.000+</strong>
          <span>Cursos impartidos</span>
        </article>
      </section>

      <section className="who-section">
        <div className="who-image">
          <img
            src="https://trekform.com/trekform/uploads/assets/images/resources/about-one-img-2.jpg"
            alt="Equipo profesional de Trekform"
          />
          <span>
            <strong>20</strong> años de experiencia
          </span>
        </div>
        <div className="who-copy">
          <span className="kicker">CONOCE TREKFORM</span>
          <h2>
            Formación práctica <span>para trabajar con seguridad</span>
          </h2>
          <p>
            Trekform nace con una idea clara: ayudar a profesionales y empresas a trabajar de forma
            más segura, eficiente y preparada. Combinamos formación técnica, práctica real y
            acompañamiento administrativo para que cada curso tenga impacto en el puesto de trabajo.
          </p>
          <p>
            Nuestra experiencia nos permite adaptar programas, calendarios y modalidades a las
            necesidades de cada cliente, desde cursos abiertos hasta planes in-company.
          </p>
          <ul className="who-checks">
            <li>
              <CheckCircle2 /> Formación homologada y certificada
            </li>
            <li>
              <CheckCircle2 /> Instructores expertos en activo
            </li>
            <li>
              <CheckCircle2 /> Cursos para particulares y empresas
            </li>
          </ul>
        </div>
      </section>

      <section className="success-section">
        <div className="center-heading">
          <span className="kicker">TREKFORM</span>
          <h2>
            Claves de <span>nuestro éxito</span>
          </h2>
        </div>
        <div className="strength-grid">
          {strengths.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="team-section">
        <div>
          <span className="kicker">DEPARTAMENTO DE FORMACIÓN</span>
          <h2>
            Un equipo técnico preparado <span>para formar en entornos reales</span>
          </h2>
          <p>
            Nuestros instructores son técnicos especialistas en PRL y maquinaria industrial. Su
            experiencia práctica permite impartir formaciones claras, útiles y alineadas con las
            exigencias del puesto de trabajo.
          </p>
          <Link to="/contacto">
            Hablar con Trekform <ArrowRight size={18} />
          </Link>
        </div>
        <div className="team-image">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85"
            alt="Equipo de instructores"
          />
          <span>
            <ShieldCheck /> Especialistas en seguridad
          </span>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-heading">
          <span className="kicker">PREGUNTAS FRECUENTES</span>
          <h2>
            Trekform <span>responde</span>
          </h2>
          <p>
            Resolvemos las dudas habituales sobre cursos, acreditaciones y formación para empresas.
          </p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>
                {faq.question}
                <ChevronDown />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <span>¡POR TU SEGURIDAD, ESCOGE TREKFORM!</span>
        <h2>
          Formación para avanzar <span>con seguridad.</span>
        </h2>
        <Link to="/cursos-trekform" className="primary">
          Descubre nuestros cursos <ArrowRight size={18} />
        </Link>
      </section>
    </>
  )
}
