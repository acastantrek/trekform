import { CourseCatalog } from '../components/courses/CourseCatalog'
import { TrekformAboutSection } from '../components/home/TrekformAboutSection'
import { TrekformFundedSection } from '../components/home/TrekformFundedSection'
import { TrekformHeroSection } from '../components/home/TrekformHeroSection'
import { LeadFormSection } from '../components/home/LeadFormSection'
import { NewsSection } from '../components/home/NewsSection'
import { TrekformStatsSection } from '../components/home/TrekformStatsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'

export function HomePage() {
  return (
    <>
      <TrekformHeroSection />
      <LeadFormSection />
      <section className="course-section">
        <div className="section-heading">
          <div>
            <span className="kicker">CURSOS TREKFORM</span>
            <h2>Cursos más destacados</h2>
          </div>
        </div>
        <CourseCatalog />
      </section>
      <TrekformStatsSection />
      <TrekformAboutSection />
      <TrekformFundedSection />
      <TestimonialsSection />
      <NewsSection />
    </>
  )
}
