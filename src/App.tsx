import { Route, Routes } from 'react-router-dom'
import { RouteScrollToTop } from './components/common/RouteScrollToTop'
import { StaticFooter } from './components/layout/StaticFooter'
import { StaticHeader } from './components/layout/StaticHeader'
import { AboutPage } from './pages/AboutPage'
import { CoursesPage } from './pages/CoursesPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <>
      <RouteScrollToTop />
      <StaticHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quienes-somos" element={<AboutPage />} />
          <Route path="/cursos-trekform" element={<CoursesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <StaticFooter />
    </>
  )
}
