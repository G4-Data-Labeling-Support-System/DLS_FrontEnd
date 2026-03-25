import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Spin, message, Result, Button } from 'antd'
import taskApi from '@/api/TaskApi'
import annotationApi from '@/api/annotation'
import { reviewerApi, type ReviewUpdateRequest } from '@/api/ReviewerApi'
import assignmentApi from '@/api/AssignmentApi'

interface Shape {
  annotationId?: string
  type: 'bounding_box' | 'polygon' | 'point'
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
  annotationResponseList?: any[]
  annotations?: any[]
}

type ReviewStatus = 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'INACTIVE' | null

interface ReviewSessionData {
  status: ReviewStatus
  comment: string
}

export default function ReviewerAnnotationPage() {
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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Zoom and Pan States
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [tool, setTool] = useState<'pan' | 'box' | 'polygon'>('pan')

  // Current Item specific shapes
  const [shapes, setShapes] = useState<Shape[]>([])
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [redoStack, setRedoStack] = useState<Shape[]>([])
  const [currentLabel, setCurrentLabel] = useState<Label | null>(null)

  // Resizable sidebars
  const [leftWidth, setLeftWidth] = useState(260)
  const [rightWidth, setRightWidth] = useState(320)
  const draggingRef = useRef<'left' | 'right' | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)

  // Review states per data item
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewSessionData>>({})

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

  const parseAnnotations = useCallback((item: DataItem | undefined): Shape[] => {
    if (!item) return []
    const rawAnns = item.annotationResponseList || item.annotations || []
    return rawAnns.map((ann: any) => {
      try {
        const rawData = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : ann.annotationData || {}
        if (rawData.shapes && Array.isArray(rawData.shapes)) {
          return rawData.shapes.map((s: any) => ({
            ...s,
            annotationId: ann.annotationId || ann.id
          }))
        }
        if (rawData.bbox) {
          return [{
            annotationId: ann.annotationId || ann.id,
            type: 'bounding_box' as const,
            x: rawData.bbox.x,
            y: rawData.bbox.y,
            width: rawData.bbox.w || rawData.bbox.width,
            height: rawData.bbox.h || rawData.bbox.height,
            label: ann.labelName || 'Unknown',
            color: '#8b5cf6'
          }]
        }
        if (rawData.points) {
          return [{
            annotationId: ann.annotationId || ann.id,
            type: 'polygon' as const,
            points: rawData.points,
            label: ann.labelName || 'Unknown',
            color: '#f43f5e'
          }]
        }
      } catch (err) {
        console.error('Failed to parse annotation:', err)
      }
      return []
    }).flat()
  }, [])

  const loadItem = useCallback((item: DataItem | undefined) => {
    if (!item) return
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setIsDrawing(false)
    setCurrentShape(null)
    setRedoStack([])
    const loadedShapes = parseAnnotations(item)
    setShapes(loadedShapes)

    // Auto-select labels if found in existing shapes
    const existingLabels = loadedShapes.map(s => s.label)
    if (existingLabels.length > 0) {
      // Just for display logic if we wanted to sync labels checkboxes
    }
  }, [parseAnnotations])

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return
      setLoading(true)
      try {
        const taskRes = await taskApi.getTaskDataItems(taskId)
        const rawItems = taskRes.data?.data || taskRes.data || []
        const items = Array.isArray(rawItems)
          ? rawItems.map((tdi: any) => ({
            ...(tdi.dataItem || {}),
            itemId: tdi.dataItemId || tdi.dataitemId || tdi.id,
            taskDataItemStatus: tdi.taskDataItemStatus,
            taskItemId: tdi.id || tdi.taskItemId,
            annotationResponseList: tdi.annotationResponseList || [],
            annotations: tdi.annotations || []
          }))
          : []

        let effectiveAssignmentId = assignmentId
        if (!effectiveAssignmentId && items.length > 0) {
          effectiveAssignmentId = items[0].assignmentId
        }

        if (effectiveAssignmentId) {
          try {
            const labelsRes = await assignmentApi.getLabelsByAssignmentId(effectiveAssignmentId)
            const labelsData = labelsRes.data?.data || labelsRes.data || []
            if (Array.isArray(labelsData)) {
              const normLabels = labelsData.map((l: any) => ({
                ...l,
                labelId: l.labelId || l.id,
                labelName: l.labelName || l.name,
                color: l.color || '#8b5cf6'
              }))
              setLabels(normLabels)
              if (normLabels.length > 0) setCurrentLabel(normLabels[0])
            }
          } catch (labelErr) {
            console.error('Failed to load labels:', labelErr)
          }
        }

        const enrichedItems = await Promise.all(
          items.map(async (item: any) => {
            try {
              const annoRes = await annotationApi.getAnnotationByDataItemId(item.itemId)
              const annoData = annoRes.data?.data || annoRes.data
              if (annoData) {
                const annos = Array.isArray(annoData) ? annoData : [annoData]
                return { ...item, annotationResponseList: annos, annotations: annos }
              }
            } catch (err) {
              console.error('Failed to load annotation:', err)
            }
            return item
          })
        )

        setDataItems(enrichedItems)
        if (enrichedItems.length > 0) {
          const safeIdx = startIdx >= 0 && startIdx < enrichedItems.length ? startIdx : 0
          setCurrentIndex(safeIdx)
          loadItem(enrichedItems[safeIdx])
        }
      } catch (err) {
        setError('Failed to load task data. Please try again.')
        console.error('Failed to load task data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [taskId, assignmentId, startIdx, loadItem])

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

    if (!currentLabel) {
      message.warning('Select a label to add/edit shapes.')
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (tool === 'polygon') {
      if (!isDrawing) {
        setIsDrawing(true)
        setCurrentShape({ type: 'polygon', points: [[x, y]], label: currentLabel.labelName, color: currentLabel.color })
      } else if (currentShape && currentShape.points) {
        const points = currentShape.isPreview ? currentShape.points.slice(0, -1) : currentShape.points
        setCurrentShape({ ...currentShape, points: [...points, [x, y]], isPreview: false })
      }
      return
    }

    setIsDrawing(true)
    if (tool === 'box') {
      setCurrentShape({ type: 'bounding_box', x, y, width: 0, height: 0, startX: x, startY: y, label: currentLabel.labelName, color: currentLabel.color })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
      return
    }
    if (!isDrawing || !currentShape) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (tool === 'box' && currentShape.startX !== undefined && currentShape.startY !== undefined) {
      setCurrentShape({ ...currentShape, x: Math.min(x, currentShape.startX), y: Math.min(y, currentShape.startY), width: Math.abs(x - currentShape.startX), height: Math.abs(y - currentShape.startY) })
    }
    if (tool === 'polygon' && currentShape.points) {
      const points = [...currentShape.points]
      if (points.length > 1 && currentShape.isPreview) points[points.length - 1] = [x, y]
      else points.push([x, y])
      setCurrentShape({ ...currentShape, points, isPreview: true })
    }
  }

  const handleMouseUp = () => {
    if (isPanning) { setIsPanning(false); return }
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
      const finalPoints = currentShape.isPreview ? currentShape.points.slice(0, -1) : currentShape.points
      if (finalPoints.length >= 2) {
        setShapes([...shapes, { ...currentShape, points: finalPoints, isPreview: false }])
        setRedoStack([])
      }
      setCurrentShape(null)
      setIsDrawing(false)
    }
  }

  const handleUndo = () => {
    if (shapes.length === 0) return
    const last = shapes[shapes.length - 1]
    setShapes(shapes.slice(0, -1))
    setRedoStack(prev => [...prev, last])
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const last = redoStack[redoStack.length - 1]
    setRedoStack(redoStack.slice(0, -1))
    setShapes(prev => [...prev, last])
  }

  const setItemReviewStatus = (status: ReviewStatus) => {
    if (!currentItem) return
    const id = currentItem.itemId || (currentItem as any).id
    setReviewMap(prev => ({ ...prev, [id]: { ...prev[id], status, comment: prev[id]?.comment || '' } }))
  }

  const setItemReviewComment = (comment: string) => {
    if (!currentItem) return
    const id = currentItem.itemId || (currentItem as any).id
    setReviewMap(prev => ({ ...prev, [id]: { ...prev[id], status: prev[id]?.status || null, comment } }))
  }

  const handleItemSelect = (idx: number) => {
    if (idx < 0 || idx >= totalItems) return
    setCurrentIndex(idx)
    loadItem(dataItems[idx])
  }

  const handleSubmitReviews = async () => {
    if (!taskId) return
    try {
      setLoading(true)
      const payload: ReviewUpdateRequest = { reviews: [] }
      Object.keys(reviewMap).forEach(itemId => {
        const review = reviewMap[itemId]
        if (review.status === 'APPROVED' || review.status === 'REJECTED') {
          const dItem = dataItems.find(d => (d.itemId || (d as any).id) === itemId)
          if (dItem) {
            const rawAnns = dItem.annotationResponseList || dItem.annotations || []
            rawAnns.forEach((ann: any) => {
              payload.reviews.push({ annotationId: ann.annotationId || ann.id, reviewStatus: review.status!, comment: review.comment || undefined })
            })
          }
        }
      })
      if (payload.reviews.length === 0) {
        message.warning('Approve or reject at least one item before submitting.')
        setLoading(false); return
      }
      await reviewerApi.submitReviewDecision(payload)
      setIsSubmitted(true)
    } catch (err) {
      message.error('Failed to submit reviews.')
      console.error('Failed to submit reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4">
        <Result status="success" title={<span className="text-white font-display">Reviews Submitted!</span>}
          extra={[<Button key="dash" type="primary" onClick={() => navigate('/reviewer/review')} className="bg-violet-600 border-none rounded-lg h-10 font-bold px-6">Back to Dashboard</Button>]} />
      </div>
    )
  }

  if (loading && totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#111116] gap-4">
        <Spin size="large" />
        <span className="text-violet-400 font-mono text-sm">Loading workspace...</span>
      </div>
    )
  }

  if (error || !currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#111116] gap-4 text-white">
        <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
        <span>{error || 'No review data found.'}</span>
        <Button onClick={() => navigate(-1)} type="link" ghost className="text-violet-400 font-bold">Go Back</Button>
      </div>
    )
  }

  const currentId = currentItem.itemId || (currentItem as any).id
  const currentReview = reviewMap[currentId] || { status: null, comment: '' }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-[#111116] text-white overflow-hidden font-sans">
      <div className="absolute top-4 left-4 z-[200]">
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 flex items-center gap-2 transition text-sm font-medium shadow-xl">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Sidebar */}
        <div style={{ width: leftWidth, minWidth: 160 }} className="border-r border-white/10 overflow-y-auto custom-scrollbar flex flex-col pt-20 pb-4 shrink-0 bg-[#0d0d12]">
          <div className="flex items-center px-4 py-2 mb-2 gap-3 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <span className="w-8 text-center">REV</span>
            <span className="flex-1">THUMBNAIL</span>
          </div>
          <div className="flex-1 flex flex-col px-4 gap-4">
            {dataItems.map((item, idx) => {
              const itemId = item.itemId || (item as any).id
              const rev = reviewMap[itemId]
              const isSelected = currentIndex === idx
              let revColor = 'bg-gray-800'
              if (rev?.status === 'APPROVED') revColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              if (rev?.status === 'REJECTED') revColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
              return (
                <div key={itemId} onClick={() => handleItemSelect(idx)} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${revColor}`} />
                  <img src={item.url} alt="t" className={`w-14 h-11 object-cover rounded-md border-[2px] ${isSelected ? 'border-violet-500' : 'border-white/5'}`} />
                  <span className="text-[10px] text-gray-500 truncate flex-1 font-mono">{item.fileName}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resizer */}
        <div className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40" onMouseDown={e => { draggingRef.current = 'left'; dragStartXRef.current = e.clientX; dragStartWidthRef.current = leftWidth; e.preventDefault() }} />

        {/* Main Viewer */}
        <div className="flex-[2] flex flex-col relative overflow-hidden bg-[#111116] pt-12 pb-6 px-5 border-l-[2px] border-white/5 mx-2 my-2">
          <div className="text-left mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-violet-500/60 block mb-1">Reviewing Item</span>
              <h2 className="text-xl font-bold text-gray-100 tracking-tight truncate max-w-[70%]">{currentItem.fileName}</h2>
            </div>
            <div className="px-3 py-1 bg-violet-500/10 rounded-lg border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
              {shapes.length} Shapes
            </div>
          </div>

          <div className="flex-1 relative flex overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
            <div className="relative bg-[#0d0d12]/50 overflow-hidden flex items-center justify-center w-full h-full" onWheel={handleWheel}>
              <div className="relative transition-transform duration-200 ease-out flex items-center justify-center h-full w-full"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center' }}>
                <img src={currentItem.url} alt="main" className="max-w-full max-h-full object-contain pointer-events-none select-none" />
                <svg className={`absolute inset-0 w-full h-full ${tool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDoubleClick={finishPolygon}>
                  {shapes.map((s, i) => (
                    <g key={i}>
                      {s.type === 'bounding_box' ? <rect x={s.x} y={s.y} width={s.width} height={s.height} fill={`${s.color}33`} stroke={s.color} strokeWidth={2 / zoom} />
                        : s.type === 'polygon' && s.points ? <polyline points={s.points.map(p => p.join(',')).join(' ')} fill={`${s.color}33`} stroke={s.color} strokeWidth={2 / zoom} /> : null}
                    </g>
                  ))}
                  {currentShape && (
                    <g>
                      {currentShape.type === 'bounding_box' ? <rect x={currentShape.x} y={currentShape.y} width={currentShape.width} height={currentShape.height} fill={`${currentShape.color}66`} stroke={currentShape.color} strokeWidth={2 / zoom} />
                        : <polyline points={currentShape.points?.map(p => p.join(',')).join(' ')} fill={`${currentShape.color}66`} stroke={currentShape.color} strokeWidth={2 / zoom} />}
                    </g>
                  )}
                </svg>
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 bg-[#1A1625]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl z-20">
              <ToolbarButton icon="pan_tool" active={tool === 'pan'} onClick={() => setTool('pan')} />
              <ToolbarButton icon="zoom_in" onClick={handleZoomIn} />
              <ToolbarButton icon="zoom_out" onClick={handleZoomOut} />
              <ToolbarButton icon="restart_alt" onClick={handleZoomReset} />
              <div className="w-full h-px bg-white/5 my-1" />
              <ToolbarButton icon="crop_free" active={tool === 'box'} onClick={() => setTool('box')} />
              <ToolbarButton icon="polyline" active={tool === 'polygon'} onClick={() => setTool('polygon')} />
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <button onClick={handleUndo} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">undo</button>
              <button onClick={handleRedo} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">redo</button>
              <span className="text-xs font-mono text-gray-600 ml-4 font-bold tracking-widest">{currentIndex + 1} / {totalItems} ITEMS</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleItemSelect(currentIndex - 1)} disabled={currentIndex === 0} className="px-5 py-2 disabled:opacity-30 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">Previous</button>
              <button onClick={() => handleItemSelect(currentIndex + 1)} disabled={currentIndex === totalItems - 1} className="px-5 py-2 disabled:opacity-30 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">Next</button>
            </div>
            <button onClick={handleSubmitReviews} className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-violet-900/20 transition-all">Submit Feedback</button>
          </div>
        </div>

        <div className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40" onMouseDown={e => { draggingRef.current = 'right'; dragStartXRef.current = e.clientX; dragStartWidthRef.current = rightWidth; e.preventDefault() }} />

        {/* Right Action Panel */}
        <div style={{ width: rightWidth, minWidth: 200 }} className="border-l border-white/10 px-8 py-10 flex flex-col gap-8 overflow-y-auto custom-scrollbar bg-[#0d0d12] shrink-0">
          <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-violet-400">rate_review</span>
            </div>
            <div><h3 className="text-sm font-bold text-gray-100 italic">Review Decision</h3><span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-600 tracking-widest">Decision Center</span></div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Decision</span>
            <div className="flex gap-3">
              <button onClick={() => { setItemReviewStatus('APPROVED'); if (currentIndex < totalItems - 1) handleItemSelect(currentIndex + 1); }}
                className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-[2px] transition-all font-bold ${currentReview.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="text-[10px] uppercase tracking-widest">Approve</span>
              </button>
              <button onClick={() => setItemReviewStatus('REJECTED')}
                className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-[2px] transition-all font-bold ${currentReview.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                <span className="text-[10px] uppercase tracking-widest">Reject</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Labels (Active Label)</span>
            <div className="flex flex-wrap gap-2">
              {labels.map(l => (
                <button key={l.labelId} onClick={() => setCurrentLabel(l)} className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${currentLabel?.labelId === l.labelId ? 'border-violet-500 bg-violet-500/20 text-white' : 'border-white/5 bg-white/5 text-gray-500 hover:text-gray-300'}`} style={{ borderColor: currentLabel?.labelId === l.labelId ? l.color : 'transparent' }}>{l.labelName}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Review Comments</span>
            <textarea value={currentReview.comment} onChange={(e) => setItemReviewComment(e.target.value)} placeholder="Provide feedback..."
              className={`w-full h-32 rounded-2xl border p-5 text-sm text-gray-300 focus:outline-none transition-all resize-none shadow-inner ${currentReview.status === 'REJECTED' ? 'bg-rose-500/5 border-rose-500/20 focus:border-rose-500/50' : 'bg-[#111116] border-white/5 focus:border-violet-500/30'}`} />
          </div>

          <div className="mt-auto glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-gray-600 uppercase">Progress</span>
              <span className="text-violet-400 font-bold">{Object.values(reviewMap).filter(r => r.status).length} / {totalItems}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${(Object.values(reviewMap).filter(r => r.status).length / totalItems) * 100}%` }} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ icon, active = false, onClick }: { icon: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-11 h-11 flex items-center justify-center transition-all cursor-pointer rounded-xl border-2 ${active ? 'bg-violet-600/20 text-violet-400 border-violet-500/50 shadow-lg shadow-violet-500/20' : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}
