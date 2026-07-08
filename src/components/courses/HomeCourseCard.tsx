import { ArrowRight, Clock3, MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Course } from '../../types/course'

export function HomeCourseCard({ course, index }: { course: Course; index: number }) {
  return (
    <article
      className="course-card"
      data-reveal
      style={
        {
          '--accent': course.color,
          '--reveal-delay': `${0.05 + index * 0.04}s`,
        } as CSSProperties
      }
    >
      <div className="course-image" style={{ backgroundImage: `url(${course.image})` }}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <b>{course.category}</b>
      </div>
      <div className="course-info">
        <h3>{course.title}</h3>
        <div className="meta">
          <span>
            <MapPin size={15} />
            {course.place}
          </span>
          <span>
            <Clock3 size={15} />
            {course.duration}
          </span>
        </div>
        <Link to={`/cursos-trekform/${course.slug}`}>
          Ver curso <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  )
}
