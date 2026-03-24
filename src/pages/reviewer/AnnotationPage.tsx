import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Spin, Result, Button, message } from 'antd'
import taskApi from '@/api/TaskApi'
import { reviewerApi, type ReviewUpdateRequest } from '@/api/ReviewerApi'

interface Shape {
  annotationId?: string
  type: 'bounding_box' | 'polygon' | 'point'
  x?: number
  y?: number
  width?: number
  height?: number
  points?: [number, number][]
  label: string
  color: string
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
  const msg = message

  // Get starting index from state if passed
  const state = location.state as { startIndex?: number; assignmentId?: string } | null
  const startIdx = state?.startIndex || 0
  // const assignmentId = state?.assignmentId

  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(startIdx)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Zoom and Pan States
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [tool] = useState<'pan'>('pan')
  
  // Current Item specific shapes (ReadOnly in review mode)
  const [shapes, setShapes] = useState<Shape[]>([])

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

  const parseAnnotations = (item: DataItem | undefined): Shape[] => {
    if (!item) return []
    const rawAnns = item.annotationResponseList || item.annotations || []
    return rawAnns.map((ann: any) => {
      let parsedBbox: any = null
      let parsedPoints: any = null
      // let shapeType: Shape['type'] = 'bounding_box'
      
      try {
        const rawData = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : ann.annotationData || {}
        if (rawData.shapes && rawData.shapes.length > 0) {
           return rawData.shapes.map((s: any) => ({
             ...s,
             annotationId: ann.annotationId || ann.id
           }))
        }
        if (rawData.bbox) parsedBbox = rawData.bbox
        if (rawData.points) parsedPoints = rawData.points
        // if (ann.annotationType === 'POLYGON') shapeType = 'polygon'
      } catch (e) {
        // fail silently for parse
      }

      const returnedShapes = []
      // Fallback single shape mapping if not array of shapes
      if (parsedBbox) {
         returnedShapes.push({
           annotationId: ann.annotationId || ann.id,
           type: 'bounding_box' as const,
           x: parsedBbox.x,
           y: parsedBbox.y,
           width: parsedBbox.w || parsedBbox.width,
           height: parsedBbox.h || parsedBbox.height,
           label: ann.labelName || 'Unknown',
           color: '#8b5cf6'
         })
      } else if (parsedPoints) {
         returnedShapes.push({
           annotationId: ann.annotationId || ann.id,
           type: 'polygon' as const,
           points: parsedPoints,
           label: ann.labelName || 'Unknown',
           color: '#f43f5e'
         })
      }
      return returnedShapes.length > 0 ? returnedShapes : [{
        annotationId: ann.annotationId || ann.id,
        type: 'bounding_box' as const,
        x: 10, y: 10, width: 50, height: 50,
        label: ann.labelName || 'Unknown',
        color: '#6366f1'
      }]
    }).flat()
  }

