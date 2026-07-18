import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TrekformLogo } from '../common/TrekformLogo'
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from '../common/SocialIcons'

const socialLinks = [
  { label: 'X (Twitter)', href: 'https://twitter.com/Trekform2', Icon: XIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/trek.form', Icon: FacebookIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/trekform/', Icon: LinkedinIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/trekform', Icon: InstagramIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@trekform938', Icon: YoutubeIcon },
] as const

const cities = [
  'BARCELONA - 93 264 05 32',
  'MADRID - 91 737 61 66',
  'SEVILLA - 95 544 15 23',
  'VALENCIA - 96 066 15 25',
  'ZARAGOZA - 87 666 00 75',
  'BILBAO - 94 477 06 15',
  'VIGO - 88 606 00 78',
  'G.CANARIA - 82 815 00 08',
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
          <p>No dudes en contactar con nuestro equipo para ampliar información.</p>
          <span>
            <Mail size={16} /> comercial@trekform.com
          </span>
          <span>
            <Phone size={16} /> 93 264 05 32
          </span>
          <div className="footer-social">
            {socialLinks.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon size={16} />
              </a>
            ))}
          </div>
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
        <span>
          © Copyright 2025 by <Link to="/">Trekform.com</Link>
        </span>
        <span>
          <Link to="/aviso-legal">Aviso legal</Link> ·{' '}
          <Link to="/politica-de-privacidad">Política de privacidad</Link> ·{' '}
          <Link to="/politica-de-cookies">Política de cookies</Link>
        </span>
      </div>
    </footer>
  )
}
