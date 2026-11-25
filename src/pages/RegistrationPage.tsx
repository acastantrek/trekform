import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CategoryChips } from '../components/courses/CategoryChips'
import { TrekformLoader } from '../components/common/TrekformLoader'
import { EnrollmentModal } from '../components/registrations/EnrollmentModal'
import { SessionAlertModal } from '../components/registrations/SessionAlertModal'
import { useCourses } from '../hooks/useCourses'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useRegistrationSessions } from '../hooks/useRegistrationSessions'
import { categoryOrder } from '../lib/courseCategories'
import { spanishProvinces } from '../lib/provinces'
import type { RegistrationSession } from '../services/registrations'

const pageSize = 15

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getMonthLabel(dateString: string) {
  return toTitleCase(monthFormatter.format(new Date(dateString)))
}

// "Últimas plazas" once free seats drop to this share of the capacity or less.
const lastSeatsShare = 0.4

function getSessionUrgency(session: RegistrationSession) {
  // Also covers open sessions with no free seats left (see getRegistrationSessions).
  if (session.status === 'full') return 'full'

  const daysUntilStart =
    (new Date(session.startsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  const fewSeatsLeft =
    session.capacity !== null &&
    session.seatsRemaining !== null &&
    session.seatsRemaining <= session.capacity * lastSeatsShare

  if (daysUntilStart <= 4 || fewSeatsLeft) return 'last'

  return 'open'
}

function formatSessionDate(dateString: string) {
  const value = weekdayFormatter.format(new Date(dateString)).replace('.', '')
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatSchedule(start: string, end: string) {
  return `${timeFormatter.format(new Date(start))} - ${timeFormatter.format(new Date(end))}`
}

const provinceOptions = ['Todas las provincias', ...spanishProvinces]

export function RegistrationPage() {
  const isMobile = useMediaQuery('(max-width: 680px)')
  const { sessions, loading, error } = useRegistrationSessions()
  const { courses } = useCourses()
  const [alertOpen, setAlertOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const courseQuery = searchParams.get('curso')
  // `?provincia=` (e.g. from a province chip on the catalog) pre-applies the province filter.
  const provinceQuery = searchParams.get('provincia')
  const [search, setSearch] = useState(courseQuery ?? '')
  const [syncedCourseQuery, setSyncedCourseQuery] = useState(courseQuery)
  const [syncedProvinceQuery, setSyncedProvinceQuery] = useState(provinceQuery)
  const [selectedProvince, setSelectedProvince] = useState(provinceQuery ?? provinceOptions[0])
  const [selectedMonth, setSelectedMonth] = useState('Cualquier fecha')
  const [appliedProvince, setAppliedProvince] = useState(provinceQuery ?? provinceOptions[0])
  const [appliedCategory, setAppliedCategory] = useState('Todas las categorías')
  const [appliedMonth, setAppliedMonth] = useState('Cualquier fecha')
  const [page, setPage] = useState(1)
  const [activeSession, setActiveSession] = useState<RegistrationSession | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  if (courseQuery && courseQuery !== syncedCourseQuery) {
    setSyncedCourseQuery(courseQuery)
    setSearch(courseQuery)
    setPage(1)
  }
  if (provinceQuery && provinceQuery !== syncedProvinceQuery) {
    setSyncedProvinceQuery(provinceQuery)
    setSelectedProvince(provinceQuery)
    setAppliedProvince(provinceQuery)
    setPage(1)
  }

  // A venue province spelled differently from the fixed list (e.g. "Bizkaia") still needs to be
  // a selectable option, or the select would show nothing while the filter is applied.
  const provinceSelectOptions = provinceOptions.includes(selectedProvince)
    ? provinceOptions
    : [...provinceOptions, selectedProvince]

  useEffect(() => {
    if (searchParams.get('curso') || searchParams.get('provincia')) {
      document
        .getElementById('registration-results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

  const updateProvince = (value: string) => {
    setSelectedProvince(value)
    setAppliedProvince(value)
    setPage(1)
  }
  const updateCategory = (value: string) => {
    setAppliedCategory(value)
    setPage(1)
  }
  const updateMonth = (value: string) => {
    setSelectedMonth(value)
    setAppliedMonth(value)
    setPage(1)
  }

  // Same chips as Cursos: every category with a published course, even when none of its courses
  // has an upcoming session right now (picking it then shows the empty state).
  const categoryOptions = useMemo(() => {
    const available = new Set([
      ...courses.flatMap((course) => course.categories),
      ...sessions.flatMap((session) => session.categories),
    ])
    return ['Todas las categorías', ...categoryOrder.filter((item) => available.has(item))]
  }, [courses, sessions])
  const monthOptions = useMemo(
    () => [
      'Cualquier fecha',
      ...new Set(sessions.map((session) => getMonthLabel(session.startsAt))),
    ],
    [sessions],
  )

  const filteredSessions = useMemo(() => {
    const query = normalize(search.trim())

    const visible = sessions.filter((session) => {
      const matchesSearch =
        query.length === 0 ||
        normalize(
          [
            session.courseTitle,
            session.categories.join(' '),
            session.city,
            session.province,
            session.venue,
            session.excerpt,
          ].join(' '),
        ).includes(query)

      const matchesProvince =
        appliedProvince === provinceOptions[0] || session.province === appliedProvince
      const matchesCategory =
        appliedCategory === categoryOptions[0] || session.categories.includes(appliedCategory)
      const matchesMonth =
        appliedMonth === monthOptions[0] || getMonthLabel(session.startsAt) === appliedMonth

      return matchesSearch && matchesProvince && matchesCategory && matchesMonth
    })

    return visible.sort(
      (left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    )
  }, [
    appliedCategory,
    appliedProvince,
    appliedMonth,
    categoryOptions,
    monthOptions,
    search,
    sessions,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize))
  const visibleSessions = filteredSessions.slice((page - 1) * pageSize, page * pageSize)

  const goToPage = (value: number) => {
    setPage(value)
    requestAnimationFrame(() => {
      document
        .getElementById('registration-results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  // When the search is exactly one course's title (e.g. arriving from a catalog card) and that
  // course has no open session — at all, or in the chosen province — offer the "notify me" form.
  // Full sessions don't count as available.
  const alertCourse = useMemo(() => {
    const query = normalize(search.trim())
    return query ? (courses.find((course) => normalize(course.title) === query) ?? null) : null
  }, [courses, search])
  const alertProvince = appliedProvince === provinceOptions[0] ? null : appliedProvince
  const alertCourseOpenAnywhere = alertCourse
    ? sessions.some(
        (session) => session.courseSlug === alertCourse.slug && session.status === 'open',
      )
    : false
  const alertCourseOpenHere = alertCourse
    ? sessions.some(
        (session) =>
          session.courseSlug === alertCourse.slug &&
          session.status === 'open' &&
          (!alertProvince || session.province === alertProvince),
      )
    : false
  const showAlertBanner = !loading && !error && alertCourse !== null && !alertCourseOpenHere

  const showAllProvinces = () => {
    setSelectedProvince(provinceOptions[0])
    setAppliedProvince(provinceOptions[0])
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedProvince(provinceOptions[0])
    setAppliedProvince(provinceOptions[0])
    setAppliedCategory(categoryOptions[0] ?? 'Todas las categorías')
    setSelectedMonth(monthOptions[0] ?? 'Cualquier fecha')
    setAppliedMonth(monthOptions[0] ?? 'Cualquier fecha')
    setPage(1)
    setFiltersOpen(false)
  }

  return (
    <div className="registration-page">
      <section className="courses-page-hero registration-page-hero">
        <div className="courses-hero-content courses-hero-animate">
          <h1 className="courses-hero-enter courses-hero-enter--1">
            Inscripciones <span>abiertas</span>
          </h1>
        </div>
      </section>

      <section className="registration-toolbar-wrap courses-toolbar-wrap" id="registration-catalog">
        <div className="registration-toolbar calendar-toolbar">
          <div className="registration-toolbar-primary">
            <label className="registration-search-field" htmlFor="registration-search">
              <span>¿Qué curso buscas?</span>
              <div>
                <input
                  id="registration-search"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder={
                    isMobile
                      ? '¿Qué curso buscas?'
                      : '¿Qué curso buscas? Ej: carretillas, PRL, PEMP...'
                  }
                  aria-label="Buscar convocatorias"
                />
                <Search size={18} />
              </div>
            </label>
            <button
              type="button"
              className="registration-filters-toggle"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal size={16} /> Filtros
              <ChevronDown size={16} className={filtersOpen ? 'is-rotated' : ''} />
            </button>
          </div>

          <div className={`registration-toolbar-fields${filtersOpen ? ' is-open' : ''}`}>
            {/* On mobile the category row is folded into this dropdown instead of the chips. */}
            {isMobile ? (
              <ToolbarSelect
                label="Categoría"
                value={appliedCategory}
                options={categoryOptions}
                onChange={updateCategory}
              />
            ) : null}
            <ToolbarSelect
              label="Provincia"
              value={selectedProvince}
              options={provinceSelectOptions}
              onChange={updateProvince}
            />
            <ToolbarSelect
              label="Fecha / Mes"
              value={selectedMonth}
              options={monthOptions}
              onChange={updateMonth}
            />
            <div className="registration-toolbar-actions registration-toolbar-actions-wide">
              <button type="button" className="registration-toolbar-reset" onClick={resetFilters}>
                <RotateCcw size={15} /> Limpiar filtros
              </button>
            </div>

            <div className="registration-active-chips">
              {isMobile && appliedCategory !== categoryOptions[0] ? (
                <button type="button" onClick={() => updateCategory(categoryOptions[0])}>
                  {appliedCategory} ×
                </button>
              ) : null}
              {appliedProvince !== provinceOptions[0] ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvince(provinceOptions[0])
                    setAppliedProvince(provinceOptions[0])
                    setPage(1)
                  }}
                >
                  {appliedProvince} ×
                </button>
              ) : null}
              {appliedMonth !== monthOptions[0] ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth(monthOptions[0])
                    setAppliedMonth(monthOptions[0])
                    setPage(1)
                  }}
                >
                  {appliedMonth} ×
                </button>
              ) : null}
            </div>
          </div>
        </div>
        {isMobile ? null : (
          <CategoryChips
            categories={categoryOptions}
            active={appliedCategory}
            onSelect={updateCategory}
            labelFor={(item) => (item === categoryOptions[0] ? 'Todas' : item)}
          />
        )}
      </section>

      <section className="registration-results-area">
        <div className="registration-results-layout">
          <div className="registration-results" id="registration-results">
            {showAlertBanner && alertCourse ? (
              <div className="registration-alert-banner">
                <BellRing size={22} aria-hidden="true" />
                <div>
                  <strong>
                    No hay convocatorias abiertas de {alertCourse.title}
                    {alertProvince ? ` en ${alertProvince}` : ''}
                  </strong>
                  <span>Déjanos tus datos y te avisamos en cuanto abramos una.</span>
                </div>
                <div className="registration-alert-banner-actions">
                  {alertProvince && alertCourseOpenAnywhere ? (
                    <button type="button" className="is-secondary" onClick={showAllProvinces}>
                      Ver convocatorias en otras provincias
                    </button>
                  ) : null}
                  <button type="button" onClick={() => setAlertOpen(true)}>
                    Avísame
                  </button>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="registration-empty registration-loading">
                <TrekformLoader label="Cargando convocatorias" />
              </div>
            ) : error ? (
              <div className="registration-empty" role="alert">
                <h3>No se pudieron cargar las inscripciones</h3>
                <p>{error}</p>
              </div>
            ) : visibleSessions.length > 0 ? (
              <>
                <div className="registration-session-list">
                  {visibleSessions.map((session) => {
                    const urgency = getSessionUrgency(session)

                    return (
                      <article className="registration-session-card" key={session.id}>
                        <div className="registration-session-course">
                          <div className="registration-session-title">
                            <h3 title={session.courseTitle}>
                              <Link to={`/cursos-trekform/${session.courseSlug}`}>
                                {session.courseTitle}
                              </Link>
                            </h3>
                          </div>
                          <div className="registration-session-meta-block">
                            <div className="registration-session-meta">
                              <span className="registration-field-city">
                                <MapPin size={14} />
                                <span className="registration-field-text">
                                  {session.city === 'Online'
                                    ? session.city
                                    : `${session.city}, ${session.province}`}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="registration-session-details">
                          <strong className="registration-field-date">
                            <CalendarDays size={14} /> {formatSessionDate(session.startsAt)}
                          </strong>
                          <span className="registration-field-schedule">
                            <Clock3 size={14} /> {formatSchedule(session.startsAt, session.endsAt)}
                          </span>
                        </div>

                        <div className="registration-session-actions">
                          {urgency === 'full' ? (
                            <button type="button" className="is-full" disabled>
                              Completo
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={`is-${urgency}`}
                              onClick={() => setActiveSession(session)}
                            >
                              {urgency === 'last' ? '¡Últimas plazas!' : 'Inscríbete!'}
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>

                <div className="registration-pagination">
                  <span>
                    {filteredSessions.length === 0 ? 0 : (page - 1) * pageSize + 1} a{' '}
                    {Math.min(page * pageSize, filteredSessions.length)} de{' '}
                    {filteredSessions.length}
                  </span>
                  <div>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                      <button
                        type="button"
                        key={item}
                        className={item === page ? 'active' : ''}
                        onClick={() => goToPage(item)}
                      >
                        {item}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(Math.min(page + 1, totalPages))}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="registration-empty">
                <Search size={30} />
                <h3>No hay convocatorias que coincidan</h3>
                <p>Prueba con otra provincia, categoría o fecha.</p>
              </div>
            )}

            <div className="registration-company-cta">
              <div className="registration-company-cta-image" />
              <section>
                <h2>¿Necesitas formación para tu empresa?</h2>
                <p>
                  <Check size={16} /> Formación in-company a medida
                </p>
                <p>
                  <Check size={16} /> Planes formativos bonificables FUNDAE
                </p>
                <p>
                  <Check size={16} /> Nos adaptamos a tus horarios y necesidades
                </p>
              </section>
              <span>
                <BriefcaseBusiness size={18} /> Asesoramiento gratuito sin compromiso
              </span>
              <Link to="/contacto">
                Solicitar formación a medida <ArrowRight size={18} />
              </Link>
            </div>

            <div className="registration-trust-row">
              <article>
                <h3>Lo que opinan nuestros alumnos</h3>
                <div className="rating-stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={16} fill="currentColor" />
                  ))}
                  <strong>4,8/5</strong>
                </div>
                <p>Basado en +2.300 valoraciones</p>
              </article>
              <article>
                <p>
                  “Formación muy práctica y profesores excelentes. Las instalaciones y la maquinaria
                  en perfecto estado.”
                </p>
                <span>— Marta C.</span>
              </article>
              <article>
                <h3>¿Por qué elegir Trekform?</h3>
                <p>
                  <Check size={16} /> Formación práctica con maquinaria real
                </p>
                <p>
                  <Check size={16} /> Instructores expertos en activo
                </p>
                <p>
                  <Check size={16} /> Instalaciones propias y homologadas
                </p>
              </article>
              <article>
                <h3>¿Tienes dudas?</h3>
                <p>Nuestro equipo te ayuda a elegir el curso que mejor se adapta a ti.</p>
                <Link to="/contacto">
                  Contactar ahora <ArrowRight size={14} />
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      {activeSession && (
        <EnrollmentModal session={activeSession} onClose={() => setActiveSession(null)} />
      )}
      {alertOpen && alertCourse ? (
        <SessionAlertModal
          courseId={alertCourse.id}
          courseTitle={alertCourse.title}
          province={alertProvince}
          onClose={() => setAlertOpen(false)}
        />
      ) : null}
    </div>
  )
}

function ToolbarSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="registration-toolbar-select">
      <span>{label}</span>
      <div>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <ChevronDown size={16} />
      </div>
    </label>
  )
}
