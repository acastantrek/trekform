import { untypedSupabase } from '../lib/supabase'

export interface SimulatedPaymentInput {
  courseSessionId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  identityDocument: string
  amountPaidCents: number | null
}

const sessionFullMessage =
  'Lo sentimos, esta convocatoria acaba de completarse. Elige otra fecha o pide que te avisemos de nuevas convocatorias.'

export async function submitSimulatedPayment(input: SimulatedPaymentInput) {
  if (!untypedSupabase) throw new Error('La conexión con Supabase no está configurada.')

  const client = untypedSupabase
  const studentId = crypto.randomUUID()
  const paidAt = new Date().toISOString()

  // Check free seats first so a full session doesn't leave a student record behind. The
  // database still has the final say (enforce_session_capacity trigger), e.g. if someone
  // takes the last seat in between.
  const { data: seats } = await client.rpc('session_seats_remaining')
  const seatsRemaining = (
    seats as { course_session_id: string; seats_remaining: number }[] | null
  )?.find((row) => row.course_session_id === input.courseSessionId)?.seats_remaining
  if (seatsRemaining === 0) throw new Error(sessionFullMessage)

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

  if (enrollmentError?.message.includes('SESSION_FULL')) throw new Error(sessionFullMessage)
  if (enrollmentError)
    throw new Error(`No se pudo registrar la inscripción: ${enrollmentError.message}`)
}
