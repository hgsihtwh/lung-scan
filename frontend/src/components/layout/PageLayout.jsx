import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import lungAscii from '@/assets/blue-lung-ascii.svg'

const PageLayout = ({ children, showBackground = true, className = '' }) => {
  const location = useLocation()
  
  const isProfilePage = location.pathname === '/profile'

  return (
    <div className="min-h-screen bg-primary-beige relative flex flex-col overflow-hidden transition-colors duration-200">
      {/* Background glow blobs — dark only */}
      <div className="hidden dark:block absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{
          position: 'absolute', top: '15%', left: '65%',
          width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(0,61,214,0.13) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }} />
        <div style={{
          position: 'absolute', top: '70%', left: '20%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(0,61,214,0.09) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }} />
      </div>

      {/* ASCII art background */}
      {showBackground && (
        <img
          src={lungAscii}
          alt=""
          className={`${
            isProfilePage ? 'fixed' : 'absolute'
          } -right-10 -top-20 w-[1200px] pointer-events-none select-none z-10 opacity-90 dark:opacity-10`}
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