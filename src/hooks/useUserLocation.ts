import { useCallback, useEffect, useState } from 'react'
import type { Coordinates } from '../lib/geo'

export type UserLocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unavailable'

/**
 * Browser geolocation, requested as soon as the component mounts: the browser shows its permission
 * prompt on arrival (or locates silently if permission was already granted). `locate` lets a
 * button retry later, e.g. after a timeout.
 */
export function useUserLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [status, setStatus] = useState<UserLocationStatus>('idle')

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setStatus('ready')
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable')
      },
      // City-level precision is enough and much faster than GPS; reuse a fix up to 30 min old.
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 30 * 60 * 1000 },
    )
  }, [])

  useEffect(() => {
    // Asking straight away triggers the browser's prompt on arrival. If the visitor blocked
    // geolocation before, the browser won't prompt again, so just reflect that on the button.
    let cancelled = false
    // Always resolved asynchronously, so state is only set from a callback, never mid-effect.
    Promise.resolve(navigator.permissions?.query({ name: 'geolocation' }))
      .then((permission) => {
        if (cancelled) return
        if (permission?.state === 'denied') setStatus('denied')
        else locate()
      })
      // Some browsers can't query the geolocation permission; ask directly instead.
      .catch(() => {
        if (!cancelled) locate()
      })
    return () => {
      cancelled = true
    }
  }, [locate])

  return { coordinates, status, locate }
}
