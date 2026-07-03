import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [{ value: '20+', label: 'Años de experiencia' }, { value: '200K', label: 'Alumnos formados' }, { value: '4.2K', label: 'Empresas' }, { value: '18K', label: 'Cursos impartidos' }]

export function StatsSection() {
  return <section className="stats-section"><div className="stats-heading"><div><span className="kicker light">NUESTROS LOGROS</span><h2>Nexo en números</h2></div><p>La calidad y la experiencia práctica marcan la diferencia.</p><Link to="/nosotros">Conócenos <ArrowRight size={18}/></Link></div><div className="stats-grid">{stats.map(stat => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></section>
}
