import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useCourses } from '../../hooks/useCourses'
import type { Course } from '../../types/course'
import { HomeCourseCard } from './HomeCourseCard'

export function CourseCatalog({ staticCourses }: { staticCourses?: Course[] }) {
  const { courses: remoteCourses, loading, error } = useCourses(true, !staticCourses)
  const courses = staticCourses ?? remoteCourses
  const showLoading = !staticCourses && loading
  const showError = !staticCourses && error
  const [category, setCategory] = useState('Todos')
  const [query, setQuery] = useState('')
  const courseCategories = useMemo(
    () => ['Todos', ...new Set(courses.flatMap((course) => course.categories))],
    [courses],
  )
  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          (category === 'Todos' || course.categories.includes(category)) &&
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
      {showLoading ? (
        <p className="empty" role="status">
          Cargando cursos...
        </p>
      ) : showError ? (
        <p className="empty" role="alert">
          {showError}
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
