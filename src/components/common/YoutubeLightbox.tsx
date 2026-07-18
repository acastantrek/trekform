import { X } from 'lucide-react'
import { useEffect } from 'react'

interface YoutubeLightboxProps {
  videoId: string
  title: string
  onClose: () => void
}

export function YoutubeLightbox({ videoId, title, onClose }: YoutubeLightboxProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="video-lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <button type="button" className="video-lightbox__close" onClick={onClose} aria-label="Cerrar vídeo">
        <X size={22} />
      </button>
      <div className="video-lightbox__frame" onClick={(event) => event.stopPropagation()}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
