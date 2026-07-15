import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../../components/DataTable'
import { Pagination } from '../../components/Pagination'
import { StatusBadge } from '../../components/StatusBadge'
import { deletePost, listPosts } from '../../services/blog'
import { useConfirm } from '../../hooks/useConfirm'
import type { BlogPost, RecordStatus } from '../../types'

const statusOptions: RecordStatus[] = ['published', 'draft', 'archived']

const statusLabel: Record<RecordStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
}

const PAGE_SIZE = 20

export function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const { confirm, dialog } = useConfirm()

  async function reload() {
    try {
      setPosts(await listPosts())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al cargar los artículos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listPosts()
      .then((data) => {
        setPosts(data)
        setError(null)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar los artículos.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(post: BlogPost) {
    if (!(await confirm(`¿Eliminar el artículo "${post.title}"? Esta acción no se puede deshacer.`))) return
    try {
      await deletePost(post.id)
      await reload()
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo eliminar el artículo.')
    }
  }

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return posts.filter((post) => {
      if (statusFilter && post.status !== statusFilter) return false
      if (
        term &&
        !post.title.toLowerCase().includes(term) &&
        !(post.categoryName ?? '').toLowerCase().includes(term)
      ) {
        return false
      }
      return true
    })
  }, [posts, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Blog</h1>
          <p>
            {filteredPosts.length} de {posts.length} artículos.
          </p>
        </div>
        <Link to="/panel/blog/nuevo" className="btn btn-primary">
          <Plus size={16} /> Nuevo artículo
        </Link>
      </div>

      <div className="filters-bar">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Todos los estados</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </select>
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
          rows={paginatedPosts}
          rowKey={(row) => row.id}
          emptyMessage={
            search || statusFilter
              ? 'Ningún artículo coincide con los filtros.'
              : 'Todavía no hay artículos. Crea el primero.'
          }
          columns={[
            { header: 'Título', render: (row) => row.title },
            { header: 'Categoría', render: (row) => row.categoryName ?? 'Sin categoría' },
            { header: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
            {
              header: 'Publicado',
              render: (row) => (row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('es-ES') : '—'),
            },
            {
              header: 'Acciones',
              className: 'col-actions',
              render: (row) => (
                <div className="row-actions">
                  <Link to={`/panel/blog/${row.id}`} className="btn btn-secondary btn-sm">
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
