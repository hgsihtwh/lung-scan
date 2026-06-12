import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import StudyPreview from './StudyPreview'
import { formatDate } from '@/utils/helpers'

const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h3 className="font-outfit font-semibold text-xl text-primary-dark mb-3">Delete scan?</h3>
      <p className="font-outfit text-sm text-primary-dark opacity-70 mb-8">
        The scan and all its data will be permanently deleted. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 h-11 rounded-full font-outfit text-sm text-primary-dark hover:opacity-70 transition-opacity"
          style={{ border: '1px solid var(--color-border)' }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-11 rounded-full bg-red-600 text-white font-outfit text-sm hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)

const StudyCard = ({ scan, token, onClick, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const getStatusColor = () => {
    if (!scan.verdict) return 'var(--color-text-muted)'
    if (scan.verdict === 'Normal') return '#003DD6'
    return 'var(--color-text)'
  }

  const getStatusText = () => {
    if (!scan.verdict) return 'Not analyzed'
    return scan.verdict
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    setConfirmOpen(false)
    onDelete(scan.id)
  }

  return (
    <>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`rounded-2xl overflow-hidden transition-all text-left ${
          isHovered ? 'border border-primary-navy shadow-lg' : 'border border-transparent'
        }`}
        style={{ backgroundColor: 'var(--color-bg)' }}
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
            <p className="font-outfit text-xs text-primary-dark opacity-60">
              {formatDate(scan.created_at)}
            </p>

            {onDelete ? (
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded-full text-primary-dark opacity-30 hover:opacity-80 hover:text-red-600 transition-all"
                title="Delete scan"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              scan.verdict && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary-dark opacity-40">
                  <path
                    d="M12 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6L12 2Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path d="M12 2V6H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            )}
          </div>
        </div>
      </button>

      {confirmOpen && (
        <DeleteConfirmModal
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  )
}

export default StudyCard
