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
    // The first network-location fix often times out or comes back POSITION_UNAVAILABLE (notably
    // Chrome on Windows while its location provider warms up) and then succeeds right after, so
    // retry silently with a longer timeout before falling back to the manual "retry" button.
    const timeouts = [10_000, 15_000, 20_000]
    const attempt = (index: number) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setStatus('ready')
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setStatus('denied')
          } else if (index + 1 < timeouts.length) {
            attempt(index + 1)
          } else {
            setStatus('unavailable')
          }
        },
        // City-level precision is enough and much faster than GPS; reuse a fix up to 30 min old.
        { enableHighAccuracy: false, timeout: timeouts[index], maximumAge: 30 * 60 * 1000 },
      )
    }
    attempt(0)
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
