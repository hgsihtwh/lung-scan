import { useState, useCallback } from 'react'
import { uploadDicom } from '@/api'
import { useAuthStore, useScanStore, useUIStore } from '@/store'

export const useFileUpload = () => {
  const { token } = useAuthStore()
  const { setCurrentScanId } = useScanStore()
  const { setCurrentStep } = useUIStore()

  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState(null)

  const upload = useCallback(
    async (file) => {
      if (!file || !token) {
        setError('No file selected or not authenticated')
        return { success: false }
      }

      setError(null)
      setIsUploading(true)
      setProgress('Uploading archive...')

      try {
        const result = await uploadDicom(file, token)

        if (!result.success) {
          setError(result.error)
          setIsUploading(false)
          setProgress('')
          return { success: false, error: result.error }
        }

        console.log('Upload successful:', result.data)

        if (result.data.status === 'exists') {
          setProgress(result.data.message)
          setCurrentScanId(result.data.scan_id)

          setTimeout(() => {
            setIsUploading(false)
            setProgress('')
            setCurrentStep('viewer')
          }, 2000)

          return { success: true, exists: true, data: result.data }
        } else {
          setCurrentScanId(result.data.scan_id)
          setProgress('Processing complete!')

          setTimeout(() => {
            setIsUploading(false)
            setProgress('')
            setCurrentStep('viewer')
          }, 500)

          return { success: true, exists: false, data: result.data }
        }
      } catch (err) {
        const errorMessage = 'Upload failed. Please try again.'
        setError(errorMessage)
        setIsUploading(false)
        setProgress('')
        return { success: false, error: errorMessage }
      }
    },
    [token, setCurrentScanId, setCurrentStep]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress('')
    setError(null)
  }, [])

  return {
    isUploading,
    progress,
    error,
    upload,
    clearError,
    reset,
  }
}
