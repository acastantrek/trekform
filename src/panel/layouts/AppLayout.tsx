import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const links = [
  { label: 'Cursos', to: '/panel/cursos' },
  { label: 'Categorías', to: '/panel/categorias' },
  { label: 'Convocatorias', to: '/panel/convocatorias' },
  { label: 'Blog', to: '/panel/blog' },
  { label: 'Categorías del blog', to: '/panel/blog-categorias' },
  { label: 'Inscripciones', to: '/panel/inscripciones' },
  { label: 'Usuarios', to: '/panel/usuarios' },
] as const

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!sidebarRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  return (
    <div className="app-shell">
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <span className="sidebar-title">
          Trekform <span>Admin</span>
        </span>
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <aside className={`sidebar${isOpen ? ' is-open' : ''}`} ref={sidebarRef}>
        <div className="sidebar-title sidebar-title--desktop">
          Trekform <span>Admin</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {profile && (
            <div className="sidebar-user">
              {profile.firstName ?? 'Administrador'} {profile.lastName ?? ''}
            </div>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => signOut()}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
