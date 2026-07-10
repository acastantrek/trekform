import { NavLink, Outlet } from 'react-router-dom'
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-title">
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
