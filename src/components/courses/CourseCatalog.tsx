import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useCourses } from '../../hooks/useCourses'
import { HomeCourseCard } from './HomeCourseCard'

export function CourseCatalog() {
  const { courses, loading, error } = useCourses(true)
  const [category, setCategory] = useState('Todos')
  const [query, setQuery] = useState('')
  const courseCategories = useMemo(
    () => ['Todos', ...new Set(courses.map((course) => course.category))],
    [courses],
  )
  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          (category === 'Todos' || course.category === category) &&
          course.title.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')),
      ),
    [category, courses, query],
  )

  return (
    <>
      <div className="filters">
        <div className="tabs" role="group" aria-label="Filtrar por categoría">
          {courseCategories.map((item) => (
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
        <label className="search">
          <Search size={19} />
          <span className="sr-only">Buscar curso</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar un curso..."
          />
        </label>
      </div>
      {loading ? (
        <p className="empty" role="status">
          Cargando cursos...
        </p>
      ) : error ? (
        <p className="empty" role="alert">
          {error}
        </p>
      ) : (
        <div className="course-grid">
          {filteredCourses.map((course, index) => (
            <HomeCourseCard course={course} index={index} key={course.id} />
          ))}
          {filteredCourses.length === 0 && (
            <p className="empty">No hay cursos que coincidan con tu búsqueda.</p>
          )}
        </div>
      )}
    </>
  )
}
