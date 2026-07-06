import { ArrowRight, Mail, Phone } from 'lucide-react'

export function LeadFormSection() {
  return (
    <section className="lead-section">
      <div className="lead-copy">
        <span className="kicker light">CONTACTA CON NOSOTROS</span>
        <h2>Contacta con nosotros</h2>
        <p>Rellena el formulario y contactaremos contigo lo antes posible.</p>
        <div>
          <span>
            <Phone size={18} /> 93 264 05 32
          </span>
          <span>
            <Mail size={18} /> comercial@trekform.com
          </span>
        </div>
      </div>
      <form className="lead-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Nombre</span>
          <input name="name" autoComplete="name" placeholder="Tu nombre" required />
        </label>
        <label>
          <span>Teléfono</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="600 000 000" required />
        </label>
        <label>
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            required
          />
        </label>
        <label>
          <span>Curso de interés</span>
          <select name="course" defaultValue="">
            <option value="" disabled>
              Selecciona un curso
            </option>
            <option>Carretillas elevadoras</option>
            <option>Plataformas elevadoras</option>
            <option>Trabajos en altura</option>
            <option>Espacios confinados</option>
          </select>
        </label>
        <label className="consent">
          <input type="checkbox" required /> <span>Acepto la política de privacidad.</span>
        </label>
        <button type="submit">
          Enviar consulta <ArrowRight size={18} />
        </button>
      </form>
    </section>
  )
}
