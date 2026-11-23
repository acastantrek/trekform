export function QualitySection() {
  return (
    <section className="quality-section" data-reveal>
      <article className="quality-section__fundae" data-reveal data-reveal-delay="0.05">
        <span className="kicker">FORMACIÓN BONIFICADA</span>
        <h2>
          Gestión de la formación <span>bonificada</span>
        </h2>
        <p>
          TREKFORM actúa como entidad organizadora de acciones formativas de la Fundación Estatal
          para la Formación en el Empleo.
        </p>
        <p>
          Realizamos la gestión administrativa para que las empresas puedan bonificar sus
          formaciones FUNDAE.
        </p>
        <img
          src="/imagenes/logo-fundae.png"
          alt="Fundación Estatal para la Formación en el Empleo (FUNDAE)"
          width={280}
          height={142}
          loading="lazy"
        />
      </article>
      <article className="quality-section__seals" data-reveal data-reveal-delay="0.12">
        <span className="kicker">CERTIFICACIONES</span>
        <h2>
          Garantía de <span>calidad</span>
        </h2>
        <img
          src="/imagenes/sellos-calidad-oca.jpg"
          alt="Sellos de certificación OCA Global: UNE 58451 (operador de carretilla), ISO 9001 (sistema de gestión de la calidad) y UNE 58923 (operador PEMP)"
          width={825}
          height={280}
          loading="lazy"
        />
        <p>
          En TREKFORM establecemos una serie de criterios de calidad que cumplimos en cada una de
          las acciones formativas que realizamos.
        </p>
      </article>
    </section>
  )
}
