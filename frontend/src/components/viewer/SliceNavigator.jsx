import { ArrowLeft } from 'lucide-react'

const SliceNavigator = ({ sliceNumbers, currentSlice, onSliceChange }) => {
  const totalSlices = sliceNumbers.length
  const currentSliceIndex = sliceNumbers.indexOf(currentSlice)

  const handlePrevious = () => {
    if (currentSliceIndex > 0) {
      onSliceChange(sliceNumbers[currentSliceIndex - 1])
    }
  }

  const handleNext = () => {
    if (currentSliceIndex < totalSlices - 1) {
      onSliceChange(sliceNumbers[currentSliceIndex + 1])
    }
  }

  const handleSliderChange = (e) => {
    const index = parseInt(e.target.value)
    onSliceChange(sliceNumbers[index])
  }

  return (
    <div className="flex items-center gap-3 lg:gap-4">
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={currentSliceIndex === 0}
        className="p-2 hover:bg-primary-dark hover:bg-opacity-10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ArrowLeft size={24} className="text-primary-navy" strokeWidth={1.5} />
      </button>

      {/* Slider */}
      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max={totalSlices - 1}
          value={currentSliceIndex}
          onChange={handleSliderChange}
          className="w-full h-1 appearance-none cursor-pointer rounded-lg"
          style={{
            background: `linear-gradient(to right, 
              #1E3A5F 0%, 
              #1E3A5F ${(currentSliceIndex / (totalSlices - 1)) * 100}%, 
              #D2D1C8 ${(currentSliceIndex / (totalSlices - 1)) * 100}%, 
              #D2D1C8 100%)`,
          }}
        />
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentSliceIndex === totalSlices - 1}
        className="p-2 hover:bg-primary-dark hover:bg-opacity-10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ArrowLeft size={24} className="text-primary-navy rotate-180" strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default SliceNavigator
