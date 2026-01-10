import { useState, useEffect } from 'react'
import { saveComment } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

const CommentsPanel = () => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails } = useScanStore()

  const [comments, setComments] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('') 

  useEffect(() => {
    if (currentScanDetails?.user_comment) {
      setComments(currentScanDetails.user_comment)
    }
  }, [currentScanDetails])

  useEffect(() => {
    if (!comments.trim() || !currentScanId || !token) return

    const timeoutId = setTimeout(async () => {
      setIsSaving(true)
      setSaveStatus('')

      try {
        const result = await saveComment(currentScanId, comments, token)

        if (result.success) {
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus(''), 2000)
        } else {
          setSaveStatus('error')
        }
      } catch (err) {
        setSaveStatus('error')
      }

      setIsSaving(false)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [comments, currentScanId, token])

  return (
    <div className="border border-primary-dark rounded-xl sm:rounded-2xl p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-outfit font-medium text-lg lg:text-xl text-primary-dark">COMMENTS</h3>

        {isSaving && (
          <span className="font-outfit text-xs text-primary-dark opacity-50">Saving...</span>
        )}
        {saveStatus === 'saved' && (
          <span className="font-outfit text-xs text-green-600">Saved ✓</span>
        )}
        {saveStatus === 'error' && (
          <span className="font-outfit text-xs text-red-600">Save failed</span>
        )}
      </div>

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Add your comments here..."
        className="w-full h-32 p-3 lg:p-4 rounded-xl font-outfit text-sm lg:text-base resize-none focus:outline-none transition-colors"
        style={{
          backgroundColor: '#E1DFD5',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '#BEBCB3',
        }}
      />

      <p className="font-outfit text-xs text-primary-dark opacity-60 mt-2 text-center">
        Comment will be included in the report
      </p>
    </div>
  )
}

export default CommentsPanel
