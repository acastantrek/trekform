import { useState } from 'react'
import { ArrowRight, Mail, Menu, ShieldCheck, X } from 'lucide-react'
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
          <span>
            <Mail size={15} /> comercial@trekform.com
          </span>
          <span className="top-sep">
            Lunes a Jueves de 9:00h - 18:00h | Viernes de 9:00h - 15:00h
          </span>
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
