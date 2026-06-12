import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import { Header, Footer, Hero, About } from './components/layout'
import { ProfilePage } from './components/profile'
import { AuthPage, ResetPasswordPage, DoctorPage, AdminPage, UploadPage, ScansPage, DynamicsPage } from './pages'
import lungAscii from './assets/dark-mode-lung.svg'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

const RoleRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

function MainPage() {
  const { user } = useAuthStore()

  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  return (
    <div className="min-h-screen bg-primary-beige relative transition-colors duration-200">
      <img
        src={lungAscii}
        alt=""
        className="absolute -right-32 -top-20 w-[1200px] pointer-events-none select-none z-10 opacity-40 dark:opacity-60"
      />
      <div className="relative z-20">
        <Header />
        <Hero />
        <About />
        <Footer />
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />

        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scans"
          element={
            <RoleRoute roles={['patient']}>
              <ScansPage />
            </RoleRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <RoleRoute roles={['doctor']}>
              <UploadPage />
            </RoleRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <RoleRoute roles={['doctor', 'admin']}>
              <DoctorPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute roles={['admin']}>
              <AdminPage />
            </RoleRoute>
          }
        />

        <Route
          path="/dynamics"
          element={
            <RoleRoute roles={['patient']}>
              <DynamicsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/dynamics/:patientId"
          element={
            <RoleRoute roles={['doctor', 'admin']}>
              <DynamicsPage />
            </RoleRoute>
          }
        />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
