import { LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const links = [
  { label: 'Inicio', to: '/panel', end: true },
  { label: 'Cursos', to: '/panel/cursos' },
  { label: 'Categorías', to: '/panel/categorias' },
  { label: 'Convocatorias', to: '/panel/convocatorias' },
  { label: 'Inscripciones', to: '/panel/inscripciones' },
  { label: 'Blog', to: '/panel/blog' },
  { label: 'Categorías del blog', to: '/panel/blog-categorias' },
  { label: 'Usuarios', to: '/panel/usuarios' },
] as const

export function AppLayout() {
  const { profile, session, signOut } = useAuth()
  const email = session?.user.email ?? null
  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() ||
    email ||
    'Administrador'
  const initials = displayName
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const [previousPathname, setPreviousPathname] = useState(location.pathname)

  if (location.pathname !== previousPathname) {
    setPreviousPathname(location.pathname)
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      // The toggle handles its own clicks; treating it as "outside" would close
      // the menu on pointerdown and reopen it on click.
      if (!sidebarRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  return (
    <div className="app-shell">
      <button
        ref={toggleRef}
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
            <NavLink key={link.to} to={link.to} end={'end' in link ? link.end : undefined}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" title={email ?? undefined}>
            <span className="sidebar-user__avatar" aria-hidden="true">
              {initials || <UserRound size={18} />}
            </span>
            <span className="sidebar-user__text">
              <span className="sidebar-user__name">{displayName}</span>
              <span className="sidebar-user__role">
                <ShieldCheck size={13} aria-hidden="true" /> Administrador
              </span>
            </span>
          </div>
          <button type="button" className="sidebar-logout" onClick={() => signOut()}>
            <LogOut size={16} aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
