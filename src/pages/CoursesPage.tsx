import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Grid3X3,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react'
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ProvincePickerModal } from '../components/registrations/ProvincePickerModal'
import { SessionAlertModal } from '../components/registrations/SessionAlertModal'
import { useCourses } from '../hooks/useCourses'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useUserLocation, type UserLocationStatus } from '../hooks/useUserLocation'
import { coordinatesForPlace, distanceKm, type Coordinates } from '../lib/geo'
import { getRegistrationSessions } from '../services/registrations'
import type { Course } from '../types/course'

const pageSize = 16
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
const modalities = ['Todas las modalidades', 'Presencial', 'Online', 'Semipresencial']
const modalityLabels = { presential: 'Presencial', online: 'Online', hybrid: 'Semipresencial' }
const durations = ['Hasta 4 horas', '4 - 8 horas', '8 - 16 horas', '+16 horas']
const certifications = ['Carnet / Diploma homologado', 'Bonificable FUNDAE', 'PRL']

const fallbackImages = [
  '/imagenes/services-1-1a.jpg',
  '/imagenes/services-1-2a.jpg',
  '/imagenes/services-1-3a.png',
  '/imagenes/services-1-4a.jpg',
  '/imagenes/services-1-5a.jpg',
  '/imagenes/services-1-6a.jpg',
  '/imagenes/services-1-10a.jpg',
  '/imagenes/carretillero_trekform_en_baleares.jpg',
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getCourseMeta(course: Course) {
  const durationHours = course.durationHours ?? 0
  // Hidden on the card when the course has no duration, rather than showing "0 h".
  const duration = !durationHours
    ? null
    : Number.isInteger(durationHours)
      ? `${durationHours} h`
      : `${durationHours.toFixed(1)} h`
  const modality = modalityLabels[course.modality]
  const certificate = course.accreditationTitle?.trim() || null
  const officialCertification = course.isOfficialCertification
  const bonificable = course.isFundaeEligible

  return { duration, durationHours, modality, certificate, officialCertification, bonificable }
}

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

function matchesCertificationFilter(
  filter: string,
  course: Course,
  meta: ReturnType<typeof getCourseMeta>,
) {
  switch (filter) {
    case 'Carnet / Diploma homologado':
      return meta.officialCertification
    case 'Bonificable FUNDAE':
      return meta.bonificable
    case 'PRL':
      return course.categories.some((item) => normalize(item).includes('prevencion'))
    default:
      return true
  }
}

export function CoursesPage() {
  const { courses: allCourses, loading, error } = useCourses()
  const isMobileFilters = useMediaQuery('(max-width: 680px)')
  // `?categoria=` (e.g. from a category card on the home) pre-applies the category filter.
  const [searchParams] = useSearchParams()
  const categoryQuery = searchParams.get('categoria')
  const [syncedCategoryQuery, setSyncedCategoryQuery] = useState(categoryQuery)
  const [category, setCategoryDraft] = useState(categoryQuery ?? 'Todos')
  const [search, setSearch] = useState('')
  const [modality, setModalityDraft] = useState(modalities[0])
  const [durationFilters, setDurationFilters] = useState<string[]>([])
  const [certificationFilters, setCertificationFilters] = useState<string[]>([])
  const [appliedCategory, setAppliedCategory] = useState(categoryQuery ?? 'Todos')
  const [appliedModality, setAppliedModality] = useState(modalities[0])
  const [page, setPage] = useState(1)
  const [provincesByCourseSlug, setProvincesByCourseSlug] = useState<Map<string, CourseProvince[]>>(
    new Map(),
  )
  const userLocation = useUserLocation()
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [alertTarget, setAlertTarget] = useState<SessionAlertTarget | null>(null)
  const [pickerCourse, setPickerCourse] = useState<Course | null>(null)
  /** The image shown on the card that opened the picker, reused as the modal's banner. */
  const [pickerImage, setPickerImage] = useState('')
  const navigate = useNavigate()
  const [filtersOpen, setFiltersOpen] = useState(false)

  if (categoryQuery && categoryQuery !== syncedCategoryQuery) {
    setSyncedCategoryQuery(categoryQuery)
    setCategoryDraft(categoryQuery)
    setAppliedCategory(categoryQuery)
    setPage(1)
  }

  useEffect(() => {
    if (searchParams.get('categoria')) {
      document
        .getElementById('catalog-results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

  const setModality = (value: string) => {
    setModalityDraft(value)
    if (!isMobileFilters) setAppliedModality(value)
  }

  useEffect(() => {
    getRegistrationSessions()
      .then((sessions) => {
        const provincesMap = new Map<string, Map<string, CourseProvince>>()
        sessions.forEach((session) => {
          const provinces =
            provincesMap.get(session.courseSlug) ?? new Map<string, CourseProvince>()
          const province = provinces.get(session.province) ?? {
            name: session.province,
            venueCoordinates: [],
            hasOpenSession: false,
          }
          // Only open sessions count as available: a course whose sessions are all full is
          // treated as having none, so the visitor is offered the "notify me" form instead.
          if (session.status === 'open') province.hasOpenSession = true
          // A province can host several venue cities; keep each one's coordinates so the
          // distance shown is to the nearest of them.
          const coordinates =
            session.province === 'Online'
              ? null
              : coordinatesForPlace(session.city, session.province)
          if (
            coordinates &&
            !province.venueCoordinates.some(
              (known) =>
                known.latitude === coordinates.latitude &&
                known.longitude === coordinates.longitude,
            )
          ) {
            province.venueCoordinates.push(coordinates)
          }
          provinces.set(session.province, province)
          provincesMap.set(session.courseSlug, provinces)
        })
        setProvincesByCourseSlug(
          new Map([...provincesMap].map(([slug, provinces]) => [slug, [...provinces.values()]])),
        )
        setSessionsLoaded(true)
      })
      // If sessions fail to load, "Convocatorias" goes straight to the registrations page,
      // since we can't tell which provinces (if any) have open sessions.
      .catch(() => {})
  }, [])

  const catalogCategories = useMemo(() => {
    const available = new Set(allCourses.flatMap((course) => course.categories))
    return ['Todos', ...categoryOrder.filter((item) => available.has(item))]
  }, [allCourses])

  const courseMetaById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getCourseMeta>>()
    allCourses.forEach((course) => {
      map.set(course.id, getCourseMeta(course))
    })
    return map
  }, [allCourses])

  // Each course's venue provinces, nearest first once we know where the visitor is (alphabetical
  // otherwise). Provinces without coordinates — "Online" or an unknown place — always go last.
  const provinceOptionsByCourseSlug = useMemo(() => {
    const origin = userLocation.coordinates
    const map = new Map<string, ProvinceOption[]>()
    provincesByCourseSlug.forEach((provinces, slug) => {
      const options = provinces.map((province) => ({
        ...province,
        distanceKm:
          origin && province.venueCoordinates.length > 0
            ? Math.min(...province.venueCoordinates.map((venue) => distanceKm(origin, venue)))
            : null,
      }))
      options.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm
        if (a.distanceKm !== null) return -1
        if (b.distanceKm !== null) return 1
        return a.name.localeCompare(b.name, 'es')
      })
      map.set(slug, options)
    })
    return map
  }, [provincesByCourseSlug, userLocation.coordinates])

  const registrationsLink = (course: Course, province: string | null) => {
    const params = new URLSearchParams({ curso: course.title })
    if (province) params.set('provincia', province)
    return `/inscripciones?${params}#registration-results`
  }

  // "Convocatorias": when the course has open sessions, ask which province first (nearest
  // first); otherwise go straight to the "notify me" form.
  const openConvocatorias = (course: Course, imageSrc: string) => {
    const provinces = provinceOptionsByCourseSlug.get(course.slug) ?? []
    if (provinces.some((province) => province.hasOpenSession)) {
      setPickerCourse(course)
      setPickerImage(imageSrc)
    } else
      setAlertTarget({
        courseId: course.id,
        courseTitle: course.title,
        province: null,
        otherProvincesLink: null,
      })
  }

  // Picking a province (or all of them) opens the registrations page filtered accordingly; a
  // province whose sessions are all full offers the "notify me" form, linking to the others.
  const selectPickerProvince = (province: string | null) => {
    const course = pickerCourse
    if (!course) return
    setPickerCourse(null)
    const option = province
      ? provinceOptionsByCourseSlug.get(course.slug)?.find((item) => item.name === province)
      : null
    if (province && option && !option.hasOpenSession) {
      setAlertTarget({
        courseId: course.id,
        courseTitle: course.title,
        province,
        otherProvincesLink: registrationsLink(course, null),
      })
      return
    }
    navigate(registrationsLink(course, province))
  }

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
      const matchesModality = appliedModality === modalities[0] || meta.modality === appliedModality
      const matchesDuration =
        durationFilters.length === 0 ||
        durationFilters.some((filter) => matchesDurationFilter(filter, meta.durationHours))
      const matchesCertification =
        certificationFilters.length === 0 ||
        certificationFilters.some((filter) => matchesCertificationFilter(filter, course, meta))

      if (!matchesCategory || !matchesModality || !matchesDuration || !matchesCertification)
        return false
      if (!query) return true

      const haystack = normalize(
        [
          course.title,
          course.slug,
          course.category,
          course.categories.join(' '),
          course.description,
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
      document
        .getElementById('catalog-results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const selectCategory = (value: string) => {
    setCategoryDraft(value)
    if (!isMobileFilters) setAppliedCategory(value)
    setPage(1)
  }

  const applyFilters = () => {
    setAppliedCategory(category)
    setAppliedModality(modality)
    setPage(1)
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setCategoryDraft('Todos')
    setAppliedCategory('Todos')
    setSearch('')
    setModalityDraft(modalities[0])
    setAppliedModality(modalities[0])
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
              <Users /> <strong>+250.000</strong> alumnos formados
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
        <div className="registration-toolbar courses-toolbar">
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
            <div className="registration-toolbar-mobile-filters">
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
            </div>
            <div className="registration-toolbar-actions registration-toolbar-actions-wide">
              <button type="button" className="registration-toolbar-reset" onClick={clearFilters}>
                <RotateCcw size={15} /> Limpiar filtros
              </button>
              <a
                href="#catalog-results"
                className="registration-toolbar-submit"
                onClick={applyFilters}
              >
                Buscar cursos
              </a>
            </div>
            <div className="registration-active-chips">
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
              <LocateButton status={userLocation.status} onLocate={userLocation.locate} />
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
                  const imageSrc =
                    course.image || fallbackImages[absoluteIndex % fallbackImages.length]
                  return (
                    <article
                      className="catalog-card"
                      key={course.id}
                      style={{ '--card-index': index } as CSSProperties}
                    >
                      <div className="catalog-image">
                        <img src={imageSrc} alt={course.title} />
                        <span>{course.category}</span>
                        {meta.bonificable ? <b>Bonificable</b> : null}
                        {course.featured ? <em>Más demandado</em> : null}
                      </div>
                      <div className="catalog-card-body">
                        <h2>
                          <Link to={`/cursos-trekform/${course.slug}`}>{course.title}</Link>
                        </h2>
                        <Link
                          className="catalog-card-details"
                          to={`/cursos-trekform/${course.slug}`}
                          aria-label={`Ver detalles de ${course.title}`}
                        >
                          Ver detalles <ArrowUpRight aria-hidden="true" />
                        </Link>
                        <div className="catalog-card-actions">
                          {sessionsLoaded ? (
                            <button
                              type="button"
                              onClick={() => openConvocatorias(course, imageSrc)}
                            >
                              Ver convocatorias <ArrowRight aria-hidden="true" />
                            </button>
                          ) : (
                            <Link to={registrationsLink(course, null)}>
                              Ver convocatorias <ArrowRight aria-hidden="true" />
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
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
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

      {pickerCourse ? (
        <ProvincePickerModal
          imageSrc={pickerImage}
          imageAlt={pickerCourse.title}
          provinces={provinceOptionsByCourseSlug.get(pickerCourse.slug) ?? []}
          onSelect={selectPickerProvince}
          onClose={() => setPickerCourse(null)}
        />
      ) : null}
      {alertTarget ? (
        <SessionAlertModal {...alertTarget} onClose={() => setAlertTarget(null)} />
      ) : null}
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

interface CourseProvince {
  name: string
  /** One entry per distinct venue city in the province (empty for "Online"). */
  venueCoordinates: Coordinates[]
  /** Whether any of the course's sessions in this province is open for enrolment. */
  hasOpenSession: boolean
}

interface SessionAlertTarget {
  courseId: string
  courseTitle: string
  province: string | null
  otherProvincesLink: string | null
}

interface ProvinceOption extends CourseProvince {
  distanceKm: number | null
}

const locateLabels: Record<UserLocationStatus, string> = {
  idle: 'Cerca de mí',
  locating: 'Buscando…',
  ready: 'Ordenado por cercanía',
  denied: 'Ubicación bloqueada',
  unavailable: 'Reintentar ubicación',
}

function LocateButton({ status, onLocate }: { status: UserLocationStatus; onLocate: () => void }) {
  const hint =
    status === 'denied'
      ? 'Activa el permiso de ubicación del navegador para ver las convocatorias más cercanas'
      : status === 'ready'
        ? 'Las provincias de cada convocatoria aparecen ordenadas de más cercana a más lejana'
        : 'Usa tu ubicación para ordenar las convocatorias de cada curso por cercanía'

  return (
    <button
      type="button"
      className={`catalog-locate${status === 'ready' ? ' is-active' : ''}`}
      onClick={onLocate}
      disabled={status === 'locating'}
      title={hint}
      aria-live="polite"
    >
      {status === 'locating' ? (
        <span className="catalog-locate-spinner" aria-hidden="true" />
      ) : (
        <LocateFixed size={15} aria-hidden="true" />
      )}
      {locateLabels[status]}
    </button>
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
