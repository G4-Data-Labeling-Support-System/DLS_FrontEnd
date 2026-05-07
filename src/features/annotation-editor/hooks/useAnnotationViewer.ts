import { useState, useCallback, useRef, useEffect } from 'react'

export function useAnnotationViewer() {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = useCallback(() => setZoom((prev) => Math.min(prev + 0.2, 10)), [])
  const handleZoomOut = useCallback(() => setZoom((prev) => Math.max(prev - 0.2, 1)), [])
  const handleZoomReset = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 10))
  }, [])

  // Clamp offset to keep image in view
  useEffect(() => {
    if (viewerRef.current) {
      const viewerWidth = viewerRef.current.clientWidth
      const viewerHeight = viewerRef.current.clientHeight
      const maxX = Math.max(0, (zoom - 1) * (viewerWidth / 2))
      const maxY = Math.max(0, (zoom - 1) * (viewerHeight / 2))

      setOffset(prev => ({
        x: Math.min(Math.max(prev.x, -maxX), maxX),
        y: Math.min(Math.max(prev.y, -maxY), maxY)
      }))
    }
  }, [zoom])

  const startPanning = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true)
    setPanStart({ x: clientX - offset.x, y: clientY - offset.y })
  }, [offset])

  const updatePanning = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return
    let nextX = clientX - panStart.x
    let nextY = clientY - panStart.y

    if (viewerRef.current) {
      const viewerWidth = viewerRef.current.clientWidth
      const viewerHeight = viewerRef.current.clientHeight
      const maxX = Math.max(0, (zoom - 1) * (viewerWidth / 2))
      const maxY = Math.max(0, (zoom - 1) * (viewerHeight / 2))
      nextX = Math.min(Math.max(nextX, -maxX), maxX)
      nextY = Math.min(Math.max(nextY, -maxY), maxY)
    }

    setOffset({ x: nextX, y: nextY })
  }, [isPanning, panStart, zoom])

  const stopPanning = useCallback(() => setIsPanning(false), [])

  return {
    zoom,
    offset,
    isPanning,
    viewerRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleWheel,
    startPanning,
    updatePanning,
    stopPanning
  }
}
