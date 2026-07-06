import { supabase } from '../lib/supabase'

export interface ContactRequestInput {
  name: string
  email: string
  phone?: string
  companyName?: string
  subject?: string
  message: string
}

export async function submitContactRequest(input: ContactRequestInput) {
  if (!supabase) throw new Error('La conexión con Supabase no está configurada.')

  const { error } = await supabase.from('contact_requests').insert({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    company_name: input.companyName?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
    status: 'new',
    privacy_accepted_at: new Date().toISOString(),
  })

  if (error) throw new Error(`No se pudo enviar la consulta: ${error.message}`)
}
