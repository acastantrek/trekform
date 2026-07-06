import { ArrowRight, Clock3, MapPin } from 'lucide-react'
import type { Course } from '../../types/course'

export function HomeCourseCard({ course, index }: { course: Course; index: number }) {
  return (
    <article className="course-card" style={{ '--accent': course.color } as React.CSSProperties}>
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
        <button type="button" disabled className="disabled-link">
          Ver curso <ArrowRight size={18} />
        </button>
      </div>
    </article>
  )
}
