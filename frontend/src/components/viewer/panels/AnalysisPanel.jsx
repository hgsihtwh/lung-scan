import { useState, useEffect, useRef } from 'react'
import { analyzeScans, getAnalysisStatus, getScanDetails } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

const POLL_INTERVAL = 2000
const POLL_TIMEOUT = 120000

const AnalysisPanel = ({ readOnly = false }) => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails, setCurrentScanDetails } = useScanStore()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const pollRef = useRef(null)
  const pollStartRef = useRef(null)

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startPolling = (scanId) => {
    pollStartRef.current = Date.now()
    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT) {
        stopPolling()
        setIsAnalyzing(false)
        setAnalysisError('Analysis timed out. Please try again.')
        return
      }

      const statusResult = await getAnalysisStatus(scanId, token)
      if (!statusResult.success) return

      const { status } = statusResult.data
      if (status === 'completed') {
        stopPolling()
        const detailsResult = await getScanDetails(scanId, token)
        if (detailsResult.success) setCurrentScanDetails(detailsResult.data)
        setIsAnalyzing(false)
      } else if (status === 'failed') {
        stopPolling()
        setIsAnalyzing(false)
        setAnalysisError('Analysis failed. Please try again.')
      }
    }, POLL_INTERVAL)
  }

  const handleStartAnalysis = async () => {
    if (!currentScanId || !token) return

    stopPolling()
    setIsAnalyzing(true)
    setAnalysisError('')

    const result = await analyzeScans(currentScanId, token)
    if (!result.success) {
      setAnalysisError(result.error)
      setIsAnalyzing(false)
      return
    }

    startPolling(currentScanId)
  }

  const hasVerdict = !!currentScanDetails?.verdict
  const isNormal = currentScanDetails?.verdict === 'Normal'

  return (
    <div className="card bg-primary-beige rounded-xl sm:rounded-2xl p-5 lg:p-6">
      <h3 className="font-outfit font-medium text-lg lg:text-xl text-primary-dark mb-4">
        ANALYSIS
      </h3>

      {hasVerdict && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span
              className="font-outfit font-semibold text-lg"
              style={{ color: isNormal ? '#003DD6' : 'var(--color-text)' }}
            >
              {isNormal ? 'Normal' : 'Pathology'}
            </span>
            <span
              className="font-outfit font-medium text-base"
              style={{ color: isNormal ? '#003DD6' : 'var(--color-text)' }}
            >
              {(currentScanDetails.probability * 100).toFixed(2)}%
            </span>
          </div>
          <p className="font-outfit text-sm text-primary-dark opacity-60 mt-1">
            {isNormal ? 'No signs of pathology detected' : 'Potential pathology detected'}
          </p>
        </div>
      )}

      {analysisError && (
        <div className="mb-4">
          <p className="font-outfit text-sm text-primary-dark opacity-60">{analysisError}</p>
        </div>
      )}

      {!readOnly && (
        <button
          onClick={handleStartAnalysis}
          disabled={isAnalyzing || hasVerdict}
          className="w-full h-10 sm:h-11 md:h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-[15px] rounded-full hover:bg-primary-navyDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : hasVerdict ? 'Analysis Complete' : 'Start Analysis'}
        </button>
      )}
    </div>
  )
}

export default AnalysisPanel