  const loadItem = useCallback((item: DataItem | undefined) => {
    if (!item) return
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setShapes(parseAnnotations(item))
  }, [])

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return
      setLoading(true)
      try {
        const taskRes = await taskApi.getTaskById(taskId)
        let items = taskRes.data?.data || taskRes.data || []
        
        // If items are not returned directly, perhaps they are inside taskDataItems?
        if (!Array.isArray(items) && items.taskDataItems) {
            items = items.taskDataItems.map((tdi: any) => ({
                ...tdi.dataItem,
                taskDataItemStatus: tdi.taskDataItemStatus,
                taskItemId: tdi.id
            }))
        } else if (!Array.isArray(items)) {
            // Default fallback if we only got the task obj
            const itemsRes = await taskApi.getTaskDataItems(taskId)
            const itmList = itemsRes.data?.data || itemsRes.data || []
            items = itmList.map((tdi: any) => ({ ...tdi.dataItem, ...tdi }))
        }

        setDataItems(items)

        if (items.length > 0) {
            const safeIdx = startIdx >= 0 && startIdx < items.length ? startIdx : 0
            setCurrentIndex(safeIdx)
            loadItem(items[safeIdx])
        }
      } catch (err) {
        console.error('Failed to load annotation data:', err)
        setError('Failed to load task data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [taskId, startIdx, loadItem])

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
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
    }
  }

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false)
  }

  const setItemReviewStatus = (status: ReviewStatus) => {
    if (!currentItem) return
    const id = currentItem.itemId || (currentItem as any).id
    setReviewMap(prev => ({
        ...prev,
        [id]: { ...prev[id], status, comment: prev[id]?.comment || '' }
    }))
  }

  const setItemReviewComment = (comment: string) => {
    if (!currentItem) return
    const id = currentItem.itemId || (currentItem as any).id
    setReviewMap(prev => ({
        ...prev,
        [id]: { ...prev[id], status: prev[id]?.status || null, comment }
    }))
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

      // Map through reviewMap to create reviews array
      Object.keys(reviewMap).forEach(itemId => {
         const review = reviewMap[itemId]
         if (review.status === 'APPROVED' || review.status === 'REJECTED') {
             // Find the dataItem
             const dItem = dataItems.find(d => (d.itemId || (d as any).id) === itemId)
             if (dItem) {
                 const rawAnns = dItem.annotationResponseList || dItem.annotations || []
                 rawAnns.forEach((ann: any) => {
                    payload.reviews.push({
                       annotationId: ann.annotationId || ann.id,
                       reviewStatus: review.status!,
                       comment: review.comment || undefined
                    })
                 })
             }
         }
      })

      if (payload.reviews.length === 0) {
        msg.warning('No reviews to submit (must approve or reject at least one task item)')
        setLoading(false)
        return
      }

      await reviewerApi.submitReviewDecision(payload)
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Failed to submit reviews.')
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4 animate-in fade-in duration-500">
        <Result
          status="success"
          title={<span className="text-white">Reviews Submitted Successfully!</span>}
          subTitle={<span className="text-gray-400">Your review decisions have been recorded.</span>}
          extra={[
            <Button
              key="back-to-assignment-btn"
              type="primary"
              onClick={() => navigate('/reviewer/review')}
              className="bg-violet-600 hover:bg-violet-500 border-none px-6 h-10 font-bold rounded-lg"
            >
              Back to Dashboard
            </Button>
          ]}
        />
      </div>
    )
  }

  if (loading && totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4">
        <Spin size="large" />
        <span className="text-violet-400 font-mono text-sm animate-pulse">
          Loading reviewer workspace...
        </span>
      </div>
    )
  }

  if (error || !currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4">
        <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
        <span className="text-gray-300 font-medium">{error || 'No review data found.'}</span>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-bold"
        >
          Go Back
        </button>
      </div>
    )
  }

  const currentId = currentItem.itemId || (currentItem as any).id
  const currentReview = reviewMap[currentId] || { status: null, comment: '' }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-[#111116] text-white overflow-hidden font-sans">
      {/* Top action layout */}
      <div className="absolute top-4 left-4 z-[200]">
        <button
           onClick={() => navigate(-1)}
           className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 flex items-center gap-2 transition text-sm font-medium shadow-xl absolute top-4 left-4 cursor-pointer group"
        >
           <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
           <span>Back</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        
        {/* Left Column: Thumbnail List */}
        <div style={{ width: leftWidth, minWidth: 160 }} className="border-r border-white/10 overflow-y-auto custom-scrollbar flex flex-col pt-20 pb-4 shrink-0 transition-all">
          <div className="flex items-center px-2 py-2 border-b border-white/10 mx-4 mb-2 gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span className="w-10 shrink-0 text-center">Rev</span>
            <span className="w-16 shrink-0 text-center">Img</span>
            <span className="flex-1">Data</span>
          </div>
          
          <div className="flex-1 flex flex-col px-4 gap-4">
            {dataItems.map((item, idx) => {
              const itemId = item.itemId || (item as any).id
              const rev = reviewMap[itemId]
              const shapeCount = parseAnnotations(item).length
              const isSelected = currentIndex === idx

              let revColor = 'bg-gray-600/60'
              if (rev?.status === 'APPROVED') revColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              if (rev?.status === 'REJECTED') revColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'

              return (
                <div 
                  key={itemId}
                  onClick={() => handleItemSelect(idx)}
                  className={`flex items-center gap-3 cursor-pointer transition-all rounded-lg px-2 py-1.5 ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="w-10 shrink-0 flex justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${revColor}`} />
                  </div>

                  <div className="relative shrink-0 w-16">
                    <img
                      src={item.url || item.fileName || 'https://via.placeholder.com/150'}
                      alt={item.fileName}
                      className={`w-16 h-12 object-cover rounded-md bg-black/50 border-[2px] ${isSelected ? 'border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'border-white/10'}`}
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/10 bg-black/70 text-gray-400">
                      {shapeCount}
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-gray-500 truncate" title={item.fileName}>
                       {item.fileName}
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

        {/* Middle Viewer */}
        <div className="flex-[2] flex flex-col relative overflow-hidden bg-[#111116] pt-12 pb-6 px-5 border-l-[2px] border-white/5 mx-2 my-2">
          
          <div className="text-left mb-3 flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-200 tracking-wide">
              Reviewing: {currentItem.fileName}
            </h2>
            <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono text-gray-400">
               {shapes.length} Annotations
            </div>
          </div>

          <div className="flex-1 relative flex">
             <div
               className="relative shadow-2xl transition-transform duration-200 ease-out will-change-transform bg-[#1e293b]/50 overflow-hidden flex items-center justify-center w-full h-full mx-auto border-[1px] border-gray-600/80 shadow-[0_0_30px_rgba(96,165,250,0.15)]"
               onWheel={handleWheel}
             >
                <div
                    className="relative transition-transform duration-200 ease-out will-change-transform flex items-center justify-center h-full w-full"
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center' }}
                >
                  <img src={currentItem.url || currentItem.fileName || ''} alt={currentItem.fileName} className="max-w-full max-h-full object-contain pointer-events-none select-none" />
                  
                  <svg
                    className="absolute inset-0 w-full h-full cursor-grab"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {shapes.map((shape, i) => (
                      <g key={`shape-${i}`}>
                        {shape.type === 'bounding_box' ? (
                          <rect
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={`${shape.color || '#8b5cf6'}33`}
                            stroke={shape.color || '#8b5cf6'}
                            strokeWidth={3 / zoom}
                          />
                        ) : shape.type === 'polygon' && shape.points ? (
                          <polyline
                            points={shape.points.map((p: [number, number]) => p.join(',')).join(' ')}
                            fill={`${shape.color || '#f43f5e'}33`}
                            stroke={shape.color || '#f43f5e'}
                            strokeWidth={3 / zoom}
                          />
                        ) : null}
                      </g>
                    ))}
                  </svg>
                </div>
             </div>

             <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-[#1e1b29] px-1.5 py-3 rounded-xl shadow-2xl border border-violet-500/20 z-20" style={{ right: '20px' }}>
                <ToolbarButton icon="pan_tool" active={tool === 'pan'} />
                <ToolbarButton icon="zoom_in" onClick={handleZoomIn} />
                <ToolbarButton icon="zoom_out" onClick={handleZoomOut} />
                <ToolbarButton icon="restart_alt" onClick={handleZoomReset} />
             </div>
          </div>

          {/* Bottom Navigation Navbar */}
          <div className="mt-8 border-t border-white/10 pt-5 flex w-full items-center justify-between gap-4">
            <div className="flex">
               <span className="text-xs font-mono text-gray-500">item {currentIndex + 1} / {totalItems}</span>
            </div>
            
            <div className="flex gap-2">
               <button onClick={() => handleItemSelect(currentIndex - 1)} disabled={currentIndex === 0} className="px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all cursor-pointer">Previous</button>
               <button onClick={() => handleItemSelect(currentIndex + 1)} disabled={currentIndex === totalItems - 1} className="px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all cursor-pointer">Next</button>
            </div>
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

        {/* Right Column: Review Action Panel */}
        <div style={{ width: rightWidth, minWidth: 200 }} className="border-l border-white/5 px-6 py-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-[#16161a] shrink-0">

           <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-4">
             <span className="material-symbols-outlined text-[20px] text-violet-400">verified</span>
             <h3 className="text-sm font-bold uppercase tracking-widest text-gray-200">Review Panel</h3>
           </div>

           <div className="flex flex-col gap-4">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px] text-gray-400">rule</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Decision</span>
               </div>
               
               <div className="flex gap-2 w-full">
                  <button
                     onClick={() => {
                         setItemReviewStatus('APPROVED')
                         if (currentIndex < totalItems - 1) handleItemSelect(currentIndex + 1)
                     }}
                     className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border-[2px] transition-all font-bold text-sm ${
                         currentReview.status === 'APPROVED' 
                           ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                           : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                     }`}
                  >
                     <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                     Approve
                  </button>

                  <button
                     onClick={() => setItemReviewStatus('REJECTED')}
                     className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border-[2px] transition-all font-bold text-sm ${
                         currentReview.status === 'REJECTED' 
                           ? 'bg-rose-500/20 text-rose-400 border-rose-500' 
                           : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                     }`}
                  >
                     <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                     Reject
                  </button>
               </div>
           </div>

           {currentReview.status === 'REJECTED' && (
             <div className="flex flex-col gap-3 mt-2 animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px] text-amber-400">chat_error</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Rejection Reason</span>
               </div>
               <textarea
                  value={currentReview.comment}
                  onChange={(e) => setItemReviewComment(e.target.value)}
                  placeholder="Explain why this annotation is rejected..."
                  className="w-full h-28 bg-rose-500/5 rounded-xl border border-rose-500/20 p-3 text-sm text-gray-200 focus:outline-none focus:border-rose-500/50 transition-colors resize-none placeholder-rose-400/30"
               />
             </div>
           )}

           {(currentReview.status === 'APPROVED' || currentReview.status === null) && (
             <div className="flex flex-col gap-3 mt-2">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px] text-gray-500">comment</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Optional Note</span>
               </div>
               <textarea
                  value={currentReview.comment}
                  onChange={(e) => setItemReviewComment(e.target.value)}
                  placeholder="Leave a comment..."
                  className="w-full h-24 bg-white/5 rounded-xl border border-white/10 p-3 text-sm text-gray-300 focus:outline-none focus:border-violet-500/50 transition-colors resize-none placeholder-gray-600"
               />
             </div>
           )}

           <div className="mt-auto pt-6 flex flex-col gap-3">
              <div className="text-xs font-mono text-gray-500 text-center mb-2">
                  {Object.values(reviewMap).filter(r => r.status).length} / {totalItems} items reviewed
              </div>
              <button
                onClick={handleSubmitReviews}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-violet-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Submit All Reviews
              </button>
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
          w-9 h-9 flex items-center justify-center transition-all cursor-pointer rounded-lg border
          ${active ? 'bg-violet-600/20 text-violet-400 border-violet-500/50 shadow-lg shadow-violet-500/20' : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/10'}
      `}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  )
}
