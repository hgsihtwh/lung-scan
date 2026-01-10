import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { uploadDicom } from '@/api'
import { useAuthStore, useScanStore, useUIStore } from '@/store'

const FileUploadZone = () => {
  const { token } = useAuthStore()
  const { setCurrentScanId } = useScanStore()
  const { setCurrentStep } = useUIStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        console.log('Uploading file:', file.name)

        setError('')
        setLoading(true)
        setUploadProgress('Uploading archive...')

        try {
          const result = await uploadDicom(file, token)

          if (!result.success) {
            setError(result.error)
            setLoading(false)
            setUploadProgress('')
            return
          }

          console.log('Upload successful:', result.data)

          // Проверяем статус
          if (result.data.status === 'exists') {
            // Исследование уже существует
            setUploadProgress(result.data.message)
            setCurrentScanId(result.data.scan_id)

            // Через 2 секунды переходим к viewer
            setTimeout(() => {
              setLoading(false)
              setUploadProgress('')
              setCurrentStep('viewer')
            }, 2000)
          } else {
            // Новое исследование
            setCurrentScanId(result.data.scan_id)
            setUploadProgress('Processing complete!')

            setTimeout(() => {
              setLoading(false)
              setUploadProgress('')
              setCurrentStep('viewer')
            }, 500)
          }
        } catch (err) {
          setError('Upload failed. Please try again.')
          setLoading(false)
          setUploadProgress('')
        }
      }
    },
    [token, setCurrentScanId, setCurrentStep]
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
    <section
      id="upload"
      className="relative min-h-[calc(100vh-500px)] flex items-center justify-center scroll-mt-24"
    >
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] py-12 sm:py-16 md:py-20">
        <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-12 sm:mb-16 md:mb-20">
          UPLOAD STUDY
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-outfit text-sm text-red-600">{error}</p>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed border-primary-dark rounded-2xl
            min-h-[400px] sm:min-h-[500px] md:min-h-[600px]
            flex flex-col items-center justify-center
            transition-all duration-300
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${
              isDragActive
                ? 'bg-primary-dark bg-opacity-5 border-primary-navy'
                : 'hover:bg-primary-dark hover:bg-opacity-5'
            }
          `}
        >
          <input {...getInputProps()} />

          {loading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-navy mb-6"></div>
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
    </section>
  )
}

export default FileUploadZone
