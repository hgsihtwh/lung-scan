import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { DicomViewer } from '@/components/viewer'
import { useAuthStore, useScanStore } from '@/store'
import { getScans } from '@/api'
import { initCornerstone } from '@/utils/cornerstone'

import HistoryControls from '@/components/profile/HistoryControls'
import StudyGrid from '@/components/profile/StudyGrid'

const PAGE_SIZE = 20

const ScansPage = () => {
  const { token } = useAuthStore()
  const { setCurrentScanId, resetScan } = useScanStore()
  const navigate = useNavigate()

  const [viewing, setViewing] = useState(false)

  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const [verdict, setVerdict] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const prevFiltersRef = useRef({ verdict: '', sortOrder: 'desc' })

  useEffect(() => {
    initCornerstone()
  }, [])

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.verdict !== verdict ||
      prevFiltersRef.current.sortOrder !== sortOrder

    prevFiltersRef.current = { verdict, sortOrder }

    if (filtersChanged && page !== 1) {
      setPage(1)
      return
    }

    const currentPage = filtersChanged ? 1 : page

    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const result = await getScans(token, {
          verdict,
          sort_order: sortOrder,
          page: currentPage,
          size: PAGE_SIZE,
        })
        if (result.success) {
          const items = result.data.items ?? []
          setScans((prev) => (currentPage === 1 ? items : [...prev, ...items]))
          setHasMore(result.data.page < result.data.pages)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, verdict, sortOrder, page])

  const handleScanClick = (scanId) => {
    setCurrentScanId(scanId)
    setViewing(true)
  }

  const handleBack = () => {
    resetScan()
    setViewing(false)
  }

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8 sm:mb-10 lg:mb-[50px]">
          <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark">
            MY SCANS
          </h2>
          <button
            onClick={() => navigate('/dynamics')}
            className="px-5 py-2 rounded-full font-outfit font-medium text-sm transition-colors"
            style={{ backgroundColor: 'var(--color-navy-accent)', color: 'var(--color-bg)' }}
          >
            Dynamics
          </button>
        </div>

        {viewing ? (
          <DicomViewer onBack={handleBack} readOnly />
        ) : (
          <>
            <HistoryControls
              verdict={verdict}
              onVerdictChange={setVerdict}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
                <p className="font-outfit text-primary-dark">Loading scans...</p>
              </div>
            ) : (
              <StudyGrid
                scans={scans}
                token={token}
                onScanClick={handleScanClick}
                hasMore={hasMore}
                onLoadMore={() => setPage((p) => p + 1)}
              />
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default ScansPage
