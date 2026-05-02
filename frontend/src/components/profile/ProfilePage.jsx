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

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [verdict, setVerdict] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    initCornerstone()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const loadScans = async () => {
      if (!token) return

      setLoading(true)
      try {
        const result = await getScans(token, {
          search: debouncedSearch,
          verdict,
          sort_order: sortOrder,
        })

        if (result.success) {
          setScans(result.data)
        }
      } catch (err) {
        console.error('Failed to load scans:', err)
      } finally {
        setLoading(false)
      }
    }

    loadScans()
  }, [token, debouncedSearch, verdict, sortOrder])

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

          <HistoryControls
            search={searchInput}
            onSearchChange={setSearchInput}
            verdict={verdict}
            onVerdictChange={setVerdict}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

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
