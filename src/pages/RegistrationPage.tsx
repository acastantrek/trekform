import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Download,
  FileCheck2,
  Grid3X3,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  UserRound,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EnrollmentModal } from '../components/registrations/EnrollmentModal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useRegistrationSessions } from '../hooks/useRegistrationSessions'
import type { RegistrationSession } from '../services/registrations'

const pageSize = 8

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

function getDurationLabel(hours: number) {
  return Number.isInteger(hours) ? `${hours} horas` : `${hours.toFixed(1)} horas`
}

function matchesDurationFilter(filter: string, hours: number | null) {
  if (hours === null) return filter === 'Consultar'

  switch (filter) {
    case 'Hasta 4 horas':
      return hours <= 4
    case '4 - 8 horas':
      return hours > 4 && hours <= 8
    case '8 - 16 horas':
      return hours > 8 && hours <= 16
    case '+16 horas':
      return hours > 16
    default:
      return false
  }
}

function getSessionUrgency(session: RegistrationSession) {
  if (session.status === 'full') return 'full'

  const daysUntilStart =
    (new Date(session.startsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)

  if (daysUntilStart <= 4 || (session.capacity ?? 99) <= 8) return 'last'

  return 'open'
}

function formatSessionDate(dateString: string) {
  const value = weekdayFormatter.format(new Date(dateString)).replace('.', '')
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatSchedule(start: string, end: string) {
  return `${timeFormatter.format(new Date(start))} - ${timeFormatter.format(new Date(end))}`
}

const dayMonthFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })

function formatUpcomingDate(dateString: string, offsetDays: number) {
  const date = new Date(dateString)
  date.setDate(date.getDate() + offsetDays)
  return dayMonthFormatter.format(date).replace('.', '')
}

const certificationOptions = ['Carnet / Diploma homologado', 'Bonificable FUNDAE', 'PRL']

const otherSpanishProvinces = [
  'Álava',
  'Albacete',
  'Alicante',
  'Almería',
  'Asturias',
  'Ávila',
  'Badajoz',
  'Baleares',
  'Burgos',
  'Cáceres',
  'Cádiz',
  'Cantabria',
  'Castellón',
  'Ciudad Real',
  'Córdoba',
  'Cuenca',
  'Gerona',
  'Granada',
  'Guadalajara',
  'Guipúzcoa',
  'Huelva',
  'Huesca',
  'Jaén',
  'La Coruña',
  'La Rioja',
  'Las Palmas',
  'León',
  'Lérida',
  'Lugo',
  'Málaga',
  'Murcia',
  'Navarra',
  'Orense',
  'Palencia',
  'Pontevedra',
  'Salamanca',
  'Santa Cruz de Tenerife',
  'Segovia',
  'Sevilla',
  'Soria',
  'Tarragona',
  'Teruel',
  'Toledo',
  'Valencia',
  'Valladolid',
  'Vizcaya',
  'Zamora',
  'Zaragoza',
].sort((a, b) => a.localeCompare(b, 'es'))

const provinceOptions = [
  'Todas las provincias',
  'Madrid',
  'Barcelona',
  ...otherSpanishProvinces,
]

function getSessionMeta(session: RegistrationSession, index: number) {
  const isOnline = session.modality === 'Online'
  const bonificable = !isOnline && index % 2 === 0
  const certificateLabel =
    index % 3 === 0 ? 'Carnet homologado' : index % 3 === 1 ? 'Diploma homologado' : 'Certificado'

  const secondaryBadge =
    index === 0
      ? { label: 'Más demandado', tone: 'featured' as const }
      : isOnline
        ? { label: 'Certificado oficial', tone: 'certified' as const }
        : bonificable
          ? { label: 'Bonificable FUNDAE', tone: 'info' as const }
          : index % 4 === 1
            ? { label: 'Grupos reducidos', tone: 'accent' as const }
            : index % 4 === 3
              ? { label: 'Inicio inmediato', tone: 'accent' as const }
              : { label: 'Certificado oficial', tone: 'certified' as const }

  const nextDates = [
    formatUpcomingDate(session.startsAt, index % 2 === 0 ? 21 : 23),
    formatUpcomingDate(session.startsAt, index % 2 === 0 ? 35 : 37),
  ]

  return { bonificable, certificateLabel, secondaryBadge, nextDates }
}

