import { useCallback, useRef, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions | string) => {
    setOptions(typeof options === 'string' ? { message: options } : options)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = () => {
    resolveRef.current?.(true)
    setOptions(null)
  }

  const handleCancel = () => {
    resolveRef.current?.(false)
    setOptions(null)
  }

  const dialog = options ? (
    <ConfirmDialog
      title={options.title ?? 'Confirmar eliminación'}
      message={options.message}
      confirmLabel={options.confirmLabel ?? 'Eliminar'}
      cancelLabel={options.cancelLabel ?? 'Cancelar'}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null

  return { confirm, dialog }
}
