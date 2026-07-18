import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { getGeneralFaqs, type Faq } from '../../services/faqs'

export function HomeFaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([])

  useEffect(() => {
    getGeneralFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]))
  }, [])

  if (faqs.length === 0) return null

  return (
    <section className="faq-section" data-reveal>
      <div className="faq-heading" data-reveal data-reveal-delay="0.05">
        <span className="kicker">PREGUNTAS FRECUENTES</span>
        <h2>
          Resolvemos <span>tus dudas</span>
        </h2>
        <p>Lo que más nos preguntan particulares y empresas antes de inscribirse.</p>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details
            key={faq.id}
            data-reveal
            style={{ '--reveal-delay': `${0.06 + index * 0.04}s` } as CSSProperties}
          >
            <summary>
              {faq.question}
              <ChevronDown />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
