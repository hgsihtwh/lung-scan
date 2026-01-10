import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { useAuthStore, useScanStore } from '@/store'
import { getScans } from '@/api'
import { initCornerstone } from '@/utils/cornerstone'

import ProfileInfo from './ProfileInfo'
import HistoryControls from './HistoryControls'
import StudyGrid from './StudyGrid'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { setCurrentScanId } = useScanStore()

  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    initCornerstone()
  }, [])

  useEffect(() => {
    const loadScans = async () => {
      if (!token) return

      try {
        const result = await getScans(token)

        if (result.success) {
          const sorted = result.data.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at)
          })
          setScans(sorted)
        }
      } catch (err) {
        console.error('Failed to load scans:', err)
      } finally {
        setLoading(false)
      }
    }

    loadScans()
  }, [token])

  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder)

    const sorted = [...scans].sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return newOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    setScans(sorted)
  }

  const handleScanClick = (scanId) => {
    setCurrentScanId(scanId)
    navigate('/')
  }

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px]">
        {/* Profile Section */}
        <div className="pt-24 sm:pt-32 lg:pt-[150px]">
          <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
            PROFILE
          </h2>

          <ProfileInfo />
        </div>

        {/* History Section */}
        <div className="pb-12 sm:pb-16 md:pb-20">
          <h2 className="font-outfit font-semibold text-[30px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
            HISTORY OF RESEARCHES
          </h2>

          <HistoryControls sortOrder={sortOrder} onSortChange={handleSortChange} />

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
              <p className="font-outfit text-primary-dark">Loading studies...</p>
            </div>
          ) : (
            <StudyGrid scans={scans} token={token} onScanClick={handleScanClick} />
          )}
        </div>
      </div>
    </PageLayout>
  )
}

export default ProfilePage
