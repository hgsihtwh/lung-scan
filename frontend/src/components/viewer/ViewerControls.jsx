import { ZoomIn, ZoomOut, Move, RotateCw } from 'lucide-react'

const ViewerControls = ({ onZoomIn, onZoomOut, onPan, onRotate }) => {
  return (
    <div className="absolute top-4 right-4 flex gap-1.5">
      <button
        onClick={onZoomIn}
        className="bg-primary-beige p-2 rounded-md hover:bg-opacity-80 transition-all shadow-sm"
        title="Zoom In"
      >
        <ZoomIn size={18} className="text-primary-navy" />
      </button>

      <button
        onClick={onZoomOut}
        className="bg-primary-beige p-2 rounded-md hover:bg-opacity-80 transition-all shadow-sm"
        title="Zoom Out"
      >
        <ZoomOut size={18} className="text-primary-navy" />
      </button>

      <button
        onClick={onPan}
        className="bg-primary-beige p-2 rounded-md hover:bg-opacity-80 transition-all shadow-sm"
        title="Pan (30s)"
      >
        <Move size={18} className="text-primary-navy" />
      </button>

      <button
        onClick={onRotate}
        className="bg-primary-beige p-2 rounded-md hover:bg-opacity-80 transition-all shadow-sm"
        title="Rotate 90°"
      >
        <RotateCw size={18} className="text-primary-navy" />
      </button>
    </div>
  )
}

export default ViewerControls
