import { ZoomIn, ZoomOut, Move, RotateCw, SunMedium, Square } from 'lucide-react'

const ToolButton = ({ onClick, title, icon: Icon, active = false }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-md transition-all shadow-sm"
    style={{
      backgroundColor: active ? '#233970' : '#F5F3EA',
      color: active ? '#F5F3EA' : '#1E3A5F',
    }}
    title={title}
  >
    <Icon size={18} />
  </button>
)

const ViewerControls = ({
  onZoomIn,
  onZoomOut,
  onPan,
  onRotate,
  onWindowLevel,
  isAnnotationMode,
  onToggleAnnotation,
  isDoctor,
}) => {
  return (
    <div className="absolute top-4 right-4 flex gap-1.5">
      <ToolButton onClick={onZoomIn} title="Zoom In" icon={ZoomIn} />
      <ToolButton onClick={onZoomOut} title="Zoom Out" icon={ZoomOut} />
      <ToolButton onClick={onPan} title="Pan (30s)" icon={Move} />
      <ToolButton onClick={onRotate} title="Rotate 90°" icon={RotateCw} />
      <ToolButton
        onClick={onWindowLevel}
        title="Window / Level (30s) — drag horizontally for contrast, vertically for brightness"
        icon={SunMedium}
      />
      {isDoctor && (
        <ToolButton
          onClick={onToggleAnnotation}
          title={isAnnotationMode ? 'Exit annotation mode' : 'Draw annotation'}
          icon={Square}
          active={isAnnotationMode}
        />
      )}
    </div>
  )
}

export default ViewerControls
