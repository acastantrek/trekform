import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { CookieBanner } from './components/common/CookieBanner'
import { RouteScrollToTop } from './components/common/RouteScrollToTop'
import { StaticFooter } from './components/layout/StaticFooter'
import { StaticHeader } from './components/layout/StaticHeader'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

// Home and 404 stay in the main bundle; every other page is split into its own
// chunk so the first load only ships what the landing page needs.
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })))
const BlogPostPage = lazy(() =>
  import('./pages/BlogPage').then((m) => ({ default: m.BlogPostPage })),
)
const CoursesPage = lazy(() =>
  import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage })),
)
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const CourseDetailPage = lazy(() =>
  import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })),
)
const CookiesPolicyPage = lazy(() =>
  import('./pages/CookiesPolicyPage').then((m) => ({ default: m.CookiesPolicyPage })),
)
const LegalNoticePage = lazy(() =>
  import('./pages/LegalNoticePage').then((m) => ({ default: m.LegalNoticePage })),
)
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })),
)
const RegistrationPage = lazy(() =>
  import('./pages/RegistrationPage').then((m) => ({ default: m.RegistrationPage })),
)
const PanelApp = lazy(() =>
  import('./panel/PanelApp').then((module) => ({ default: module.PanelApp })),
)

function PageLoading({ label }: { label: string }) {
  return (
    <div className="course-detail-loading" role="status">
      <span />
      <p>{label}</p>
    </div>
  )
}

function PublicLayout() {
  return (
    <>
      <StaticHeader />
      <main>
        <Suspense fallback={<PageLoading label="Cargando…" />}>
          <Outlet />
        </Suspense>
      </main>
      <StaticFooter />
      <CookieBanner />
    </>
  )
}

export default function App() {
  return (
    <>
      <RouteScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/quienes-somos" element={<AboutPage />} />
          <Route path="/cursos-trekform" element={<CoursesPage />} />
          <Route path="/cursos-trekform/:slug" element={<CourseDetailPage />} />
          <Route path="/inscripciones" element={<RegistrationPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />
          <Route path="/aviso-legal" element={<LegalNoticePage />} />
          <Route path="/politica-de-cookies" element={<CookiesPolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/panel/*"
          element={
            <Suspense fallback={<PageLoading label="Cargando panel…" />}>
              <PanelApp />
            </Suspense>
          }
        />
      </Routes>
    </>
  )
}
