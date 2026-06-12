import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore, useScanStore, useUIStore } from '@/store'
import { getScanDetails, getSliceNumbers, getAnnotations, createAnnotation, updateAnnotation, deleteAnnotation } from '@/api'
import { initCornerstone } from '@/utils/cornerstone'

import ViewerCanvas from './ViewerCanvas'
import SliceNavigator from './SliceNavigator'
import ThumbnailGrid from './ThumbnailGrid'

import { AnalysisPanel, CommentsPanel, FeedbackPanel, ExportPanel } from './panels'

const DicomViewer = ({ onBack, readOnly = false }) => {
  const { token, user } = useAuthStore()
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

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin'
  const [annotations, setAnnotations] = useState([])
  const [isAnnotationMode, setIsAnnotationMode] = useState(false)

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
        if (!detailsResult.success) throw new Error(detailsResult.error)
        setCurrentScanDetails(detailsResult.data)

        const slicesResult = await getSliceNumbers(currentScanId, token)
        if (!slicesResult.success) throw new Error(slicesResult.error)
        setSliceNumbers(slicesResult.data.slices)

        setLoadingScan(false)
      } catch (err) {
        setScanError(err.message)
        setLoadingScan(false)
      }
    }

    loadScanData()
  }, [currentScanId, token])

  useEffect(() => {
    if (!currentScanId || !token) return
    const load = async () => {
      const result = await getAnnotations(currentScanId, token)
      if (result.success) setAnnotations(result.data)
    }
    load()
  }, [currentScanId, token])

  const sliceAnnotations = annotations.filter((a) => a.slice_number === currentSlice)

  const handleAnnotationCreate = async (rect) => {
    if (!currentScanId || !currentSlice) return
    const result = await createAnnotation(currentScanId, { ...rect, slice_number: currentSlice }, token)
    if (result.success) setAnnotations((prev) => [...prev, result.data])
  }

  const handleAnnotationDelete = async (id) => {
    const result = await deleteAnnotation(currentScanId, id, token)
    if (result.success) setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }

  const handleAnnotationUpdate = async (id, label) => {
    const result = await updateAnnotation(currentScanId, id, { label }, token)
    if (result.success) setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, label } : a)))
  }

  const handleChangeStudy = () => {
    resetScan()
    setIsAnnotationMode(false)
    if (onBack) onBack()
    else setCurrentStep('upload')
  }

  if (isLoadingScan) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-navy mb-4 mx-auto" />
          <p className="font-outfit text-lg text-primary-dark">Loading scan...</p>
        </div>
      </div>
    )
  }

  if (scanError) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <p className="font-outfit text-lg text-primary-dark opacity-60 mb-4">{scanError}</p>
          <button onClick={handleChangeStudy} className="font-outfit text-primary-navy hover:opacity-70">
            Back to Upload
          </button>
        </div>
      </div>
    )
  }

  const totalSlices = sliceNumbers.length

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
        <p className="font-outfit font-normal text-base" style={{ color: 'var(--color-text-muted)' }}>
          Chest CT Scan Analysis · {totalSlices} slices loaded
          {isAnnotationMode && (
            <span className="ml-3 text-[var(--color-navy-accent)] font-medium">· Annotation mode</span>
          )}
        </p>
        <button
          onClick={handleChangeStudy}
          className="flex items-center gap-2 font-outfit font-medium text-base sm:text-lg text-primary-dark hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={24} strokeWidth={1.5} />
          Change Study
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <div className="space-y-4 lg:space-y-6">
          <ViewerCanvas
            scanId={currentScanId}
            currentSlice={currentSlice}
            token={token}
            sliceNumbers={sliceNumbers}
            annotations={sliceAnnotations}
            isAnnotationMode={isAnnotationMode}
            isDoctor={isDoctor}
            onAnnotationModeChange={setIsAnnotationMode}
            onAnnotationCreate={handleAnnotationCreate}
            onAnnotationDelete={handleAnnotationDelete}
            onAnnotationUpdate={handleAnnotationUpdate}
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

        <div className="space-y-4 lg:space-y-6">
          <AnalysisPanel readOnly={readOnly} />
          <CommentsPanel readOnly={readOnly} />
          {!readOnly && <FeedbackPanel />}
          <ExportPanel />
        </div>
      </div>
    </div>
  )
}

export default DicomViewer
