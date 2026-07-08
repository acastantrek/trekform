import { useEffect, useState } from 'react'
import { getRegistrationSessions, type RegistrationSession } from '../services/registrations'

export function useRegistrationSessions() {
  const [sessions, setSessions] = useState<RegistrationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getRegistrationSessions()
      .then((data) => {
        if (active) setSessions(data)
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'No se pudieron cargar las convocatorias abiertas.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { sessions, loading, error }
}
