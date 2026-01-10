import { useState } from 'react'
import ThumbnailSlice from './ThumbnailSlice'

const ThumbnailGrid = ({
  sliceNumbers,
  currentSlice,
  onSliceChange,
  scanId,
  token,
  thumbnailsCount = 8,
}) => {
  const [thumbnailOffset, setThumbnailOffset] = useState(0)

  const maxOffset = Math.max(0, sliceNumbers.length - thumbnailsCount)

  const visibleThumbnails = Array.from({ length: thumbnailsCount }, (_, i) => {
    const index = thumbnailOffset + i
    return index < sliceNumbers.length ? sliceNumbers[index] : null
  }).filter(Boolean)

  const handleThumbnailScroll = (e) => {
    const value = parseInt(e.target.value)
    setThumbnailOffset(value)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        {thumbnailOffset > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-12 lg:w-16 bg-gradient-to-r from-primary-beige to-transparent z-10 pointer-events-none" />
        )}

        {thumbnailOffset < maxOffset && (
          <div className="absolute right-0 top-0 bottom-0 w-12 lg:w-16 bg-gradient-to-l from-primary-beige to-transparent z-10 pointer-events-none" />
        )}

        <div className="flex gap-2 lg:gap-3">
          {visibleThumbnails.map((sliceNum) => (
            <ThumbnailSlice
              key={`thumb-${sliceNum}`}
              sliceNumber={sliceNum}
              scanId={scanId}
              token={token}
              isActive={currentSlice === sliceNum}
              onClick={() => onSliceChange(sliceNum)}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max={maxOffset}
          value={thumbnailOffset}
          onChange={handleThumbnailScroll}
          className="w-full thumbnail-scroll-slider"
        />
      </div>

      <style>{`
        .thumbnail-scroll-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: #D2D1C8;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        
        .thumbnail-scroll-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 60px;
          height: 4px;
          background: #797872;
          cursor: pointer;
          border-radius: 2px;
        }
        
        .thumbnail-scroll-slider::-moz-range-thumb {
          width: 60px;
          height: 4px;
          background: #797872;
          cursor: pointer;
          border-radius: 2px;
          border: none;
        }
      `}</style>
    </div>
  )
}

export default ThumbnailGrid
