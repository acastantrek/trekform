import { AboutSection } from '../components/home/AboutSection'
import { StatsSection } from '../components/home/StatsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'

export function AboutPage() {
  return <><section className="page-hero simple"><span className="kicker">SOBRE NEXO</span><h1>Formación que transforma el trabajo.</h1><p>Más de dos décadas ayudando a profesionales y empresas a trabajar con más conocimiento y seguridad.</p></section><AboutSection/><StatsSection/><TestimonialsSection/></>
}
