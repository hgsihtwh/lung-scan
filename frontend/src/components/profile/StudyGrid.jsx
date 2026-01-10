import { useState } from 'react'
import StudyCard from './StudyCard'

const StudyGrid = ({ scans, token, onScanClick }) => {
  const [displayCount, setDisplayCount] = useState(12)

  const visibleScans = scans.slice(0, displayCount)
  const hasMore = displayCount < scans.length

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 12)
  }

  if (scans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-outfit text-primary-dark opacity-60">No studies found</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleScans.map((scan) => (
          <StudyCard key={scan.id} scan={scan} token={token} onClick={() => onScanClick(scan.id)} />
        ))}
      </div>

      {/* Show More */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleShowMore}
            className="font-outfit font-normal text-base text-primary-navy hover:opacity-70 transition-opacity underline"
          >
            Show more ({scans.length - displayCount} remaining)
          </button>
        </div>
      )}
    </>
  )
}

export default StudyGrid
