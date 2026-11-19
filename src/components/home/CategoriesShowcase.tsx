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

// Photo shown on each category card, fading in from the left.
const categoryImages: Record<string, string> = {
  'maquinaria-industrial': '/imagenes/carretilla-trekform-2.jpg',
  'trabajos-en-altura': '/imagenes/conoce_un_poco_mejor_los_trabajos_en_altura_trekform.jpg',
  'espacios-confinados': '/imagenes/home_espacios_confinados_trekform.jpg',
  'formacion-telco': '/imagenes/curso_telco_espacios_confinados.jpg',
  'trekform-online': '/imagenes/curso_ciberseguridad.jpg',
  'construccion-metal': '/cursos/curso-de-prl-construccion-tpc-metal-tpm.jpg',
  prevencion: '/imagenes/curso_epis.jpg',
  logistica: '/imagenes/curso_picking.jpg',
  hosteleria: '/imagenes/curso_manipulador_alimentos.jpg',
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
          const image = categoryImages[category.slug]
          return (
            <Link
              to={`/cursos-trekform?categoria=${encodeURIComponent(category.name)}`}
              className="category-card"
              key={category.id}
              data-reveal
              style={
                {
                  '--reveal-delay': `${0.05 + index * 0.04}s`,
                  ...(image ? { '--category-image': `url('${image}')` } : {}),
                } as CSSProperties
              }
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
