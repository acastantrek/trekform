import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Download,
  Grid3X3,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  User,
  Users,
} from 'lucide-react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EnrollmentModal } from '../components/registrations/EnrollmentModal'
import { useCourses } from '../hooks/useCourses'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { getRegistrationSessions, type RegistrationSession } from '../services/registrations'
import type { Course } from '../types/course'

const pageSize = 8
const categoryOrder = [
  'Maquinaria industrial',
  'Trabajos en altura',
  'Espacios confinados',
  'Formación TELCO',
  'Trekform online',
  'Construcción (TPC) / Metal (TPM)',
  'Prevención',
  'Logística',
  'Hostelería',
]
const cities = ['Todas las ciudades', 'Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao']
const modalities = ['Todas las modalidades', 'Presencial', 'Online', 'Blended', 'In-company']
const dates = ['Cualquier fecha', 'Junio 2026', 'Julio 2026', 'Agosto 2026']
const durations = ['Hasta 4 horas', '4 - 8 horas', '8 - 16 horas', '+16 horas']
const certifications = ['Carnet / Diploma homologado', 'Bonificable FUNDAE', 'PRL']

const fallbackImages = [
  'https://trekform.com/trekform/uploads/assets/images/services/services-1-1a.jpg',
  'https://trekform.com/trekform/uploads/assets/images/services/services-1-2a.jpg',
  'https://trekform.com/trekform/uploads/assets/images/services/services-1-3a.png',
  'https://trekform.com/trekform/uploads/assets/images/services/services-1-4a.jpg',
  'https://trekform.com/trekform/uploads/assets/images/services/services-1-5a.jpg',
  'https://trekform.com/trekform/uploads/assets/images/services/services-1-6a.jpg',
  'https://trekform.com/trekform/uploads/assets/images/services/services-1-10a.jpg',
  'https://cloudflare.shopincdn.ovh/trekform/cache/images/img_blogs/1170x636_q91_cr0_fix1/carretillero_trekform_en_baleares.jpg',
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const fallbackDurationHours = [3, 6, 12, 20]

function getCourseMeta(course: Course, index: number) {
  const durationMatch = course.duration.match(/\d+/)
  const durationHours = durationMatch
    ? Number(durationMatch[0])
    : fallbackDurationHours[index % fallbackDurationHours.length]
  const duration = `${durationHours} h`
  const city = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla'][index % 4]
  const modality = course.category.toLowerCase().includes('online') ? 'Online' : 'Presencial'
  const certificate =
    index % 3 === 0
      ? 'Carnet homologado'
      : index % 3 === 1
        ? 'Diploma homologado'
        : 'Certificado PRL'
  const bonificable = index % 3 === 1

  return { duration, durationHours, city, modality, certificate, bonificable }
}

const cardDateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })

function matchesDurationFilter(filter: string, hours: number) {
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
      return true
  }
}

function matchesCertificationFilter(filter: string, meta: ReturnType<typeof getCourseMeta>) {
  switch (filter) {
    case 'Carnet / Diploma homologado':
      return meta.certificate === 'Carnet homologado' || meta.certificate === 'Diploma homologado'
    case 'Bonificable FUNDAE':
      return meta.bonificable
    case 'PRL':
      return meta.certificate === 'Certificado PRL'
    default:
      return true
  }
}

