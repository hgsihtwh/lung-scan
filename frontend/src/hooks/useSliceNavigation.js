import { useState, useCallback, useMemo } from 'react'

export const useSliceNavigation = (sliceNumbers = []) => {
  const [currentSlice, setCurrentSlice] = useState(null)
  const [thumbnailOffset, setThumbnailOffset] = useState(0)

  const initSlices = useCallback(
    (numbers) => {
      const unique = [...new Set(numbers)].sort((a, b) => a - b)
      if (unique.length > 0 && currentSlice === null) {
        setCurrentSlice(unique[0])
      }
      return unique
    },
    [currentSlice]
  )

  const currentIndex = useMemo(() => {
    return sliceNumbers.indexOf(currentSlice)
  }, [sliceNumbers, currentSlice])

  const totalSlices = sliceNumbers.length

  const goToSlice = useCallback(
    (sliceNumber) => {
      if (sliceNumbers.includes(sliceNumber)) {
        setCurrentSlice(sliceNumber)
      }
    },
    [sliceNumbers]
  )

  const goToIndex = useCallback(
    (index) => {
      if (index >= 0 && index < sliceNumbers.length) {
        setCurrentSlice(sliceNumbers[index])
      }
    },
    [sliceNumbers]
  )

  const nextSlice = useCallback(() => {
    if (currentIndex < totalSlices - 1) {
      setCurrentSlice(sliceNumbers[currentIndex + 1])
    }
  }, [currentIndex, totalSlices, sliceNumbers])

  const previousSlice = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentSlice(sliceNumbers[currentIndex - 1])
    }
  }, [currentIndex, sliceNumbers])

  const firstSlice = useCallback(() => {
    if (sliceNumbers.length > 0) {
      setCurrentSlice(sliceNumbers[0])
    }
  }, [sliceNumbers])

  const lastSlice = useCallback(() => {
    if (sliceNumbers.length > 0) {
      setCurrentSlice(sliceNumbers[sliceNumbers.length - 1])
    }
  }, [sliceNumbers])

  const canGoNext = currentIndex < totalSlices - 1
  const canGoPrevious = currentIndex > 0

  const getVisibleThumbnails = useCallback(
    (count = 8) => {
      const maxOffset = Math.max(0, sliceNumbers.length - count)
      const safeOffset = Math.min(thumbnailOffset, maxOffset)

      return Array.from({ length: count }, (_, i) => {
        const index = safeOffset + i
        return index < sliceNumbers.length ? sliceNumbers[index] : null
      }).filter(Boolean)
    },
    [sliceNumbers, thumbnailOffset]
  )

  const maxThumbnailOffset = useCallback(
    (count = 8) => {
      return Math.max(0, sliceNumbers.length - count)
    },
    [sliceNumbers]
  )

  return {
    currentSlice,
    currentIndex,
    totalSlices,
    thumbnailOffset,
    setCurrentSlice,
    setThumbnailOffset,
    initSlices,
    goToSlice,
    goToIndex,
    nextSlice,
    previousSlice,
    firstSlice,
    lastSlice,
    canGoNext,
    canGoPrevious,
    getVisibleThumbnails,
    maxThumbnailOffset,
  }
}
