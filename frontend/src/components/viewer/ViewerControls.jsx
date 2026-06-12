import { ZoomIn, ZoomOut, Move, RotateCw, SunMedium, Square } from 'lucide-react'

const ToolButton = ({ onClick, title, icon: Icon, active = false }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-md transition-all shadow-sm"
    style={{
      backgroundColor: active ? 'var(--color-navy-accent)' : 'var(--color-surface-alt)',
      color: active ? 'var(--color-surface-alt)' : 'var(--color-navy)',
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
  activeTool,
  onToggleAnnotation,
  isDoctor,
}) => {
  return (
    <div className="absolute top-4 right-4 flex gap-1.5">
      <ToolButton onClick={onZoomIn} title="Zoom In" icon={ZoomIn} />
      <ToolButton onClick={onZoomOut} title="Zoom Out" icon={ZoomOut} />
      <ToolButton onClick={onPan} title="Pan — нажмите снова для выключения" icon={Move} active={activeTool === 'pan'} />
      <ToolButton onClick={onRotate} title="Rotate 90°" icon={RotateCw} />
      <ToolButton
        onClick={onWindowLevel}
        title="Window / Level — нажмите снова для выключения"
        icon={SunMedium}
        active={activeTool === 'windowLevel'}
      />
      {isDoctor && (
        <ToolButton
          onClick={onToggleAnnotation}
          title={activeTool === 'annotation' ? 'Exit annotation mode' : 'Draw annotation'}
          icon={Square}
          active={activeTool === 'annotation'}
        />
      )}
    </div>
  )
}

export default ViewerControls
