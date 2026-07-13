import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getTestimonials, type Testimonial } from '../../services/testimonials'

const ROTATE_MS = 3000

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    getTestimonials()
      .then(setTestimonials)
      .catch(() => setTestimonials([]))
  }, [])

  useEffect(() => {
    if (testimonials.length < 2) return
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const current = testimonials[index]
  if (!current) return null

  return (
    <div className="home-testimonial-slide" key={current.id}>
      <div className="home-stars">
        {Array.from({ length: 5 }, (_, position) => (
          <Star key={position} size={17} fill={position < current.rating ? 'currentColor' : 'none'} />
        ))}
      </div>
      <blockquote>&ldquo;{current.content}&rdquo;</blockquote>
      <div className="home-review-author">
        <div className="home-review-avatar" aria-hidden="true">
          {initials(current.authorName)}
        </div>
        <div>
          <strong>{current.authorName}</strong>
          <span>{current.authorRole}</span>
        </div>
      </div>
    </div>
  )
}
