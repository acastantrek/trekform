import { useEffect, useState } from 'react'
import { getCourses } from '../services/courses'
import type { Course } from '../types/course'

export function useCourses(featured = false) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getCourses({ featured })
      .then((data) => {
        if (active) setCourses(data)
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los cursos.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [featured])

  return { courses, loading, error }
}
