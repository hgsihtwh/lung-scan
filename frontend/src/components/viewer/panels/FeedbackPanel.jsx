import { useState, useEffect } from 'react'
import { saveFeedback } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

const FeedbackPanel = () => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails } = useScanStore()

  const [feedback, setFeedback] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentScanDetails?.has_feedback && currentScanDetails?.is_accurate !== null) {
      setFeedback(currentScanDetails.is_accurate ? 'accurate' : 'inaccurate')
    }
  }, [currentScanDetails])

  const handleFeedback = async (isAccurate) => {
    const feedbackValue = isAccurate ? 'accurate' : 'inaccurate'
    setFeedback(feedbackValue)
    setIsSaving(true)
    setError('')

    console.log('Saving feedback:', feedbackValue)

    try {
      const result = await saveFeedback(currentScanId, isAccurate, token)

      console.log('Save feedback result:', result)

      if (!result.success) {
        setError(result.error || 'Failed to save feedback')
      }
    } catch (err) {
      setError('Failed to save feedback')
    }

    setIsSaving(false)
  }

  const hasVerdict = !!currentScanDetails?.verdict

  return (
    <div className="border border-primary-dark rounded-xl sm:rounded-2xl p-5 lg:p-6">
      <h3 className="font-outfit font-medium text-lg lg:text-xl text-primary-dark mb-4">
        FEEDBACK
      </h3>

      {hasVerdict ? (
        <div className="space-y-3">
          <p className="font-outfit text-sm text-primary-dark opacity-60 mb-3">
            Was this analysis accurate?
          </p>

          {error && <p className="font-outfit text-sm text-red-600 mb-2">{error}</p>}

          <div className="space-y-2">
            {/* Accurate button */}
            <button
              onClick={() => handleFeedback(true)}
              disabled={isSaving}
              className={`w-full h-10 px-4 rounded-full font-outfit text-sm transition-all flex items-center gap-2 ${
                feedback === 'accurate' ? 'text-white' : 'text-primary-dark hover:opacity-80'
              } disabled:opacity-50`}
              style={{
                backgroundColor: feedback === 'accurate' ? '#1F7819' : '#E1DFD5',
              }}
            >
              <span className="text-lg">{feedback === 'accurate' ? '●' : '○'}</span>
              Accurate
            </button>

            {/* Inaccurate button */}
            <button
              onClick={() => handleFeedback(false)}
              disabled={isSaving}
              className={`w-full h-10 px-4 rounded-full font-outfit text-sm transition-all flex items-center gap-2 ${
                feedback === 'inaccurate' ? 'text-white' : 'text-primary-dark hover:opacity-80'
              } disabled:opacity-50`}
              style={{
                backgroundColor: feedback === 'inaccurate' ? '#7E2F2F' : '#E1DFD5',
              }}
            >
              <span className="text-lg">{feedback === 'inaccurate' ? '●' : '○'}</span>
              Inaccurate
            </button>
          </div>
        </div>
      ) : (
        <p className="font-outfit text-sm text-primary-dark opacity-50 text-center py-4">
          Complete analysis to provide feedback
        </p>
      )}
    </div>
  )
}

export default FeedbackPanel
