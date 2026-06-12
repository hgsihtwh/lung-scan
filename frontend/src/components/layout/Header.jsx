import { useNavigate, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAuthStore, useThemeStore } from '@/store'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const role = user?.role

  const navClass = (path) =>
    `nav-link font-outfit font-normal text-base sm:text-lg md:text-lg hover:opacity-70 transition-opacity ${
      location.pathname === path ? 'nav-active' : ''
    }`

  return (
    <header className="fixed top-0 left-0 right-0 bg-primary-beige z-30 pt-8 sm:pt-12 md:pt-[60px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px]">
        <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-primary-dark">
          {/* Logo */}
          <button
            onClick={() => {
              navigate('/')
              setTimeout(() => {
                const hero = document.getElementById('hero')
                if (hero) {
                  hero.scrollIntoView({ behavior: 'smooth' })
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }, 100)
            }}
            className="font-outfit font-medium text-base sm:text-lg md:text-lg text-primary-dark hover:opacity-70 transition-opacity"
          >
            Chest Scan
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <button
              onClick={toggle}
              className="text-primary-dark opacity-60 hover:opacity-100 transition-opacity"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {role !== 'admin' && (
              <a
                href="/#about"
                className={`nav-link font-outfit font-normal text-base sm:text-lg md:text-lg hover:opacity-70 transition-opacity ${location.pathname === '/' ? 'nav-active' : ''}`}
              >
                About
              </a>
            )}

            {isAuthenticated ? (
              <>
                {role === 'patient' && (
                  <button onClick={() => navigate('/scans')} className={navClass('/scans')}>
                    My Scans
                  </button>
                )}
                {role === 'doctor' && (
                  <>
                    <button onClick={() => navigate('/upload')} className={navClass('/upload')}>
                      Upload
                    </button>
                    <button onClick={() => navigate('/doctor')} className={navClass('/doctor')}>
                      Scans & Patients
                    </button>
                  </>
                )}
                {role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className={navClass('/admin')}>
                    Admin
                  </button>
                )}
                <button onClick={() => navigate('/profile')} className={navClass('/profile')}>
                  Profile
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/auth')} className={navClass('/auth')}>
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-3 sm:h-4 bg-primary-beige"></div>
    </header>
  )
}

export default Header
