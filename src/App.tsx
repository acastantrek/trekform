import { Outlet, Route, Routes } from 'react-router-dom'
import { RouteScrollToTop } from './components/common/RouteScrollToTop'
import { StaticFooter } from './components/layout/StaticFooter'
import { StaticHeader } from './components/layout/StaticHeader'
import { AboutPage } from './pages/AboutPage'
import { BlogPage, BlogPostPage } from './pages/BlogPage'
import { CoursesPage } from './pages/CoursesPage'
import { ContactPage } from './pages/ContactPage'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { HomePage } from './pages/HomePage'
import { RegistrationPage } from './pages/RegistrationPage'
import { PanelApp } from './panel/PanelApp'

function PublicLayout() {
  return (
    <>
      <StaticHeader />
      <main>
        <Outlet />
      </main>
      <StaticFooter />
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
          <Route path="*" element={<HomePage />} />
        </Route>

        <Route path="/panel/*" element={<PanelApp />} />
      </Routes>
    </>
  )
}
