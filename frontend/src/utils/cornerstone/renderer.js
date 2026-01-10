import { cornerstone, cornerstoneWADOImageLoader } from './setup'
import { getSlice } from '@/api'

const imageCache = new Map()

export const loadDicomImage = async (scanId, sliceNumber, token) => {
  const cacheKey = `${scanId}-${sliceNumber}`

  if (imageCache.has(cacheKey)) {
    return { success: true, image: imageCache.get(cacheKey) }
  }

  try {
    const result = await getSlice(scanId, sliceNumber, token)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    const blob = result.data
    const arrayBuffer = await blob.arrayBuffer()
    const byteArray = new Uint8Array(arrayBuffer)

    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(
      new File([byteArray], `slice_${sliceNumber}.dcm`)
    )

    const image = await cornerstone.loadImage(imageId)

    imageCache.set(cacheKey, image)

    return { success: true, image }
  } catch (err) {
    console.error('Error loading DICOM image:', err)
    return { success: false, error: err.message }
  }
}

export const renderToCanvas = (canvas, image, options = {}) => {
  if (!canvas || !image) return false

  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()

  canvas.width = rect.width
  canvas.height = rect.height

  const pixelData = image.getPixelData()
  const width = image.width
  const height = image.height

  const windowWidth = options.windowWidth || image.windowWidth || 400
  const windowCenter = options.windowCenter || image.windowCenter || 40
  const windowLow = windowCenter - windowWidth / 2
  const windowHigh = windowCenter + windowWidth / 2

  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let i = 0; i < pixelData.length; i++) {
    let pixelValue = pixelData[i]

    if (pixelValue <= windowLow) {
      pixelValue = 0
    } else if (pixelValue >= windowHigh) {
      pixelValue = 255
    } else {
      pixelValue = ((pixelValue - windowLow) / windowWidth) * 255
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

  return true
}

export const clearImageCache = () => {
  imageCache.clear()
}

export const removeFromCache = (scanId, sliceNumber) => {
  const cacheKey = `${scanId}-${sliceNumber}`
  imageCache.delete(cacheKey)
}

export const getCacheSize = () => {
  return imageCache.size
}
