import { useState, useEffect, useCallback } from 'react'
import { saveFeedback } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

export const useFeedback = () => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails } = useScanStore()

  const [feedback, setFeedback] = useState(null) 
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (currentScanDetails?.has_feedback && currentScanDetails?.is_accurate !== null) {
      setFeedback(currentScanDetails.is_accurate ? 'accurate' : 'inaccurate')
    }
  }, [currentScanDetails])

  const submitFeedback = useCallback(
    async (isAccurate) => {
      if (!currentScanId || !token) {
        setError('No scan selected')
        return { success: false }
      }

      const feedbackValue = isAccurate ? 'accurate' : 'inaccurate'
      setFeedback(feedbackValue)
      setIsSaving(true)
      setError(null)

      try {
        console.log('Saving feedback:', feedbackValue)

        const result = await saveFeedback(currentScanId, isAccurate, token)

        console.log('Save feedback result:', result)

        if (!result.success) {
          setError(result.error || 'Failed to save feedback')
          setIsSaving(false)
          return { success: false, error: result.error }
        }

        setIsSaving(false)
        return { success: true }
      } catch (err) {
        const errorMessage = 'Failed to save feedback'
        setError(errorMessage)
        setIsSaving(false)
        return { success: false, error: errorMessage }
      }
    },
    [currentScanId, token]
  )

  const markAccurate = useCallback(() => submitFeedback(true), [submitFeedback])
  const markInaccurate = useCallback(() => submitFeedback(false), [submitFeedback])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const hasVerdict = !!currentScanDetails?.verdict
  const isAccurate = feedback === 'accurate'
  const isInaccurate = feedback === 'inaccurate'
  const hasFeedback = feedback !== null

  return {
    feedback,
    isSaving,
    error,
    hasVerdict,
    isAccurate,
    isInaccurate,
    hasFeedback,
    submitFeedback,
    markAccurate,
    markInaccurate,
    clearError,
  }
}
