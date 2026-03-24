import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import assignmentApi from '@/api/AssignmentApi'
import taskApi from '@/api/TaskApi'
import type { AnnotationSubmitItem } from '@/shared/types/api.types'

interface Shape {
  type: 'bounding_box' | 'polygon'
  x?: number
  y?: number
  width?: number
  height?: number
  startX?: number
  startY?: number
  points?: [number, number][]
  label: string
  color: string
  isPreview?: boolean
}

interface Label {
  labelId: string
  labelName: string
  color: string
  description?: string
}

interface DataItem {
  itemId: string
  fileName: string
  url: string
  fileFormat: string
  dataType: string
}

export default function AnnotationPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Get starting index and assignmentId from state if passed
  const state = location.state as { startIndex?: number; assignmentId?: string } | null
  const startIdx = state?.startIndex || 0
  const assignmentId = state?.assignmentId

  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [currentIndex, setCurrentIndex] = useState(startIdx)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [currentLabel, setCurrentLabel] = useState<Label | null>(null)
  const [comment, setComment] = useState('This is a preliminary scan observation.')
  const [confidence, setConfidence] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Zoom and Tool States
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [tool, setTool] = useState<'pan' | 'box' | 'polygon'>('pan')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [shapes, setShapes] = useState<Shape[]>([])
  
  // New: Redo Stack
  const [redoStack, setRedoStack] = useState<Shape[]>([])

  // Resizable sidebars
  const [leftWidth, setLeftWidth] = useState(260)
  const [rightWidth, setRightWidth] = useState(320)
  const draggingRef = useRef<'left' | 'right' | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      const delta = e.clientX - dragStartXRef.current
      if (draggingRef.current === 'left') {
        setLeftWidth(Math.max(160, Math.min(500, dragStartWidthRef.current + delta)))
      } else {
        setRightWidth(Math.max(200, Math.min(600, dragStartWidthRef.current - delta)))
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

  // Store all annotations in current session before bulk submit
  const [sessionAnnotations, setSessionAnnotations] = useState<AnnotationSubmitItem[]>([])

  // Persistence Keys
  const STORAGE_KEY_SESSIONS = `annotation_session_${taskId}`
  const STORAGE_KEY_INDEX = `annotation_index_${taskId}`

  // Save progress automatically
  useEffect(() => {
    if (taskId && (sessionAnnotations.length > 0 || currentIndex > 0)) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessionAnnotations))
      localStorage.setItem(STORAGE_KEY_INDEX, String(currentIndex))
    }
  }, [sessionAnnotations, currentIndex, taskId, STORAGE_KEY_SESSIONS, STORAGE_KEY_INDEX])

  // Auto-save realtime changes (with debounce)
  useEffect(() => {
    if (loading || !dataItems[currentIndex]) return
    const timeout = setTimeout(() => {
      saveCurrentToSession()
    }, 500)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, comment, selectedLabels, confidence, loading])

  const loadFromSession = useCallback(
    (item: DataItem | undefined, annotationsToSearch?: AnnotationSubmitItem[]) => {
      if (!item) return
      const itemId =
        (item as any).dataItemId ||
        (item as any).dataitemId ||
        item.itemId ||
        (item as any).dataItem?.itemId ||
        (item as any).id
      const sourceAnnotations = annotationsToSearch || sessionAnnotations
      const existing = sourceAnnotations.find((a) => a.dataitemId === itemId)

      // Zoom and pan reset
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      setIsDrawing(false)
      setCurrentShape(null)
      // Reset Redo Stack on page change
      setRedoStack([])

      if (existing) {
        setShapes((existing.annotationData.shapes as Shape[]) || (existing.annotationData.raw as Shape[]) || [])
        setComment(existing.comment || '')
        setSelectedLabels(existing.labelIds || [])
        setConfidence((existing.annotationConfidence as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW')
      } else {
        setShapes([])
        setComment('This is a preliminary scan observation.')
        setConfidence('LOW')
        if (labels.length > 0) {
          setSelectedLabels([labels[0].labelId])
        } else {
          setSelectedLabels([])
        }
      }
    },
    [sessionAnnotations, labels]
  )

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return
      setLoading(true)
      try {
        // 1. Fetch task items
        const taskRes = await taskApi.getTaskById(taskId)
        const items = taskRes.data?.data || taskRes.data || []
        setDataItems(Array.isArray(items) ? items : [])

        // Try to recover assignmentId from task if missing (e.g., on refresh)
        let effectiveAssignmentId = assignmentId
        if (!effectiveAssignmentId && items.length > 0) {
          effectiveAssignmentId = items[0].assignmentId
        }

        // 2. Fetch labels if effectiveAssignmentId is available
        if (effectiveAssignmentId) {
          try {
            const labelsRes = await assignmentApi.getLabelsByAssignmentId(effectiveAssignmentId)
            const labelsData = labelsRes.data?.data || labelsRes.data || []
            if (Array.isArray(labelsData)) {
              // Normalize internal label structure to match UI expectations
              const normLabels = labelsData.map((l: any) => ({
                ...l,
                labelId: l.labelId || l.id,
                labelName: l.labelName || l.name,
                color: l.color || '#8b5cf6'
              }))
              setLabels(normLabels)
              if (normLabels.length > 0) {
                setCurrentLabel(normLabels[0])
                setSelectedLabels([normLabels[0].labelId])
              }
            }
          } catch (labelErr) {
            console.error('Failed to fetch labels for assignment:', labelErr)
          }
        }

        // 3. Restore from localStorage if available
        const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS)
        const savedIndex = localStorage.getItem(STORAGE_KEY_INDEX)

        if (savedSessions) {
          try {
            const parsed = JSON.parse(savedSessions)
            setSessionAnnotations(parsed)

            const restoredIdx = savedIndex !== null ? parseInt(savedIndex) : startIdx
            if (restoredIdx >= 0 && restoredIdx < items.length) {
              setCurrentIndex(restoredIdx)
              // We need to load from the RESTORED session, not the state yet
              const restoredItem = items[restoredIdx]
              const restoredItemId =
                (restoredItem as any).dataItemId ||
                (restoredItem as any).dataitemId ||
                restoredItem.itemId ||
                (restoredItem as any).dataItem?.itemId ||
                restoredItem.id
              const existing = parsed.find(
                (a: AnnotationSubmitItem) => a.dataitemId === restoredItemId
              )
              if (existing) {
                setShapes((existing.annotationData.shapes as Shape[]) || (existing.annotationData.raw as Shape[]) || [])
                setComment(existing.comment || '')
                setSelectedLabels(existing.labelIds || [])
                setConfidence((existing.annotationConfidence as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW')
              }
            }
          } catch (e) {
            console.warn('Failed to restore session:', e)
          }
        } else {
          // Normal first-time load
          loadFromSession(items[currentIndex])
        }
      } catch (err) {
        console.error('Failed to load annotation data:', err)
        setError('Failed to load annotation data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, assignmentId])

  const currentItem = dataItems[currentIndex]
  const totalItems = dataItems.length

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 10))
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 10))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))
  const handleZoomReset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tool === 'pan') {
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
      return
    }

    if (!currentLabel) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (tool === 'polygon') {
      if (!isDrawing) {
        setIsDrawing(true)
        setCurrentShape({
          type: 'polygon',
          points: [[x, y]],
          label: currentLabel.labelName,
          color: currentLabel.color
        })
      } else if (currentShape && currentShape.points) {
        const points = currentShape.isPreview
          ? currentShape.points.slice(0, -1)
          : currentShape.points
        setCurrentShape({ ...currentShape, points: [...points, [x, y]], isPreview: false })
      }
      return
    }

    setIsDrawing(true)
    if (tool === 'box') {
      setCurrentShape({
        type: 'bounding_box',
        x,
        y,
        width: 0,
        height: 0,
        startX: x,
        startY: y,
        label: currentLabel.labelName,
        color: currentLabel.color
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
      return
    }

    if (!isDrawing || !currentShape) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (
      tool === 'box' &&
      currentShape &&
      currentShape.startX !== undefined &&
      currentShape.startY !== undefined
    ) {
      setCurrentShape({
        ...currentShape,
        x: Math.min(x, currentShape.startX),
        y: Math.min(y, currentShape.startY),
        width: Math.abs(x - currentShape.startX),
        height: Math.abs(y - currentShape.startY)
      })
    }

    if (tool === 'polygon' && currentShape && currentShape.points) {
      const points = [...currentShape.points]
      if (points.length > 1 && currentShape.isPreview) {
        points[points.length - 1] = [x, y]
      } else {
        points.push([x, y])
      }
      setCurrentShape({ ...currentShape, points, isPreview: true })
    }
  }

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
      return
    }
    if (!isDrawing || tool === 'polygon') return
    setIsDrawing(false)
    if (currentShape) {
      setShapes([...shapes, currentShape])
      setRedoStack([])
      setCurrentShape(null)
    }
  }

  const finishPolygon = () => {
    if (tool === 'polygon' && currentShape && currentShape.points) {
      const finalPoints = currentShape.isPreview
        ? currentShape.points.slice(0, -1)
        : currentShape.points

      if (finalPoints.length >= 2) {
        setShapes([...shapes, { ...currentShape, points: finalPoints, isPreview: false }])
        setRedoStack([])
      }
      setCurrentShape(null)
      setIsDrawing(false)
    }
  }

  const handleClearAll = () => {
    setShapes([])
    setRedoStack([])
    setCurrentShape(null)
    setIsDrawing(false)
  }

  const handleUndo = () => {
    if (shapes.length === 0) return
    const lastShape = shapes[shapes.length - 1]
    setShapes(shapes.slice(0, -1))
    setRedoStack((prev) => [...prev, lastShape])
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const shapeToRestore = redoStack[redoStack.length - 1]
    setRedoStack(redoStack.slice(0, -1))
    setShapes([...shapes, shapeToRestore])
  }

  const createAnnotationPayload = (
    itemId: string,
    status: AnnotationSubmitItem['annotationStatus'] = 'DRAFT'
  ): AnnotationSubmitItem => {
    return {
      annotationConfidence: confidence,
      annotationData: {
        shapes: shapes,
        comment: comment,
        labels: selectedLabels
      },
      annotationStatus: status,
      annotationType: shapes.some((s) => s.type === 'bounding_box')
        ? 'BOUNDING_BOX'
        : shapes.some((s) => s.type === 'polygon')
          ? 'POLYGON'
          : 'CLASSIFICATION',
      comment: comment,
      dataitemId: itemId,
      labelIds: selectedLabels
    }
  }

  const saveCurrentToSession = () => {
    if (!currentItem) return
    const itemId =
      (currentItem as any).dataItemId ||
      (currentItem as any).dataitemId ||
      currentItem.itemId ||
      (currentItem as any).dataItem?.itemId ||
      (currentItem as any).id
    if (!itemId) return

    const newAnnotation = createAnnotationPayload(itemId)
    setSessionAnnotations((prev) => {
      const existingIndex = prev.findIndex((a) => a.dataitemId === itemId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = newAnnotation
        return updated
      }
      return [...prev, newAnnotation]
    })
  }

  const handleItemSelect = (idx: number) => {
    saveCurrentToSession()
    loadFromSession(dataItems[idx])
    setCurrentIndex(idx)
  }

  const toggleLabel = (labelObj: Label) => {
    setCurrentLabel(labelObj)
    setSelectedLabels((prev) =>
      prev.includes(labelObj.labelId)
        ? prev.filter((l) => l !== labelObj.labelId)
        : [...prev, labelObj.labelId]
    )
  }

  const handleSubmitTask = async () => {
    if (!taskId) return
    saveCurrentToSession()

    try {
      setLoading(true)
      const currentItemId = ((currentItem as any)?.dataItemId ||
        (currentItem as any)?.dataitemId ||
        currentItem?.itemId ||
        (currentItem as any)?.dataItem?.itemId ||
        (currentItem as any)?.id ||
        '') as string
      // Create current annotation as SUBMITTED
      const currentAnnotation = createAnnotationPayload(currentItemId, 'SUBMITTED')

      // Normalize all session annotations to SUBMITTED for the final push
      const finalAnnotations: AnnotationSubmitItem[] = sessionAnnotations.map((a) => ({
        ...a,
        annotationStatus: 'SUBMITTED'
      }))

      const existingIndex = finalAnnotations.findIndex((a) => a.dataitemId === currentItemId)
      if (existingIndex >= 0) {
        finalAnnotations[existingIndex] = currentAnnotation
      } else {
        finalAnnotations.push(currentAnnotation)
      }

      const payload = {
        taskId,
        annotations: finalAnnotations.filter((a) => a.dataitemId && a.dataitemId.length > 5) // Filter out garbage
      }

      console.log('🚀 SUBMITTING ANNOTATIONS TO BE:', payload)

      await taskApi.submitAnnotations(payload)

      localStorage.removeItem(STORAGE_KEY_INDEX)

      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Failed to submit annotations.')
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4">
        <Result
          status="success"
          title={<span className="text-white">Task Submitted Successfully!</span>}
          subTitle={<span className="text-gray-400">Your annotations have been saved and securely submitted for review.</span>}
          extra={[
            <Button
              key="back-to-assignment-btn"
              type="primary"
              onClick={() => navigate(assignmentId ? `/annotator/assignment/${assignmentId}` : '/annotator/assignment')}
              className="bg-violet-600 hover:bg-violet-500 border-none px-6 h-10 font-bold rounded-lg"
            >
              Back to Assignment
            </Button>
          ]}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4">
        <Spin size="large" />
        <span className="text-violet-400 font-mono text-sm animate-pulse">
          Loading annotation workspace...
        </span>
      </div>
    )
  }

  if (error || !currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4">
        <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
        <span className="text-red-400 font-medium">{error || 'No data items found.'}</span>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-bold"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-[#111116] text-white overflow-hidden font-sans">
      {/* Optional minimal top bar for backing out */}
      <div className="absolute top-4 left-4 z-[200]">
        <button
           onClick={() => {
             saveCurrentToSession()
             navigate(-1)
           }}
           className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 flex items-center gap-2 transition text-sm font-medium shadow-xl absolute top-4 left-4 cursor-pointer"
        >
           <span className="material-symbols-outlined text-[16px]">arrow_back</span>
           <span>Back</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        
        {/* Left Column: Thumbnail List */}
        <div style={{ width: leftWidth, minWidth: 160 }} className="border-r border-white/10 overflow-y-auto custom-scrollbar flex flex-col pt-16 mt-4 pb-4 shrink-0">
          <div className="flex items-center px-2 py-2 border-b border-white/10 mx-4 mb-2 gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span className="w-10 shrink-0 text-center">Status</span>
            <span className="w-16 shrink-0 text-center">Image</span>
            <span className="flex-1">Shapes</span>
          </div>
          
          <div className="flex-1 flex flex-col px-4 gap-4">
            {dataItems.map((item, idx) => {
              const currentId =
                (item as any).dataItemId ||
                (item as any).dataitemId ||
                item.itemId ||
                (item as any).dataItem?.itemId ||
                (item as any).id
              const annotation = sessionAnnotations.find(a => a.dataitemId === currentId)
              const shapeCount = ((annotation?.annotationData?.shapes as Shape[]) || []).length
              const labelCount = annotation?.labelIds?.length || 0
              const isLabeled = shapeCount > 0 || labelCount > 0
              
              const isSelected = currentIndex === idx;
              return (
                <div 
                  key={currentId || idx}
                  onClick={() => handleItemSelect(idx)}
                  className="flex items-center gap-3 cursor-pointer transition-all hover:bg-white/5 rounded-lg px-2 py-1.5"
                >
                  {/* Status — w-10 to match header */}
                  <div className="w-10 shrink-0 flex justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${isLabeled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-400/60'}`} />
                  </div>

                  {/* Image — w-16 to match header */}
                  <div className="relative shrink-0 w-16">
                    <img
                      src={item.url}
                      alt={item.fileName}
                      className={`w-16 h-12 object-cover rounded-md bg-black/50 border-[2px] ${isSelected ? 'border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'border-white/10'}`}
                    />
                    {/* Shape count badge */}
                    <div className={`absolute -bottom-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      shapeCount > 0
                        ? 'bg-violet-600 border-violet-400/50 text-white'
                        : 'bg-black/70 border-white/10 text-gray-500'
                    }`}>
                      {shapeCount}
                    </div>
                  </div>

                  {/* Shapes — flex-1 to match header */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-gray-600 leading-tight">
                      {shapeCount > 0 ? `${shapeCount} shape${shapeCount !== 1 ? 's' : ''}` : 'no shapes'}
                      {labelCount > 0 ? ` · ${labelCount} label${labelCount !== 1 ? 's' : ''}` : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Left Resize Handle */}
        <div
          className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40 transition-colors bg-transparent group relative"
          onMouseDown={(e) => {
            draggingRef.current = 'left'
            dragStartXRef.current = e.clientX
            dragStartWidthRef.current = leftWidth
            document.body.style.cursor = 'col-resize'
            e.preventDefault()
          }}
        >
          <div className="absolute inset-y-0 left-0 w-[3px] group-hover:bg-violet-500/40 transition-colors" />
        </div>
        <div className="flex-[2] flex flex-col relative overflow-hidden bg-[#111116] pt-12 pb-6 px-5 border-l-[2px] border-white/5 mx-2 my-2">
          
          <div className="text-left mb-3">
            <h2 className="text-2xl font-medium text-gray-200 tracking-wide">
              Select label and click the image to start
            </h2>
          </div>

          {/* Image Container */}
          <div className="flex-1 relative flex">
             
             {/* The Viewer */}
             <div
               className="relative shadow-2xl transition-transform duration-200 ease-out will-change-transform bg-[#1e293b]/50 overflow-hidden flex items-center justify-center w-full h-full mx-auto border-[1px] border-gray-600/80 shadow-[0_0_30px_rgba(96,165,250,0.15)]"
               onWheel={handleWheel}
             >
                <div
                    className="relative transition-transform duration-200 ease-out will-change-transform flex items-center justify-center h-full w-full"
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center' }}
                >
                  <img src={currentItem.url} alt={currentItem.fileName} className="max-w-full max-h-full object-contain pointer-events-none select-none" />
                  
                  <svg
                    className={`absolute inset-0 w-full h-full ${tool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onDoubleClick={finishPolygon}
                  >
                    {shapes.map((shape, i) => (
                      <g key={`shape-${i}-${shape.label}`}>
                        {shape.type === 'bounding_box' ? (
                          <rect
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={`${shape.color}33`}
                            stroke={shape.color}
                            strokeWidth={3 / zoom}
                          />
                        ) : (
                          <polyline
                            points={shape.points?.map((p: [number, number]) => p.join(',')).join(' ')}
                            fill={`${shape.color}33`}
                            stroke={shape.color}
                            strokeWidth={3 / zoom}
                          />
                        )}
                      </g>
                    ))}
                    {currentShape && (
                      <g>
                        {currentShape.type === 'bounding_box' ? (
                          <rect
                            x={currentShape.x}
                            y={currentShape.y}
                            width={currentShape.width}
                            height={currentShape.height}
                            fill={`${currentShape.color}66`}
                            stroke={currentShape.color}
                            strokeWidth={3 / zoom}
                          />
                        ) : (
                          <polyline
                            points={currentShape.points
                              ?.map((p: [number, number]) => p.join(','))
                              .join(' ')}
                            fill={`${currentShape.color}66`}
                            stroke={currentShape.color}
                            strokeWidth={3 / zoom}
                          />
                        )}
                      </g>
                    )}
                  </svg>
                </div>
             </div>

             {/* Floating Tools on the right */}
             <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-[#1e1b29] px-1.5 py-3 rounded-xl shadow-2xl border border-violet-500/20 z-20" style={{ right: '20px' }}>
                {/* <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400/60 text-center mb-2">Tools</span> */}
                <ToolbarButton icon="pan_tool" active={tool === 'pan'} onClick={() => setTool('pan')} />
                <ToolbarButton icon="zoom_in" onClick={handleZoomIn} />
                <ToolbarButton icon="zoom_out" onClick={handleZoomOut} />
                <ToolbarButton icon="restart_alt" onClick={handleZoomReset} />
                <div className="w-full h-px bg-violet-500/20 my-1" />
                <ToolbarButton icon="crop_free" active={tool === 'box'} onClick={() => setTool('box')} />
                <ToolbarButton icon="polyline" active={tool === 'polygon'} onClick={() => setTool('polygon')} />
             </div>
          </div>


          {/* Bottom Action Bar */}
          <div className="mt-8 border-t border-white/10 pt-5 flex w-full items-center justify-between gap-4">
            
            <div className="flex item-center">
              {/* Left: task counter */}
              <span className="text-xs  font-mono text-gray-500">task {currentIndex + 1}/{totalItems}</span>

              {/* Center: Undo / Redo / Reset */}
              <div className="flex items-center gap-1 flex-1 justify-center">
                <button onClick={handleUndo} className="px-3 py-1.5 cursor-pointer rounded-lg text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">undo</button>
                <button onClick={handleRedo} className="px-3 py-1.5 cursor-pointer rounded-lg text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">redo</button>
                <button onClick={handleClearAll} className="px-3 py-1.5 cursor-pointer rounded-lg text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">reset</button>
              </div>
            </div>
            
            
            {/* Submit on Right */}
            <button
               onClick={handleSubmitTask}
               className="shrink-0 cursor-pointer bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-violet-900/20"
            >
               Submit
            </button>
          </div>
        </div>

        {/* Right Resize Handle */}
        <div
          className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40 transition-colors bg-transparent group relative"
          onMouseDown={(e) => {
            draggingRef.current = 'right'
            dragStartXRef.current = e.clientX
            dragStartWidthRef.current = rightWidth
            document.body.style.cursor = 'col-resize'
            e.preventDefault()
          }}
        >
          <div className="absolute inset-y-0 left-0 w-[3px] group-hover:bg-violet-500/40 transition-colors" />
        </div>

        {/* Right Column: Comment, Labels, Confidence & Geometry */}
        <div style={{ width: rightWidth, minWidth: 200 }} className="border-l border-white/5 px-6 py-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-[#16161a] shrink-0">

           {/* Labels */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px] text-violet-400">label</span>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Labels</span>
             </div>
             <div className="flex flex-wrap gap-2">
               {labels.map(label => (
                 <button
                   key={label.labelId}
                   onClick={() => toggleLabel(label)}
                   className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all`}
                   style={{
                     borderColor: selectedLabels.includes(label.labelId) ? label.color : 'transparent',
                     backgroundColor: selectedLabels.includes(label.labelId) ? `${label.color}22` : 'rgba(255,255,255,0.05)',
                     color: selectedLabels.includes(label.labelId) ? '#fff' : '#6b7280'
                   }}
                 >
                   {label.labelName}
                 </button>
               ))}
             </div>
           </div>

           {/* Confidence */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px] text-orange-400">psychology</span>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Confidence</span>
             </div>
             <div className="flex bg-black/40 rounded-xl border border-white/5 p-1 gap-1">
               {(['LOW', 'MEDIUM', 'HIGH'] as const).map(level => (
                 <button
                   key={level}
                   onClick={() => setConfidence(level)}
                   className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                     confidence === level
                       ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                       : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                   }`}
                 >
                   {level}
                 </button>
               ))}
             </div>
           </div>
           
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px] text-amber-400">chat_bubble</span>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Comment</span>
             </div>
             <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-24 bg-white/5 rounded-xl border border-white/10 p-4 text-sm text-gray-300 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
             />
           </div>

           <div className="flex flex-col gap-3 flex-1">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px] text-blue-400">poly</span>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Geometry</span>
             </div>
             <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 overflow-y-auto min-h-[300px] custom-scrollbar">
                {shapes.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono">JSON</div>
                ) : (
                  <pre className="text-[10px] font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">
                     {JSON.stringify(
                         {
                           session: shapes.map((s) => ({ type: s.type, label: s.label })),
                           raw: shapes
                         },
                         null,
                         2
                     )}
                  </pre>
                )}
             </div>
           </div>

        </div>

      </div>
    </div>
  )
}

function ToolbarButton({
  icon,
  active = false,
  onClick
}: {
  icon: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
          w-7 h-7 p-4 flex items-center justify-center transition-all cursor-pointer rounded-md
          ${active ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}
      `}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
  )
}
