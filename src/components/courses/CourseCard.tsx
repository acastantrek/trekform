import { ArrowRight, Clock3, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Course } from '../../types/course'
export function CourseCard({ course, index }: { course: Course; index: number }) { return <article className="course-card" style={{ '--accent': course.color } as React.CSSProperties}><div className="course-image" style={{ backgroundImage: `url(${course.image})` }}><span>{String(index + 1).padStart(2, '0')}</span><b>{course.category}</b></div><div className="course-info"><h3>{course.title}</h3><div className="meta"><span><MapPin size={15}/>{course.place}</span><span><Clock3 size={15}/>{course.duration}</span></div><Link to={`/cursos/${course.slug}`}>Ver curso <ArrowRight size={18}/></Link></div></article> }
