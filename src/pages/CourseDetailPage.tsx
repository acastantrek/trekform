import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  GraduationCap,
  MapPin,
  Monitor,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
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

const fallbackModules = [
  {
    id: 'fundamentos',
    title: 'Fundamentos y normativa aplicable',
    content: 'Conceptos esenciales, responsabilidades y normativa relacionada con la actividad.',
    durationMinutes: null,
    position: 1,
  },
  {
    id: 'prevencion',
    title: 'Prevención y trabajo seguro',
    content: 'Identificación de riesgos, medidas preventivas y procedimientos de trabajo seguro.',
    durationMinutes: null,
    position: 2,
  },
  {
    id: 'evaluacion',
    title: 'Aplicación práctica y evaluación',
    content:
      'Ejercicios aplicados, resolución de situaciones reales y evaluación de conocimientos.',
    durationMinutes: null,
    position: 3,
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

  const modules = course.modules.length ? course.modules : fallbackModules
  const modality =
    course.modality === 'online'
      ? 'Online'
      : course.modality === 'hybrid'
        ? 'Híbrida'
        : 'Presencial'

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
              <strong>Formación acreditativa</strong> orientada al trabajo seguro
            </span>
          </div>
        </div>
      </section>

      <section className="course-detail-overview">
        <div>
          <Clock3 />
          <span>
            Duración
            <strong>{course.durationHours ? `${course.durationHours} horas` : 'Consultar'}</strong>
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
            Metodología<strong>Teórico-práctica</strong>
          </span>
        </div>
        <div>
          <Award />
          <span>
            Acreditación<strong>Diploma incluido</strong>
          </span>
        </div>
      </section>

      <section className="course-detail-main">
        <div className="course-detail-content">
          <span className="course-detail-kicker">SOBRE EL CURSO</span>
          <h2>
            Formación útil <span>para el trabajo real.</span>
          </h2>
          <p className="course-detail-lead">{course.description}</p>
          <p>
            El programa está pensado para particulares que quieren mejorar su empleabilidad y para
            empresas que necesitan formar a sus equipos. Los contenidos se trabajan con un enfoque
            claro, aplicado y centrado en la seguridad.
          </p>

          <div className="course-detail-benefits">
            <article>
              <ShieldCheck />
              <h3>Seguridad</h3>
              <p>Identifica riesgos y aplica medidas preventivas adecuadas.</p>
            </article>
            <article>
              <GraduationCap />
              <h3>Capacitación</h3>
              <p>Adquiere conocimientos transferibles a situaciones reales.</p>
            </article>
            <article>
              <Award />
              <h3>Acreditación</h3>
              <p>Recibe un diploma acreditativo al completar la formación.</p>
            </article>
          </div>

          <div className="course-detail-audience">
            <span className="course-detail-kicker">A QUIÉN VA DIRIGIDO</span>
            <h2>
              Particulares, profesionales <span>y empresas.</span>
            </h2>
            <ul>
              <li>
                <Check size={17} /> Personas que quieren mejorar sus competencias profesionales.
              </li>
              <li>
                <Check size={17} /> Trabajadores que necesitan formación para su puesto.
              </li>
              <li>
                <Check size={17} /> Empresas que buscan formar equipos o cumplir requisitos
                preventivos.
              </li>
            </ul>
          </div>
        </div>

        <aside className="course-detail-sidebar">
          <span>INFORMACIÓN DEL CURSO</span>
          <h2>{accentedTitle(course.title)}</h2>
          <dl>
            <div>
              <dt>Duración</dt>
              <dd>{course.durationHours ? `${course.durationHours} horas` : 'Consultar'}</dd>
            </div>
            <div>
              <dt>Modalidad</dt>
              <dd>{modality}</dd>
            </div>
            <div>
              <dt>Metodología</dt>
              <dd>Teórico-práctica</dd>
            </div>
            <div>
              <dt>Certificación</dt>
              <dd>Diploma acreditativo</dd>
            </div>
          </dl>
          <Link to="/inscripciones">
            Inscríbete ahora <ArrowRight size={18} />
          </Link>
          <small>¿Necesitas una formación a medida?</small>
          <Link to="/contacto" className="course-detail-contact">
            Habla con nuestro equipo
          </Link>
        </aside>
      </section>

      <section className="course-detail-program">
        <div className="course-detail-section-heading">
          <div>
            <span className="course-detail-kicker">PROGRAMA FORMATIVO</span>
            <h2>
              Qué <span>aprenderás.</span>
            </h2>
          </div>
          <p>Un recorrido estructurado desde los fundamentos hasta la aplicación práctica.</p>
        </div>
        <div className="course-detail-modules">
          {modules.map((module, index) => (
            <details key={module.id} open={index === 0}>
              <summary>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{module.title}</strong>
                {module.durationMinutes && <small>{module.durationMinutes} min</small>}
                <i>+</i>
              </summary>
              <p>{module.content}</p>
            </details>
          ))}
        </div>
      </section>

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
