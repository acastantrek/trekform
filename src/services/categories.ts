import { untypedSupabase } from '../lib/supabase'

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
  course_category_assignments: Array<{ category_id: string | null }>
}

export async function getCategoriesOverview(): Promise<CategoryOverview[]> {
  if (!untypedSupabase) return []

  const client = untypedSupabase
  const [categoriesResult, coursesResult] = await Promise.all([
    client
      .from('course_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    client
      .from('courses')
      .select('category_id, course_category_assignments(category_id)')
      .eq('status', 'published'),
  ])

  if (categoriesResult.error) {
    throw new Error(`No se pudieron cargar las categorías: ${categoriesResult.error.message}`)
  }
  if (coursesResult.error) {
    throw new Error(`No se pudieron cargar las categorías: ${coursesResult.error.message}`)
  }

  // Same rule as the catalog filter: a course counts towards its main category and every extra
  // category assigned to it (once each), so the number on the card matches the filtered catalog.
  const counts = new Map<string, number>()
  for (const row of (coursesResult.data as CourseCategoryRow[]) ?? []) {
    const categoryIds = new Set(
      [row.category_id, ...row.course_category_assignments.map((item) => item.category_id)].filter(
        (id): id is string => Boolean(id),
      ),
    )
    categoryIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1))
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
