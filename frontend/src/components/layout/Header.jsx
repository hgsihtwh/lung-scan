import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'

const NAV_LINK_CLASS =
  'font-outfit font-normal text-base sm:text-lg md:text-[20px] text-primary-navy hover:opacity-70 transition-opacity'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const role = user?.role

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
            className="font-outfit font-medium text-base sm:text-lg md:text-[20px] text-primary-dark hover:opacity-70 transition-opacity"
          >
            Chest Scan
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {role !== 'admin' && (
              <a
                href="/#about"
                className="font-outfit font-normal text-base sm:text-lg md:text-[20px] text-primary-dark hover:opacity-70 transition-opacity"
              >
                About
              </a>
            )}

            {isAuthenticated ? (
              <>
                {role === 'patient' && (
                  <button onClick={() => navigate('/scans')} className={NAV_LINK_CLASS}>
                    My Scans
                  </button>
                )}
                {role === 'doctor' && (
                  <>
                    <button onClick={() => navigate('/upload')} className={NAV_LINK_CLASS}>
                      Upload
                    </button>
                    <button onClick={() => navigate('/doctor')} className={NAV_LINK_CLASS}>
                      Patients
                    </button>
                  </>
                )}
                {role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className={NAV_LINK_CLASS}>
                    Admin
                  </button>
                )}
                <button onClick={() => navigate('/profile')} className={NAV_LINK_CLASS}>
                  Profile
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/auth')} className={NAV_LINK_CLASS}>
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
