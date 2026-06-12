import { useAuthStore, useScanStore } from '@/store'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { currentScanId } = useScanStore()

  const handleStartAnalysis = () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    const role = user?.role
    if (role === 'doctor') {
      navigate(currentScanId ? '/doctor' : '/upload')
    } else if (role === 'patient') {
      navigate('/scans')
    } else if (role === 'admin') {
      navigate('/admin')
    }
  }

  return (
    <section
      id="hero"
      className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-[180px] sm:pt-[260px] lg:pt-[350px] pb-16 sm:pb-24 lg:pb-32"
    >
      <h1
        className="font-outfit font-semibold text-[60px] sm:text-[80px] lg:text-[100px] leading-none"
        style={{ color: 'var(--color-text)' }}
      >
        CHEST SCAN
      </h1>

      <p 
        className="font-outfit font-normal text-base mt-4 whitespace-nowrap"
        style={{ color: 'var(--color-text)' }}
      >
        Classification of chest CT scans: Normal vs Pathology detection
      </p>

      <button
        onClick={handleStartAnalysis}
        className="mt-16 sm:mt-20 lg:mt-24 w-fit px-8 sm:px-10 py-3 sm:py-4 bg-primary-navy text-primary-beige font-outfit font-medium text-lg rounded-full hover:bg-opacity-90 transition-colors"
      >
        START ANALYSIS
      </button>

      <div className="flex items-start gap-4 mt-8 sm:mt-10">
        <div 
          className="w-1 h-12 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'var(--color-navy-accent)' }}
        ></div>
        <p 
          className="font-outfit font-normal text-base max-w-[500px] opacity-70"
          style={{ color: 'var(--color-text)' }}
        >
          Research Prototype - This is a demonstration of medical imaging analysis. Not intended for clinical diagnosis or treatment decisions.
        </p>
      </div>
    </section>
  )
}

export default Hero