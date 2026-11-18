import { X } from 'lucide-react'
import { useModalDismiss } from '../../hooks/useModalDismiss'

export interface ProvincePickerOption {
  name: string
  /** Distance to the visitor's nearest venue in the province; null if unknown or not located. */
  distanceKm: number | null
  /** Whether any of the course's sessions there is still open for enrolment. */
  hasOpenSession: boolean
}

/**
 * Opened from "Ver convocatorias" on a catalog card: the visitor picks a province (listed in
 * the order given, nearest first once located) or all of them. `onSelect(null)` means all.
 */
export function ProvincePickerModal({
  imageSrc,
  imageAlt,
  provinces,
  onSelect,
  onClose,
}: {
  imageSrc: string
  imageAlt: string
  provinces: ProvincePickerOption[]
  onSelect: (province: string | null) => void
  onClose: () => void
}) {
  useModalDismiss(onClose)

  return (
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div
        className="province-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="province-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="province-picker-image">
          {imageSrc ? <img src={imageSrc} alt={imageAlt} /> : null}
          <button
            type="button"
            className="province-picker-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="province-picker-title" className="province-picker-title">
          ¿Dónde quieres hacer el curso?
        </h2>

        <ul className="province-picker-list">
          <li>
            <button
              type="button"
              className="province-picker-option is-all"
              onClick={() => onSelect(null)}
            >
              Todas las provincias
            </button>
          </li>
          {provinces.map((province) => (
            <li key={province.name}>
              <button
                type="button"
                className="province-picker-option"
                onClick={() => onSelect(province.name)}
              >
                {province.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
