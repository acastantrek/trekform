import { useState } from 'react'
import { ArrowRight, Mail, Menu, Phone, ShieldCheck, X } from 'lucide-react'
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

const cityPhones = [
  'BARCELONA 932640532',
  'MADRID 917376166',
  'SEVILLA 955441523',
  'VALENCIA 960661525',
  'ZARAGOZA 876660075',
  'BILBAO 944770615',
  'VIGO 886060078',
  'G.CANARIA 828150008',
  'RESTO POBLACIONES 932640532',
]

export function StaticHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="cityline">
        {cityPhones.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="topline">
        <span>
          <ShieldCheck size={16} /> ¡Por tu seguridad, escoge Trekform!
        </span>
        <div>
          <span>
            <Mail size={15} /> comercial@trekform.com
          </span>
          <span>
            <Phone size={15} /> 93 264 05 32
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
