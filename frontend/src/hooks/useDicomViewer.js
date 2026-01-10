import { useState, useEffect, useCallback } from 'react'
import { useAuthStore, useScanStore, useUIStore } from '@/store'
import { getScanDetails, getSliceNumbers } from '@/api'
import { initCornerstone } from '@/utils/cornerstoneSetup'

export const useDicomViewer = () => {
  const { token } = useAuthStore()
  const {
    currentScanId,
    setCurrentScanDetails,
    setSliceNumbers: setScanSliceNumbers,
  } = useScanStore()
  const { setCurrentStep } = useUIStore()

  const [scanDetails, setScanDetails] = useState(null)
  const [sliceNumbers, setSliceNumbers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initCornerstone()
  }, [])

  const loadScanData = useCallback(async () => {
    if (!currentScanId || !token) {
      setError('No scan selected')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const detailsResult = await getScanDetails(currentScanId, token)
      if (!detailsResult.success) {
        throw new Error(detailsResult.error)
      }

      setScanDetails(detailsResult.data)
      setCurrentScanDetails(detailsResult.data)

      const slicesResult = await getSliceNumbers(currentScanId, token)
      if (!slicesResult.success) {
        throw new Error(slicesResult.error)
      }

      const uniqueSlices = [...new Set(slicesResult.data)].sort((a, b) => a - b)
      setSliceNumbers(uniqueSlices)
      setScanSliceNumbers(slicesResult.data)

      setIsLoading(false)
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }, [currentScanId, token, setCurrentScanDetails, setScanSliceNumbers])

  useEffect(() => {
    loadScanData()
  }, [loadScanData])

  const reloadScanData = useCallback(() => {
    loadScanData()
  }, [loadScanData])

  const changeStudy = useCallback(() => {
    setCurrentStep('landing')
  }, [setCurrentStep])

  return {
    scanDetails,
    sliceNumbers,
    isLoading,
    error,
    currentScanId,
    token,
    reloadScanData,
    changeStudy,
  }
}
