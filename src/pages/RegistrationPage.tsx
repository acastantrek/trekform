import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  MailCheck,
  MapPin,
  Search,
  SlidersHorizontal,
  UserRoundCheck,
} from 'lucide-react'

type SessionStatus = 'available' | 'last' | 'full'

type CourseSession = {
  id: number
  course: string
  city: string
  province: string
  date: string
  month: string
  schedule: string
  format: 'Presencial' | 'Online'
  status: SessionStatus
}

const sessions: CourseSession[] = [
  {
    id: 1,
    course: 'Trabajos en Altura',
    city: 'Reus',
    province: 'Tarragona',
    date: '08 JUL',
    month: 'Julio',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'available',
  },
  {
    id: 2,
    course: 'Plataformas Elevadoras',
    city: 'Madrid',
    province: 'Madrid',
    date: '08 JUL',
    month: 'Julio',
    schedule: '08:00 — 14:00',
    format: 'Presencial',
    status: 'last',
  },
  {
    id: 3,
    course: 'Carretillas Elevadoras',
    city: 'Montcada i Reixac',
    province: 'Barcelona',
    date: '08 JUL',
    month: 'Julio',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'available',
  },
  {
    id: 4,
    course: 'Carretillas Elevadoras',
    city: 'Madrid',
    province: 'Madrid',
    date: '09 JUL',
    month: 'Julio',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'available',
  },
  {
    id: 5,
    course: 'Trabajos en Altura',
    city: 'Cornellà de Llobregat',
    province: 'Barcelona',
    date: '10 JUL',
    month: 'Julio',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'available',
  },
  {
    id: 6,
    course: 'Puente Grúa',
    city: 'Montcada i Reixac',
    province: 'Barcelona',
    date: '11 JUL',
    month: 'Julio',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'full',
  },
  {
    id: 7,
    course: 'Operario de Almacén',
    city: 'Online',
    province: 'Online',
    date: '13 JUL',
    month: 'Julio',
    schedule: 'Acceso 24 horas',
    format: 'Online',
    status: 'available',
  },
  {
    id: 8,
    course: 'Riesgo Eléctrico',
    city: 'Madrid',
    province: 'Madrid',
    date: '17 JUL',
    month: 'Julio',
    schedule: '08:00 — 14:00',
    format: 'Presencial',
    status: 'available',
  },
  {
    id: 9,
    course: 'Espacios Confinados',
    city: 'Madrid',
    province: 'Madrid',
    date: '20 JUL',
    month: 'Julio',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'last',
  },
  {
    id: 10,
    course: 'Carretillas Elevadoras',
    city: 'Dos Hermanas',
    province: 'Sevilla',
    date: '30 JUL',
    month: 'Julio',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'available',
  },
  {
    id: 11,
    course: 'Plataformas Elevadoras',
    city: 'Madrid',
    province: 'Madrid',
    date: '07 AGO',
    month: 'Agosto',
    schedule: '08:00 — 14:00',
    format: 'Presencial',
    status: 'available',
  },
  {
    id: 12,
    course: 'Carretillas Elevadoras',
    city: 'Alcoletge',
    province: 'Lleida',
    date: '08 AGO',
    month: 'Agosto',
    schedule: '08:00 — 16:00',
    format: 'Presencial',
    status: 'available',
  },
]

const steps = [
  { icon: Search, title: 'Encuentra tu curso', text: 'Filtra por ubicación, curso y fecha.' },
  { icon: UserRoundCheck, title: 'Completa tus datos', text: 'Identifícate y reserva tu plaza.' },
  { icon: CreditCard, title: 'Pago seguro', text: 'Finaliza la matrícula online.' },
  { icon: MailCheck, title: 'Confirmación', text: 'Recibe horario, dirección y detalles.' },
]

const statusText: Record<SessionStatus, string> = {
  available: 'Plazas disponibles',
  last: 'Últimas plazas',
  full: 'Curso completo',
}

