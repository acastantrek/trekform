import { ArrowRight, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCourses } from '../hooks/useCourses'

export function CoursesPage() {
  const { courses: allCourses, loading, error } = useCourses()
  const [category, setCategory] = useState('Todos')
  const catalogCategories = useMemo(
    () => ['Todos', ...new Set(allCourses.map((course) => course.category))],
    [allCourses],
  )
  const courses = useMemo(
    () =>
      category === 'Todos'
        ? allCourses
        : allCourses.filter((course) => course.category === category),
    [allCourses, category],
  )

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
          <div>
            <SlidersHorizontal />
            <label htmlFor="course-category">Selecciona la categoría</label>
          </div>
          <div className="select-wrap">
            <select
              id="course-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
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
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="catalog-summary">
          <p>
            <strong>{courses.length}</strong> cursos encontrados
          </p>
          <span>{category}</span>
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
        ) : courses.length > 0 ? (
          <div className="catalog-grid">
            {courses.map((course, index) => (
              <article className="catalog-card" key={course.id}>
                <div className="catalog-image">
                  <img src={course.image} alt={course.title} />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="catalog-card-body">
                  <small>{course.category}</small>
                  <h2>{course.title}</h2>
                  <button type="button" disabled className="disabled-link">
                    Información <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <SlidersHorizontal />
            <h2>No hay cursos en esta categoría</h2>
            <p>Selecciona otra categoría para consultar la formación disponible.</p>
          </div>
        )}
        <div className="catalog-pagination">
          <span>
            1 a {courses.length} de {courses.length}
          </span>
          <div>
            <button type="button" className="active">
              1
            </button>
            <button type="button" disabled>
              2
            </button>
            <button type="button" disabled>
              3
            </button>
            <button type="button" disabled>
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
