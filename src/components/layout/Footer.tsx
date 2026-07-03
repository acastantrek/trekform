import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../common/Logo'

const cities = ['Barcelona', 'Madrid', 'Sevilla', 'Valencia', 'Zaragoza', 'Bilbao', 'Vigo', 'Gran Canaria']

export function Footer() {
  return <footer><div className="footer-main"><div className="footer-brand"><Logo light/><p>Formación práctica en maquinaria industrial y prevención para particulares y empresas.</p><a href="mailto:hola@nexoformacion.es"><Mail size={16}/> hola@nexoformacion.es</a><a href="tel:+34932640532"><Phone size={16}/> 93 264 05 32</a></div><div><h4>Explora</h4><div className="footer-nav"><Link to="/nosotros">Nosotros</Link><Link to="/cursos">Cursos</Link><Link to="/empresas">Empresas</Link><Link to="/blog">Blog</Link><Link to="/contacto">Contacto</Link></div></div><div><h4>Centros y cobertura</h4><div className="city-grid">{cities.map(city => <span key={city}><MapPin size={13}/>{city}</span>)}</div></div></div><div className="footer-bottom"><span>© 2026 Nexo Formación</span><span>Privacidad · Cookies · Aviso legal</span></div></footer>
}
