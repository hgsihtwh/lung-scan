import { useRef, useEffect, useState } from 'react'
import { getSliceNumbers, getSlice } from '@/api'
import { cornerstone, cornerstoneWADOImageLoader } from '@/utils/cornerstone'

const previewCache = new Map()

const StudyPreview = ({ scanId, token }) => {
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreview = async () => {
      if (!canvasRef.current || !scanId || !token) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      try {
        const cacheKey = `preview-${scanId}`
        if (previewCache.has(cacheKey)) {
          const cachedImage = previewCache.get(cacheKey)
          renderPreview(canvas, ctx, cachedImage)
          setIsLoading(false)
          return
        }

        const slicesResult = await getSliceNumbers(scanId, token)
        if (!slicesResult.success || !slicesResult.data.slices || slicesResult.data.slices.length === 0) {
          setIsLoading(false)
          return
        }

        const uniqueSlices = [...new Set(slicesResult.data.slices)].sort((a, b) => a - b)
        const firstSlice = uniqueSlices[0]

        const sliceResult = await getSlice(scanId, firstSlice, token)
        if (!sliceResult.success) {
          setIsLoading(false)
          return
        }

        const blob = sliceResult.data
        const arrayBuffer = await blob.arrayBuffer()
        const byteArray = new Uint8Array(arrayBuffer)

        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(
          new File([byteArray], `preview_${firstSlice}.dcm`)
        )

        const image = await cornerstone.loadImage(imageId)

        previewCache.set(cacheKey, image)

        renderPreview(canvas, ctx, image)
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading preview:', err)
        setIsLoading(false)
      }
    }

    loadPreview()
  }, [scanId, token])

  const renderPreview = (canvas, ctx, image) => {
    if (!canvas || !ctx || !image) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const pixelData = image.getPixelData()
    const width = image.width
    const height = image.height

    const windowWidth = image.windowWidth || image.maxPixelValue - image.minPixelValue || 400
    const windowCenter = image.windowCenter || (image.maxPixelValue + image.minPixelValue) / 2 || 40
    const slope = image.slope || 1
    const intercept = image.intercept || 0
    const invert = image.invert || false

    const windowLow = windowCenter - windowWidth / 2
    const windowHigh = windowCenter + windowWidth / 2

    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let i = 0; i < pixelData.length; i++) {
      let pixelValue = pixelData[i] * slope + intercept

      if (pixelValue <= windowLow) {
        pixelValue = 0
      } else if (pixelValue >= windowHigh) {
        pixelValue = 255
      } else {
        pixelValue = ((pixelValue - windowLow) / windowWidth) * 255
      }

      if (invert) {
        pixelValue = 255 - pixelValue
      }

      const idx = i * 4
      data[idx] = pixelValue
      data[idx + 1] = pixelValue
      data[idx + 2] = pixelValue
      data[idx + 3] = 255
    }

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(imageData, 0, 0)

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const scale = Math.min(canvas.width / width, canvas.height / height)
    const scaledWidth = width * scale
    const scaledHeight = height * scale
    const x = (canvas.width - scaledWidth) / 2
    const y = (canvas.height - scaledHeight) / 2

    ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight)
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy"></div>
        </div>
      )}
    </div>
  )
}

export default StudyPreview
