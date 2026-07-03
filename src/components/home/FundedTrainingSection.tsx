import { ArrowRight, BadgeEuro, FileCheck2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FundedTrainingSection() {
  return <section className="funded-section"><div className="funded-copy"><span className="kicker">FORMACIÓN BONIFICADA</span><h2>Tu empresa puede recuperar la inversión.</h2><p>Gestionamos la documentación para que tu empresa pueda bonificar la formación a través de FUNDAE.</p><ul><li><BadgeEuro/> Aprovecha el crédito disponible</li><li><FileCheck2/> Gestión administrativa completa</li><li><Users/> Programas adaptados a tu plantilla</li></ul><Link to="/empresas">Consultar sin compromiso <ArrowRight size={18}/></Link></div><div className="funded-visual"><div><span>HASTA</span><strong>100%</strong><p>bonificable según el crédito disponible de la empresa</p></div></div></section>
}
