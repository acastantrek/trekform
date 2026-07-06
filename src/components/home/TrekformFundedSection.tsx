import { ArrowRight, BadgeEuro, FileCheck2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TrekformFundedSection() {
  return (
    <section className="funded-section">
      <div className="funded-copy">
        <span className="kicker">FORMACIÓN BONIFICADA</span>
        <h2>Gestión de la formación bonificada</h2>
        <p>
          Trekform actúa como entidad organizadora de acciones formativas de la Fundación Estatal
          para la Formación en el Empleo.
        </p>
        <p>
          Realizamos la gestión administrativa para que las empresas puedan bonificar sus
          formaciones FUNDAE.
        </p>
        <ul>
          <li>
            <BadgeEuro /> Aprovecha el crédito disponible
          </li>
          <li>
            <FileCheck2 /> Gestión administrativa completa
          </li>
          <li>
            <Users /> Formación adaptada a la empresa
          </li>
        </ul>
        <Link to="/contacto">
          Solicitar información <ArrowRight size={18} />
        </Link>
      </div>
      <div className="funded-visual">
        <div>
          <span>FORMACIÓN</span>
          <strong>FUNDAE</strong>
          <p>Gestionamos la bonificación de principio a fin.</p>
        </div>
      </div>
    </section>
  )
}
