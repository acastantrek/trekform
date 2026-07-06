import { useState } from 'react'
import { ArrowRight, Menu, Phone, ShieldCheck, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { TrekformLogo } from '../common/TrekformLogo'

const links = [
  { label: 'Inicio', to: '/' },
  { label: 'Quiénes somos', to: '/quienes-somos' },
  { label: 'Cursos', to: '/cursos-trekform' },
  { label: 'Inscripciones', to: '/inscripciones' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contacto', to: '/contacto' },
] as const

export function StaticHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="topline">
        <span>
          <ShieldCheck size={16} /> ¡Por tu seguridad, escoge Trekform!
        </span>
        <div>
          <span>comercial@trekform.com</span>
          <span>
            <Phone size={15} /> 93 264 05 32
          </span>
          <span className="top-sep">L-J 9:00-18:00 · V 9:00-15:00</span>
        </div>
      </div>
      <header className="nav-wrap">
        <TrekformLogo />
        <nav className={`nav${isOpen ? ' open' : ''}`} aria-label="Navegación principal">
          {links.map(({ label, to }) => (
            <NavLink key={label} className="enabled-link" to={to} onClick={() => setIsOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink className="nav-cta" to="/inscripciones">
          ¡Inscríbete ahora! <ArrowRight size={17} />
        </NavLink>
        <button
          className="menu"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </header>
    </>
  )
}
