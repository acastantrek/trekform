import {
  ArrowRight,
  ArrowUpFromLine,
  Box,
  Forklift,
  HardHat,
  LayoutGrid,
  Monitor,
  Radio,
  ShieldCheck,
  UtensilsCrossed,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getCategoriesOverview, type CategoryOverview } from '../../services/categories'

const categoryIcons: Record<string, LucideIcon> = {
  'maquinaria-industrial': Forklift,
  'trabajos-en-altura': ArrowUpFromLine,
  'espacios-confinados': Box,
  'formacion-telco': Radio,
  'trekform-online': Monitor,
  'construccion-metal': HardHat,
  prevencion: ShieldCheck,
  logistica: Warehouse,
  hosteleria: UtensilsCrossed,
}

export function CategoriesShowcase() {
  const [categories, setCategories] = useState<CategoryOverview[]>([])

  useEffect(() => {
    getCategoriesOverview()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="category-section" data-reveal>
      <div className="section-heading" data-reveal data-reveal-delay="0.05">
        <div>
          <span className="kicker">EXPLORA POR ÁREA</span>
          <h2>
            Encuentra tu <span>formación ideal</span>
          </h2>
        </div>
        <Link to="/cursos-trekform">
          Ver todos los cursos <ArrowRight size={18} />
        </Link>
      </div>
      <div className="category-grid">
        {categories.map((category, index) => {
          const Icon = categoryIcons[category.slug] ?? LayoutGrid
          return (
            <Link
              to="/cursos-trekform"
              className="category-card"
              key={category.id}
              data-reveal
              style={{ '--reveal-delay': `${0.05 + index * 0.04}s` } as CSSProperties}
            >
              <Icon size={26} />
              <strong>{category.name}</strong>
              <span>
                {category.courseCount} {category.courseCount === 1 ? 'curso' : 'cursos'}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
