import { useNavigate } from 'react-router-dom'
import { useAuthStore, useScanStore, useUIStore } from '@/store'

const ProfileInfo = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { resetScan } = useScanStore()
  const { resetUI } = useUIStore()

  const handleSignOut = () => {
    logout()
    resetScan()
    resetUI()
    navigate('/')
  }

  return (
    <div className="max-w-[300px] mb-32 sm:mb-40 lg:mb-[200px]">
      <p className="font-outfit font-normal text-[20px] text-primary-dark opacity-60 mb-1">EMAIL</p>
      <p className="font-outfit font-normal text-base text-primary-dark mb-6">{user?.email}</p>

      <button
        onClick={handleSignOut}
        className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors"
      >
        SIGN OUT
      </button>
    </div>
  )
}

export default ProfileInfo
