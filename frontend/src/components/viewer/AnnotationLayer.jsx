import { useRef, useState, useEffect } from 'react'
import { cornerstone } from '@/utils/cornerstone'

const AnnotationLayer = ({
  annotations,
  viewerRef,
  isAnnotationMode,
  isDoctor,
  onCreate,
  onDelete,
  onUpdate,
}) => {
  const svgRef = useRef(null)
  const [drawing, setDrawing] = useState(null)
  const [canvasRects, setCanvasRects] = useState([])
  const [selected, setSelected] = useState(null)
  const [labelInput, setLabelInput] = useState('')

  const computeRects = () => {
    if (!viewerRef.current) return
    try {
      const rects = annotations.map((ann) => {
        const tl = cornerstone.pixelToCanvas(viewerRef.current, { x: ann.x1, y: ann.y1 })
        const br = cornerstone.pixelToCanvas(viewerRef.current, { x: ann.x2, y: ann.y2 })
        return {
          ...ann,
          cx: Math.min(tl.x, br.x),
          cy: Math.min(tl.y, br.y),
          cw: Math.abs(br.x - tl.x),
          ch: Math.abs(br.y - tl.y),
        }
      })
      setCanvasRects(rects)
    } catch {}
  }

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    el.addEventListener('cornerstoneimagerendered', computeRects)
    computeRects()
    return () => el.removeEventListener('cornerstoneimagerendered', computeRects)
  }, [annotations, viewerRef.current])

  // Close selected panel when changing slices (annotations prop changes)
  useEffect(() => {
    setSelected(null)
    setDrawing(null)
  }, [annotations])

  const getSVGPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e) => {
    if (!isAnnotationMode || !isDoctor) return
    e.preventDefault()
    setSelected(null)
    const pt = getSVGPoint(e)
    setDrawing({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y })
  }

  const handleMouseMove = (e) => {
    if (!drawing) return
    const pt = getSVGPoint(e)
    setDrawing((d) => ({ ...d, x2: pt.x, y2: pt.y }))
  }

  const handleMouseUp = () => {
    if (!drawing) return
    const w = Math.abs(drawing.x2 - drawing.x1)
    const h = Math.abs(drawing.y2 - drawing.y1)
    if (w > 10 && h > 10) {
      try {
        const p1 = cornerstone.canvasToPixel(viewerRef.current, { x: drawing.x1, y: drawing.y1 })
        const p2 = cornerstone.canvasToPixel(viewerRef.current, { x: drawing.x2, y: drawing.y2 })
        onCreate({
          x1: Math.min(p1.x, p2.x),
          y1: Math.min(p1.y, p2.y),
          x2: Math.max(p1.x, p2.x),
          y2: Math.max(p1.y, p2.y),
        })
      } catch {}
    }
    setDrawing(null)
  }

  const handleAnnotationClick = (e, ann) => {
    e.stopPropagation()
    if (selected?.id === ann.id) {
      setSelected(null)
    } else {
      setSelected(ann)
      setLabelInput(ann.label || '')
    }
  }

  const handleSaveLabel = () => {
    if (!selected) return
    onUpdate(selected.id, labelInput)
    setSelected((s) => ({ ...s, label: labelInput }))
    setSelected(null)
  }

  const handleDelete = () => {
    if (!selected) return
    onDelete(selected.id)
    setSelected(null)
  }

  const drawingRect = drawing
    ? {
        x: Math.min(drawing.x1, drawing.x2),
        y: Math.min(drawing.y1, drawing.y2),
        w: Math.abs(drawing.x2 - drawing.x1),
        h: Math.abs(drawing.y2 - drawing.y1),
      }
    : null

  return (
    <>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          pointerEvents: isAnnotationMode ? 'all' : 'none',
          cursor: isAnnotationMode ? 'crosshair' : 'default',
          zIndex: 10,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {canvasRects.map((ann) => {
          const isSelected = selected?.id === ann.id
          return (
            <g
              key={ann.id}
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onClick={(e) => handleAnnotationClick(e, ann)}
            >
              <rect
                x={ann.cx}
                y={ann.cy}
                width={ann.cw}
                height={ann.ch}
                fill="rgba(255, 210, 0, 0.08)"
                stroke="#FFD700"
                strokeWidth={isSelected ? 2 : 1.5}
                strokeDasharray={isSelected ? 'none' : '5 3'}
              />
              {ann.label && (
                <text
                  x={ann.cx + 4}
                  y={ann.cy - 5}
                  fill="#FFD700"
                  fontSize="11"
                  fontFamily="Outfit, sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {ann.label}
                </text>
              )}
            </g>
          )
        })}

        {drawingRect && (
          <rect
            x={drawingRect.x}
            y={drawingRect.y}
            width={drawingRect.w}
            height={drawingRect.h}
            fill="rgba(255, 210, 0, 0.12)"
            stroke="#FFD700"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>

      {selected && (() => {
        const rect = canvasRects.find((r) => r.id === selected.id)
        if (!rect) return null
        return (
          <div
            className="absolute z-20 rounded-xl p-3 shadow-lg"
            style={{
              backgroundColor: '#EFEDE3',
              left: rect.cx,
              top: rect.cy + rect.ch + 6,
              minWidth: 180,
              pointerEvents: 'all',
            }}
          >
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isDoctor && handleSaveLabel()}
              placeholder="Label (optional)"
              disabled={!isDoctor}
              className="w-full px-2 py-1 rounded-lg text-sm font-outfit text-primary-dark focus:outline-none mb-2"
              style={{ backgroundColor: '#E1DFD5' }}
            />
            <div className="flex gap-2">
              {isDoctor && (
                <button
                  onClick={handleSaveLabel}
                  className="flex-1 text-xs font-outfit py-1 px-2 rounded-lg"
                  style={{ backgroundColor: '#233970', color: '#F5F3EA' }}
                >
                  Save
                </button>
              )}
              {isDoctor && (
                <button
                  onClick={handleDelete}
                  className="text-xs font-outfit py-1 px-2 rounded-lg"
                  style={{ backgroundColor: '#FEE2E2', color: '#7E2F2F' }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="text-xs font-outfit py-1 px-2 rounded-lg"
                style={{ backgroundColor: '#E1DFD5', color: '#787771' }}
              >
                ✕
              </button>
            </div>
          </div>
        )
      })()}
    </>
  )
}

export default AnnotationLayer
