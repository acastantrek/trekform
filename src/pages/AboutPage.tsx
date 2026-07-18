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
import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getGeneralFaqs, type Faq } from '../services/faqs'

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

export function AboutPage() {
  useScrollReveal()
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [faqs, setFaqs] = useState<Faq[]>([])

  useEffect(() => {
    getGeneralFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]))
  }, [])

  return (
    <>
      <section className="about-page-hero" data-reveal>
        <div className="about-hero-copy" data-reveal data-reveal-delay="0.04">
          <span data-reveal data-reveal-delay="0.06">Más de 20 años formando a profesionales</span>
          <h1 data-reveal data-reveal-delay="0.1">
            Tu partner en formación <span>y seguridad laboral</span>
          </h1>
          <p data-reveal data-reveal-delay="0.14">
            {isMobile ? (
              'Somos especialistas en prevención de riesgos laborales y manejo de maquinaria industrial.'
            ) : (
              <>
                Somos especialistas en prevención de riesgos laborales y manejo de maquinaria
                industrial. Formamos a particulares y empresas con una metodología práctica,
                certificada y orientada al trabajo real.
              </>
            )}
          </p>
          <div className="about-hero-actions" data-reveal data-reveal-delay="0.18">
            <Link to="/cursos-trekform">
              Ver cursos <ArrowRight size={18} />
            </Link>
            <Link to="/contacto">Solicitar información</Link>
          </div>
        </div>
        <div className="about-hero-media" data-reveal data-reveal-delay="0.12">
          <img
            src="/brand/about-hero-forklift-cropped.png"
            alt="Formación Trekform"
          />
        </div>
      </section>

      <section className="about-proof-strip" data-reveal>
        <article data-reveal data-reveal-delay="0.04">
          <Award />
          <strong>20+</strong>
          <span>Años de experiencia</span>
        </article>
        <article data-reveal data-reveal-delay="0.08">
          <HardHat />
          <strong>200.000+</strong>
          <span>Alumnos formados</span>
        </article>
        <article data-reveal data-reveal-delay="0.12">
          <Building2 />
          <strong>4.000+</strong>
          <span>Empresas cliente</span>
        </article>
        <article data-reveal data-reveal-delay="0.16">
          <ShieldCheck />
          <strong>18.000+</strong>
          <span>Cursos impartidos</span>
        </article>
      </section>

      <section className="who-section" data-reveal>
        <div className="who-image" data-reveal data-reveal-delay="0.06">
          <img
            src="https://trekform.com/trekform/uploads/assets/images/resources/about-one-img-2.jpg"
            alt="Equipo profesional de Trekform"
          />
          <span>
            <strong>+20</strong> años de experiencia
          </span>
        </div>
        <div className="who-copy" data-reveal data-reveal-delay="0.12">
          <span className="kicker" data-reveal data-reveal-delay="0.14">CONOCE TREKFORM</span>
          <h2 data-reveal data-reveal-delay="0.18">
            Formación práctica <span>para trabajar con seguridad</span>
          </h2>
          <p data-reveal data-reveal-delay="0.22">
            Trekform nace con una idea clara: ayudar a profesionales y empresas a trabajar de forma
            más segura, eficiente y preparada. Combinamos formación técnica, práctica real y
            acompañamiento administrativo para que cada curso tenga impacto en el puesto de trabajo.
          </p>
          <p data-reveal data-reveal-delay="0.26">
            Nuestra experiencia nos permite adaptar programas, calendarios y modalidades a las
            necesidades de cada cliente, desde cursos abiertos hasta planes in-company.
          </p>
          <ul className="who-checks" data-reveal data-reveal-delay="0.3">
            <li data-reveal data-reveal-delay="0.32">
              <CheckCircle2 /> Formación homologada y certificada
            </li>
            <li data-reveal data-reveal-delay="0.36">
              <CheckCircle2 /> Instructores expertos en activo
            </li>
            <li data-reveal data-reveal-delay="0.4">
              <CheckCircle2 /> Cursos para particulares y empresas
            </li>
          </ul>
        </div>
      </section>

      <section className="success-section" data-reveal>
        <div className="center-heading" data-reveal data-reveal-delay="0.05">
          <span className="kicker">TREKFORM</span>
          <h2>
            Claves de <span>nuestro éxito</span>
          </h2>
        </div>
        <div className="strength-grid">
          {strengths.map(({ icon: Icon, title, text }, index) => (
            <article key={title} data-reveal style={{ '--reveal-delay': `${0.06 + index * 0.05}s` } as CSSProperties}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="team-section" data-reveal>
        <div data-reveal data-reveal-delay="0.06">
          <span className="kicker" data-reveal data-reveal-delay="0.08">DEPARTAMENTO DE FORMACIÓN</span>
          <h2 data-reveal data-reveal-delay="0.12">
            Un equipo técnico preparado <span>para formar en entornos reales</span>
          </h2>
          <p data-reveal data-reveal-delay="0.16">
            Nuestros instructores son técnicos especialistas en PRL y maquinaria industrial. Su
            experiencia práctica permite impartir formaciones claras, útiles y alineadas con las
            exigencias del puesto de trabajo.
          </p>
          <Link to="/contacto" data-reveal data-reveal-delay="0.2">
            Hablar con Trekform <ArrowRight size={18} />
          </Link>
        </div>
        <div className="team-image" data-reveal data-reveal-delay="0.14">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85"
            alt="Equipo de instructores"
          />
          <span>
            <ShieldCheck /> Especialistas en seguridad
          </span>
        </div>
      </section>

      {faqs.length > 0 ? (
        <section className="faq-section" data-reveal>
          <div className="faq-heading" data-reveal data-reveal-delay="0.05">
            <span className="kicker">PREGUNTAS FRECUENTES</span>
            <h2>
              Trekform <span>responde</span>
            </h2>
            <p>
              Resolvemos las dudas habituales sobre cursos, acreditaciones y formación para
              empresas.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details
                key={faq.id}
                data-reveal
                style={{ '--reveal-delay': `${0.06 + index * 0.04}s` } as CSSProperties}
              >
                <summary>
                  {faq.question}
                  <ChevronDown />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="about-cta" data-reveal>
        <span data-reveal data-reveal-delay="0.04">¡POR TU SEGURIDAD, ESCOGE TREKFORM!</span>
        <h2 data-reveal data-reveal-delay="0.08">
          Formación para avanzar <span>con seguridad.</span>
        </h2>
        <Link to="/cursos-trekform" className="primary" data-reveal data-reveal-delay="0.12">
          Descubre nuestros cursos <ArrowRight size={18} />
        </Link>
      </section>
    </>
  )
}
