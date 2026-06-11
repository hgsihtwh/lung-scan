import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { uploadDicom } from '@/api'
import { useAuthStore, useScanStore, useUIStore } from '@/store'

const FileUploadZone = ({ patientId = null }) => {
  const { token } = useAuthStore()
  const { setCurrentScanId } = useScanStore()
  const { setCurrentStep } = useUIStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles?.length) return

      const file = acceptedFiles[0]
      setError('')
      setLoading(true)
      setUploadProgress('Uploading archive...')

      try {
        const result = await uploadDicom(file, token, patientId)

        if (!result.success) {
          setError(result.error)
          setLoading(false)
          setUploadProgress('')
          return
        }

        if (result.data.status === 'exists') {
          setUploadProgress(result.data.message)
          setCurrentScanId(result.data.scan_id)
          setTimeout(() => {
            setLoading(false)
            setUploadProgress('')
            setCurrentStep('viewer')
          }, 2000)
        } else {
          setCurrentScanId(result.data.scan_id)
          setUploadProgress('Processing complete!')
          setTimeout(() => {
            setLoading(false)
            setUploadProgress('')
            setCurrentStep('viewer')
          }, 500)
        }
      } catch {
        setError('Upload failed. Please try again.')
        setLoading(false)
        setUploadProgress('')
      }
    },
    [token, patientId, setCurrentScanId, setCurrentStep]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    multiple: false,
    disabled: loading,
  })

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="font-outfit text-sm text-red-600">{error}</p>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed border-primary-dark rounded-2xl
          min-h-[400px] sm:min-h-[500px]
          flex flex-col items-center justify-center
          transition-all duration-300
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragActive
            ? 'bg-primary-dark bg-opacity-5 border-primary-navy'
            : 'hover:bg-primary-dark hover:bg-opacity-5'
          }
        `}
      >
        <input {...getInputProps()} />

        {loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-navy mb-6" />
            <p className="font-outfit font-normal text-lg sm:text-xl text-primary-dark">
              {uploadProgress}
            </p>
          </>
        ) : (
          <>
            <Upload size={64} className="text-primary-navy mb-6 sm:mb-8" strokeWidth={1.5} />
            <p className="font-outfit font-normal text-lg sm:text-xl md:text-[20px] text-primary-dark text-center px-4">
              {isDragActive
                ? 'Drop the DICOM archive here...'
                : 'Drag DICOM archive here or click to browse'}
            </p>
            <p className="font-outfit font-light text-sm sm:text-base text-primary-dark opacity-60 mt-4 text-center px-4">
              Supported format: .zip
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default FileUploadZone
