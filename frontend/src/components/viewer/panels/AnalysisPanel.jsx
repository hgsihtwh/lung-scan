import { useState } from 'react'
import { analyzeScans, getScanDetails } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

const AnalysisPanel = () => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails, setCurrentScanDetails } = useScanStore()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  const handleStartAnalysis = async () => {
    if (!currentScanId || !token) return

    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      console.log('Starting analysis for scan:', currentScanId)

      const result = await analyzeScans(currentScanId, token)

      console.log('Analysis result:', result)

      if (!result.success) {
        setAnalysisError(result.error)
        setIsAnalyzing(false)
        return
      }

      const detailsResult = await getScanDetails(currentScanId, token)
      if (detailsResult.success) {
        setCurrentScanDetails(detailsResult.data)
      }

      setIsAnalyzing(false)
    } catch (err) {
      console.error('Analysis error:', err)
      setAnalysisError('Analysis failed. Please try again.')
      setIsAnalyzing(false)
    }
  }

  const hasVerdict = !!currentScanDetails?.verdict
  const isNormal = currentScanDetails?.verdict === 'Normal'

  return (
    <div className="border border-primary-dark rounded-xl sm:rounded-2xl p-5 lg:p-6">
      <h3 className="font-outfit font-medium text-lg lg:text-xl text-primary-dark mb-4">
        ANALYSIS
      </h3>

      {hasVerdict && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span
              className="font-outfit font-semibold text-lg"
              style={{ color: isNormal ? '#1F7819' : '#7E2F2F' }}
            >
              {isNormal ? 'Normal' : 'Pathology'}
            </span>
            <span
              className="font-outfit font-medium text-base"
              style={{ color: isNormal ? '#1F7819' : '#7E2F2F' }}
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
          <p className="font-outfit text-sm text-red-600">{analysisError}</p>
        </div>
      )}

      <button
        onClick={handleStartAnalysis}
        disabled={isAnalyzing || hasVerdict}
        className="w-full h-10 sm:h-11 md:h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-[15px] rounded-full hover:bg-primary-navyDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? 'Analyzing...' : hasVerdict ? 'Analysis Complete' : 'Start Analysis'}
      </button>
    </div>
  )
}

export default AnalysisPanel
