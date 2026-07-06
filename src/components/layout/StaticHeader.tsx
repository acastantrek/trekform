import { useState } from 'react'
import { ArrowRight, Menu, Phone, ShieldCheck, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { TrekformLogo } from '../common/TrekformLogo'

const links = ['Inicio', '¿Quiénes somos?', 'Cursos', 'Inscripciones', 'Blog', 'Contacto']

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
          <span className="top-sep">L–J 9:00–18:00 · V 9:00–15:00</span>
        </div>
      </div>
      <header className="nav-wrap">
        <TrekformLogo />
        <nav className={`nav${isOpen ? ' open' : ''}`} aria-label="Navegación principal">
          {links.map((label) =>
            label === 'Inicio' ? (
              <NavLink
                key={label}
                end
                className="enabled-link"
                to="/"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </NavLink>
            ) : label === '¿Quiénes somos?' ? (
              <NavLink
                key={label}
                className="enabled-link"
                to="/quienes-somos"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </NavLink>
            ) : label === 'Cursos' ? (
              <NavLink
                key={label}
                className="enabled-link"
                to="/cursos-trekform"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </NavLink>
            ) : (
              <button type="button" disabled key={label} className="disabled-link">
                {label}
              </button>
            ),
          )}
          <button type="button" disabled className="mobile-cta disabled-link">
            ¡Inscríbete ahora!
          </button>
        </nav>
        <button type="button" disabled className="nav-cta disabled-link">
          ¡Inscríbete ahora! <ArrowRight size={17} />
        </button>
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
