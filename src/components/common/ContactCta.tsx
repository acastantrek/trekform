import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
export function ContactCta() { return <section className="contact"><span>¿NO SABES QUÉ CURSO ELEGIR?</span><h2>Cuéntanos dónde quieres llegar.</h2><p>Te ayudamos a encontrar la formación que encaja contigo.</p><Link to="/contacto">Hablar con un asesor <ArrowRight size={20}/></Link></section> }
