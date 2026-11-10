import { ArrowRight, Play } from 'lucide-react'
import { useState } from 'react'
import { YoutubeLightbox } from '../common/YoutubeLightbox'

const VIDEO_ID = '03iV9FR58xY'
const videoBg = '/imagenes/trusted-one-bg.jpg'

export function TrekformVideoSection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <section
        className="video-section"
        data-reveal
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(46,46,46,.9), rgba(46,46,46,.82) 55%, rgba(46,46,46,.9)), url(${videoBg})`,
        }}
      >
        <button type="button" className="video-section__play" onClick={() => setIsOpen(true)}>
          <Play size={22} fill="currentColor" />
          <i className="ripple" aria-hidden="true" />
          <span className="sr-only">Reproducir vídeo corporativo Trekform</span>
        </button>
        <span className="kicker light">VÍDEO CORPORATIVO</span>
        <h2>
          Conoce Trekform <span>en primera persona</span>
        </h2>
        <p>Instalaciones, equipos y formadores: así es la formación práctica de Trekform.</p>
        <a
          href="https://www.youtube.com/@trekform938"
          target="_blank"
          rel="noreferrer"
          className="video-section__link"
        >
          Descubre todos los vídeos de Trekform <ArrowRight size={18} />
        </a>
      </section>

      {isOpen ? (
        <YoutubeLightbox
          videoId={VIDEO_ID}
          title="Vídeo corporativo Trekform"
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  )
}
