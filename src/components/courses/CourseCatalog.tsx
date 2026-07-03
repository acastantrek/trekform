import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { courseCategories, courses } from '../../data/courses'
import type { CourseCategory } from '../../types/course'
import { CourseCard } from './CourseCard'
type CategoryFilter = 'Todos' | CourseCategory
export function CourseCatalog() { const [category, setCategory] = useState<CategoryFilter>('Todos'); const [query, setQuery] = useState(''); const filteredCourses = useMemo(() => courses.filter(course => (category === 'Todos' || course.category === category) && course.title.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))), [category, query]); return <><div className="filters"><div className="tabs" role="group" aria-label="Filtrar por categoría">{courseCategories.map(item => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search"><Search size={19}/><span className="sr-only">Buscar curso</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar un curso..."/></label></div><div className="course-grid">{filteredCourses.map((course, index) => <CourseCard course={course} index={index} key={course.slug}/>)}{filteredCourses.length === 0 && <p className="empty">No hay cursos que coincidan con tu búsqueda.</p>}</div></> }
