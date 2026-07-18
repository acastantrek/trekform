import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ContactCtaBanner() {
  return (
    <section className="home-cta-banner" data-reveal>
      <div>
        <span>¿HABLAMOS?</span>
        <h3>Cuéntanos qué necesitas y te ayudamos a elegir la formación adecuada.</h3>
      </div>
      <Link to="/contacto" className="home-cta-banner-button">
        Contactar ahora <ArrowRight size={18} />
      </Link>
    </section>
  )
}
