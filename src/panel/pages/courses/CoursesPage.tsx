import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../../components/DataTable'
import { Pagination } from '../../components/Pagination'
import { StatusBadge } from '../../components/StatusBadge'
import { deleteCourse, listCourses } from '../../services/courses'
import { useConfirm } from '../../hooks/useConfirm'
import type { Course } from '../../types'

const modalityLabel: Record<Course['modality'], string> = {
  presential: 'Presencial',
  online: 'Online',
  hybrid: 'Híbrida',
}

const PAGE_SIZE = 20

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { confirm, dialog } = useConfirm()

  async function reload() {
    try {
      setCourses(await listCourses())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al cargar los cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listCourses()
      .then((data) => {
        setCourses(data)
        setError(null)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar los cursos.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(course: Course) {
    if (!(await confirm(`¿Eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`))) return
    try {
      await deleteCourse(course.id)
      await reload()
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo eliminar el curso.')
    }
  }

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return courses
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(term) || course.categoryName.toLowerCase().includes(term),
    )
  }, [courses, search])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Cursos</h1>
          <p>
            {filteredCourses.length} de {courses.length} cursos.
          </p>
        </div>
        <Link to="/panel/cursos/nuevo" className="btn btn-primary">
          <Plus size={16} /> Nuevo curso
        </Link>
      </div>

      <div className="filters-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por título o categoría…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <DataTable
          rows={paginatedCourses}
          rowKey={(row) => row.id}
          emptyMessage={search ? 'Ningún curso coincide con la búsqueda.' : 'Todavía no hay cursos. Crea el primero.'}
          columns={[
            { header: 'Título', className: 'col-wide', render: (row) => row.title },
            { header: 'Categoría', className: 'col-medium', render: (row) => row.categoryName },
            { header: 'Modalidad', className: 'col-narrow', render: (row) => modalityLabel[row.modality] },
            {
              header: 'Destacado',
              className: 'col-narrow',
              render: (row) => (row.isFeatured ? 'Sí' : 'No'),
            },
            {
              header: 'Estado',
              className: 'col-narrow',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              header: 'Acciones',
              className: 'col-actions',
              render: (row) => (
                <div className="row-actions">
                  <Link to={`/panel/cursos/${row.id}`} className="btn btn-secondary btn-sm">
                    <Pencil size={14} /> Editar
                  </Link>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      {dialog}
    </div>
  )
}
