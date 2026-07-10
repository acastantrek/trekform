import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export function ProtectedRoute() {
  const { loading, session, isAdmin, signOut } = useAuth()

  if (loading) {
    return <div className="page-loading">Cargando…</div>
  }

  if (!session) {
    return <Navigate to="/panel/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="unauthorized">
        <h1>Acceso no autorizado</h1>
        <p>Esta cuenta no tiene permisos de administrador.</p>
        <button type="button" onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </div>
    )
  }

  return <Outlet />
}
