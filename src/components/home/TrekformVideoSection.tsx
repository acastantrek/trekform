import { ArrowRight, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const VIDEO_ID = '03iV9FR58xY'
const videoBg =
  'https://trekform.com/trekform/uploads/assets/images/backgrounds/trusted-one-bg.jpg'

export function TrekformVideoSection() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <section
        className="video-section"
        data-reveal
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(11,18,32,.9), rgba(15,26,45,.82) 55%, rgba(11,18,32,.9)), url(${videoBg})`,
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
        <div
          className="video-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vídeo corporativo Trekform"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="video-lightbox__close"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar vídeo"
          >
            <X size={22} />
          </button>
          <div className="video-lightbox__frame" onClick={(event) => event.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title="Vídeo corporativo Trekform"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
