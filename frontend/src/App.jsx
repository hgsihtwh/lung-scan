import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useScanStore, useUIStore } from './store'
import { Header, Footer, Hero, About } from './components/layout'
import { FileUploadZone } from './components/upload'
import { DicomViewer } from './components/viewer'
import { ProfilePage } from './components/profile'
import { AuthPage } from './pages'
import lungAscii from './assets/blue-lung-ascii.svg'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function MainPage() {
  const { isAuthenticated } = useAuthStore()
  const { currentScanId } = useScanStore()
  const { currentStep } = useUIStore()

  const shouldShowViewer = currentStep === 'viewer' || (isAuthenticated && currentScanId)

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
        <Hero />
        <About />

        {isAuthenticated && (shouldShowViewer ? <DicomViewer /> : <FileUploadZone />)}

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
