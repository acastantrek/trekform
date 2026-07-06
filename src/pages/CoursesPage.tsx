import { ArrowRight, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'

const pageSize = 12
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

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function CoursesPage() {
  const { courses: allCourses, loading, error } = useCourses()
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const catalogCategories = useMemo(() => {
    const available = new Set(allCourses.flatMap((course) => course.categories))
    return ['Todos', ...categoryOrder.filter((item) => available.has(item))]
  }, [allCourses])

  const filteredCourses = useMemo(() => {
    const query = normalize(search.trim())

    return allCourses.filter((course) => {
      const matchesCategory =
        category === 'Todos' || course.categories.includes(category)

      if (!matchesCategory) return false
      if (!query) return true

      const haystack = normalize(
        [course.title, course.slug, course.category, course.categories.join(' '), course.description]
          .filter(Boolean)
          .join(' '),
      )

      return haystack.includes(query)
    })
  }, [allCourses, category, search])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const visibleCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize)

  const selectCategory = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  const clearSearch = () => {
    setSearch('')
    setPage(1)
  }

  return (
    <>
      <section className="courses-page-hero">
        <div>
          <span>FORMACIÓN EN MAQUINARIA INDUSTRIAL Y PRL</span>
          <h1>Catálogo de cursos Trekform</h1>
          <p>
            Inicio <i /> Cursos
          </p>
        </div>
      </section>
      <section className="catalog-section">
        <div className="catalog-toolbar">
          <div className="catalog-toolbar-title">
            <SlidersHorizontal />
            <label htmlFor="course-category">Selecciona la categoría</label>
          </div>
          <div className="catalog-toolbar-search">
            <Search />
            <input
              id="course-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Buscar curso, categoría o palabra clave"
              aria-label="Buscar cursos"
            />
            {search ? (
              <button type="button" className="clear-search" onClick={clearSearch} aria-label="Limpiar búsqueda">
                <X size={16} />
              </button>
            ) : null}
          </div>
          <div className="select-wrap">
            <select
              id="course-category"
              value={category}
              onChange={(event) => selectCategory(event.target.value)}
            >
              {catalogCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
        <div className="category-pills" role="group" aria-label="Filtrar cursos por categoría">
          {catalogCategories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => selectCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="catalog-summary">
          <p>
            <strong>{filteredCourses.length}</strong> cursos encontrados
          </p>
          <span>
            {category}
            {search ? ` · ${search}` : ''}
          </span>
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
            {visibleCourses.map((course, index) => (
              <article className="catalog-card" key={course.id}>
                <div className="catalog-image">
                  <img src={course.image} alt={course.title} />
                  <span>{String((page - 1) * pageSize + index + 1).padStart(2, '0')}</span>
                </div>
                <div className="catalog-card-body">
                  <small>{course.category}</small>
                  <h2>{course.title}</h2>
                  <Link className="catalog-course-link" to={`/cursos-trekform/${course.slug}`}>
                    Información <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
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
                onClick={() => setPage(item)}
                key={item}
              >
                {item}
              </button>
            ))}
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