export function RegistrationPage() {
  const [province, setProvince] = useState('Todas')
  const [course, setCourse] = useState('Todos')
  const [month, setMonth] = useState('Todos')
  const [visible, setVisible] = useState(6)

  const provinces = [...new Set(sessions.map((session) => session.province))]
  const courses = [...new Set(sessions.map((session) => session.course))]
  const months = [...new Set(sessions.map((session) => session.month))]
  const filtered = useMemo(
    () =>
      sessions.filter(
        (session) =>
          (province === 'Todas' || session.province === province) &&
          (course === 'Todos' || session.course === course) &&
          (month === 'Todos' || session.month === month),
      ),
    [province, course, month],
  )

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value)
    setVisible(6)
  }

  const clearFilters = () => {
    setProvince('Todas')
    setCourse('Todos')
    setMonth('Todos')
    setVisible(6)
  }

  return (
    <div className="registration-page">
      <section className="registration-hero">
        <div className="registration-hero-copy">
          <span className="registration-kicker">FORMACIÓN ABIERTA · MATRÍCULA ONLINE</span>
          <h1>
            Reserva tu próxima formación <span>Trekform</span>
          </h1>
          <p>
            Consulta convocatorias, filtra por ciudad, curso y fecha, y reserva plaza en la
            formación que mejor encaja contigo o con tu equipo.
          </p>
          <div className="registration-hero-actions">
            <a href="#registration-sessions">
              Ver convocatorias <ArrowRight size={18} />
            </a>
            <a
              href="https://drive.google.com/file/d/0B7Ghcuo4WDYtYTlrWGxtXzhnNTg/edit"
              target="_blank"
              rel="noreferrer"
            >
              <Download size={18} /> Descargar calendario
            </a>
          </div>
        </div>
        <div className="registration-hero-media">
          <img
            src="https://trekform.com/trekform/uploads/assets/images/backgrounds/home_operario_carretillas_elevadoras_trekform.jpg"
            alt="Inscripciones Trekform"
          />
        </div>
      </section>

      <section className="registration-process" aria-labelledby="process-title">
        <div className="registration-section-heading">
          <span>UN PROCESO SENCILLO</span>
          <h2 id="process-title">
            Inscríbete <span>en cuatro pasos</span>
          </h2>
        </div>
        <div className="registration-steps">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article key={title}>
              <span className="step-number">0{index + 1}</span>
              <Icon size={25} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="registration-list"
        id="registration-sessions"
        aria-labelledby="sessions-title"
      >
        <div className="registration-list-intro">
          <div>
            <span>PRÓXIMAS CONVOCATORIAS</span>
            <h2 id="sessions-title">
              Elige dónde <span>y cuándo formarte</span>
            </h2>
          </div>
          <p>
            La disponibilidad se actualiza regularmente. Selecciona una convocatoria para continuar
            en nuestra plataforma de matrícula segura.
          </p>
        </div>

        <div className="registration-filters">
          <div className="filter-title">
            <SlidersHorizontal size={19} /> Filtrar convocatorias
          </div>
          <FilterSelect
            label="Provincia"
            value={province}
            options={provinces}
            allLabel="Todas"
            onChange={(value) => updateFilter(setProvince, value)}
          />
          <FilterSelect
            label="Curso"
            value={course}
            options={courses}
            allLabel="Todos"
            onChange={(value) => updateFilter(setCourse, value)}
          />
          <FilterSelect
            label="Mes"
            value={month}
            options={months}
            allLabel="Todos"
            onChange={(value) => updateFilter(setMonth, value)}
          />
          <button type="button" onClick={clearFilters} className="registration-clear">
            Limpiar filtros
          </button>
        </div>

        <div className="registration-results-bar">
          <p>
            <strong>{filtered.length}</strong> convocatorias encontradas
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="session-grid">
            {filtered.slice(0, visible).map((session) => (
              <article className="session-card" key={session.id}>
                <div className="session-date">
                  <CalendarDays size={20} />
                  <strong>{session.date.split(' ')[0]}</strong>
                  <span>{session.date.split(' ')[1]}</span>
                </div>
                <div className="session-content">
                  <span className={`session-status ${session.status}`}>
                    <i />
                    {statusText[session.status]}
                  </span>
                  <h3>{session.course}</h3>
                  <p>
                    <MapPin size={16} /> {session.city}, {session.province}
                  </p>
                  <div className="session-meta">
                    <span>{session.format}</span>
                    <span>{session.schedule}</span>
                  </div>
                </div>
                {session.status === 'full' ? (
                  <button className="session-action is-full" type="button" disabled>
                    Completo
                  </button>
                ) : (
                  <a
                    className="session-action"
                    href="https://inscripciones.trekcom.online/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Inscríbete <ArrowRight size={18} />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="registration-empty">
            <Search size={34} />
            <h3>No hay convocatorias con estos filtros</h3>
            <p>Prueba otra provincia, curso o mes.</p>
          </div>
        )}

        {visible < filtered.length && (
          <button
            className="load-sessions"
            type="button"
            onClick={() => setVisible((value) => value + 6)}
          >
            Ver más convocatorias <ArrowRight size={17} />
          </button>
        )}
      </section>

      <section className="registration-help">
        <div>
          <Check size={26} />
          <span>¿Necesitas ayuda para elegir?</span>
          <h2>
            Nuestro equipo <span>te asesora.</span>
          </h2>
        </div>
        <div>
          <p>
            Cuéntanos qué formación buscas y encontraremos la convocatoria adecuada para ti o para
            tu empresa.
          </p>
          <a href="tel:+34932640532">
            93 264 05 32 <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  allLabel: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      <span>{label}</span>
      <div>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option>{allLabel}</option>
          {options.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <ChevronDown />
      </div>
    </label>
  )
}
