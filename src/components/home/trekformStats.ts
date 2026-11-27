import { Award, Building2, HardHat, ShieldCheck, type LucideIcon } from 'lucide-react'

/** Key figures shared by the home ("Nuestros logros") and the "Quiénes somos" proof strip. */
export const trekformStats: { value: string; label: string; icon: LucideIcon }[] = [
  { value: '+20', label: 'Años de experiencia', icon: Award },
  { value: '+250.000', label: 'Alumnos formados', icon: HardHat },
  { value: '+5.500', label: 'Empresas', icon: Building2 },
  { value: '+18.000', label: 'Cursos impartidos', icon: ShieldCheck },
]
