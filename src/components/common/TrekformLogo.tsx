import { Link } from 'react-router-dom'

export function TrekformLogo({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`trekform-logo${light ? ' trekform-logo--light' : ''}`}
      to="/"
      aria-label="Ir al inicio"
    >
      <img
        src={light ? '/brand/logo-trekform-white.png' : '/brand/logo-trekform.png'}
        alt="Trekform"
      />
    </Link>
  )
}
