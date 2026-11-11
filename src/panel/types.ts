export type CourseModality = 'presential' | 'online' | 'hybrid'
export type RecordStatus = 'draft' | 'published' | 'archived'
export type SessionStatus = 'draft' | 'open' | 'full' | 'completed' | 'cancelled'
export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type AppRole = 'admin' | 'student' | 'company'

export interface Profile {
  id: string
  role: AppRole
  firstName: string | null
  lastName: string | null
  isActive: boolean
}

export interface AdminUser {
  id: string
  role: AppRole
  firstName: string | null
  lastName: string | null
  email: string | null
  isActive: boolean
  createdAt: string
}

export interface CourseCategory {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
}

export type CourseAudience = 'individuals' | 'companies' | 'both'

export interface CourseTypology {
  cards: Array<{ title: string | null; lines: string[] }>
  note: string[]
}

export interface CourseExtraSection {
  title: string
  items?: string[]
  paragraphs?: string[]
}

export interface Course {
  id: string
  categoryId: string
  categoryName: string
  /** Secondary categories (course_category_assignments), excluding the primary one. */
  extraCategoryIds: string[]
  title: string
  shortTitle: string | null
  slug: string
  excerpt: string | null
  heroText: string | null
  seoDescription: string | null
  description: string | null
  objectives: string | null
  audience: CourseAudience
  audienceLabel: string | null
  audienceDescription: string | null
  methodology: string | null
  modality: CourseModality
  modalityLabel: string | null
  durationHours: number | null
  durationLabel: string | null
  imageUrl: string | null
  brochureUrl: string | null
  videoUrl: string | null
  isOfficialCertification: boolean
  isFundaeEligible: boolean
  accreditationTitle: string | null
  accreditationItems: string | null
  benefitsItems: string | null
  typology: CourseTypology | null
  extraSections: CourseExtraSection[]
  isFeatured: boolean
  sortOrder: number
  status: RecordStatus
  publishedAt: string | null
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  content: string | null
  durationMinutes: number | null
  position: number
}

export interface VenueOption {
  id: string
  name: string
  city: string
  province: string
}

export interface CourseSession {
  id: string
  courseId: string
  courseTitle: string
  venueId: string | null
  venueName: string | null
  code: string
  slug: string
  startsAt: string
  endsAt: string
  capacity: number
  priceCents: number
  status: SessionStatus
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

export interface BlogPost {
  id: string
  categoryId: string | null
  categoryName: string | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  imageUrl: string | null
  status: RecordStatus
  publishedAt: string | null
}

export interface Enrollment {
  id: string
  status: EnrollmentStatus
  notes: string | null
  createdAt: string
  studentId: string
  studentName: string
  studentEmail: string | null
  studentPhone: string | null
  courseSessionId: string
  sessionCode: string
  sessionStartsAt: string
  courseId: string
  courseTitle: string
  companyId: string | null
  companyName: string | null
}
