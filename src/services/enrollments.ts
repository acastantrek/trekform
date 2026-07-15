import { supabase } from '../lib/supabase'

export interface SimulatedPaymentInput {
  courseSessionId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  identityDocument: string
  amountPaidCents: number | null
}

export async function submitSimulatedPayment(input: SimulatedPaymentInput) {
  if (!supabase) throw new Error('La conexión con Supabase no está configurada.')

  const client = supabase as any
  const studentId = crypto.randomUUID()
  const paidAt = new Date().toISOString()

  const { error: studentError } = await client.from('students').insert({
    id: studentId,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    identity_document: input.identityDocument.trim(),
  })

  if (studentError) throw new Error(`No se pudo registrar al alumno: ${studentError.message}`)

  const { error: enrollmentError } = await client.from('enrollments').insert({
    course_session_id: input.courseSessionId,
    student_id: studentId,
    status: 'pending',
    privacy_accepted_at: paidAt,
    payment_status: 'paid',
    paid_at: paidAt,
    amount_paid_cents: input.amountPaidCents,
    payment_reference: `SIMULADO-${studentId.slice(0, 8).toUpperCase()}`,
  })

  if (enrollmentError) throw new Error(`No se pudo registrar la inscripción: ${enrollmentError.message}`)
}
