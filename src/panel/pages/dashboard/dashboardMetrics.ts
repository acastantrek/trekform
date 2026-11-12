import type { DashboardData, DashboardSession } from '../../services/dashboard'

const DAY_MS = 24 * 60 * 60 * 1000

/** Window used for "recent" numbers on the KPI tiles. */
export const RECENT_DAYS = 30
/** How far ahead a convocatoria counts as "upcoming". */
export const UPCOMING_DAYS = 60
/** A convocatoria starting this soon with nobody enrolled is flagged. */
export const STARTING_SOON_DAYS = 14
/** The blog is flagged as inactive after this long without a new post. */
export const BLOG_STALE_DAYS = 60
/** Months shown on the demand chart, current month included. */
export const DEMAND_MONTHS = 6

export interface UpcomingSession extends DashboardSession {
  enrolled: number
  occupancy: number
}

export interface MonthlyDemand {
  key: string
  label: string
  longLabel: string
  requests: number
  enrollments: number
}

export interface CategoryCoverage {
  name: string
  total: number
  withDates: number
}

export type AttentionTone = 'warning' | 'info'

export interface AttentionItem {
  id: string
  tone: AttentionTone
  count: number
  title: string
  detail: string
  to: string
  action: string
}

export interface DashboardMetrics {
  revenueCents: number
  recentRevenueCents: number
  enrollmentsActive: number
  recentEnrollments: number
  pendingEnrollments: number
  openRequests: number
  totalRequests: number
  upcomingSessions: UpcomingSession[]
  upcomingSeats: number
  upcomingEnrolled: number
  demand: MonthlyDemand[]
  coverage: CategoryCoverage[]
  publishedCourses: number
  coursesWithDates: number
  attention: AttentionItem[]
  studentCount: number
}

const monthShort = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const monthLong = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function plural(count: number, one: string, many: string) {
  return count === 1 ? one : many
}

