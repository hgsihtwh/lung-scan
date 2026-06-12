import { useScanStore } from '@/store'

const StudyInfoPanel = () => {
  const { currentScanDetails, sliceNumbers } = useScanStore()

  const totalSlices = sliceNumbers.length

  return (
    <div className="absolute bottom-4 left-4">
      <div className="space-y-1">
        <p className="font-outfit font-normal text-[13px]" style={{ color: 'var(--color-surface-alt)' }}>
          Scan #{currentScanDetails?.id || 'N/A'}
        </p>
        <p className="font-outfit font-normal text-[13px]" style={{ color: 'var(--color-surface-alt)' }}>
          Slices: {totalSlices}
        </p>
        {currentScanDetails?.created_at && (
          <p className="font-outfit font-normal text-[13px]" style={{ color: 'var(--color-surface-alt)' }}>
            Date:{' '}
            {new Date(currentScanDetails.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default StudyInfoPanel
