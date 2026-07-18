import { supabase } from '../lib/supabase'

export interface Faq {
  id: string
  question: string
  answer: string
}

export async function getGeneralFaqs(): Promise<Faq[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('faqs')
    .select('id, question, answer')
    .is('course_id', null)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar las preguntas frecuentes: ${error.message}`)
  return (data as Faq[]) ?? []
}
