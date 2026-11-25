import type { CSSProperties } from 'react'

// Loading indicator built from the three isometric cubes of the Trekform logo.
// Each cube flies in face by face, assembles, hops in a wave and breaks apart
// again; the animation lives in src/styles/trekform-loader.css.

const CUBES = [
  { id: 'grey', top: '#dcdcda', right: '#bdbdbb', left: '#9c9c9b' },
  { id: 'sand', top: '#ecdcc0', right: '#d6bc95', left: '#bfa27c' },
  { id: 'orange', top: '#fbd08a', right: '#f5b04a', left: '#ec9a1f' },
] as const

// Pointy-top hexagon in a 100x100 box, split into its three visible faces.
const FACES = {
  top: '50,4 90,27 50,50 10,27',
  left: '10,27 50,50 50,96 10,73',
  right: '90,27 90,73 50,96 50,50',
} as const

type TrekformLoaderProps = {
  label?: string
  className?: string
}

export function TrekformLoader({ label = 'Cargando…', className }: TrekformLoaderProps) {
  return (
    <div className={['tk-loader', className].filter(Boolean).join(' ')} role="status">
      <div className="tk-loader-cubes" aria-hidden="true">
        {CUBES.map((cube, index) => (
          <div
            key={cube.id}
            className="tk-loader-cube"
            style={{ '--tk-delay': `${index * 0.16}s` } as CSSProperties}
          >
            <svg viewBox="0 0 100 100">
              {(['left', 'right', 'top'] as const).map((face) => (
                <g key={face} className={`tk-loader-face tk-loader-face--${face}`}>
                  <polygon points={FACES[face]} fill={cube[face]} stroke={cube[face]} />
                </g>
              ))}
            </svg>
            <span className="tk-loader-shadow" />
          </div>
        ))}
      </div>
      <span className="tk-loader-label">{label}</span>
    </div>
  )
}
