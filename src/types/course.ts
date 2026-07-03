export type CourseCategory = 'Maquinaria' | 'Seguridad' | 'Logística' | 'Prevención'
export interface Course { slug: string; title: string; category: CourseCategory; place: string; duration: string; image: string; color: string; description: string }