function matchesCertificationFilter(
  filter: string,
  session: RegistrationSession,
  meta: ReturnType<typeof getSessionMeta>,
) {
  switch (filter) {
    case 'Carnet / Diploma homologado':
      return meta.certificateLabel === 'Carnet homologado' || meta.certificateLabel === 'Diploma homologado'
    case 'Bonificable FUNDAE':
      return meta.bonificable
    case 'PRL':
      return normalize(session.category).includes('prevencion')
    default:
      return true
  }
}

export function RegistrationPage() {
  const { sessions, loading, error } = useRegistrationSessions()
  const isMobileFilters = useMediaQuery('(max-width: 680px)')
  const [searchParams] = useSearchParams()
  const courseQuery = searchParams.get('curso')
  const [search, setSearch] = useState(courseQuery ?? '')
  const [syncedCourseQuery, setSyncedCourseQuery] = useState(courseQuery)
  const [selectedProvince, setSelectedProvince] = useState(provinceOptions[0])
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías')
  const [selectedModality, setSelectedModality] = useState('Todas las modalidades')
  const [selectedMonth, setSelectedMonth] = useState('Cualquier fecha')
  const [appliedProvince, setAppliedProvince] = useState(provinceOptions[0])
  const [appliedCategory, setAppliedCategory] = useState('Todas las categorías')
  const [appliedModality, setAppliedModality] = useState('Todas las modalidades')
  const [appliedMonth, setAppliedMonth] = useState('Cualquier fecha')
  const [durationFilters, setDurationFilters] = useState<string[]>([])
  const [certificationFilters, setCertificationFilters] = useState<string[]>([])
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sortBy, setSortBy] = useState('Más próximas')
  const [page, setPage] = useState(1)
  const [activeSession, setActiveSession] = useState<RegistrationSession | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  if (courseQuery && courseQuery !== syncedCourseQuery) {
    setSyncedCourseQuery(courseQuery)
    setSearch(courseQuery)
    setPage(1)
  }

  useEffect(() => {
    if (searchParams.get('curso')) {
      document
        .getElementById('registration-results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

  const updateProvince = (value: string) => {
    setSelectedProvince(value)
    if (!isMobileFilters) setAppliedProvince(value)
    setPage(1)
  }
  const updateCategory = (value: string) => {
    setSelectedCategory(value)
    if (!isMobileFilters) setAppliedCategory(value)
    setPage(1)
  }
  const updateModality = (value: string) => {
    setSelectedModality(value)
    if (!isMobileFilters) setAppliedModality(value)
    setPage(1)
  }
  const updateMonth = (value: string) => {
    setSelectedMonth(value)
    if (!isMobileFilters) setAppliedMonth(value)
    setPage(1)
  }

  const categoryOptions = useMemo(
    () => ['Todas las categorías', ...new Set(sessions.map((session) => session.category))],
    [sessions],
  )
  const modalityOptions = useMemo(
    () => ['Todas las modalidades', ...new Set(sessions.map((session) => session.modality))],
    [sessions],
  )
  const monthOptions = useMemo(
    () => ['Cualquier fecha', ...new Set(sessions.map((session) => getMonthLabel(session.startsAt)))],
    [sessions],
  )
  const durationOptions = ['Hasta 4 horas', '4 - 8 horas', '8 - 16 horas', '+16 horas', 'Consultar']

  const sessionMetaById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getSessionMeta>>()
    sessions.forEach((session, index) => {
      map.set(session.id, getSessionMeta(session, index))
    })
    return map
  }, [sessions])

  const filteredSessions = useMemo(() => {
    const query = normalize(search.trim())

    const visible = sessions.filter((session) => {
      const meta = sessionMetaById.get(session.id)!
      const matchesSearch =
        query.length === 0 ||
        normalize(
          [
            session.courseTitle,
            session.category,
            session.city,
            session.province,
            session.venue,
            session.excerpt,
          ].join(' '),
        ).includes(query)

      const matchesProvince =
        appliedProvince === provinceOptions[0] || session.province === appliedProvince
      const matchesCategory =
        appliedCategory === categoryOptions[0] || session.category === appliedCategory
      const matchesModality =
        appliedModality === modalityOptions[0] || session.modality === appliedModality
      const matchesMonth =
        appliedMonth === monthOptions[0] || getMonthLabel(session.startsAt) === appliedMonth
      const matchesAvailability = !onlyAvailable || session.status !== 'full'
      const matchesDuration =
        durationFilters.length === 0 ||
        durationFilters.some((filter) => matchesDurationFilter(filter, session.durationHours))
      const matchesCertification =
        certificationFilters.length === 0 ||
        certificationFilters.some((filter) => matchesCertificationFilter(filter, session, meta))

      return (
        matchesSearch &&
        matchesProvince &&
        matchesCategory &&
        matchesModality &&
        matchesMonth &&
        matchesAvailability &&
        matchesDuration &&
        matchesCertification
      )
    })

    return visible.sort((left, right) => {
      if (sortBy === 'Curso A-Z') {
        return left.courseTitle.localeCompare(right.courseTitle, 'es')
      }

      return new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
    })
  }, [
    appliedCategory,
    appliedProvince,
    appliedModality,
    appliedMonth,
    categoryOptions,
    certificationFilters,
    durationFilters,
    modalityOptions,
    monthOptions,
    onlyAvailable,
    search,
    sessionMetaById,
    sessions,
    sortBy,
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

  const applyFilters = () => {
    setAppliedProvince(selectedProvince)
    setAppliedCategory(selectedCategory)
    setAppliedModality(selectedModality)
    setAppliedMonth(selectedMonth)
    setPage(1)
    setFiltersOpen(false)
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedProvince(provinceOptions[0])
    setAppliedProvince(provinceOptions[0])
    setSelectedCategory(categoryOptions[0] ?? 'Todas las categorías')
    setAppliedCategory(categoryOptions[0] ?? 'Todas las categorías')
    setSelectedModality(modalityOptions[0] ?? 'Todas las modalidades')
    setAppliedModality(modalityOptions[0] ?? 'Todas las modalidades')
    setSelectedMonth(monthOptions[0] ?? 'Cualquier fecha')
    setAppliedMonth(monthOptions[0] ?? 'Cualquier fecha')
    setDurationFilters([])
    setCertificationFilters([])
    setOnlyAvailable(false)
    setSortBy('Más próximas')
    setPage(1)
    setFiltersOpen(false)
  }

  const toggleCheckboxFilter = (
    value: string,
    current: string[],
    setter: (items: string[]) => void,
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
    setPage(1)
  }

  return (
    <div className="registration-page">
      <section className="courses-page-hero registration-page-hero">
        <div className="courses-hero-content courses-hero-animate">
          <h1 className="courses-hero-enter courses-hero-enter--1">
            Inscripciones <span>abiertas</span>
          </h1>
          <p className="courses-hero-enter courses-hero-enter--2">
            Formación práctica, certificada y enfocada a tu seguridad y a tu futuro profesional.
          </p>
          <div className="courses-hero-actions courses-hero-enter courses-hero-enter--3">
            <a href="#registration-catalog" className="hero-search-link">
              Buscar curso <Search size={18} />
            </a>
            <a
              className="hero-calendar-link"
              href="https://drive.google.com/file/d/0B7Ghcuo4WDYtYTlrWGxtXzhnNTg/view?resourcekey=0-M3q-VqD92HG26e_bJn9KTw"
              target="_blank"
              rel="noreferrer"
            >
              Calendario cursos <Download size={18} />
            </a>
          </div>
          <div className="courses-hero-metrics">
            <span className="courses-hero-enter courses-hero-enter--4">
              <Award /> <strong>+20 años</strong> de experiencia
            </span>
            <span className="courses-hero-enter courses-hero-enter--5">
              <Users /> <strong>+200.000</strong> alumnos formados
            </span>
            <span className="courses-hero-enter courses-hero-enter--6">
              <MapPin /> <strong>Cobertura</strong> nacional
            </span>
            <span className="courses-hero-enter courses-hero-enter--7">
              <BriefcaseBusiness /> <strong>Formación abierta</strong> a tu empresa
            </span>
          </div>
        </div>
        <div className="courses-hero-claim courses-hero-enter courses-hero-enter--4">
          <strong>
            Por tu seguridad, escoge <span>Trekform</span>
          </strong>
        </div>
      </section>

      <section className="registration-toolbar-wrap" id="registration-catalog">
        <div className="registration-toolbar">
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
                  placeholder="Ej: Carretillas, Altura, PRL, PEMP..."
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
            <ToolbarSelect
              label="Provincia"
              value={selectedProvince}
              options={provinceOptions}
              onChange={updateProvince}
            />
            <ToolbarSelect
              label="Categoría"
              value={selectedCategory}
              options={categoryOptions}
              onChange={updateCategory}
            />
            <ToolbarSelect
              label="Modalidad"
              value={selectedModality}
              options={modalityOptions}
              onChange={updateModality}
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
              <a
                href="#registration-results"
                className="registration-toolbar-submit"
                onClick={applyFilters}
              >
                Buscar cursos
              </a>
            </div>

            <div className="registration-active-chips">
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
              {appliedCategory !== categoryOptions[0] ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(categoryOptions[0])
                    setAppliedCategory(categoryOptions[0])
                    setPage(1)
                  }}
                >
                  {appliedCategory} ×
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="registration-results-area">
        <div className="registration-results-layout">
          <aside className="registration-sidebar">
            <h2>Filtrar resultados</h2>

            <SidebarGroup title="Categoría">
              {categoryOptions.slice(1).map((item) => (
                <SidebarCheckbox
                  key={item}
                  label={item}
                  checked={selectedCategory === item}
                  onChange={() => updateCategory(selectedCategory === item ? categoryOptions[0] : item)}
                />
              ))}
              <button
                type="button"
                className="sidebar-link-button"
                onClick={() => updateCategory(categoryOptions[0])}
              >
                Ver todas las categorías
              </button>
            </SidebarGroup>

            <SidebarGroup title="Modalidad">
              {modalityOptions.slice(1).map((item) => (
                <SidebarCheckbox
                  key={item}
                  label={item}
                  checked={selectedModality === item}
                  onChange={() => updateModality(selectedModality === item ? modalityOptions[0] : item)}
                />
              ))}
            </SidebarGroup>

            <SidebarGroup title="Duración">
              {durationOptions.map((item) => (
                <SidebarCheckbox
                  key={item}
                  label={item}
                  checked={durationFilters.includes(item)}
                  onChange={() => toggleCheckboxFilter(item, durationFilters, setDurationFilters)}
                />
              ))}
            </SidebarGroup>

            <SidebarGroup title="Certificación">
              {certificationOptions.map((item) => (
                <SidebarCheckbox
                  key={item}
                  label={item}
                  checked={certificationFilters.includes(item)}
                  onChange={() => toggleCheckboxFilter(item, certificationFilters, setCertificationFilters)}
                />
              ))}
            </SidebarGroup>

            <button type="button" className="registration-sidebar-reset" onClick={resetFilters}>
              <RotateCcw size={16} /> Limpiar filtros
            </button>
          </aside>

          <div className="registration-results" id="registration-results">
            <div className="registration-summary">
              <div className="registration-summary-controls">
                <label className="availability-toggle">
                  <span>Solo plazas disponibles</span>
                  <button
                    type="button"
                    className={onlyAvailable ? 'active' : ''}
                    aria-pressed={onlyAvailable}
                    onClick={() => {
                      setOnlyAvailable((value) => !value)
                      setPage(1)
                    }}
                  >
                    <i />
                  </button>
                </label>
                <label className="sort-select">
                  <span>Ordenar por:</span>
                  <div>
                    <select
                      value={sortBy}
                      onChange={(event) => {
                        setSortBy(event.target.value)
                        setPage(1)
                      }}
                    >
                      <option>Más próximas</option>
                      <option>Curso A-Z</option>
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </label>
                <div className="registration-view-switch">
                  <button type="button">
                    <Grid3X3 size={15} /> Catálogo
                  </button>
                  <button type="button" className="active">
                    <CalendarDays size={15} /> Próximas convocatorias
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="registration-empty registration-loading" role="status">
                <span className="registration-spinner" />
              </div>
            ) : error ? (
              <div className="registration-empty" role="alert">
                <h3>No se pudieron cargar las inscripciones</h3>
                <p>{error}</p>
              </div>
            ) : visibleSessions.length > 0 ? (
              <>
                <div className="registration-results-headers">
                  <span>Curso</span>
                  <span>Detalles de la sesión</span>
                </div>
                <div className="registration-session-list">
                  {visibleSessions.map((session) => {
                    const urgency = getSessionUrgency(session)
                    const meta = sessionMetaById.get(session.id)!

                    return (
                      <article className="registration-session-card" key={session.id}>
                        <div className="registration-session-image">
                          <img src={session.image} alt={session.courseTitle} />
                          {meta.secondaryBadge.tone === 'featured' ? (
                            <span>
                              <Star size={11} fill="currentColor" /> Más demandado
                            </span>
                          ) : null}
                        </div>

                        <div className="registration-session-course">
                          <div className="registration-session-title">
                            <h3>{session.courseTitle}</h3>
                            <p>{session.category}</p>
                          </div>
                          <div className="registration-session-meta-block">
                            <div className="registration-session-meta">
                              <span className="registration-field-modality">
                                <UserRound size={14} /> {session.modality}
                              </span>
                              {session.durationHours ? (
                                <span className="registration-field-duration">
                                  <Clock3 size={14} /> {getDurationLabel(session.durationHours)}
                                </span>
                              ) : null}
                              <span className="registration-field-city">
                                <MapPin size={14} /> {session.city}
                              </span>
                            </div>
                            <div className="registration-session-certificate">
                              <FileCheck2 size={14} /> {meta.certificateLabel}
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
                          <span className="registration-field-venue">
                            <MapPin size={14} /> {session.venue}
                          </span>
                          <small className="registration-field-nextdates">
                            Próximas fechas: {meta.nextDates[0]} · {meta.nextDates[1]}
                          </small>
                        </div>

                        <div className="registration-session-badges">
                          <span className={`badge badge-${urgency}`}>
                            {urgency === 'full'
                              ? 'Completo'
                              : urgency === 'last'
                                ? 'Últimas plazas'
                                : 'Inscripción abierta'}
                          </span>
                        </div>

                        <div className="registration-session-actions">
                          <Link to={`/cursos-trekform/${session.courseSlug}`}>Ver detalles</Link>
                          {session.status === 'full' ? (
                            <button type="button" disabled>
                              Completo
                            </button>
                          ) : (
                            <button type="button" onClick={() => setActiveSession(session)}>
                              Inscribirme
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
                    {Math.min(page * pageSize, filteredSessions.length)} de {filteredSessions.length}
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
                  “Formación muy práctica y profesores excelentes. Las instalaciones y la
                  maquinaria en perfecto estado.”
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

function SidebarGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="registration-sidebar-group">
      <h3>
        {title}
        <ChevronDown size={15} />
      </h3>
      <div>{children}</div>
    </section>
  )
}

function SidebarCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="registration-sidebar-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  )
}
