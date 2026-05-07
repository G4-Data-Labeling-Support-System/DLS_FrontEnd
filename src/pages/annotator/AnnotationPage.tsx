import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'


// Features & Hooks
import { useAnnotationViewer } from '@/features/annotation-editor/hooks/useAnnotationViewer'
import { useAnnotationDrawing } from '@/features/annotation-editor/hooks/useAnnotationDrawing'
import { useAnnotationSession } from '@/features/annotation-editor/hooks/useAnnotationSession'

// Components
import { AnnotationCanvas } from '@/features/annotation-editor/components/AnnotationCanvas'
import { AnnotationToolbar } from '@/features/annotation-editor/components/AnnotationToolbar'
import { EditorSidebarLeft } from '@/features/annotation-editor/components/EditorSidebarLeft'
import { EditorSidebarRight } from '@/features/annotation-editor/components/EditorSidebarRight'

// Types
import type { Shape, Label } from '@/features/annotation-editor/types'


import annotationApi from '@/services/annotation'

export default function AnnotationPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const location = useLocation()

  
  // 1. Session & API Data
  const state = location.state as { assignmentId?: string } | null
  const {
    dataItems,
    labels,
    currentIndex,
    setCurrentIndex,
    sessionAnnotations,
    setSessionAnnotations,
    loading
  } = useAnnotationSession(taskId, state?.assignmentId)


  // 2. Viewer Logic (Zoom/Pan)
  const viewer = useAnnotationViewer()

  // 3. Drawing Logic
  const drawing = useAnnotationDrawing()

  // 4. UI States
  const [currentLabel, setCurrentLabel] = useState<Label | null>(null)
  const [comment, setComment] = useState('')
  const [confidence, setConfidence] = useState<'LOW' | 'MEDIUM' | 'HIGH' | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [leftWidth, setLeftWidth] = useState(260)
  const [rightWidth, setRightWidth] = useState(320)
  const draggingRef = useRef<'left' | 'right' | null>(null)

  // 5. Sidebar Resizing Logic
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      if (draggingRef.current === 'left') {
        setLeftWidth(Math.max(160, Math.min(500, e.clientX)))
      } else {
        setRightWidth(Math.max(200, Math.min(600, window.innerWidth - e.clientX)))
      }
    }
    const onMouseUp = () => { draggingRef.current = null; document.body.style.cursor = '' }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // 6. Syncing logic when current index changes
  const currentItem = dataItems[currentIndex]
  const currentItemId = currentItem ? ((currentItem as any).dataItemId || currentItem.itemId || (currentItem as any).id) : ''

  const loadCurrentItemData = useCallback(() => {
    if (!currentItemId) return
    const annotation = sessionAnnotations.find(a => a.dataitemId === currentItemId)
    
    viewer.handleZoomReset()
    drawing.resetDrawing()
    
    if (annotation) {
      const data = annotation.annotationData as any
      const shapes = (data?.shapes || data?.raw || []) as Shape[]
      drawing.setShapes(shapes)
      setComment(annotation.comment || '')
      setConfidence((annotation.annotationConfidence as any) || null)
    } else {
      setComment('')
      setConfidence(null)
    }
  }, [currentItemId, sessionAnnotations, viewer, drawing])

  useEffect(() => {
    loadCurrentItemData()
  }, [currentIndex, currentItemId])

  // 7. Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drawing.tool === 'pan') {
      viewer.startPanning(e.clientX, e.clientY)
      return
    }
    if (!currentLabel) {
      toast.warning('Please select a label first.')
      return
    }


    const rect = e.currentTarget.getBoundingClientRect()
    const x = naturalSize ? ((e.clientX - rect.left) / rect.width) * naturalSize.width : (e.clientX - rect.left) / viewer.zoom
    const y = naturalSize ? ((e.clientY - rect.top) / rect.height) * naturalSize.height : (e.clientY - rect.top) / viewer.zoom

    if (drawing.tool === 'polygon') {
      if (!drawing.isDrawing) {
        drawing.setIsDrawing(true)
        drawing.setCurrentShape({
          type: 'polygon',
          points: [[x, y]],
          label: currentLabel.labelName,
          color: currentLabel.color
        })
      } else if (drawing.currentShape?.points) {
        const points = drawing.currentShape.isPreview ? drawing.currentShape.points.slice(0, -1) : drawing.currentShape.points
        drawing.setCurrentShape({ ...drawing.currentShape, points: [...points, [x, y]], isPreview: false })
      }
      return
    }

    drawing.setIsDrawing(true)
    if (drawing.tool === 'box') {
      drawing.setCurrentShape({
        type: 'bounding_box',
        x, y, width: 0, height: 0,
        startX: x, startY: y,
        label: currentLabel.labelName,
        color: currentLabel.color
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (viewer.isPanning) {
      viewer.updatePanning(e.clientX, e.clientY)
      return
    }
    if (!drawing.isDrawing || !drawing.currentShape) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = naturalSize ? ((e.clientX - rect.left) / rect.width) * naturalSize.width : (e.clientX - rect.left) / viewer.zoom
    const y = naturalSize ? ((e.clientY - rect.top) / rect.height) * naturalSize.height : (e.clientY - rect.top) / viewer.zoom

    if (drawing.tool === 'box' && drawing.currentShape.startX !== undefined) {
      drawing.setCurrentShape({
        ...drawing.currentShape,
        x: Math.min(x, drawing.currentShape.startX),
        y: Math.min(y, drawing.currentShape.startY!),
        width: Math.abs(x - drawing.currentShape.startX),
        height: Math.abs(y - drawing.currentShape.startY!)
      })
    }

    if (drawing.tool === 'polygon' && drawing.currentShape.points) {
      const points = [...drawing.currentShape.points]
      if (drawing.currentShape.isPreview) points[points.length - 1] = [x, y]
      else points.push([x, y])
      drawing.setCurrentShape({ ...drawing.currentShape, points, isPreview: true })
    }
  }

  const handleMouseUp = () => {
    if (viewer.isPanning) {
      viewer.stopPanning()
      return
    }
    if (!drawing.isDrawing || drawing.tool === 'polygon') return
    
    drawing.setIsDrawing(false)
    if (drawing.currentShape) {
      drawing.addShape(drawing.currentShape)
      drawing.setCurrentShape(null)
    }
  }

  const handleFinishPolygon = () => {
    if (drawing.currentShape?.points) {
      const finalPoints = drawing.currentShape.isPreview ? drawing.currentShape.points.slice(0, -1) : drawing.currentShape.points
      if (finalPoints.length >= 2) {
        drawing.addShape({ ...drawing.currentShape, points: finalPoints, isPreview: false })
      }
      drawing.setCurrentShape(null)
      drawing.setIsDrawing(false)
    }
  }

  const handleSubmit = async () => {
    if (!taskId || !currentItemId) return
    try {
      const payload = {
        taskId,
        annotationConfidence: confidence || 'LOW',
        annotationData: { raw: drawing.shapes },
        annotationStatus: 'SUBMITTED' as const,
        annotationType: 'CLASSIFICATION' as const, // Simplification for demo
        comment: comment || '',
        dataitemId: currentItemId,
        labelIds: Array.from(new Set([...drawing.shapes.map(s => labels.find(l => l.labelName === s.label)?.labelId).filter(Boolean)])) as string[]
      }
      await annotationApi.submitSingleAnnotation(payload)
      toast.success('Annotation submitted!')
      drawing.setIsDirty(false)
      // Update session locally
      setSessionAnnotations(prev => {
        const idx = prev.findIndex(a => a.dataitemId === currentItemId)
        const updated = [...prev]
        if (idx >= 0) updated[idx] = { ...payload, isRemote: true } as any
        else updated.push({ ...payload, isRemote: true } as any)
        return updated
      })
    } catch (err) {
      toast.error('Failed to submit.')
    }
  }

  if (loading) return (
    <div className="h-screen bg-[#0f0c15] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <div className="absolute inset-0 blur-xl bg-violet-500/20 rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-violet-400 font-mono tracking-widest text-xs animate-pulse uppercase font-bold">
          Initializing Editor
        </span>
        <div className="flex gap-1">
          <Skeleton className="w-2 h-2 rounded-full bg-violet-500/40" />
          <Skeleton className="w-2 h-2 rounded-full bg-violet-500/40" />
          <Skeleton className="w-2 h-2 rounded-full bg-violet-500/40" />
        </div>
      </div>
    </div>
  )


  return (
    <div className="h-screen bg-[#0f0c15] flex flex-col overflow-hidden text-white font-sans selection:bg-violet-500/30">
      <AnnotationToolbar 
        tool={drawing.tool}
        zoom={viewer.zoom}
        canUndo={drawing.shapes.length > 0}
        canRedo={drawing.redoStack.length > 0}
        isDirty={drawing.isDirty}
        onToolChange={drawing.setTool}
        onUndo={drawing.handleUndo}
        onRedo={drawing.handleRedo}
        onZoomIn={viewer.handleZoomIn}
        onZoomOut={viewer.handleZoomOut}
        onZoomReset={viewer.handleZoomReset}
        onFinishPolygon={handleFinishPolygon}
        onClearAll={loadCurrentItemData}
        onSubmit={handleSubmit}
      />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebarLeft 
          width={leftWidth}
          items={dataItems}
          currentIndex={currentIndex}
          sessionAnnotations={sessionAnnotations}
          onItemSelect={setCurrentIndex}
          onMouseDownResize={() => { draggingRef.current = 'left' }}
        />

        <AnnotationCanvas 
          imageUrl={currentItem?.url || ''}
          zoom={viewer.zoom}
          offset={viewer.offset}
          tool={drawing.tool}
          shapes={drawing.shapes}
          currentShape={drawing.currentShape}
          naturalSize={naturalSize}
          viewerRef={viewer.viewerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onImageLoad={(e) => setNaturalSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
          onWheel={viewer.handleWheel}
        />

        <EditorSidebarRight 
          width={rightWidth}
          labels={labels}
          selectedLabels={[]}
          currentLabel={currentLabel}
          shapes={drawing.shapes}
          comment={comment}
          confidence={confidence}
          annotationReviews={[]} // Populate from state if needed
          onLabelToggle={setCurrentLabel}
          onCommentChange={setComment}
          onConfidenceChange={setConfidence}
          onRemoveShape={drawing.handleRemoveShape}
          onMouseDownResize={() => { draggingRef.current = 'right' }}
        />
      </div>
    </div>
  )
}