export function computeDashboardMetrics(data: DashboardData, now = new Date()): DashboardMetrics {
  const nowMs = now.getTime()
  const recentFrom = nowMs - RECENT_DAYS * DAY_MS

  // Enrollments: cancelled ones don't take a seat or count as demand.
  const activeEnrollments = data.enrollments.filter((item) => item.status !== 'cancelled')
  const paid = data.enrollments.filter((item) => item.paymentStatus === 'paid')
  const revenueCents = paid.reduce((sum, item) => sum + item.amountPaidCents, 0)
  const recentRevenueCents = paid
    .filter((item) => new Date(item.createdAt).getTime() >= recentFrom)
    .reduce((sum, item) => sum + item.amountPaidCents, 0)
  const pendingEnrollments = data.enrollments.filter((item) => item.status === 'pending').length

  const enrolledBySession = new Map<string, number>()
  activeEnrollments.forEach((item) =>
    enrolledBySession.set(item.sessionId, (enrolledBySession.get(item.sessionId) ?? 0) + 1),
  )

  // Upcoming convocatorias (not cancelled/draft), soonest first.
  const liveStatuses = new Set(['open', 'full'])
  const futureSessions = data.sessions.filter(
    (session) => liveStatuses.has(session.status) && new Date(session.startsAt).getTime() >= nowMs,
  )
  const upcomingSessions: UpcomingSession[] = futureSessions
    .filter((session) => new Date(session.startsAt).getTime() <= nowMs + UPCOMING_DAYS * DAY_MS)
    .map((session) => {
      const enrolled = enrolledBySession.get(session.id) ?? 0
      return {
        ...session,
        enrolled,
        occupancy: session.capacity > 0 ? Math.min(enrolled / session.capacity, 1) : 0,
      }
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  // Monthly demand: contact requests vs enrollments for the last DEMAND_MONTHS months.
  const demand: MonthlyDemand[] = []
  for (let offset = DEMAND_MONTHS - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    demand.push({
      key: monthKey(date),
      label: capitalize(monthShort.format(date).replace('.', '')),
      longLabel: capitalize(monthLong.format(date)),
      requests: 0,
      enrollments: 0,
    })
  }
  const demandByKey = new Map(demand.map((month) => [month.key, month]))
  data.contactRequests
    .filter((item) => item.status !== 'spam')
    .forEach((item) => {
      const month = demandByKey.get(monthKey(new Date(item.createdAt)))
      if (month) month.requests += 1
    })
  activeEnrollments.forEach((item) => {
    const month = demandByKey.get(monthKey(new Date(item.createdAt)))
    if (month) month.enrollments += 1
  })

  // Catalog coverage: published courses with at least one future convocatoria, per category.
  const publishedCourses = data.courses.filter((course) => course.status === 'published')
  const coursesWithFutureDates = new Set(futureSessions.map((session) => session.courseId))
  const coverageByCategory = new Map<string, CategoryCoverage>()
  publishedCourses.forEach((course) => {
    const entry = coverageByCategory.get(course.categoryName) ?? {
      name: course.categoryName,
      total: 0,
      withDates: 0,
    }
    entry.total += 1
    if (coursesWithFutureDates.has(course.id)) entry.withDates += 1
    coverageByCategory.set(course.categoryName, entry)
  })
  const coverage = [...coverageByCategory.values()].sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name),
  )
  const coursesWithDates = publishedCourses.filter((course) =>
    coursesWithFutureDates.has(course.id),
  ).length

  // Things that need someone to act, most urgent first.
  const openRequests = data.contactRequests.filter(
    (item) => item.status === 'new' || item.status === 'in_progress',
  ).length
  const staleSessions = data.sessions.filter(
    (session) => liveStatuses.has(session.status) && new Date(session.startsAt).getTime() < nowMs,
  ).length
  const emptySoon = futureSessions.filter(
    (session) =>
      new Date(session.startsAt).getTime() <= nowMs + STARTING_SOON_DAYS * DAY_MS &&
      !enrolledBySession.get(session.id),
  ).length
  const coursesWithoutDates = publishedCourses.length - coursesWithDates
  const lastPostMs = Math.max(
    0,
    ...data.blogPosts
      .filter((post) => post.status === 'published' && post.publishedAt)
      .map((post) => new Date(post.publishedAt!).getTime()),
  )
  const daysSincePost = lastPostMs ? Math.floor((nowMs - lastPostMs) / DAY_MS) : null

  const attention: AttentionItem[] = []
  if (openRequests > 0) {
    attention.push({
      id: 'requests',
      tone: 'warning',
      count: openRequests,
      title: `${openRequests} ${plural(openRequests, 'solicitud de contacto sin atender', 'solicitudes de contacto sin atender')}`,
      detail: 'Personas interesadas esperando respuesta.',
      to: '#solicitudes',
      action: 'Ver solicitudes',
    })
  }
  if (pendingEnrollments > 0) {
    attention.push({
      id: 'enrollments',
      tone: 'warning',
      count: pendingEnrollments,
      title: `${pendingEnrollments} ${plural(pendingEnrollments, 'inscripción pendiente', 'inscripciones pendientes')} de confirmar`,
      detail: 'Revisa el pago y confirma la plaza al alumno.',
      to: '/panel/inscripciones',
      action: 'Revisar',
    })
  }
  if (emptySoon > 0) {
    attention.push({
      id: 'empty-soon',
      tone: 'warning',
      count: emptySoon,
      title: `${emptySoon} ${plural(emptySoon, 'convocatoria empieza', 'convocatorias empiezan')} en menos de ${STARTING_SOON_DAYS} días sin inscritos`,
      detail: 'Promociónalas o valora aplazarlas.',
      to: '/panel/convocatorias',
      action: 'Ver convocatorias',
    })
  }
  if (staleSessions > 0) {
    attention.push({
      id: 'stale',
      tone: 'info',
      count: staleSessions,
      title: `${staleSessions} ${plural(staleSessions, 'convocatoria ya celebrada sigue', 'convocatorias ya celebradas siguen')} abierta${staleSessions === 1 ? '' : 's'}`,
      detail: 'Márcalas como finalizadas para mantener el calendario limpio.',
      to: '/panel/convocatorias',
      action: 'Ordenar',
    })
  }
  if (coursesWithoutDates > 0) {
    attention.push({
      id: 'no-dates',
      tone: 'info',
      count: coursesWithoutDates,
      title: `${coursesWithoutDates} ${plural(coursesWithoutDates, 'curso publicado', 'cursos publicados')} sin fechas próximas`,
      detail: 'En la web aparecen como «Próximamente».',
      to: '/panel/convocatorias',
      action: 'Programar',
    })
  }
  if (daysSincePost === null || daysSincePost > BLOG_STALE_DAYS) {
    attention.push({
      id: 'blog',
      tone: 'info',
      count: daysSincePost ?? 0,
      title:
        daysSincePost === null
          ? 'Aún no hay artículos publicados en el blog'
          : `El último artículo del blog es de hace ${daysSincePost} días`,
      detail: 'Publicar con regularidad ayuda al posicionamiento en Google.',
      to: '/panel/blog/nuevo',
      action: 'Escribir',
    })
  }

  return {
    revenueCents,
    recentRevenueCents,
    enrollmentsActive: activeEnrollments.length,
    recentEnrollments: activeEnrollments.filter(
      (item) => new Date(item.createdAt).getTime() >= recentFrom,
    ).length,
    pendingEnrollments,
    openRequests,
    totalRequests: data.contactRequests.filter((item) => item.status !== 'spam').length,
    upcomingSessions,
    upcomingSeats: upcomingSessions.reduce((sum, session) => sum + session.capacity, 0),
    upcomingEnrolled: upcomingSessions.reduce((sum, session) => sum + session.enrolled, 0),
    demand,
    coverage,
    publishedCourses: publishedCourses.length,
    coursesWithDates,
    attention,
    studentCount: data.studentCount,
  }
}
