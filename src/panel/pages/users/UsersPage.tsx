import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { DataTable } from '../../components/DataTable'
import { FormField } from '../../components/FormField'
import { useAuth } from '../../contexts/useAuth'
import { inviteAdminUser, listUsers, updateUserActive, updateUserRole } from '../../services/users'
import type { AdminUser, AppRole } from '../../types'

const roleOptions: AppRole[] = ['admin', 'student', 'company']

const roleLabel: Record<AppRole, string> = {
  admin: 'Administrador',
  student: 'Alumno',
  company: 'Empresa',
}

const emptyInviteForm = { email: '', firstName: '', lastName: '' }

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString('es-ES') : '—'
}

export function UsersPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [inviteForm, setInviteForm] = useState(emptyInviteForm)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  async function reload() {
    try {
      setUsers(await listUsers())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listUsers()
      .then((data) => {
        setUsers(data)
        setError(null)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar los usuarios.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleInvite(event: FormEvent) {
    event.preventDefault()
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(null)
    try {
      await inviteAdminUser(inviteForm)
      setInviteSuccess(`Invitación enviada a ${inviteForm.email}.`)
      setInviteForm(emptyInviteForm)
      await reload()
    } catch (cause) {
      setInviteError(cause instanceof Error ? cause.message : 'No se pudo enviar la invitación.')
    } finally {
      setInviting(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter((user) => {
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.toLowerCase()
      return name.includes(term) || (user.email ?? '').toLowerCase().includes(term)
    })
  }, [users, search])

  async function handleRoleChange(user: AdminUser, role: AppRole) {
    setUpdatingId(user.id)
    try {
      await updateUserRole(user.id, role)
      setUsers((prev) => prev.map((row) => (row.id === user.id ? { ...row, role } : row)))
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo actualizar el rol.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleActiveChange(user: AdminUser, isActive: boolean) {
    setUpdatingId(user.id)
    try {
      await updateUserActive(user.id, isActive)
      setUsers((prev) => prev.map((row) => (row.id === user.id ? { ...row, isActive } : row)))
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo actualizar el estado.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Gestiona quién tiene acceso de administrador al panel.</p>
        </div>
      </div>

      <form className="form" onSubmit={handleInvite} style={{ marginBottom: 24 }}>
        <h2>Invitar administrador</h2>
        <p className="form-field-hint" style={{ marginTop: -4, marginBottom: 12 }}>
          Se enviará un email de invitación para que la persona establezca su propia contraseña.
        </p>
        {inviteError && <div className="alert alert-error">{inviteError}</div>}
        {inviteSuccess && <div className="alert alert-success">{inviteSuccess}</div>}

        <div className="form-grid">
          <FormField label="Nombre" htmlFor="invite-first-name">
            <input
              id="invite-first-name"
              value={inviteForm.firstName}
              onChange={(event) => setInviteForm((prev) => ({ ...prev, firstName: event.target.value }))}
            />
          </FormField>
          <FormField label="Apellidos" htmlFor="invite-last-name">
            <input
              id="invite-last-name"
              value={inviteForm.lastName}
              onChange={(event) => setInviteForm((prev) => ({ ...prev, lastName: event.target.value }))}
            />
          </FormField>
          <FormField label="Email" htmlFor="invite-email">
            <input
              id="invite-email"
              type="email"
              required
              value={inviteForm.email}
              onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </FormField>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={inviting}>
            {inviting ? 'Enviando…' : 'Enviar invitación'}
          </button>
        </div>
      </form>

      <div className="filters-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <DataTable
          rows={filteredUsers}
          rowKey={(row) => row.id}
          emptyMessage="No hay usuarios para esta búsqueda."
          columns={[
            {
              header: 'Nombre',
              render: (row) => [row.firstName, row.lastName].filter(Boolean).join(' ') || '—',
            },
            { header: 'Email', render: (row) => row.email ?? '—' },
            { header: 'Alta', render: (row) => formatDate(row.createdAt) },
            {
              header: 'Rol',
              render: (row) =>
                row.id === profile?.id ? (
                  <span>{roleLabel[row.role]} (tú)</span>
                ) : (
                  <select
                    value={row.role}
                    disabled={updatingId === row.id}
                    onChange={(event) => handleRoleChange(row, event.target.value as AppRole)}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel[role]}
                      </option>
                    ))}
                  </select>
                ),
            },
            {
              header: 'Activo',
              render: (row) =>
                row.id === profile?.id ? (
                  'Sí'
                ) : (
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      disabled={updatingId === row.id}
                      onChange={(event) => handleActiveChange(row, event.target.checked)}
                    />
                  </label>
                ),
            },
          ]}
        />
      )}
    </div>
  )
}
