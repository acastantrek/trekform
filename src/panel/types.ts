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

export interface Course {
  id: string
  categoryId: string
  categoryName: string
  title: string
  slug: string
  excerpt: string | null
  description: string | null
  modality: CourseModality
  durationHours: number | null
  imageUrl: string | null
  isFeatured: boolean
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
