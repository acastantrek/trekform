import { CourseCatalog } from '../components/courses/CourseCatalog'
import { AboutSection } from '../components/home/AboutSection'
import { FundedTrainingSection } from '../components/home/FundedTrainingSection'
import { HeroSection } from '../components/home/HeroSection'
import { LeadFormSection } from '../components/home/LeadFormSection'
import { NewsSection } from '../components/home/NewsSection'
import { StatsSection } from '../components/home/StatsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'

export function HomePage() {
  return <><HeroSection/><LeadFormSection/><section className="course-section"><div className="section-heading"><div><span className="kicker">CURSOS NEXO</span><h2>Cursos más destacados</h2></div><p>Formación diseñada para el trabajo real, con teoría esencial, práctica y acreditación.</p></div><CourseCatalog/></section><StatsSection/><AboutSection/><FundedTrainingSection/><TestimonialsSection/><NewsSection/></>
}
