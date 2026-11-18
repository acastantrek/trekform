import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Globe2,
  LocateFixed,
  MapPin,
  Phone,
  X,
} from 'lucide-react'
import type { UserLocationStatus } from '../../hooks/useUserLocation'
import { useModalDismiss } from '../../hooks/useModalDismiss'
import { formatDistance } from '../../lib/geo'

export interface ProvincePickerOption {
  name: string
  /** Distance to the visitor's nearest venue in the province; null if unknown or not located. */
  distanceKm: number | null
  /** Whether any of the course's sessions there is still open for enrolment. */
  hasOpenSession: boolean
}

const locationHints: Record<UserLocationStatus, string | null> = {
  idle: 'Activa tu ubicación para ver primero las provincias más cercanas.',
  locating: 'Buscando tu ubicación…',
  ready: null,
  denied: 'Ubicación bloqueada: actívala en tu navegador para ordenar por cercanía.',
  unavailable: 'No hemos podido obtener tu ubicación.',
}

/**
 * Opened from "Convocatorias" on a catalog card: the visitor picks the province they want
 * (nearest first once located) or all of them. `onSelect(null)` means every province.
 */
export function ProvincePickerModal({
  courseTitle,
  provinces,
  locationStatus,
  onLocate,
  onSelect,
  onClose,
}: {
  courseTitle: string
  provinces: ProvincePickerOption[]
  locationStatus: UserLocationStatus
  onLocate: () => void
  onSelect: (province: string | null) => void
  onClose: () => void
}) {
  useModalDismiss(onClose)
  const hint = locationHints[locationStatus]
  const canRetryLocation = locationStatus === 'idle' || locationStatus === 'unavailable'
  const nearest = locationStatus === 'ready' ? provinces.find((p) => p.distanceKm !== null) : null

  return (
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div
        className="no-sessions-modal province-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="province-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="no-sessions-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="no-sessions-hero province-picker-hero">
          <div className="no-sessions-icon">
            <MapPin size={30} />
          </div>
          <p className="no-sessions-kicker">Convocatorias</p>
          <h2 id="province-picker-title">¿Dónde quieres hacer el curso?</h2>
          <p className="province-picker-course">{courseTitle}</p>
        </div>

        <div className="no-sessions-body province-picker-body">
          {hint ? (
            <div className="province-picker-location" aria-live="polite">
              {locationStatus === 'locating' ? (
                <span className="catalog-locate-spinner" aria-hidden="true" />
              ) : (
                <LocateFixed size={16} aria-hidden="true" />
              )}
              <span>{hint}</span>
              {canRetryLocation ? (
                <button type="button" onClick={onLocate}>
                  {locationStatus === 'idle' ? 'Usar mi ubicación' : 'Reintentar'}
                </button>
              ) : null}
            </div>
          ) : (
            <p className="province-picker-location is-ready">
              <LocateFixed size={16} aria-hidden="true" /> Ordenadas de más cercana a más lejana
            </p>
          )}

          <button type="button" className="province-picker-all" onClick={() => onSelect(null)}>
            <span className="province-picker-all-icon" aria-hidden="true">
              <Globe2 size={20} />
            </span>
            <span className="province-picker-text">
              <strong>Todas las provincias</strong>
              <span>
                Ver las convocatorias en {provinces.length}{' '}
                {provinces.length === 1 ? 'provincia' : 'provincias'}
              </span>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <p className="province-picker-divider">
            <span>o elige una provincia</span>
          </p>

          <ul className="province-picker-list">
            {provinces.map((province) => (
              <li key={province.name}>
                <button
                  type="button"
                  className={`province-picker-option${province.hasOpenSession ? '' : ' is-full'}`}
                  onClick={() => onSelect(province.name)}
                >
                  <MapPin size={16} aria-hidden="true" className="province-picker-pin" />
                  <span className="province-picker-text">
                    <strong>{province.name}</strong>
                    {province.hasOpenSession ? (
                      <span>
                        <CalendarDays size={12} aria-hidden="true" /> Plazas disponibles
                      </span>
                    ) : (
                      <span>
                        <BellRing size={12} aria-hidden="true" /> Sin plazas · avísame
                      </span>
                    )}
                  </span>
                  {province === nearest ? (
                    <span className="province-picker-badge">Más cercana</span>
                  ) : null}
                  {province.distanceKm !== null ? (
                    <span className="province-picker-distance">
                      {formatDistance(province.distanceKm)}
                    </span>
                  ) : null}
                  <ArrowRight size={16} aria-hidden="true" className="province-picker-arrow" />
                </button>
              </li>
            ))}
          </ul>

          <p className="no-sessions-phone">
            <Phone size={14} /> ¿Dudas? Llámanos al <a href="tel:+34932640532">93 264 05 32</a>
          </p>
        </div>
      </div>
    </div>
  )
}
