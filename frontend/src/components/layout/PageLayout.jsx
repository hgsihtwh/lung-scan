import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import lungAscii from '@/assets/blue-lung-ascii.svg'

const PageLayout = ({ children, showBackground = true, className = '' }) => {
  const location = useLocation()
  
  const isProfilePage = location.pathname === '/profile'

  return (
    <div className="min-h-screen bg-primary-beige relative flex flex-col overflow-x-hidden">
      {/* ASCII art background */}
      {showBackground && (
        <img
          src={lungAscii}
          alt=""
          className={`${
            isProfilePage ? 'fixed' : 'absolute'
          } -right-10 -top-20 w-[1200px] pointer-events-none select-none z-10`}
          style={{ opacity: 0.9 }}
        />
      )}

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Header />
        
        <main className={`flex-1 ${className}`}>
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  )
}

export default PageLayout