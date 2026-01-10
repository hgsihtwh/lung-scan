import { useState } from 'react'
import { Download } from 'lucide-react'
import { downloadScanReport } from '@/api'
import { useAuthStore, useScanStore } from '@/store'

const ExportPanel = ({ comments = '' }) => {
  const { token } = useAuthStore()
  const { currentScanId, currentScanDetails } = useScanStore()

  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    setError('')
    setIsDownloading(true)

    console.log('=== DOWNLOADING REPORT ===')
    console.log('Scan ID:', currentScanId)
    console.log('Comment:', comments)

    try {
      const result = await downloadScanReport(currentScanId, comments, token)

      console.log('Download result:', result)

      if (!result.success) {
        setError(result.error || 'Failed to download report')
        console.error('Download failed:', result.error)
      } else {
        console.log('Download successful!')
      }
    } catch (err) {
      setError('Failed to download report. Please try again.')
    }

    setIsDownloading(false)
  }

  const hasVerdict = !!currentScanDetails?.verdict

  return (
    <div className="border border-primary-dark rounded-xl sm:rounded-2xl p-5 lg:p-6">
      <h3 className="font-outfit font-medium text-lg lg:text-xl text-primary-dark mb-4">
        EXPORT REPORT
      </h3>

      {error && (
        <div className="mb-3 p-3 bg-red-50 rounded-lg">
          <p className="font-outfit text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={!hasVerdict || isDownloading}
        className={`w-full h-10 sm:h-11 md:h-12 font-outfit font-normal text-[15px] rounded-full flex items-center justify-center gap-2 transition-colors ${
          hasVerdict
            ? 'bg-primary-navy text-primary-beige hover:bg-primary-navyDark cursor-pointer'
            : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
        }`}
      >
        <Download size={18} />
        {isDownloading ? 'Downloading...' : 'Download Report'}
      </button>

      {!hasVerdict && (
        <p className="font-outfit font-normal text-[10px] text-primary-dark opacity-50 text-center mt-2 lg:mt-3">
          Complete analysis first
        </p>
      )}
    </div>
  )
}

export default ExportPanel
