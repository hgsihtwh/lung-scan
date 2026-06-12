import { useRef, useEffect, useState } from 'react'
import { useAuthStore } from '@/store'
import { getScanDetails, getSliceNumbers, getSlice } from '@/api'
import { cornerstone, cornerstoneWADOImageLoader, initCornerstone } from '@/utils/cornerstone'
import SliceNavigator from '@/components/viewer/SliceNavigator'
import ViewerControls from '@/components/viewer/ViewerControls'
import { formatDate } from '@/utils/helpers'

const ComparePane = ({ scanId }) => {
  const { token } = useAuthStore()
  const viewerRef = useRef(null)
  const [isViewerEnabled, setIsViewerEnabled] = useState(false)
  const [sliceNumbers, setSliceNumbers] = useState([])
  const [currentSlice, setCurrentSlice] = useState(null)
  const [scanDetails, setScanDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initCornerstone()
    const load = async () => {
      const [detailsRes, slicesRes] = await Promise.all([
        getScanDetails(scanId, token),
        getSliceNumbers(scanId, token),
      ])
      if (detailsRes.success) setScanDetails(detailsRes.data)
      if (slicesRes.success) {
        const nums = [...new Set(slicesRes.data.slices)].sort((a, b) => a - b)
        setSliceNumbers(nums)
        setCurrentSlice(nums[0] ?? null)
      }
      setIsLoading(false)
    }
    load()
  }, [scanId, token])

  useEffect(() => {
    if (!viewerRef.current || isViewerEnabled || sliceNumbers.length === 0) return
    try {
      cornerstone.enable(viewerRef.current)
      setTimeout(() => { if (viewerRef.current) cornerstone.resize(viewerRef.current, true) }, 0)
      setIsViewerEnabled(true)
    } catch {}
    return () => {
      if (viewerRef.current && isViewerEnabled) {
        try { cornerstone.disable(viewerRef.current) } catch {}
      }
    }
  }, [sliceNumbers.length])

  useEffect(() => {
    const load = async () => {
      if (!viewerRef.current || !isViewerEnabled || !currentSlice || !scanId || !token) return
      try {
        const result = await getSlice(scanId, currentSlice, token)
        if (!result.success) return
        const arrayBuffer = await result.data.arrayBuffer()
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(
          new File([new Uint8Array(arrayBuffer)], `slice_${currentSlice}.dcm`)
        )
        const image = await cornerstone.loadImage(imageId)
        if (viewerRef.current && isViewerEnabled) {
          cornerstone.displayImage(viewerRef.current, image)
          const viewport = cornerstone.getViewport(viewerRef.current)
          if (viewport) {
            viewport.voi.windowWidth = image.windowWidth || 400
            viewport.voi.windowCenter = image.windowCenter || 40
            cornerstone.setViewport(viewerRef.current, viewport)
          }
        }
      } catch {}
    }
    load()
  }, [currentSlice, isViewerEnabled, scanId, token])

  const handleZoomIn = () => {
    if (!viewerRef.current || !isViewerEnabled) return
    const vp = cornerstone.getViewport(viewerRef.current)
    if (vp) { vp.scale += 0.25; cornerstone.setViewport(viewerRef.current, vp) }
  }

  const handleZoomOut = () => {
    if (!viewerRef.current || !isViewerEnabled) return
    const vp = cornerstone.getViewport(viewerRef.current)
    if (vp) { vp.scale = Math.max(0.25, vp.scale - 0.25); cornerstone.setViewport(viewerRef.current, vp) }
  }

  const handleRotate = () => {
    if (!viewerRef.current || !isViewerEnabled) return
    const vp = cornerstone.getViewport(viewerRef.current)
    if (vp) { vp.rotation += 90; cornerstone.setViewport(viewerRef.current, vp) }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    )
  }

  const verdictColor = scanDetails?.verdict === 'Normal'
    ? '#1F7819'
    : scanDetails?.verdict ? '#7E2F2F' : '#9CA3AF'

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p className="font-outfit font-medium text-sm text-primary-dark">
          {formatDate(scanDetails?.created_at)}
        </p>
        <p className="font-outfit font-medium text-sm mt-1" style={{ color: verdictColor }}>
          {scanDetails?.verdict ?? 'Not analyzed'}
          {scanDetails?.probability != null && (
            <span className="opacity-70 ml-2">
              {(scanDetails.probability * 100).toFixed(0)}%
            </span>
          )}
        </p>
      </div>

      <div
        className="relative rounded-xl overflow-hidden"
        style={{ aspectRatio: '4/3', backgroundColor: '#000' }}
      >
        <div ref={viewerRef} className="absolute inset-0" />

        <div className="absolute top-4 left-4 bg-primary-beige px-3 py-2 rounded-md shadow-sm">
          <span className="font-outfit font-normal text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            slice {currentSlice}/{sliceNumbers.length}
          </span>
        </div>

        <ViewerControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPan={() => {}}
          onRotate={handleRotate}
        />
      </div>

      <SliceNavigator
        sliceNumbers={sliceNumbers}
        currentSlice={currentSlice}
        onSliceChange={setCurrentSlice}
      />
    </div>
  )
}

export default ComparePane
