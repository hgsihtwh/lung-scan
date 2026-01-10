import { useState, useEffect, useCallback, useRef } from 'react'
import { saveComment } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

export const useComments = (debounceMs = 1000) => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails } = useScanStore()

  const [comments, setComments] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [error, setError] = useState(null)

  const debounceRef = useRef(null)

  useEffect(() => {
    if (currentScanDetails?.user_comment) {
      setComments(currentScanDetails.user_comment)
    }
  }, [currentScanDetails])

  useEffect(() => {
    if (!comments.trim() || !currentScanId || !token) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      setIsSaving(true)
      setSaveStatus('')
      setError(null)

      try {
        const result = await saveComment(currentScanId, comments, token)

        if (result.success) {
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus(''), 2000)
        } else {
          setSaveStatus('error')
          setError(result.error)
        }
      } catch (err) {
        setSaveStatus('error')
        setError('Failed to save comment')
      }

      setIsSaving(false)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [comments, currentScanId, token, debounceMs])

  const save = useCallback(async () => {
    if (!comments.trim() || !currentScanId || !token) {
      return { success: false }
    }

    setIsSaving(true)
    setSaveStatus('')
    setError(null)

    try {
      const result = await saveComment(currentScanId, comments, token)

      if (result.success) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus(''), 2000)
        setIsSaving(false)
        return { success: true }
      } else {
        setSaveStatus('error')
        setError(result.error)
        setIsSaving(false)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setSaveStatus('error')
      setError('Failed to save comment')
      setIsSaving(false)
      return { success: false, error: 'Failed to save comment' }
    }
  }, [comments, currentScanId, token])

  const clearError = useCallback(() => {
    setError(null)
    setSaveStatus('')
  }, [])

  return {
    comments,
    setComments,
    isSaving,
    saveStatus,
    error,
    save,
    clearError,
  }
}
