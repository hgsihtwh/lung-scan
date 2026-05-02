import { useState, useCallback, useRef } from 'react'
import { analyzeScans, getAnalysisStatus, getScanDetails } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

const POLL_INTERVAL_MS = 3000

export const useAnalysis = () => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails, setCurrentScanDetails } = useScanStore()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const pollTimer = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current)
      pollTimer.current = null
    }
  }, [])

  const pollStatus = useCallback(async (scanId) => {
    const result = await getAnalysisStatus(scanId, token)

    if (!result.success) {
      stopPolling()
      setError(result.error)
      setIsAnalyzing(false)
      return
    }

    const { status } = result.data

    if (status === 'completed') {
      stopPolling()
      const detailsResult = await getScanDetails(scanId, token)
      if (detailsResult.success) {
        setCurrentScanDetails(detailsResult.data)
      }
      setIsAnalyzing(false)
      return
    }

    if (status === 'failed') {
      stopPolling()
      setError('Analysis failed. Please try again.')
      setIsAnalyzing(false)
      return
    }

    pollTimer.current = setTimeout(() => pollStatus(scanId), POLL_INTERVAL_MS)
  }, [token, stopPolling, setCurrentScanDetails])

  const startAnalysis = useCallback(async () => {
    if (!currentScanId || !token) {
      setError('No scan selected')
      return { success: false }
    }

    setIsAnalyzing(true)
    setError(null)
    stopPolling()

    const result = await analyzeScans(currentScanId, token)

    if (!result.success) {
      setError(result.error)
      setIsAnalyzing(false)
      return { success: false, error: result.error }
    }

    pollTimer.current = setTimeout(() => pollStatus(currentScanId), POLL_INTERVAL_MS)
    return { success: true }
  }, [currentScanId, token, stopPolling, pollStatus])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const hasVerdict = !!currentScanDetails?.verdict
  const verdict = currentScanDetails?.verdict
  const probability = currentScanDetails?.probability
  const isNormal = verdict === 'Normal'

  return {
    isAnalyzing,
    error,
    hasVerdict,
    verdict,
    probability,
    isNormal,
    startAnalysis,
    clearError,
  }
}
