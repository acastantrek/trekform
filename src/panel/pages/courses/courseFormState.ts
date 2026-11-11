import type { CourseInput } from '../../services/courses'
import type { Course, CourseTypology } from '../../types'

export function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

/** One entry per line, as the public site reads accreditation/benefit/typology lists. */
export function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Paragraphs separated by a blank line, as the public site splits objectives and audience. */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export interface TypologyCardDraft {
  title: string
  lines: string
}

export interface ExtraSectionDraft {
  title: string
  items: string
  paragraphs: string
}

export interface CourseFormState extends Omit<CourseInput, 'typology' | 'extraSections'> {
  customTypology: boolean
  typologyCards: TypologyCardDraft[]
  typologyNote: string
  extraSections: ExtraSectionDraft[]
}

// Same cards the public course page shows when a presential course has no typology of its own.
const defaultTypologyCards: TypologyCardDraft[] = [
  {
    title: 'Curso Abierto',
    lines:
      'Dirigido a particulares y empresas. Se imparte en nuestras instalaciones presentes en todo el territorio nacional. Calendario de cursos flexible y actualizado.',
  },
  {
    title: 'Curso In-Company (a medida)',
    lines:
      'Personalizado para grupos de trabajadores de una misma empresa. Formación en nuestras instalaciones o directamente en las de tu empresa para mayor comodidad. Adaptable en fechas y horarios según tus necesidades.',
  },
]

export const emptyForm: CourseFormState = {
  categoryId: '',
  extraCategoryIds: [],
  title: '',
  shortTitle: '',
  slug: '',
  excerpt: '',
  heroText: '',
  seoDescription: '',
  description: '',
  objectives: '',
  audience: 'both',
  audienceLabel: '',
  audienceDescription: '',
  methodology: '',
  modality: 'presential',
  modalityLabel: '',
  durationHours: null,
  durationLabel: '',
  imageUrl: '',
  brochureUrl: '',
  videoUrl: '',
  isOfficialCertification: false,
  isFundaeEligible: false,
  accreditationTitle: '',
  accreditationItems: '',
  benefitsItems: '',
  customTypology: false,
  typologyCards: defaultTypologyCards,
  typologyNote: '',
  extraSections: [],
  isFeatured: false,
  sortOrder: 0,
  status: 'draft',
  publishedAt: null,
}

export function toFormState(course: Course): CourseFormState {
  const { typology, extraSections, ...rest } = course
  return {
    ...rest,
    customTypology: Boolean(typology),
    typologyCards: typology
      ? typology.cards.map((card) => ({ title: card.title ?? '', lines: card.lines.join('\n') }))
      : defaultTypologyCards,
    typologyNote: typology?.note.join('\n\n') ?? '',
    extraSections: extraSections.map((section) => ({
      title: section.title,
      items: (section.items ?? []).join('\n'),
      paragraphs: (section.paragraphs ?? []).join('\n\n'),
    })),
  }
}

export function toCourseInput(form: CourseFormState): CourseInput {
  const { customTypology, typologyCards, typologyNote, extraSections, ...rest } = form

  const typology: CourseTypology | null = customTypology
    ? {
        cards: typologyCards
          .map((card) => ({ title: card.title.trim() || null, lines: toLines(card.lines) }))
          .filter((card) => card.title || card.lines.length),
        note: toParagraphs(typologyNote),
      }
    : null

  return {
    ...rest,
    typology,
    extraSections: extraSections
      .map((section) => {
        const items = toLines(section.items)
        const paragraphs = toParagraphs(section.paragraphs)
        return {
          title: section.title.trim(),
          ...(items.length ? { items } : {}),
          ...(paragraphs.length ? { paragraphs } : {}),
        }
      })
      .filter((section) => section.title),
  }
}
