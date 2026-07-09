import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Monitor,
  ShieldCheck,
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
const moneyFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

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
  const sidebarCards = [
    {
      title: course.sidebarCertificationTitle,
      text: course.sidebarCertificationText,
    },
    {
      title: course.sidebarQualityTitle,
      text: course.sidebarQualityText,
    },
    {
      title: course.sidebarFundaeTitle,
      text: course.sidebarFundaeText,
    },
  ].filter((item) => item.text)

  return (
    <div className="course-detail-page">
      <section className="course-detail-hero">
        <div className="course-detail-copy">
          <nav aria-label="Migas de pan">
            <Link to="/">Inicio</Link>
            <ChevronRight size={13} />
            <Link to="/cursos-trekform">Cursos</Link>
            <ChevronRight size={13} />
            <span>{course.categories[0]}</span>
          </nav>
          <div className="course-detail-categories">
            {course.categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
          <h1>{accentedTitle(course.title)}</h1>
          <p>{course.excerpt}</p>
          <div className="course-detail-hero-actions">
            <Link to="/inscripciones" className="course-detail-primary">
              Ver convocatorias <ArrowRight size={18} />
            </Link>
            <Link to="/contacto" className="course-detail-secondary">
              Solicitar información
            </Link>
          </div>
        </div>
        <div className="course-detail-visual">
          <img src={course.image} alt={course.title} />
          <div>
            <ShieldCheck size={25} />
            <span>
              <strong>{course.isOfficialCertification ? 'Certificación oficial' : 'Formación acreditativa'}</strong>
              {course.isFundaeEligible
                ? ' Bonificable para empresas a través de FUNDAE.'
                : ' Orientada al trabajo seguro y la mejora profesional.'}
            </span>
          </div>
        </div>
      </section>

      <section className="course-detail-overview">
        <div>
          <Clock3 />
          <span>
            Duración
            <strong>{durationLabel}</strong>
          </span>
        </div>
        <div>
          {course.modality === 'online' ? <Monitor /> : <UsersRound />}
          <span>
            Modalidad<strong>{modality}</strong>
          </span>
        </div>
        <div>
          <BookOpen />
          <span>
            Metodología<strong>{methodologyLabel}</strong>
          </span>
        </div>
        <div>
          <Award />
          <span>
            Certificación<strong>{certificationLabel}</strong>
          </span>
        </div>
      </section>

      <section className="course-detail-main">
        <div className="course-detail-content">
          <span className="course-detail-kicker">SOBRE EL CURSO</span>
          <h2>
            Información útil <span>y aplicada.</span>
          </h2>
          <p className="course-detail-lead">{course.heroText || course.excerpt}</p>
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {!!objectiveParagraphs.length && (
            <div className="course-detail-audience">
              <span className="course-detail-kicker">OBJETIVOS</span>
              <h2>
                Qué vas <span>a conseguir.</span>
              </h2>
              {objectiveParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}

          {!!audienceParagraphs.length && (
            <div className="course-detail-audience">
              <span className="course-detail-kicker">A QUIÉN VA DIRIGIDO</span>
              <h2>
                Pensado para <span>{getAudienceLabel(course.audience).toLowerCase()}.</span>
              </h2>
              {audienceParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}

          {!!methodologyParagraphs.length && (
            <div className="course-detail-audience">
              <span className="course-detail-kicker">METODOLOGÍA</span>
              <h2>
                Cómo se desarrolla <span>la formación.</span>
              </h2>
              {methodologyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
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
          {sidebarCards.length ? (
            <div className="course-detail-editorial-list">
              {sidebarCards.map((card) => (
                <article key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          ) : null}
          <Link to="/inscripciones">
            Inscríbete ahora <ArrowRight size={18} />
          </Link>
          {course.brochureUrl ? (
            <a href={course.brochureUrl} className="course-detail-text-link" target="_blank" rel="noreferrer">
              <FileText size={14} /> Descargar ficha
            </a>
          ) : null}
          <small>¿Necesitas una formación a medida?</small>
          <Link to="/contacto" className="course-detail-contact">
            Habla con nuestro equipo
          </Link>
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
            <p>Contenido estructurado para que puedas aplicar la formación en situaciones reales.</p>
          </div>
          <div className="course-detail-modules">
            {course.modules.map((module, index) => (
              <details key={module.id} open={index === 0}>
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

      <section className="course-detail-sessions">
        <div className="course-detail-section-heading">
          <div>
            <span className="course-detail-kicker">PRÓXIMAS CONVOCATORIAS</span>
            <h2>
              Elige fecha <span>y lugar.</span>
            </h2>
          </div>
          <p>Las plazas se actualizan regularmente. Selecciona una convocatoria para continuar.</p>
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
                <div>
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
                  <strong>{moneyFormatter.format(session.priceCents / 100)}</strong>
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
              <p>Podemos organizar esta formación en convocatoria abierta o para tu empresa.</p>
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
            Te ayudamos <span>a elegir.</span>
          </h2>
        </div>
        <p>
          Cuéntanos qué formación buscas y encontraremos la opción adecuada para ti o tu empresa.
        </p>
        <Link to="/contacto">
          Contactar <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
