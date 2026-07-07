import { Quote, Star } from 'lucide-react'

const reviews = [
  {
    text: 'He trabajado en esta compañía, y doy fe del valor humano de todos sus colaboradores, del interés que demuestran en la preparación de los cursos para satisfacer al cliente como prioridad, de la profesionalidad acreditada de todos los formadores que colaboran, de las adecuadas instalaciones para impartir la formación, la intención de mejora continua en todas sus formaciones y del gran abanico de oferta formativa la cual se adapta a todas las normas vigentes. Un saludo y agradecido por todo.',
    name: 'Luis Coll',
    role: 'CEO - CO Founder',
    avatar: 'https://trekform.com/trekform/uploads/assets/images/testimonial/testimonial-1-2.jpg',
  },
  {
    text: 'Profesionalismo 10/10. El curso fué muy claro, muy detallado, excelente opción de estudio para dar peso al CV. Profesionales muy familiarizados con lo que enseñan, además explican muy bien. Cuenta con un espacio recomendable para el manejo de las máquinas. Muy buenos los profesores y, la chica que me atendió inicialmente para adquirir el curso fue encantadora y atenta en todo momento.',
    name: 'Javier V',
    role: 'Alumno',
    avatar: 'https://trekform.com/trekform/uploads/assets/images/testimonial/testimonial-1-2.jpg',
  },
  {
    text: 'Hice el curso de carretillas elevadoras para mejorar mis habilidades en el trabajo, y no me decepcionó. Aprendí mucho sobre seguridad y maniobras efectivas. Lo único que podría mejorar es la duración del curso, pero en general, fue una experiencia valiosa.',
    name: 'Cristina Carrasco',
    role: 'CEO - CO Founder',
    avatar: 'https://trekform.com/trekform/uploads/assets/images/testimonial/testimonial-1-2.jpg',
  },
  {
    text: 'Me ha gustado hacer el curso de carretillero, lo único que cambiaría es el tiempo de las practicas que pondría mas tiempo para aprender un poco mas de las maquinas para el momento de estar en un puesto de trabajo saber mejor la manera de usarlas.',
    name: 'David O',
    role: 'Alumno',
    avatar: 'https://trekform.com/trekform/uploads/assets/images/testimonial/testimonial-1-2.jpg',
  },
  {
    text: 'En este curso de carretillera me ha gustado mucho haber aprendido manejar las máquinas de carretillas y habérmelo sacado , me han enseñado muy bien tienen unos buenos profesores y el tiempo de estudio me parece correcto . Estoy muy contenta .! Y sobre todo tiene mucha paciencia con los alumnos .',
    name: 'Angela D',
    role: 'Alumna',
    avatar: 'https://trekform.com/trekform/uploads/assets/images/testimonial/testimonial-1-2.jpg',
  },
  {
    text: 'He hecho 2 cursos con TREKFORM. El de puente grúa y el de carretilla elevadora. Te enseñan muy bien tanto la teórica como la práctica. Aparte los profesores son muy agradables. Espero encontrar faena con los 2 carnets que me sacado. Vale la pena hacer el curso en TREKFORM',
    name: 'Juan Carlos C',
    role: 'Alumno',
    avatar: 'https://trekform.com/trekform/uploads/assets/images/testimonial/testimonial-1-2.jpg',
  },
]

export function TestimonialsSection() {
  return (
    <section className="reviews-section">
      <div className="reviews-heading">
        <span className="kicker">RESEÑAS</span>
        <h2>Lo que dicen de nosotros</h2>
        <p>
          Valoramos positivamente las experiencias compartidas por quienes confían en nosotros.
          Saber escuchar a nuestros clientes es clave para seguir creciendo y mejorar día a día.
        </p>
      </div>
      <div className="reviews-grid">
        {reviews.map((review) => (
          <article key={review.name}>
            <Quote className="quote" />
            <div className="stars">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={15} fill="currentColor" />
              ))}
            </div>
            <p>“{review.text}”</p>
            <footer>
              <img className="review-avatar" src={review.avatar} alt="" />
              <div>
                <strong>{review.name}</strong>
                <span>{review.role}</span>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
