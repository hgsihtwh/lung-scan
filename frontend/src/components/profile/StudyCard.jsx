import { useState } from 'react'
import StudyPreview from './StudyPreview'
import { formatDate } from '@/utils/helpers'

const StudyCard = ({ scan, token, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = () => {
    if (!scan.verdict) return '#9CA3AF'
    if (scan.verdict === 'Normal') return '#1F7819'
    return '#7E2F2F'
  }

  const getStatusText = () => {
    if (!scan.verdict) return 'Not analyzed'
    return scan.verdict
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`rounded-2xl overflow-hidden transition-all text-left ${
        isHovered ? 'border border-primary-navy shadow-lg' : 'border border-transparent'
      }`}
      style={{ backgroundColor: '#EFEDE3' }}
    >
      <div className="p-5">
        {/* Preview */}
        <div
          className="w-full aspect-square rounded-xl mb-4 overflow-hidden"
          style={{ backgroundColor: '#000' }}
        >
          <StudyPreview scanId={scan.id} token={token} />
        </div>

        {/* Study Info */}
        <div className="mb-12">
          <p className="font-outfit font-medium text-base text-primary-dark mb-1">
            Study ID: {scan.patient_name || 'Unknown'}
          </p>
          <p className="font-outfit text-sm text-primary-dark opacity-60 mb-2">
            {scan.slice_count} slices
          </p>
          <p className="font-outfit font-medium text-sm" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </p>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <div className="w-6">
            {scan.verdict && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-primary-dark opacity-40"
              >
                <path
                  d="M12 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2V6H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <p className="font-outfit text-xs text-primary-dark opacity-60">
            {formatDate(scan.created_at)}
          </p>
        </div>
      </div>
    </button>
  )
}

export default StudyCard
