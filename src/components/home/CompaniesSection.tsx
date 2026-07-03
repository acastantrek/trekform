import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
export function CompaniesSection() { return <section className="companies"><div><span className="kicker">FORMACIÓN IN COMPANY</span><h2>Tu equipo, preparado<br/>para lo que viene.</h2></div><div><p>Diseñamos programas a medida, nos desplazamos a tus instalaciones y adaptamos horarios, contenidos y equipos.</p><Link to="/empresas">Solicitar propuesta <ArrowRight size={18}/></Link></div></section> }