export function CoursesPage() {
  const { courses: allCourses, loading, error } = useCourses()
  const isMobileFilters = useMediaQuery('(max-width: 680px)')
  const [category, setCategoryDraft] = useState('Todos')
  const [search, setSearch] = useState('')
  const [city, setCityDraft] = useState(cities[0])
  const [modality, setModalityDraft] = useState(modalities[0])
  const [date, setDate] = useState(dates[0])
  const [durationFilters, setDurationFilters] = useState<string[]>([])
  const [certificationFilters, setCertificationFilters] = useState<string[]>([])
  const [appliedCategory, setAppliedCategory] = useState('Todos')
  const [appliedCity, setAppliedCity] = useState(cities[0])
  const [appliedModality, setAppliedModality] = useState(modalities[0])
  const [page, setPage] = useState(1)
  const [nextSessionByCourseSlug, setNextSessionByCourseSlug] = useState<
    Map<string, RegistrationSession>
  >(new Map())
  const [sessionsByCourseSlug, setSessionsByCourseSlug] = useState<
    Map<string, RegistrationSession[]>
  >(new Map())
  const [activeSession, setActiveSession] = useState<RegistrationSession | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const setCity = (value: string) => {
    setCityDraft(value)
    if (!isMobileFilters) setAppliedCity(value)
  }

  const setModality = (value: string) => {
    setModalityDraft(value)
    if (!isMobileFilters) setAppliedModality(value)
  }

  useEffect(() => {
    getRegistrationSessions()
      .then((sessions) => {
        const nextOpenMap = new Map<string, RegistrationSession>()
        const bySlugMap = new Map<string, RegistrationSession[]>()
        sessions.forEach((session) => {
          if (session.status === 'open' && !nextOpenMap.has(session.courseSlug)) {
            nextOpenMap.set(session.courseSlug, session)
          }
          const list = bySlugMap.get(session.courseSlug) ?? []
          list.push(session)
          bySlugMap.set(session.courseSlug, list)
        })
        setNextSessionByCourseSlug(nextOpenMap)
        setSessionsByCourseSlug(bySlugMap)
      })
      .catch(() => {
        setNextSessionByCourseSlug(new Map())
        setSessionsByCourseSlug(new Map())
      })
  }, [])

  const catalogCategories = useMemo(() => {
    const available = new Set(allCourses.flatMap((course) => course.categories))
    return ['Todos', ...categoryOrder.filter((item) => available.has(item))]
  }, [allCourses])

  const courseMetaById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getCourseMeta>>()
    allCourses.forEach((course, index) => {
      map.set(course.id, getCourseMeta(course, index))
    })
    return map
  }, [allCourses])

  const toggleFilterValue = (setter: Dispatch<SetStateAction<string[]>>, value: string) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
    setPage(1)
  }

  const filteredCourses = useMemo(() => {
    const query = normalize(search.trim())

    return allCourses.filter((course) => {
      const meta = courseMetaById.get(course.id)!
      const matchesCategory =
        appliedCategory === 'Todos' || course.categories.includes(appliedCategory)
      const matchesCity = appliedCity === cities[0] || meta.city === appliedCity
      const matchesModality = appliedModality === modalities[0] || meta.modality === appliedModality
      const matchesDuration =
        durationFilters.length === 0 ||
        durationFilters.some((filter) => matchesDurationFilter(filter, meta.durationHours))
      const matchesCertification =
        certificationFilters.length === 0 ||
        certificationFilters.some((filter) => matchesCertificationFilter(filter, meta))

      if (
        !matchesCategory ||
        !matchesCity ||
        !matchesModality ||
        !matchesDuration ||
        !matchesCertification
      )
        return false
      if (!query) return true

      const haystack = normalize(
        [
          course.title,
          course.slug,
          course.category,
          course.categories.join(' '),
          course.description,
          meta.city,
          meta.modality,
        ]
          .filter(Boolean)
          .join(' '),
      )

      return haystack.includes(query)
    })
  }, [
    allCourses,
    courseMetaById,
    appliedCategory,
    appliedCity,
    appliedModality,
    durationFilters,
    certificationFilters,
    search,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const visibleCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize)

  const goToPage = (value: number) => {
    setPage(value)
    requestAnimationFrame(() => {
      document.getElementById('catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const selectCategory = (value: string) => {
    setCategoryDraft(value)
    if (!isMobileFilters) setAppliedCategory(value)
    setPage(1)
  }

  const applyFilters = () => {
    setAppliedCity(city)
    setAppliedCategory(category)
    setAppliedModality(modality)
    setPage(1)
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setCategoryDraft('Todos')
    setAppliedCategory('Todos')
    setSearch('')
    setCityDraft(cities[0])
    setAppliedCity(cities[0])
    setModalityDraft(modalities[0])
    setAppliedModality(modalities[0])
    setDate(dates[0])
    setDurationFilters([])
    setCertificationFilters([])
    setPage(1)
    setFiltersOpen(false)
  }

  return (
    <>
      <section className="courses-page-hero">
        <div className="courses-hero-content courses-hero-animate">
          <h1 className="courses-hero-enter courses-hero-enter--1">
            Cursos abiertos <span>Trekform</span>
          </h1>
          <p className="courses-hero-enter courses-hero-enter--2">
            Formación práctica, certificada y enfocada a tu seguridad y a tu futuro profesional.
          </p>
          <div className="courses-hero-actions courses-hero-enter courses-hero-enter--3">
            <a href="#catalog-results" className="hero-search-link">
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
              <BriefcaseBusiness /> <strong>Formación abierta</strong> e in-company
            </span>
          </div>
        </div>
        <div className="courses-hero-claim courses-hero-enter courses-hero-enter--4">
          <strong>
            Por tu seguridad, escoge <span>Trekform</span>
          </strong>
        </div>
      </section>

      <section className="registration-toolbar-wrap">
        <div className="registration-toolbar">
          <div className="registration-toolbar-primary">
            <label className="registration-search-field" htmlFor="course-search">
              <span>¿Qué curso buscas?</span>
              <div>
                <input
                  id="course-search"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Ej: Carretillas, Altura, PRL, PEMP..."
                  aria-label="Buscar cursos"
                />
                <Search />
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
            <CatalogSelect label="Ciudad" value={city} options={cities} onChange={setCity} />
            <CatalogSelect
              label="Categoría"
              value={category}
              options={catalogCategories}
              onChange={selectCategory}
            />
            <CatalogSelect
              label="Modalidad"
              value={modality}
              options={modalities}
              onChange={setModality}
            />
            <CatalogSelect label="Fecha / Mes" value={date} options={dates} onChange={setDate} />
            <div className="registration-toolbar-actions registration-toolbar-actions-wide">
              <button type="button" className="registration-toolbar-reset" onClick={clearFilters}>
                <RotateCcw size={15} /> Limpiar filtros
              </button>
              <a href="#catalog-results" className="registration-toolbar-submit" onClick={applyFilters}>
                Buscar cursos
              </a>
            </div>
            <div className="registration-active-chips">
              {appliedCity !== cities[0] ? (
                <button
                  onClick={() => {
                    setCity(cities[0])
                    setAppliedCity(cities[0])
                  }}
                >
                  {appliedCity} ×
                </button>
              ) : null}
              {date !== dates[0] ? (
                <button onClick={() => setDate(dates[0])}>{date} ×</button>
              ) : null}
              {appliedCategory !== 'Todos' ? (
                <button
                  onClick={() => {
                    setCategoryDraft('Todos')
                    setAppliedCategory('Todos')
                  }}
                >
                  {appliedCategory} ×
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="catalog-layout" id="catalog-results">
          <aside className="catalog-sidebar">
            <h2>Filtrar resultados</h2>
            <FilterGroup title="Categoría">
              {catalogCategories.slice(1).map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={category === item}
                    onChange={() => selectCategory(category === item ? 'Todos' : item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
              <button type="button" onClick={() => selectCategory('Todos')}>
                Ver todas las categorías
              </button>
            </FilterGroup>
            <FilterGroup title="Modalidad">
              {modalities.slice(1).map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={modality === item}
                    onChange={() => {
                      setModality(modality === item ? modalities[0] : item)
                      setPage(1)
                    }}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Duración">
              {durations.map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={durationFilters.includes(item)}
                    onChange={() => toggleFilterValue(setDurationFilters, item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Certificación">
              {certifications.map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={certificationFilters.includes(item)}
                    onChange={() => toggleFilterValue(setCertificationFilters, item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </FilterGroup>
            <button type="button" className="sidebar-reset" onClick={clearFilters}>
              <RotateCcw size={16} /> Limpiar filtros
            </button>
          </aside>

          <div className="catalog-results">
            <div className="catalog-summary">
              <div>
                <label className="catalog-sort-select">
                  <span>Ordenar por:</span>
                  <div>
                    <select defaultValue="Más relevantes">
                      <option>Más relevantes</option>
                      <option>Próximas fechas</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </label>
                <button type="button" className="view-toggle active">
                  <Grid3X3 size={15} /> Catálogo
                </button>
                <button type="button" className="view-toggle">
                  <CalendarDays size={15} /> Próximas convocatorias
                </button>
              </div>
            </div>

            {loading ? (
              <div className="catalog-empty catalog-loading" role="status">
                <span className="catalog-spinner" />
              </div>
            ) : error ? (
              <div className="catalog-empty" role="alert">
                <h2>No se pudo cargar el catálogo</h2>
                <p>{error}</p>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="catalog-grid">
                {visibleCourses.map((course, index) => {
                  const absoluteIndex = (page - 1) * pageSize + index
                  const meta = courseMetaById.get(course.id)!
                  const upcomingSessions = (sessionsByCourseSlug.get(course.slug) ?? []).slice(0, 3)

                  return (
                    <article className="catalog-card" key={course.id}>
                      <div className="catalog-image">
                        <img
                          src={
                            course.image || fallbackImages[absoluteIndex % fallbackImages.length]
                          }
                          alt={course.title}
                        />
                        <span>{course.category}</span>
                        {meta.bonificable ? <b>Bonificable</b> : null}
                        {absoluteIndex === 0 ? <em>Más demandado</em> : null}
                      </div>
                      <div className="catalog-card-body">
                        <h2>{course.title}</h2>
                        <p>
                          {course.description ||
                            'Formación segura y práctica con profesores especializados.'}
                        </p>
                        <div className="course-meta-row">
                          <span>
                            <User /> {meta.modality}
                          </span>
                          <span>
                            <Clock3 /> {meta.duration}
                          </span>
                          <span>
                            <MapPin /> {meta.city}
                          </span>
                        </div>
                        <div className="course-meta-row">
                          <span>
                            <Award /> {meta.certificate}
                          </span>
                        </div>
                        <div className="course-dates">
                          <small>Próx. fechas:</small>
                          {upcomingSessions.length > 0 ? (
                            upcomingSessions.map((session) => (
                              <span key={session.id}>
                                {cardDateFormatter.format(new Date(session.startsAt))}
                              </span>
                            ))
                          ) : (
                            <span>Próximamente</span>
                          )}
                        </div>
                        <div className="catalog-card-actions">
                          <Link to={`/cursos-trekform/${course.slug}`}>Ver detalles</Link>
                          {nextSessionByCourseSlug.has(course.slug) ? (
                            <button
                              type="button"
                              onClick={() => setActiveSession(nextSessionByCourseSlug.get(course.slug)!)}
                            >
                              Inscribirme
                            </button>
                          ) : (
                            <Link to={`/cursos-trekform/${course.slug}#convocatorias`}>
                              Inscribirme
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="catalog-empty">
                <Search />
                <h2>No hay cursos que coincidan</h2>
                <p>Prueba con otro término de búsqueda o cambia la categoría seleccionada.</p>
              </div>
            )}

            <div className="catalog-pagination">
              <span>
                {filteredCourses.length === 0 ? 0 : (page - 1) * pageSize + 1} a{' '}
                {Math.min(page * pageSize, filteredCourses.length)} de {filteredCourses.length}
              </span>
              <div>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                  <button
                    type="button"
                    className={page === item ? 'active' : ''}
                    onClick={() => goToPage(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
                <button type="button" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                  Siguiente
                </button>
              </div>
            </div>

            <div className="catalog-company-cta">
              <div className="courses-lower-enter courses-lower-enter--1" />
              <section className="courses-lower-enter courses-lower-enter--2">
                <h2>¿Necesitas formación para tu empresa?</h2>
                <p>
                  <Check /> Formación in-company a medida
                </p>
                <p>
                  <Check /> Planes formativos bonificables FUNDAE
                </p>
                <p>
                  <Check /> Nos adaptamos a tus horarios y necesidades
                </p>
              </section>
              <span className="courses-lower-enter courses-lower-enter--3">
                <BriefcaseBusiness /> Asesoramiento gratuito sin compromiso
              </span>
              <Link to="/contacto" className="courses-lower-enter courses-lower-enter--4">
                Solicitar formación a medida <ArrowRight size={18} />
              </Link>
            </div>

            <div className="catalog-trust-row">
              <article className="courses-lower-enter courses-lower-enter--1">
                <h3>Lo que opinan nuestros alumnos</h3>
                <div className="rating-stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} fill="currentColor" />
                  ))}
                  <strong>4,8/5</strong>
                </div>
                <p>Basado en +2.300 valoraciones</p>
              </article>
              <article className="courses-lower-enter courses-lower-enter--2">
                <p>
                  “Formación muy práctica y profesores excelentes. Las instalaciones y la maquinaria
                  en perfecto estado.”
                </p>
                <span>— Marta C.</span>
              </article>
              <article className="courses-lower-enter courses-lower-enter--3">
                <h3>¿Por qué elegir Trekform?</h3>
                <p>
                  <Check /> Formación práctica con maquinaria real
                </p>
                <p>
                  <Check /> Instructores expertos en activo
                </p>
                <p>
                  <Check /> Instalaciones propias y homologadas
                </p>
              </article>
              <article className="courses-lower-enter courses-lower-enter--4">
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
    </>
  )
}

function CatalogSelect({
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
        <ChevronDown />
      </div>
    </label>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="filter-group">
      <h3>
        {title}
        <ChevronDown size={15} />
      </h3>
      <div>{children}</div>
    </section>
  )
}
