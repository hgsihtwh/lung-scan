import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useScanStore, useUIStore } from './store'
import { Header, Footer, Hero, About } from './components/layout'
import { FileUploadZone } from './components/upload'
import { DicomViewer } from './components/viewer'
import { ProfilePage } from './components/profile'
import { AuthPage, ResetPasswordPage, DoctorPage, AdminPage } from './pages'
import lungAscii from './assets/blue-lung-ascii.svg'

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

function DoctorBlock() {
  const { user } = useAuthStore()
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] py-16">
      <div
        className="rounded-2xl px-8 py-10 max-w-lg"
        style={{ backgroundColor: '#EFEDE3' }}
      >
        <p className="font-outfit text-sm text-primary-dark opacity-60 uppercase tracking-widest mb-3">
          Doctor panel
        </p>
        <h3 className="font-outfit font-semibold text-2xl text-primary-dark mb-2">
          Welcome, {user?.email}
        </h3>
        <p className="font-outfit text-base text-primary-dark opacity-70 mb-8">
          View your patients and their CT scan results.
        </p>
        <a
          href="/doctor"
          className="inline-block px-6 py-3 rounded-full bg-primary-navy text-primary-beige font-outfit text-base hover:bg-primary-navyDark transition-colors"
        >
          Go to Patients →
        </a>
      </div>
    </div>
  )
}

function AdminBlock() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] py-16">
      <div
        className="rounded-2xl px-8 py-10 max-w-lg"
        style={{ backgroundColor: '#EFEDE3' }}
      >
        <p className="font-outfit text-sm text-primary-dark opacity-60 uppercase tracking-widest mb-3">
          Administrative panel
        </p>
        <h3 className="font-outfit font-semibold text-2xl text-primary-dark mb-2">
          User management
        </h3>
        <p className="font-outfit text-base text-primary-dark opacity-70 mb-8">
          Manage user accounts and assign roles.
        </p>
        <a
          href="/admin"
          className="inline-block px-6 py-3 rounded-full bg-primary-navy text-primary-beige font-outfit text-base hover:bg-primary-navyDark transition-colors"
        >
          Open Admin Panel →
        </a>
      </div>
    </div>
  )
}

function MainPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { currentScanId } = useScanStore()
  const { currentStep } = useUIStore()

  const role = user?.role
  const isAdmin = role === 'admin'

  if (isAdmin) return <Navigate to="/admin" replace />
  const shouldShowViewer = currentStep === 'viewer' || (isAuthenticated && currentScanId)

  const renderRoleBlock = () => {
    if (!isAuthenticated) return null
    if (role === 'doctor') return <DoctorBlock />
    if (isAdmin) return <AdminBlock />
    return shouldShowViewer ? <DicomViewer /> : <FileUploadZone />
  }

  return (
    <div className="min-h-screen bg-primary-beige relative">
      <img
        src={lungAscii}
        alt=""
        className="absolute -right-10 -top-20 w-[1200px] pointer-events-none select-none z-10"
        style={{ opacity: 0.9 }}
      />

      <div className="relative z-20">
        <Header />
        {!isAdmin && <Hero />}
        {!isAdmin && <About />}
        {renderRoleBlock()}
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

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
