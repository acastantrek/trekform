import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { CoursesPage } from './pages/courses/CoursesPage'
import { CourseFormPage } from './pages/courses/CourseFormPage'
import { CategoriesPage } from './pages/courses/CategoriesPage'
import { SessionsPage } from './pages/sessions/SessionsPage'
import { SessionFormPage } from './pages/sessions/SessionFormPage'
import { BlogPostsPage } from './pages/blog/BlogPostsPage'
import { BlogPostFormPage } from './pages/blog/BlogPostFormPage'
import { BlogCategoriesPage } from './pages/blog/BlogCategoriesPage'
import { EnrollmentsPage } from './pages/enrollments/EnrollmentsPage'
import { UsersPage } from './pages/users/UsersPage'

export function PanelApp() {
  return (
    <div className="panel-app">
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/panel/cursos" replace />} />
              <Route path="cursos" element={<CoursesPage />} />
              <Route path="cursos/nuevo" element={<CourseFormPage />} />
              <Route path="cursos/:id" element={<CourseFormPage />} />
              <Route path="categorias" element={<CategoriesPage />} />
              <Route path="convocatorias" element={<SessionsPage />} />
              <Route path="convocatorias/nueva" element={<SessionFormPage />} />
              <Route path="convocatorias/:id" element={<SessionFormPage />} />
              <Route path="blog" element={<BlogPostsPage />} />
              <Route path="blog/nuevo" element={<BlogPostFormPage />} />
              <Route path="blog/:id" element={<BlogPostFormPage />} />
              <Route path="blog-categorias" element={<BlogCategoriesPage />} />
              <Route path="inscripciones" element={<EnrollmentsPage />} />
              <Route path="usuarios" element={<UsersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/panel/cursos" replace />} />
        </Routes>
      </AuthProvider>
    </div>
  )
}
