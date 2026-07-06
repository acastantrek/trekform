import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
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
    text: 'Gestión simultánea de un alto volumen de cursos manteniendo los estándares de calidad.',
  },
  {
    icon: HardHat,
    title: 'Equipo técnico cualificado',
    text: 'Profesionales especialistas en sus áreas y con amplia experiencia práctica.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Experiencia en grandes empresas',
    text: 'Planes a medida para pymes, organizaciones y grandes cuentas.',
  },
]

const faqs = [
  {
    question: '¿Dónde puedo realizar el curso?',
    answer:
      'Impartimos formación abierta y a medida en todo el territorio nacional, incluyendo Barcelona, Madrid, Zaragoza, Valencia, Tarragona, Canarias, Mallorca, Sevilla, Bilbao, Lleida y Pontevedra.',
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
  {
    question: '¿Qué tipo de carretilla se puede conducir con el carnet?',
    answer:
      'La formación puede incluir carretillas frontales, retráctiles, apiladores, recogepedidos y transpaletas.',
  },
  {
    question: '¿Cuándo es obligatoria la formación de trabajos en altura?',
    answer:
      'Los trabajadores expuestos a tareas a más de dos metros deben recibir formación específica sobre riesgos, equipos y medidas preventivas.',
  },
  {
    question: '¿Los formadores son especialistas en PRL?',
    answer:
      'Sí. Las formaciones son impartidas por técnicos especialistas en prevención con experiencia acreditada.',
  },
]

export function AboutPage() {
  return (
    <>
      <section className="about-page-hero">
        <div>
          <span>Más de 20 años formando a profesionales</span>
          <h1>¿Quiénes somos?</h1>
          <p>
            Inicio <i /> ¿Quiénes somos?
          </p>
        </div>
      </section>
      <section className="who-section">
        <div className="who-image">
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=85"
            alt="Equipo profesional de Trekform"
          />
          <span>
            <strong>20</strong> años de experiencia
          </span>
        </div>
        <div className="who-copy">
          <span className="kicker">CONOCE TREKFORM</span>
          <h2>¿Quién es Trekform?</h2>
          <p>
            Somos una empresa de consultoría y formación especializada en prevención de riesgos
            laborales y manejo de maquinaria industrial.
          </p>
          <p>
            Tras más de dos décadas, seguimos trabajando para ser una referencia estatal en
            formación, seguridad y excelencia técnica.
          </p>
          <div className="who-progress">
            <div>
              <strong>90%</strong>
              <span>Formación práctica</span>
            </div>
            <i />
          </div>
        </div>
      </section>
      <section className="success-section">
        <div className="center-heading">
          <span className="kicker">TREKFORM</span>
          <h2>Claves de nuestro éxito</h2>
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
          <span className="kicker light">DEPARTAMENTO DE FORMACIÓN</span>
          <h2>Amplio equipo de instructores</h2>
          <p>
            Técnicos especialistas en PRL para impartir todas nuestras formaciones. Cada formador
            cuenta con una sólida trayectoria profesional.
          </p>
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
          <h2>Trekform responde</h2>
          <p>
            Resolvemos las dudas habituales sobre nuestros cursos, acreditaciones y formación para
            empresas.
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
        <h2>Formación para avanzar con seguridad.</h2>
        <Link to="/cursos-trekform" className="primary">
          Descubre nuestros cursos
        </Link>
      </section>
    </>
  )
}

