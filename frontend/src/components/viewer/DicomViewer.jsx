import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore, useScanStore, useUIStore } from '@/store'
import { getScanDetails, getSliceNumbers } from '@/api'
import { initCornerstone } from '@/utils/cornerstone'

import ViewerCanvas from './ViewerCanvas'
import SliceNavigator from './SliceNavigator'
import ThumbnailGrid from './ThumbnailGrid'

import { AnalysisPanel, CommentsPanel, FeedbackPanel, ExportPanel } from './panels'

const DicomViewer = () => {
  const { token } = useAuthStore()
  const {
    currentScanId,
    currentScanDetails,
    sliceNumbers,
    currentSlice,
    isLoadingScan,
    scanError,
    setCurrentScanDetails,
    setSliceNumbers,
    setCurrentSlice,
    setLoadingScan,
    setScanError,
    resetScan,
  } = useScanStore()
  const { setCurrentStep } = useUIStore()

  useEffect(() => {
    const viewerSection = document.getElementById('viewer')
    if (viewerSection) {
      viewerSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    initCornerstone()
  }, [])

  useEffect(() => {
    const loadScanData = async () => {
      if (!currentScanId || !token) {
        setScanError('No scan selected')
        setLoadingScan(false)
        return
      }

      try {
        setLoadingScan(true)
        setScanError('')

        const detailsResult = await getScanDetails(currentScanId, token)
        if (!detailsResult.success) {
          throw new Error(detailsResult.error)
        }
        setCurrentScanDetails(detailsResult.data)

        const slicesResult = await getSliceNumbers(currentScanId, token)
        if (!slicesResult.success) {
          throw new Error(slicesResult.error)
        }

        setSliceNumbers(slicesResult.data.slices)
        setLoadingScan(false)
      } catch (err) {
        setScanError(err.message)
        setLoadingScan(false)
      }
    }

    loadScanData()
  }, [currentScanId, token])

  const handleChangeStudy = () => {
    resetScan()
    setCurrentStep('upload')
  }

  if (isLoadingScan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-navy mb-4 mx-auto"></div>
          <p className="font-outfit text-lg text-primary-dark">Loading scan...</p>
        </div>
      </div>
    )
  }

  if (scanError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-outfit text-lg text-red-600 mb-4">{scanError}</p>
          <button
            onClick={handleChangeStudy}
            className="font-outfit text-primary-navy hover:opacity-70"
          >
            Back to Upload
          </button>
        </div>
      </div>
    )
  }

  const totalSlices = sliceNumbers.length

  return (
    <section id="viewer" className="relative scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] py-12 sm:py-16 md:py-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark">
              DICOM VIEWER
            </h2>
            <p className="font-outfit font-normal text-[15px] mt-2" style={{ color: '#787771' }}>
              Chest CT Scan Analysis • {totalSlices} slices loaded
            </p>
          </div>

          <button
            onClick={handleChangeStudy}
            className="flex items-center gap-2 font-outfit font-medium text-base sm:text-lg text-primary-dark hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={24} strokeWidth={1.5} />
            Change Study
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* Left: Viewer */}
          <div className="space-y-4 lg:space-y-6">
            <ViewerCanvas
              scanId={currentScanId}
              currentSlice={currentSlice}
              token={token}
              sliceNumbers={sliceNumbers}
            />

            <SliceNavigator
              sliceNumbers={sliceNumbers}
              currentSlice={currentSlice}
              onSliceChange={setCurrentSlice}
            />

            <ThumbnailGrid
              sliceNumbers={sliceNumbers}
              currentSlice={currentSlice}
              onSliceChange={setCurrentSlice}
              scanId={currentScanId}
              token={token}
            />
          </div>

          {/* Right: Panels */}
          <div className="space-y-4 lg:space-y-6">
            <AnalysisPanel />
            <CommentsPanel />
            <FeedbackPanel />
            <ExportPanel />
          </div>
        </div>
      </div>
    </section>
  )
}

export default DicomViewer
