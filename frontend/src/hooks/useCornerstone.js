import { useRef, useState, useEffect, useCallback } from 'react'
import { cornerstone, cornerstoneWADOImageLoader, initCornerstone } from '@/utils/cornerstoneSetup'
import { getSlice } from '@/api'

export const useCornerstone = ({ scanId, token }) => {
  const viewerRef = useRef(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    initCornerstone()
  }, [])

  const enableViewer = useCallback(() => {
    if (viewerRef.current && !isEnabled) {
      try {
        cornerstone.enable(viewerRef.current)
        setIsEnabled(true)
      } catch (err) {
        console.error('Failed to enable cornerstone:', err)
      }
    }
  }, [isEnabled])

  const disableViewer = useCallback(() => {
    if (viewerRef.current && isEnabled) {
      try {
        cornerstone.disable(viewerRef.current)
        setIsEnabled(false)
      } catch (err) {
        console.error('Failed to disable cornerstone:', err)
      }
    }
  }, [isEnabled])

  const displaySlice = useCallback(
    async (sliceNumber) => {
      if (!viewerRef.current || !isEnabled || !scanId || !token || !sliceNumber) {
        return
      }

      setIsLoading(true)

      try {
        const result = await getSlice(scanId, sliceNumber, token)

        if (!result.success) {
          console.error('Failed to load slice:', result.error)
          setIsLoading(false)
          return
        }

        const blob = result.data
        const arrayBuffer = await blob.arrayBuffer()
        const byteArray = new Uint8Array(arrayBuffer)

        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(
          new File([byteArray], `slice_${sliceNumber}.dcm`)
        )

        const image = await cornerstone.loadImage(imageId)
        cornerstone.displayImage(viewerRef.current, image)

        const viewport = cornerstone.getViewport(viewerRef.current)
        viewport.voi.windowWidth = image.windowWidth || 400
        viewport.voi.windowCenter = image.windowCenter || 40
        cornerstone.setViewport(viewerRef.current, viewport)
      } catch (err) {
        console.error('Error displaying slice:', err)
      }

      setIsLoading(false)
    },
    [isEnabled, scanId, token]
  )

  const zoomIn = useCallback(() => {
    if (!viewerRef.current || !isEnabled) return
    const viewport = cornerstone.getViewport(viewerRef.current)
    viewport.scale += 0.25
    cornerstone.setViewport(viewerRef.current, viewport)
  }, [isEnabled])

  const zoomOut = useCallback(() => {
    if (!viewerRef.current || !isEnabled) return
    const viewport = cornerstone.getViewport(viewerRef.current)
    viewport.scale = Math.max(0.25, viewport.scale - 0.25)
    cornerstone.setViewport(viewerRef.current, viewport)
  }, [isEnabled])

  const rotate = useCallback(() => {
    if (!viewerRef.current || !isEnabled) return
    const viewport = cornerstone.getViewport(viewerRef.current)
    viewport.rotation += 90
    cornerstone.setViewport(viewerRef.current, viewport)
  }, [isEnabled])

  const resetViewport = useCallback(() => {
    if (!viewerRef.current || !isEnabled) return
    cornerstone.reset(viewerRef.current)
  }, [isEnabled])

  const enablePan = useCallback(
    (duration = 30000) => {
      if (!viewerRef.current || !isEnabled) return

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
        viewport.translation.x += deltaX / viewport.scale
        viewport.translation.y += deltaY / viewport.scale
        cornerstone.setViewport(element, viewport)
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
      }, duration)
    },
    [isEnabled]
  )

  return {
    viewerRef,
    isEnabled,
    isLoading,
    enableViewer,
    disableViewer,
    displaySlice,
    zoomIn,
    zoomOut,
    rotate,
    resetViewport,
    enablePan,
  }
}
