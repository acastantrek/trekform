import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Monitor,
  Percent,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCourseDetail, type CourseDetail } from '../services/courses'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
})

function accentedTitle(text: string) {
  const words = text.split(' ')
  const splitAt = Math.max(1, Math.ceil(words.length / 2))
  return (
    <>
      {words.slice(0, splitAt).join(' ')} <span>{words.slice(splitAt).join(' ')}</span>
    </>
  )
}

function splitParagraphs(text: string) {
  return text
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function formatDuration(minutes: number | null) {
  if (!minutes) return 'Consultar'
  if (minutes % 60 === 0) return `${minutes / 60} horas`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} min`

  return `${hours} h ${remainder} min`
}

function getModalityLabel(modality: string) {
  if (modality === 'online') return 'Online'
  if (modality === 'hybrid') return 'Híbrida'
  return 'Presencial'
}

function getAudienceLabel(audience: CourseDetail['audience']) {
  if (audience === 'companies') return 'Empresas'
  if (audience === 'individuals') return 'Particulares'
  return 'Particulares y empresas'
}

export function CourseDetailPage() {
  const { slug = '' } = useParams()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getCourseDetail(slug)
      .then((data) => {
        if (active) setCourse(data)
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Error inesperado.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="course-detail-loading" role="status">
        <span />
        <p>Cargando información del curso…</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <section className="course-detail-missing">
        <span>CURSO NO DISPONIBLE</span>
        <h1>
          No hemos encontrado <span>esta formación.</span>
        </h1>
        {error && <p>{error}</p>}
        <Link to="/cursos-trekform">
          <ArrowLeft size={17} /> Volver al catálogo
        </Link>
      </section>
    )
  }

  const descriptionParagraphs = splitParagraphs(course.description)
  const objectiveParagraphs = splitParagraphs(course.objectives)
  const audienceParagraphs = splitParagraphs(course.audienceDescription)
  const methodologyParagraphs = splitParagraphs(course.methodology)
  const modality = getModalityLabel(course.modality)
  const durationLabel = formatDuration(course.durationMinutes)
  const methodologyLabel = course.methodology || 'Teórico-práctica'
  const certificationLabel = course.certificationName || 'Diploma acreditativo Trekform'
  const trustCards = [
    {
      title: course.sidebarCertificationTitle,
      text: course.sidebarCertificationText,
      icon: <ShieldCheck size={22} />,
    },
    {
      title: course.sidebarQualityTitle,
      text: course.sidebarQualityText,
      icon: <Star size={22} />,
    },
    {
      title: course.sidebarFundaeTitle,
      text: course.sidebarFundaeText,
      icon: <Percent size={22} />,
    },
  ].filter((item) => item.text)
  const factCards = [
    { label: 'Duración', value: durationLabel, icon: <Clock3 size={20} /> },
    {
      label: 'Modalidad',
      value: modality,
      icon: course.modality === 'online' ? <Monitor size={20} /> : <UsersRound size={20} />,
    },
    { label: 'Metodología', value: methodologyLabel, icon: <BookOpen size={20} /> },
    { label: 'Certificación', value: certificationLabel, icon: <Award size={20} /> },
  ]
  const contentSections = [
    {
      kicker: 'OBJETIVOS',
      title: 'Qué vas a conseguir',
      paragraphs: objectiveParagraphs,
      variant: 'list' as const,
    },
    {
      kicker: 'A QUIÉN VA DIRIGIDO',
      title: `Pensado para ${getAudienceLabel(course.audience).toLowerCase()}`,
      paragraphs: audienceParagraphs,
      variant: 'list' as const,
    },
    {
      kicker: 'METODOLOGÍA',
      title: 'Cómo se desarrolla la formación',
      paragraphs: methodologyParagraphs,
      variant: 'text' as const,
    },
  ].filter((section) => section.paragraphs.length)

  return (
    <div className="course-detail-page">
      <section className="course-detail-hero">
        <div
          className="course-detail-hero-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url('${course.image}')` }}
        />
        <div className="course-detail-hero-grid">
          <div className="course-detail-copy">
            <div className="course-detail-categories">
              {course.categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
              <span>{modality}</span>
            </div>
            <h1>{accentedTitle(course.title)}</h1>
            <p className="course-detail-excerpt">{course.heroText || course.excerpt}</p>
            <div className="course-detail-hero-actions">
              <Link to="/inscripciones" className="course-detail-primary">
                Ver convocatorias <ArrowRight size={18} />
              </Link>
              <Link to="/contacto" className="course-detail-secondary">
                Solicitar información
              </Link>
            </div>
          </div>

          <aside className="course-detail-hero-card">
            <span>{course.isOfficialCertification ? 'Certificación oficial' : 'Formación acreditativa'}</span>
            <strong>
              {course.isFundaeEligible
                ? 'Bonificable por FUNDAE para empresas'
                : 'Formación práctica adaptada a necesidades reales'}
            </strong>
            <p>
              {course.isFundaeEligible
                ? 'Gestionamos formación abierta o in-company con enfoque práctico, seguro y orientado al puesto de trabajo.'
                : 'Curso pensado para mejorar la seguridad, la cualificación y la empleabilidad del alumno.'}
            </p>
            <div className="course-detail-hero-card-meta">
              <article>
                <ShieldCheck size={16} />
                <span>{certificationLabel}</span>
              </article>
              <article>
                <Clock3 size={16} />
                <span>{durationLabel}</span>
              </article>
            </div>
          </aside>
        </div>

        <div className="course-detail-breadcrumb-box">
          <ul className="course-detail-breadcrumb" aria-label="Breadcrumb">
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <ChevronRight size={12} />
            </li>
            <li>
              <Link to="/cursos-trekform">Cursos</Link>
            </li>
            <li>
              <ChevronRight size={12} />
            </li>
            <li>
              <span>{course.categories[0]}</span>
            </li>
          </ul>
        </div>

      </section>

      <div className="course-detail-overview">
        {factCards.map((item) => (
          <article key={item.label}>
            {item.icon}
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <section className="course-detail-main">
        <div className="course-detail-content-column">
          <div className="course-detail-intro-card">
            <span className="course-detail-kicker">SOBRE EL CURSO</span>
            <h2>
              Formación diseñada para <span>aplicarse de verdad.</span>
            </h2>
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`}>{paragraph}</p>
            ))}
          </div>

          {contentSections.length ? (
            <div className="course-detail-story-grid">
              {contentSections.map((section) => (
                <article className="course-detail-story-card" key={section.kicker}>
                  <span className="course-detail-kicker">{section.kicker}</span>
                  <h3>{section.title}</h3>
                  {section.variant === 'list' ? (
                    <ul>
                      {section.paragraphs.map((paragraph, index) => (
                        <li key={`${section.kicker}-${index}`}>
                          <Check size={15} />
                          <span>{paragraph}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    section.paragraphs.map((paragraph, index) => (
                      <p key={`${section.kicker}-${index}`}>{paragraph}</p>
                    ))
                  )}
                </article>
              ))}
            </div>
          ) : null}

          {trustCards.length ? (
            <div className="course-detail-trust-row">
              {trustCards.map((card) => (
                <article key={card.title}>
                  {card.icon}
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="course-detail-sidebar">
          <span>INFORMACIÓN DEL CURSO</span>
          <h2>{accentedTitle(course.shortTitle)}</h2>
          <dl>
            <div>
              <dt>Duración</dt>
              <dd>{durationLabel}</dd>
            </div>
            <div>
              <dt>Modalidad</dt>
              <dd>{modality}</dd>
            </div>
            <div>
              <dt>Dirigido a</dt>
              <dd>{getAudienceLabel(course.audience)}</dd>
            </div>
            <div>
              <dt>Certificación</dt>
              <dd>{certificationLabel}</dd>
            </div>
          </dl>
          <Link to="/inscripciones">
            Inscríbete ahora <ArrowRight size={18} />
          </Link>
          <p className="course-detail-sidebar-note">
            <ShieldCheck size={14} /> Sin compromiso · Respuesta en menos de 24h
          </p>
          <div className="course-detail-sidebar-links">
            {course.brochureUrl ? (
              <a href={course.brochureUrl} className="course-detail-text-link" target="_blank" rel="noreferrer">
                <FileText size={14} /> Descargar ficha
              </a>
            ) : null}
            <Link to="/contacto" className="course-detail-contact">
              Habla con nuestro equipo
            </Link>
          </div>
        </aside>
      </section>

      {course.modules.length ? (
        <section className="course-detail-program">
        <div className="course-detail-section-heading">
          <div>
            <span className="course-detail-kicker">PROGRAMA FORMATIVO</span>
            <h2>
              Qué <span>aprenderás.</span>
            </h2>
          </div>
          <p>Un recorrido claro, progresivo y orientado a situaciones reales de trabajo.</p>
        </div>
          <div className="course-detail-modules">
            {course.modules.map((module, index) => (
              <details key={module.id}>
                <summary>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{module.title}</strong>
                  {module.durationMinutes ? <small>{formatDuration(module.durationMinutes)}</small> : null}
                  <i>+</i>
                </summary>
                <p>{module.description}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="course-detail-social-proof">
        <div className="course-detail-social-rating">
          <div className="course-detail-stars">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} fill="currentColor" />
            ))}
            <strong>4,8/5</strong>
          </div>
          <p>Basado en +2.300 valoraciones de alumnos</p>
        </div>
        <blockquote>
          “Formación muy práctica y profesores excelentes. Las instalaciones y la maquinaria en
          perfecto estado.”
          <cite>— Marta C.</cite>
        </blockquote>
      </section>

      <section className="course-detail-sessions">
        <div className="course-detail-section-heading">
          <div>
            <span className="course-detail-kicker">PRÓXIMAS CONVOCATORIAS</span>
            <h2>
              Elige tu fecha <span>y avanza.</span>
            </h2>
          </div>
          <p>Consulta la disponibilidad actual o pídenos una convocatoria adaptada a tu empresa.</p>
        </div>
        {course.sessions.length ? (
          <div className="course-detail-session-grid">
            {course.sessions.map((session) => (
              <article key={session.id}>
                <div className="course-detail-session-date">
                  <CalendarDays size={18} />
                  <strong>{dateFormatter.format(new Date(session.startsAt))}</strong>
                  <span>
                    {timeFormatter.format(new Date(session.startsAt))}–
                    {timeFormatter.format(new Date(session.endsAt))}
                  </span>
                </div>
                <div className="course-detail-session-body">
                  <span className={`course-detail-status ${session.status}`}>
                    {session.status === 'full' ? 'Completo' : 'Plazas disponibles'}
                  </span>
                  <h3>
                    {session.city}
                    {session.province ? `, ${session.province}` : ''}
                  </h3>
                  <p>
                    <MapPin size={15} /> {session.venue}
                  </p>
                </div>
                <div className="course-detail-session-price">
                  {session.status === 'open' ? (
                    <Link to="/inscripciones">
                      Inscríbete <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <span>Sin plazas</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="course-detail-no-sessions">
            <CalendarDays size={31} />
            <div>
              <h3>
                Consulta las <span>próximas fechas.</span>
              </h3>
              <p>Podemos organizar esta formación en convocatoria abierta o in-company.</p>
            </div>
            <Link to="/contacto">
              Solicitar información <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>

      <section className="course-detail-final-cta">
        <div>
          <span>¿TIENES DUDAS?</span>
          <h2>
            Te ayudamos <span>a elegir la formación adecuada.</span>
          </h2>
        </div>
        <p>
          Cuéntanos el perfil del alumno o las necesidades de tu empresa y te proponemos la mejor opción.
        </p>
        <Link to="/contacto">
          Contactar <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
