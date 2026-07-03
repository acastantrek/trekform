import { ArrowLeft, Clock3, MapPin } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ContactCta } from '../components/common/ContactCta'
import { courses } from '../data/courses'
export function CourseDetailPage() { const { courseSlug } = useParams(); const course = courses.find(item => item.slug === courseSlug); if (!course) return <Navigate to="/404" replace/>; return <><section className="detail-hero" style={{ '--accent': course.color } as React.CSSProperties}><div><Link className="back-link" to="/cursos"><ArrowLeft size={17}/> Volver a cursos</Link><span className="kicker">{course.category}</span><h1>{course.title}</h1><p>{course.description}</p><div className="detail-meta"><span><MapPin/>{course.place}</span><span><Clock3/>{course.duration}</span></div><Link className="primary" to="/contacto">Solicitar información</Link></div><img src={course.image} alt={`Curso de ${course.title}`}/></section><ContactCta/></> }
