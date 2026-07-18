import { supabase } from '../lib/supabase'

export interface CategoryOverview {
  id: string
  name: string
  slug: string
  courseCount: number
}

interface CategoryRow {
  id: string
  name: string
  slug: string
}

interface CourseCategoryRow {
  category_id: string | null
}

export async function getCategoriesOverview(): Promise<CategoryOverview[]> {
  if (!supabase) return []

  const client = supabase as any
  const [categoriesResult, coursesResult] = await Promise.all([
    client
      .from('course_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    client.from('courses').select('category_id').eq('status', 'published'),
  ])

  if (categoriesResult.error) {
    throw new Error(`No se pudieron cargar las categorías: ${categoriesResult.error.message}`)
  }
  if (coursesResult.error) {
    throw new Error(`No se pudieron cargar las categorías: ${coursesResult.error.message}`)
  }

  const counts = new Map<string, number>()
  for (const row of (coursesResult.data as CourseCategoryRow[]) ?? []) {
    if (!row.category_id) continue
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1)
  }

  return ((categoriesResult.data as CategoryRow[]) ?? [])
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      courseCount: counts.get(category.id) ?? 0,
    }))
    .filter((category) => category.courseCount > 0)
    .sort((a, b) => b.courseCount - a.courseCount)
}
