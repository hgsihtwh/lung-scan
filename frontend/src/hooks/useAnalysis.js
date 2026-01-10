import { useState, useCallback } from 'react'
import { analyzeScans, getScanDetails } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

export const useAnalysis = () => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails, setCurrentScanDetails } = useScanStore()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const startAnalysis = useCallback(async () => {
    if (!currentScanId || !token) {
      setError('No scan selected')
      return { success: false }
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('Starting analysis for scan:', currentScanId)

      const result = await analyzeScans(currentScanId, token)

      console.log('Analysis result:', result)

      if (!result.success) {
        setError(result.error)
        setIsAnalyzing(false)
        return { success: false, error: result.error }
      }

      const detailsResult = await getScanDetails(currentScanId, token)
      if (detailsResult.success) {
        setCurrentScanDetails(detailsResult.data)
      }

      setIsAnalyzing(false)
      return { success: true, data: result.data }
    } catch (err) {
      console.error('Analysis error:', err)
      const errorMessage = 'Analysis failed. Please try again.'
      setError(errorMessage)
      setIsAnalyzing(false)
      return { success: false, error: errorMessage }
    }
  }, [currentScanId, token, setCurrentScanDetails])

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
