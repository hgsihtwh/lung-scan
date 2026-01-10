import { useRef, useEffect, useState } from 'react'
import { getSlice } from '@/api'
import { cornerstone, cornerstoneWADOImageLoader } from '@/utils/cornerstone'

const thumbnailCache = new Map()

const ThumbnailSlice = ({ sliceNumber, scanId, token, isActive, onClick }) => {
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadThumbnail = async () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      try {
        const cacheKey = `${scanId}-${sliceNumber}`
        let image

        if (thumbnailCache.has(cacheKey)) {
          image = thumbnailCache.get(cacheKey)
        } else {
          const result = await getSlice(scanId, sliceNumber, token)

          if (!result.success) {
            setIsLoading(false)
            return
          }

          const blob = result.data
          const arrayBuffer = await blob.arrayBuffer()
          const byteArray = new Uint8Array(arrayBuffer)

          const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(
            new File([byteArray], `thumb_${sliceNumber}.dcm`)
          )

          image = await cornerstone.loadImage(imageId)

          thumbnailCache.set(cacheKey, image)
        }

        renderThumbnail(canvas, ctx, image)
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading thumbnail:', err)
        setIsLoading(false)
      }
    }

    loadThumbnail()
  }, [sliceNumber, scanId, token])

  const renderThumbnail = (canvas, ctx, image) => {
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
      data[idx] = pixelValue // R
      data[idx + 1] = pixelValue // G
      data[idx + 2] = pixelValue // B
      data[idx + 3] = 255 // A
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
    <button
      onClick={onClick}
      className={`
        relative flex-1 aspect-square rounded-xl sm:rounded-2xl border-2 transition-all overflow-hidden
        ${isActive ? 'border-primary-navy' : 'border-transparent hover:border-gray-400'}
      `}
      style={{ backgroundColor: '#000' }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </button>
  )
}

export default ThumbnailSlice
