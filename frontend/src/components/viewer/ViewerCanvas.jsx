import { useRef, useEffect, useState } from 'react'
import { getSlice } from '@/api'
import { cornerstone, cornerstoneWADOImageLoader } from '@/utils/cornerstone'
import ViewerControls from './ViewerControls'
import StudyInfoPanel from './panels/StudyInfoPanel'

const ViewerCanvas = ({ scanId, currentSlice, token, sliceNumbers }) => {
  const viewerRef = useRef(null)
  const [isViewerEnabled, setIsViewerEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (viewerRef.current && !isViewerEnabled && sliceNumbers.length > 0) {
      try {
        cornerstone.enable(viewerRef.current)
        setIsViewerEnabled(true)
        console.log('Cornerstone enabled')
      } catch (err) {
        console.error('Failed to enable cornerstone:', err)
      }
    }

    return () => {
      if (viewerRef.current && isViewerEnabled) {
        try {
          cornerstone.disable(viewerRef.current)
          setIsViewerEnabled(false)
        } catch (err) {
          console.error('Failed to disable cornerstone:', err)
        }
      }
    }
  }, [sliceNumbers.length])

  useEffect(() => {
    const loadAndDisplaySlice = async () => {
      if (!viewerRef.current || !isViewerEnabled || !currentSlice || !scanId || !token) {
        console.log('Skip loading:', {
          hasRef: !!viewerRef.current,
          isViewerEnabled,
          currentSlice,
          scanId,
        })
        return
      }

      setIsLoading(true)
      console.log('Loading slice:', currentSlice)

      try {
        const result = await getSlice(scanId, currentSlice, token)

        if (!result.success) {
          console.error('Failed to load slice:', result.error)
          setIsLoading(false)
          return
        }

        const blob = result.data
        const arrayBuffer = await blob.arrayBuffer()
        const byteArray = new Uint8Array(arrayBuffer)

        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(
          new File([byteArray], `slice_${currentSlice}.dcm`)
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
          console.log('Slice displayed:', currentSlice)
        }
      } catch (err) {
        console.error('Error displaying slice:', err)
      }

      setIsLoading(false)
    }

    loadAndDisplaySlice()
  }, [currentSlice, isViewerEnabled, scanId, token])

  const handleZoomIn = () => {
    if (!viewerRef.current || !isViewerEnabled) return
    const viewport = cornerstone.getViewport(viewerRef.current)
    if (viewport) {
      viewport.scale += 0.25
      cornerstone.setViewport(viewerRef.current, viewport)
    }
  }

  const handleZoomOut = () => {
    if (!viewerRef.current || !isViewerEnabled) return
    const viewport = cornerstone.getViewport(viewerRef.current)
    if (viewport) {
      viewport.scale = Math.max(0.25, viewport.scale - 0.25)
      cornerstone.setViewport(viewerRef.current, viewport)
    }
  }

  const handleRotate = () => {
    if (!viewerRef.current || !isViewerEnabled) return
    const viewport = cornerstone.getViewport(viewerRef.current)
    if (viewport) {
      viewport.rotation += 90
      cornerstone.setViewport(viewerRef.current, viewport)
    }
  }

  const handlePan = () => {
    if (!viewerRef.current || !isViewerEnabled) return

    let isDragging = false
    let lastX = 0
    let lastY = 0

    const element = viewerRef.current

    const onMouseDown = (e) => {
      isDragging = true
      lastX = e.clientX
      lastY = e.clientY
      e.preventDefault()
      element.style.cursor = 'grabbing'
    }

    const onMouseMove = (e) => {
      if (!isDragging) return

      const deltaX = e.clientX - lastX
      const deltaY = e.clientY - lastY

      lastX = e.clientX
      lastY = e.clientY

      const viewport = cornerstone.getViewport(element)
      if (viewport) {
        viewport.translation.x += deltaX / viewport.scale
        viewport.translation.y += deltaY / viewport.scale
        cornerstone.setViewport(element, viewport)
      }
    }

    const onMouseUp = () => {
      isDragging = false
      element.style.cursor = 'default'
    }

    element.addEventListener('mousedown', onMouseDown)
    element.addEventListener('mousemove', onMouseMove)
    element.addEventListener('mouseup', onMouseUp)
    element.addEventListener('mouseleave', onMouseUp)

    setTimeout(() => {
      element.removeEventListener('mousedown', onMouseDown)
      element.removeEventListener('mousemove', onMouseMove)
      element.removeEventListener('mouseup', onMouseUp)
      element.removeEventListener('mouseleave', onMouseUp)
      element.style.cursor = 'default'
    }, 30000)
  }

  const totalSlices = sliceNumbers.length

  return (
    <div
      className="relative rounded-xl sm:rounded-2xl overflow-hidden"
      style={{ aspectRatio: '4/3', backgroundColor: '#000' }}
    >
      <div ref={viewerRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-primary-beige px-3 py-2 rounded-md shadow-sm">
        <span className="font-outfit font-normal text-[13px]" style={{ color: '#787771' }}>
          slice {currentSlice}/{totalSlices}
        </span>
      </div>

      <ViewerControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onPan={handlePan}
        onRotate={handleRotate}
      />

      <StudyInfoPanel />
    </div>
  )
}

export default ViewerCanvas
