import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

const UploadStatus = ({ status, progress, error }) => {

  if (status === 'uploading') {
    return (
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-navy mb-6"></div>
        <p className="font-outfit font-normal text-lg text-primary-dark">
          {progress || 'Uploading...'}
        </p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center">
        <CheckCircle size={64} className="text-green-600 mb-6" />
        <p className="font-outfit font-normal text-lg text-primary-dark">Upload successful!</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center">
        <AlertCircle size={64} className="text-red-600 mb-6" />
        <p className="font-outfit font-normal text-lg text-red-600">{error || 'Upload failed'}</p>
      </div>
    )
  }

  return (
    <>
      <Upload size={64} className="text-primary-navy mb-6 sm:mb-8" strokeWidth={1.5} />
      <p className="font-outfit font-normal text-lg sm:text-xl md:text-[20px] text-primary-dark text-center px-4">
        Drag DICOM archive here or click to browse
      </p>
      <p className="font-outfit font-light text-sm sm:text-base text-primary-dark opacity-60 mt-4 text-center px-4">
        Supported format: .zip
      </p>
    </>
  )
}

export default UploadStatus
