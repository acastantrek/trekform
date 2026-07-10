type BadgeTone = 'neutral' | 'positive' | 'warning' | 'negative'

const toneByStatus: Record<string, BadgeTone> = {
  draft: 'neutral',
  published: 'positive',
  archived: 'negative',
  open: 'positive',
  full: 'warning',
  completed: 'neutral',
  cancelled: 'negative',
  pending: 'warning',
  confirmed: 'positive',
}

const labelByStatus: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
  open: 'Abierta',
  full: 'Completa',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
  pending: 'Pendiente',
  confirmed: 'Confirmada',
}

export function StatusBadge({ status }: { status: string }) {
  const tone = toneByStatus[status] ?? 'neutral'
  const label = labelByStatus[status] ?? status

  return <span className={`badge badge--${tone}`}>{label}</span>
}
