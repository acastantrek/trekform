import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Grid3X3,
  MapPin,
  RotateCcw,
  Search,
  Star,
  User,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
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
const prices = ['Todos los precios', 'Hasta 50 €', '50 € - 120 €', '+120 €']
const clientTypes = ['Particulares y empresas', 'Particulares', 'Empresas']
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

function getCourseMeta(course: Course, index: number) {
  const durationMatch = course.duration.match(/\d+/)
  const duration = durationMatch ? `${durationMatch[0]} h` : index % 4 === 0 ? '6 h' : '8 h'
  const price = [120, 130, 140, 120, 150, 110, 100, 25][index % 8]
  const city = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla'][index % 4]
  const modality = course.category.toLowerCase().includes('online') ? 'Online' : 'Presencial'
  const certificate =
    index % 3 === 0
      ? 'Carnet homologado'
      : index % 3 === 1
        ? 'Diploma homologado'
        : 'Certificado PRL'
  const nextDates =
    index % 5 === 0
      ? ['Inicio inmediato']
      : index % 2 === 0
        ? ['02 Jun', '09 Jun', '16 Jun']
        : ['03 Jun', '10 Jun', '17 Jun']

  return { duration, price, city, modality, certificate, dates: nextDates }
}

export function CoursesPage() {
  const { courses: allCourses, loading, error } = useCourses()
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [city, setCity] = useState(cities[0])
  const [modality, setModality] = useState(modalities[0])
  const [date, setDate] = useState(dates[0])
  const [price, setPrice] = useState(prices[0])
  const [clientType, setClientType] = useState(clientTypes[0])
  const [page, setPage] = useState(1)

  const catalogCategories = useMemo(() => {
    const available = new Set(allCourses.flatMap((course) => course.categories))
    return ['Todos', ...categoryOrder.filter((item) => available.has(item))]
  }, [allCourses])

  const filteredCourses = useMemo(() => {
    const query = normalize(search.trim())

    return allCourses.filter((course, index) => {
      const meta = getCourseMeta(course, index)
      const matchesCategory = category === 'Todos' || course.categories.includes(category)
      const matchesCity = city === cities[0] || meta.city === city
      const matchesModality = modality === modalities[0] || meta.modality === modality
      const matchesPrice =
        price === prices[0] ||
        (price === prices[1] && meta.price <= 50) ||
        (price === prices[2] && meta.price > 50 && meta.price <= 120) ||
        (price === prices[3] && meta.price > 120)

      if (!matchesCategory || !matchesCity || !matchesModality || !matchesPrice) return false
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
  }, [allCourses, category, city, modality, price, search])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const visibleCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize)

  const selectCategory = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  const clearFilters = () => {
    setCategory('Todos')
    setSearch('')
    setCity(cities[0])
    setModality(modalities[0])
    setDate(dates[0])
    setPrice(prices[0])
    setClientType(clientTypes[0])
    setPage(1)
  }

  return (
    <>
      <section className="courses-page-hero">
        <div className="courses-hero-content">
          <h1>
            Cursos abiertos <span>Trekform</span>
          </h1>
          <p>
            Formación práctica, certificada y enfocada a tu seguridad y a tu futuro profesional.
          </p>
          <div className="courses-hero-actions">
            <a href="#catalog-results" className="hero-search-link">
              Buscar curso <Search size={18} />
            </a>
            <a
              className="hero-calendar-link"
              href="https://drive.google.com/"
              target="_blank"
              rel="noreferrer"
            >
              Descargar calendario <CalendarDays size={18} />
            </a>
          </div>
          <div className="courses-hero-metrics">
            <span>
              <Award /> <strong>+20 años</strong> de experiencia
            </span>
            <span>
              <Users /> <strong>+200.000</strong> alumnos formados
            </span>
            <span>
              <MapPin /> <strong>Cobertura</strong> nacional
            </span>
            <span>
              <BriefcaseBusiness /> <strong>Formación abierta</strong> e in-company
            </span>
          </div>
        </div>
        <div className="courses-hero-claim">
          <strong>
            Por tu seguridad, escoge <span>Trekform</span>
          </strong>
        </div>
      </section>

      <section className="catalog-section">
        <div className="catalog-toolbar">
          <label className="catalog-search-field" htmlFor="course-search">
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
          <CatalogSelect label="Precio" value={price} options={prices} onChange={setPrice} />
          <CatalogSelect
            label="Tipo de cliente"
            value={clientType}
            options={clientTypes}
            onChange={setClientType}
          />
          <button type="button" className="catalog-reset" onClick={clearFilters}>
            <RotateCcw size={15} /> Limpiar filtros
          </button>
          <button type="button" className="catalog-submit">
            Buscar cursos
          </button>
          <div className="active-filter-chips">
            {city !== cities[0] ? (
              <button onClick={() => setCity(cities[0])}>{city} ×</button>
            ) : null}
            {date !== dates[0] ? <button onClick={() => setDate(dates[0])}>{date} ×</button> : null}
            {category !== 'Todos' ? (
              <button onClick={() => selectCategory('Todos')}>{category} ×</button>
            ) : null}
          </div>
        </div>

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
              {durations.map((item, index) => (
                <label key={item}>
                  <input type="checkbox" defaultChecked={index === 1} />
                  <span>{item}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Certificación">
              {certifications.map((item, index) => (
                <label key={item}>
                  <input type="checkbox" defaultChecked={index === 0} />
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
              <p>
                <strong>{filteredCourses.length}</strong> cursos encontrados
              </p>
              <div>
                <label>
                  Ordenar por:
                  <select defaultValue="Más relevantes">
                    <option>Más relevantes</option>
                    <option>Precio menor</option>
                    <option>Próximas fechas</option>
                  </select>
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
              <div className="catalog-empty" role="status">
                <h2>Cargando cursos...</h2>
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
                  const meta = getCourseMeta(course, absoluteIndex)

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
                        {absoluteIndex % 3 === 1 ? <b>Bonificable</b> : null}
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
                          {meta.dates.map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                        </div>
                        <strong className="course-price">Desde {meta.price} €</strong>
                        <div className="catalog-card-actions">
                          <Link to={`/cursos-trekform/${course.slug}`}>Ver fechas</Link>
                          <Link to="/inscripciones">Inscribirme</Link>
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

            <div className="catalog-company-cta">
              <div />
              <section>
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
              <span>
                <BriefcaseBusiness /> Asesoramiento gratuito sin compromiso
              </span>
              <Link to="/contacto">
                Solicitar formación a medida <ArrowRight size={18} />
              </Link>
            </div>

            <div className="catalog-trust-row">
              <article>
                <h3>Lo que opinan nuestros alumnos</h3>
                <div className="rating-stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} fill="currentColor" />
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
                  <Check /> Formación práctica con maquinaria real
                </p>
                <p>
                  <Check /> Instructores expertos en activo
                </p>
                <p>
                  <Check /> Instalaciones propias y homologadas
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
                    onClick={() => setPage(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
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
    <label className="catalog-select">
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
