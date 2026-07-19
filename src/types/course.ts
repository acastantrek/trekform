export interface Course {
  id: string
  slug: string
  title: string
  category: string
  categories: string[]
  place: string
  duration: string
  durationHours: number | null
  modality: 'presential' | 'online'
  isOfficialCertification: boolean
  isFundaeEligible: boolean
  accreditationTitle: string | null
  image: string
  color: string
  description: string
  featured: boolean
  order: number
}
