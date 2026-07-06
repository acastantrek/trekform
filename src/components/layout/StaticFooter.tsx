import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TrekformLogo } from '../common/TrekformLogo'

const cities = [
  'Barcelona',
  'Madrid',
  'Sevilla',
  'Valencia',
  'Zaragoza',
  'Bilbao',
  'Vigo',
  'Gran Canaria',
]
const links = [
  { label: 'Quiénes somos', to: '/quienes-somos' },
  { label: 'Cursos', to: '/cursos-trekform' },
  { label: 'Inscripciones', to: '/inscripciones' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contacto', to: '/contacto' },
] as const

export function StaticFooter() {
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand">
          <TrekformLogo light />
          <p>
            Formación práctica en maquinaria industrial y prevención para particulares y empresas.
          </p>
          <span>
            <Mail size={16} /> comercial@trekform.com
          </span>
          <span>
            <Phone size={16} /> 93 264 05 32
          </span>
        </div>
        <div>
          <h4>Enlaces de interés</h4>
          <div className="footer-nav">
            {links.map(({ label, to }) => (
              <Link key={label} to={to}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4>Centros y cobertura</h4>
          <div className="city-grid">
            {cities.map((city) => (
              <span key={city}>
                <MapPin size={13} />
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Trekform</span>
        <span>Aviso legal · Política de privacidad · Política de cookies</span>
      </div>
    </footer>
  )
}
