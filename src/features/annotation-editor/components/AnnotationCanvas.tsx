import React from 'react'
import type { Shape } from '../types'


interface AnnotationCanvasProps {
  imageUrl: string
  zoom: number
  offset: { x: number; y: number }
  tool: 'pan' | 'box' | 'polygon'
  shapes: Shape[]
  currentShape: Shape | null
  naturalSize: { width: number; height: number } | null
  viewerRef: React.RefObject<HTMLDivElement | null>
  onMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void

  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
  onMouseUp: () => void
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onWheel: (e: React.WheelEvent) => void
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  imageUrl,
  zoom,
  offset,
  tool,
  shapes,
  currentShape,
  naturalSize,
  viewerRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onImageLoad,
  onWheel
}) => {
  return (
    <div
      ref={viewerRef}
      className="flex-1 bg-[#0f0c15] relative overflow-hidden cursor-crosshair select-none"
      onWheel={onWheel}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transition: tool === 'pan' ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <div className="relative inline-block shadow-2xl">
          <img
            src={imageUrl}
            alt="Annotate"
            className="max-w-none block pointer-events-none"
            style={{ width: naturalSize ? 'auto' : '800px' }}
            onLoad={onImageLoad}
          />
          <svg
            className={`absolute inset-0 w-full h-full ${tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            viewBox={naturalSize ? `0 0 ${naturalSize.width} ${naturalSize.height}` : '0 0 800 600'}
          >
            {/* Render Saved Shapes */}
            {shapes.map((shape, idx) => (
              <React.Fragment key={idx}>
                {shape.type === 'bounding_box' && (
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={shape.color}
                    fillOpacity="0.2"
                    stroke={shape.color}
                    strokeWidth={2 / zoom}
                  />
                )}
                {shape.type === 'polygon' && shape.points && (
                  <polygon
                    points={shape.points.map((p) => p.join(',')).join(' ')}
                    fill={shape.color}
                    fillOpacity="0.2"
                    stroke={shape.color}
                    strokeWidth={2 / zoom}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Render Current Shape */}
            {currentShape && (
              <>
                {currentShape.type === 'bounding_box' && (
                  <rect
                    x={currentShape.x}
                    y={currentShape.y}
                    width={currentShape.width}
                    height={currentShape.height}
                    fill={currentShape.color}
                    fillOpacity="0.3"
                    stroke={currentShape.color}
                    strokeWidth={2 / zoom}
                    strokeDasharray={`${4 / zoom},${4 / zoom}`}
                  />
                )}
                {currentShape.type === 'polygon' && currentShape.points && (
                  <>
                    <polygon
                      points={currentShape.points.map((p) => p.join(',')).join(' ')}
                      fill={currentShape.color}
                      fillOpacity="0.3"
                      stroke={currentShape.color}
                      strokeWidth={2 / zoom}
                      strokeDasharray={`${4 / zoom},${4 / zoom}`}
                    />
                    {currentShape.points.map((p, i) => (
                      <circle
                        key={i}
                        cx={p[0]}
                        cy={p[1]}
                        r={4 / zoom}
                        fill="white"
                        stroke={currentShape.color}
                        strokeWidth={1 / zoom}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
