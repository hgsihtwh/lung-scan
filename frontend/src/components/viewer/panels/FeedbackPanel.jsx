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

    try {
      const result = await saveFeedback(currentScanId, isAccurate, token)

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
    <div className="bg-primary-beige border border-primary-dark rounded-xl sm:rounded-2xl p-5 lg:p-6">
      <h3 className="font-outfit font-medium text-lg lg:text-xl text-primary-dark mb-4">
        FEEDBACK
      </h3>

      {hasVerdict ? (
        <div className="space-y-3">
          <p className="font-outfit text-sm text-primary-dark opacity-60 mb-3">
            Was this analysis accurate?
          </p>

          {error && (
            <p className="font-outfit text-sm opacity-60 mb-2" style={{ color: 'var(--color-text)' }}>
              {error}
            </p>
          )}

          <div className="space-y-2">
            {[
              { value: 'accurate', label: 'Accurate', isAccurate: true },
              { value: 'inaccurate', label: 'Inaccurate', isAccurate: false },
            ].map(({ value, label, isAccurate }) => {
              const isSelected = feedback === value
              return (
                <button
                  key={value}
                  onClick={() => handleFeedback(isAccurate)}
                  disabled={isSaving}
                  className="w-full h-10 px-4 rounded-full font-outfit text-sm flex items-center gap-3 text-primary-dark hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-200"
                    style={
                      isSelected
                        ? { backgroundColor: '#003DD6', boxShadow: '0 0 8px rgba(0,61,214,0.9), 0 0 3px rgba(0,61,214,0.6)' }
                        : { border: '1.5px solid var(--color-text-muted)' }
                    }
                  />
                  {label}
                </button>
              )
            })}
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
