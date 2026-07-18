import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  MessageCircle,
  Monitor,
  Play,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { YoutubeLightbox } from '../components/common/YoutubeLightbox'
import { EnrollmentModal } from '../components/registrations/EnrollmentModal'
import { getCourseDetail, type CourseDetail, type CourseSession } from '../services/courses'
import type { RegistrationSession } from '../services/registrations'
import { getTestimonialsByCourse, type Testimonial } from '../services/testimonials'

const TYPOLOGY_CARDS = [
  {
    title: 'Curso Abierto',
    text: 'Dirigido a particulares y empresas. Se imparte en nuestras instalaciones presentes en todo el territorio nacional. Calendario de cursos flexible y actualizado.',
  },
  {
    title: 'Curso In-Company (a medida)',
    text: 'Personalizado para grupos de trabajadores de una misma empresa. Formación en nuestras instalaciones o directamente en las de tu empresa para mayor comodidad. Adaptable en fechas y horarios según tus necesidades.',
  },
]

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

function getYoutubeId(url: string | null) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/)
  return match ? match[1] : null
}

function getModalityLabel(modality: string) {
  if (modality === 'online') return 'Online'
  if (modality === 'hybrid') return 'Híbrida'
  return 'Presencial'
}

const sessionDayFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit' })
const sessionMonthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const sessionDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function getAudienceLabel(audience: CourseDetail['audience']) {
  if (audience === 'companies') return 'Empresas'
  if (audience === 'individuals') return 'Particulares'
  return 'Particulares y empresas'
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function toRegistrationSession(course: CourseDetail, session: CourseSession): RegistrationSession {
  return {
    id: session.id,
    slug: session.slug,
    courseSlug: course.slug,
    courseTitle: course.title,
    category: course.categories[0] ?? 'Formación',
    excerpt: course.excerpt,
    objectives: course.objectives,
    accreditationTitle: course.accreditationTitle,
    accreditationItems: course.accreditationItems,
    benefitsItems: course.benefitsItems,
    isOfficialCertification: course.isOfficialCertification,
    image: course.image,
    city: session.city,
    province: session.province,
    venue: session.venue,
    address: session.address,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    modality: getModalityLabel(course.modality),
    durationHours: course.durationMinutes ? course.durationMinutes / 60 : null,
    capacity: session.capacity,
    priceCents: session.priceCents,
    status: session.status,
  }
}

export function CourseDetailPage() {
  const { slug = '' } = useParams()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<RegistrationSession | null>(null)
  const [error, setError] = useState('')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setCourse(null)
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

  useEffect(() => {
    if (!course) return
    let active = true
    getTestimonialsByCourse(course.id)
      .then((data) => {
        if (active) setTestimonials(data)
      })
      .catch(() => {
        if (active) setTestimonials([])
      })
    return () => {
      active = false
    }
  }, [course])

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

  const objectiveParagraphs = splitParagraphs(course.objectives)
  const audienceParagraphs = splitParagraphs(course.audienceDescription)
  const videoId = getYoutubeId(course.videoUrl)
  const modality = getModalityLabel(course.modality)
  const durationLabel = formatDuration(course.durationMinutes)
  const certificationLabel = 'Diploma acreditativo Trekform'
  const nextOpenSession = course.sessions.find((session) => session.status === 'open')
  const showTypology = course.modality !== 'online'
  const trustCards = [
    {
      title: 'Certificación oficial',
      text: 'Estamos inscritos en el registro estatal de entidades de formación con el código 2577, y certificados con ISO 9001, garantía de calidad y formación de confianza.',
    },
    {
      title: 'Calidad garantizada',
      text: 'Ofrecemos formación adaptada a las necesidades de empresas y profesionales, garantizando un aprendizaje práctico y efectivo.',
    },
    {
      title: 'Bonificaciones',
      text: 'Gestionamos todos los trámites necesarios para que las empresas puedan bonificar su formación a través de FUNDAE, asegurando un acceso ágil y optimizado a la formación subvencionada.',
    },
  ]
  const factCards = [
    { label: 'Duración', value: durationLabel, icon: <Clock3 size={20} /> },
    {
      label: 'Modalidad',
      value: modality,
      icon: course.modality === 'online' ? <Monitor size={20} /> : <UsersRound size={20} />,
    },
    { label: 'Metodología', value: 'Teórico-práctica', icon: <BookOpen size={20} /> },
    { label: 'Certificación', value: certificationLabel, icon: <Award size={20} /> },
  ]
  const audienceSection = audienceParagraphs.length
    ? {
        kicker: 'A QUIÉN VA DIRIGIDO',
        title: `Pensado para ${getAudienceLabel(course.audience).toLowerCase()}`,
        paragraphs: audienceParagraphs,
      }
    : null
  const objectivesSection = objectiveParagraphs.length
    ? {
        kicker: 'OBJETIVOS',
        title: 'Qué vas a conseguir',
        paragraphs: objectiveParagraphs,
      }
    : null

  return (
    <div className="course-detail-page">
      <section className="course-detail-hero">
        <div
          className="course-detail-hero-bg"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(16, 28, 48, 0.92) 0%, rgba(16, 28, 48, 0.55) 45%, rgba(16, 28, 48, 0.22) 100%), url('${course.image}')`,
          }}
        />
        <div className="course-detail-hero-grid">
          <div className="course-detail-copy">
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
            <h1>{accentedTitle(course.title)}</h1>
            <p className="course-detail-excerpt">{course.heroText || course.excerpt}</p>
            <div className="course-detail-hero-actions">
              <Link
                to={`/inscripciones?curso=${encodeURIComponent(course.title)}#registration-results`}
                className="course-detail-primary"
              >
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
          {videoId ? (
            <article className="course-detail-story-card course-detail-video-card">
              <span className="course-detail-kicker">VÍDEO DEL CURSO</span>
              <h2>Descubre cómo es la formación</h2>
              <button
                type="button"
                className="course-detail-video-trigger"
                onClick={() => setIsVideoOpen(true)}
              >
                <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" />
                <span className="course-detail-video-play">
                  <Play size={22} fill="currentColor" />
                </span>
                <span className="sr-only">Reproducir vídeo del curso {course.title}</span>
              </button>
            </article>
          ) : null}

          {audienceSection ? (
            <article className="course-detail-story-card">
              <span className="course-detail-kicker">{audienceSection.kicker}</span>
              <h2>{audienceSection.title}</h2>
              {audienceSection.paragraphs.map((paragraph, index) => (
                <p key={`audience-${index}`}>{paragraph}</p>
              ))}
            </article>
          ) : null}

          {showTypology ? (
            <div className="course-detail-story-grid">
              {TYPOLOGY_CARDS.map((card) => (
                <article className="course-detail-story-card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          ) : null}

          {objectivesSection ? (
            <article className="course-detail-story-card">
              <span className="course-detail-kicker">{objectivesSection.kicker}</span>
              <h2>{objectivesSection.title}</h2>
              <ul>
                {objectivesSection.paragraphs.map((paragraph, index) => (
                  <li key={`objective-${index}`}>
                    <Check size={15} />
                    <span>{paragraph}</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>

        <aside className="course-detail-sidebar">
          <span>INFORMACIÓN DEL CURSO</span>
          <h2>{accentedTitle(course.shortTitle)}</h2>
          {nextOpenSession ? (
            <button
              type="button"
              className="course-detail-enroll-button"
              onClick={() => setActiveSession(toRegistrationSession(course, nextOpenSession))}
            >
              Inscríbete ahora <ArrowRight size={18} />
            </button>
          ) : (
            <Link to={`/inscripciones?curso=${encodeURIComponent(course.title)}#registration-results`}>
              Inscríbete ahora <ArrowRight size={18} />
            </Link>
          )}
          <dl>
            <div>
              <dt>Próxima convocatoria</dt>
              <dd>
                {nextOpenSession ? (
                  sessionDateFormatter.format(new Date(nextOpenSession.startsAt))
                ) : (
                  <Link to={`/inscripciones?curso=${encodeURIComponent(course.title)}#registration-results`}>
                    Consultar fechas
                  </Link>
                )}
              </dd>
            </div>
            <div>
              <dt>Calendario</dt>
              <dd>
                <Link to={`/inscripciones?curso=${encodeURIComponent(course.title)}#registration-results`}>
                  Ver todas las convocatorias
                </Link>
              </dd>
            </div>
          </dl>
          {trustCards.length ? (
            <div className="course-detail-sidebar-trust">
              {trustCards.map((card) => (
                <article key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          ) : null}
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
              <MessageCircle size={16} /> Habla con nuestro equipo
            </Link>
          </div>
        </aside>
      </section>

      {course.sessions.length > 0 ? (
        <section className="course-detail-sessions">
          <div className="course-detail-section-heading">
            <div>
              <span className="course-detail-kicker">PRÓXIMAS CONVOCATORIAS</span>
              <h2>Elige la fecha que mejor te encaje</h2>
            </div>
            <p>Todas las convocatorias incluyen materiales, certificado y seguimiento personalizado.</p>
          </div>

          <div className="course-detail-sessions-list">
            {course.sessions.map((session) => (
              <article className="course-detail-session-card" key={session.id}>
                <div className="course-detail-session-date">
                  <span>{sessionMonthFormatter.format(new Date(session.startsAt))}</span>
                  <strong>{sessionDayFormatter.format(new Date(session.startsAt))}</strong>
                </div>

                <div className="course-detail-session-info">
                  <h3>{sessionDateFormatter.format(new Date(session.startsAt))}</h3>
                  <p>
                    <MapPin size={14} />
                    {session.venue}
                    {session.city ? ` · ${session.city}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  className="course-detail-session-cta"
                  disabled={session.status !== 'open'}
                  onClick={() => setActiveSession(toRegistrationSession(course, session))}
                >
                  {session.status === 'open' ? (
                    <>
                      Inscríbete <ArrowRight size={16} />
                    </>
                  ) : (
                    'Plazas completas'
                  )}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="course-detail-reviews">
          <div className="course-detail-section-heading">
            <div>
              <span className="course-detail-kicker">OPINIONES</span>
              <h2>Lo que dicen nuestros alumnos</h2>
            </div>
            <p>Experiencias reales de quienes ya han hecho este curso.</p>
          </div>

          <div className="course-detail-reviews-list">
            {testimonials.map((testimonial) => (
              <article className="course-detail-review-card" key={testimonial.id}>
                <div className="course-detail-review-stars">
                  {Array.from({ length: 5 }, (_, position) => (
                    <Star key={position} size={15} fill={position < testimonial.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <blockquote>&ldquo;{testimonial.content}&rdquo;</blockquote>
                <div className="course-detail-review-author">
                  <div className="course-detail-review-avatar" aria-hidden="true">
                    {initials(testimonial.authorName)}
                  </div>
                  <div>
                    <strong>{testimonial.authorName}</strong>
                    <span>{testimonial.authorRole}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="course-detail-final-cta">
        <div>
          <span>¿TIENES DUDAS?</span>
          <h2>
            Te ayudamos
            <br />
            <span>a elegir la formación adecuada.</span>
          </h2>
        </div>
        <p>
          Cuéntanos el perfil del alumno o las necesidades de tu empresa y te proponemos la mejor opción.
        </p>
        <Link to="/contacto">
          Contactar <ArrowRight size={18} />
        </Link>
      </section>

      {activeSession && (
        <EnrollmentModal session={activeSession} onClose={() => setActiveSession(null)} />
      )}

      {isVideoOpen && videoId ? (
        <YoutubeLightbox
          videoId={videoId}
          title={`Vídeo del curso: ${course.title}`}
          onClose={() => setIsVideoOpen(false)}
        />
      ) : null}
    </div>
  )
}
