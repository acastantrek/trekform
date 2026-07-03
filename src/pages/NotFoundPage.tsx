import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
export function NotFoundPage() { return <section className="not-found"><span>404</span><h1>Esta página no existe.</h1><Link className="primary" to="/"><ArrowLeft size={18}/> Volver al inicio</Link></section> }
