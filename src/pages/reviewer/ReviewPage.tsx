// import React, { useState, useEffect, useCallback, useRef } from 'react'
// import { useParams, useNavigate, useLocation } from 'react-router-dom'
// import { Spin, message, Result, Button } from 'antd'
// import taskApi, { type TaskDataItem } from '@/api/TaskApi'
// import annotationApi from '@/api/annotation'
// import { reviewerApi, type ReviewUpdateRequest, type Annotation as ReviewAnnotation } from '@/api/ReviewerApi'
// import assignmentApi from '@/api/AssignmentApi'

// interface Shape {
//   annotationId?: string
//   type: 'bounding_box' | 'polygon' | 'point'
//   x?: number
//   y?: number
//   width?: number
//   height?: number
//   startX?: number
//   startY?: number
//   points?: [number, number][]
//   label: string
//   color: string
//   isPreview?: boolean
// }

// interface Label {
//   labelId: string
//   labelName: string
//   color: string
//   description?: string
// }

// interface DataItem extends TaskDataItem {
//   itemId: string
//   assignmentId?: string
//   taskDataItemStatus?: string
//   taskItemId?: string
//   annotationResponseList?: ReviewAnnotation[]
//   annotations?: ReviewAnnotation[]
// }

// type ReviewStatus = 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'INACTIVE' | null

// interface ReviewSessionData {
//   status: ReviewStatus
//   comment: string
// }

// const ReviewerAnnotationPage: React.FC = () => {
//   const { taskId } = useParams<{ taskId: string }>()
//   const navigate = useNavigate()
//   const location = useLocation()

//   // Get starting index and assignmentId from state if passed
//   const state = location.state as { startIndex?: number; assignmentId?: string } | null
//   const startIdx = state?.startIndex || 0
//   const assignmentId = state?.assignmentId

//   const [dataItems, setDataItems] = useState<DataItem[]>([])
//   const [labels, setLabels] = useState<Label[]>([])
//   const [currentIndex, setCurrentIndex] = useState(startIdx)

//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [isSubmitted, setIsSubmitted] = useState(false)

//   // Zoom and Pan States
//   const [zoom, setZoom] = useState(1)
//   const [offset, setOffset] = useState({ x: 0, y: 0 })
//   const [isPanning, setIsPanning] = useState(false)
//   const [panStart, setPanStart] = useState({ x: 0, y: 0 })
//   const [tool, setTool] = useState<'pan' | 'box' | 'polygon'>('pan')

//   // Current Item specific shapes
//   const [shapes, setShapes] = useState<Shape[]>([])
//   const [currentShape, setCurrentShape] = useState<Shape | null>(null)
//   const [isDrawing, setIsDrawing] = useState(false)
//   const [redoStack, setRedoStack] = useState<Shape[]>([])
//   const [currentLabel, setCurrentLabel] = useState<Label | null>(null)

//   // Resizable sidebars
//   const [leftWidth, setLeftWidth] = useState(260)
//   const [rightWidth, setRightWidth] = useState(320)
//   const draggingRef = useRef<'left' | 'right' | null>(null)
//   const dragStartXRef = useRef(0)
//   const dragStartWidthRef = useRef(0)

//   // Review states per data item
//   const [reviewMap, setReviewMap] = useState<Record<string, ReviewSessionData>>({})

//   useEffect(() => {
//     const onMouseMove = (e: MouseEvent) => {
//       if (!draggingRef.current) return
//       const delta = e.clientX - dragStartXRef.current
//       if (draggingRef.current === 'left') {
//         setLeftWidth(Math.max(160, Math.min(500, dragStartWidthRef.current + delta)))
//       } else {
//         setRightWidth(Math.max(200, Math.min(600, dragStartWidthRef.current - delta)))
//       }
//     }
//     const onMouseUp = () => { draggingRef.current = null; document.body.style.cursor = '' }
//     document.addEventListener('mousemove', onMouseMove)
//     document.addEventListener('mouseup', onMouseUp)
//     return () => {
//       document.removeEventListener('mousemove', onMouseMove)
//       document.removeEventListener('mouseup', onMouseUp)
//     }
//   }, [])

//   const parseAnnotations = useCallback((item: DataItem | undefined): Shape[] => {
//     if (!item) return []
//     const rawAnns = item.annotationResponseList || item.annotations || []
//     return rawAnns.map((ann: ReviewAnnotation) => {
//       try {
//         const rawData = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : ann.annotationData || {}
//         if (rawData.shapes && Array.isArray(rawData.shapes)) {
//           return (rawData.shapes as { type: string; label: string; color: string; [key: string]: unknown }[]).map((s) => ({
//             ...s,
//             type: s.type as Shape['type'], // refined cast
//             label: s.label,
//             color: s.color,
//             annotationId: ann.annotationId
//           }))
//         }
//         if (rawData.bbox) {
//           const bbox = rawData.bbox as { x: number; y: number; w?: number; width?: number; h?: number; height?: number }
//           return [{
//             annotationId: ann.annotationId,
//             type: 'bounding_box' as const,
//             x: bbox.x,
//             y: bbox.y,
//             width: bbox.w || bbox.width,
//             height: bbox.h || bbox.height,
//             label: 'Labeled Object',
//             color: '#8b5cf6'
//           }]
//         }
//       } catch (err) {
//         console.error('Failed to parse annotation:', err)
//       }
//       return []
//     }).flat()
//   }, [])

//   const loadItem = useCallback((item: DataItem | undefined) => {
//     if (!item) return
//     setZoom(1)
//     setOffset({ x: 0, y: 0 })
//     setIsDrawing(false)
//     setCurrentShape(null)
//     setRedoStack([])
//     const loadedShapes = parseAnnotations(item)
//     setShapes(loadedShapes)
//   }, [parseAnnotations])

//   useEffect(() => {
//     async function fetchData() {
//       if (!taskId) return
//       setLoading(true)
//       try {
//         const taskRes = await taskApi.getTaskDataItems(taskId)
//         const rawItems = (taskRes.data?.data || taskRes.data || []) as unknown[]
//         const items: DataItem[] = Array.isArray(rawItems)
//           ? rawItems.map((tdi: unknown) => {
//             const item = tdi as Record<string, unknown>
//             const dataItem = (item.dataItem || {}) as Record<string, unknown>
//             return {
//               ...dataItem,
//               itemId: (item.dataItemId as string) || (item.dataitemId as string) || (item.id as string) || '',
//               taskDataItemStatus: item.taskDataItemStatus as string,
//               taskItemId: (item.id as string) || (item.taskItemId as string) || '',
//               filename: (dataItem.fileName as string) || (item.filename as string) || 'Unknown',
//               annotationResponseList: (item.annotationResponseList || item.annotations || []) as ReviewAnnotation[]
//             } as DataItem
//           })
//           : []

//         let effectiveAssignmentId = assignmentId
//         if (!effectiveAssignmentId && items.length > 0) {
//           effectiveAssignmentId = (items[0] as DataItem).assignmentId
//         }

//         if (effectiveAssignmentId) {
//           try {
//             const labelsRes = await assignmentApi.getLabelsByAssignmentId(effectiveAssignmentId)
//             const labelsData = labelsRes.data?.data || labelsRes.data || []
//             if (Array.isArray(labelsData)) {
//               const normLabels = labelsData.map((l: any) => ({
//                 ...l,
//                 labelId: l.labelId || l.id,
//                 labelName: l.labelName || l.name,
//                 color: l.color || '#8b5cf6'
//               }))
//               setLabels(normLabels)
//               if (normLabels.length > 0) setCurrentLabel(normLabels[0])
//             }
//           } catch (labelErr) {
//             console.error('Failed to load labels:', labelErr)
//           }
//         }

//         const enrichedItems = await Promise.all(
//           items.map(async (item: DataItem) => {
//             try {
//               const annoRes = await annotationApi.getAnnotationByDataItemId(item.itemId)
//               const annoData = annoRes.data?.data || annoRes.data
//               if (annoData) {
//                 const annos = (Array.isArray(annoData) ? annoData : [annoData]) as ReviewAnnotation[]
//                 return { ...item, annotationResponseList: annos, annotations: annos }
//               }
//             } catch (err) {
//               console.error('Failed to load annotation:', err)
//             }
//             return item
//           })
//         )

//         setDataItems(enrichedItems)
//         if (enrichedItems.length > 0) {
//           const safeIdx = startIdx >= 0 && startIdx < enrichedItems.length ? startIdx : 0
//           setCurrentIndex(safeIdx)
//           loadItem(enrichedItems[safeIdx])
//         }
//       } catch (err) {
//         setError('Failed to load task data. Please try again.')
//         console.error('Failed to load task data:', err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchData()
//   }, [taskId, assignmentId, startIdx, loadItem])

//   const currentItem = dataItems[currentIndex]
//   const totalItems = dataItems.length

//   const handleWheel = (e: React.WheelEvent) => {
//     const delta = e.deltaY > 0 ? -0.1 : 0.1
//     setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 10))
//   }

//   const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 10))
//   const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))
//   const handleZoomReset = () => {
//     setZoom(1)
//     setOffset({ x: 0, y: 0 })
//   }

//   const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
//     if (tool === 'pan') {
//       setIsPanning(true)
//       setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
//       return
//     }

//     if (!currentLabel) {
//       message.warning('Select a label to add/edit shapes.')
//       return
//     }

//     const rect = e.currentTarget.getBoundingClientRect()
//     const x = (e.clientX - rect.left) / zoom
//     const y = (e.clientY - rect.top) / zoom

//     if (tool === 'polygon') {
//       if (!isDrawing) {
//         setIsDrawing(true)
//         setCurrentShape({ type: 'polygon', points: [[x, y]], label: currentLabel.labelName, color: currentLabel.color })
//       } else if (currentShape && currentShape.points) {
//         const points = currentShape.isPreview ? currentShape.points.slice(0, -1) : currentShape.points
//         setCurrentShape({ ...currentShape, points: [...points, [x, y]], isPreview: false })
//       }
//       return
//     }

//     setIsDrawing(true)
//     if (tool === 'box') {
//       setCurrentShape({ type: 'bounding_box', x, y, width: 0, height: 0, startX: x, startY: y, label: currentLabel.labelName, color: currentLabel.color })
//     }
//   }

//   const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
//     if (isPanning) {
//       setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
//       return
//     }
//     if (!isDrawing || !currentShape) return
//     const rect = e.currentTarget.getBoundingClientRect()
//     const x = (e.clientX - rect.left) / zoom
//     const y = (e.clientY - rect.top) / zoom

//     if (tool === 'box' && currentShape.startX !== undefined && currentShape.startY !== undefined) {
//       setCurrentShape({ ...currentShape, x: Math.min(x, currentShape.startX), y: Math.min(y, currentShape.startY), width: Math.abs(x - currentShape.startX), height: Math.abs(y - currentShape.startY) })
//     }
//     if (tool === 'polygon' && currentShape.points) {
//       const points = [...currentShape.points]
//       if (points.length > 1 && currentShape.isPreview) points[points.length - 1] = [x, y]
//       else points.push([x, y])
//       setCurrentShape({ ...currentShape, points, isPreview: true })
//     }
//   }

//   const handleMouseUp = () => {
//     if (isPanning) { setIsPanning(false); return }
//     if (!isDrawing || tool === 'polygon') return
//     setIsDrawing(false)
//     if (currentShape) {
//       setShapes([...shapes, currentShape])
//       setRedoStack([])
//       setCurrentShape(null)
//     }
//   }

//   const finishPolygon = () => {
//     if (tool === 'polygon' && currentShape && currentShape.points) {
//       const finalPoints = currentShape.isPreview ? currentShape.points.slice(0, -1) : currentShape.points
//       if (finalPoints.length >= 2) {
//         setShapes([...shapes, { ...currentShape, points: finalPoints, isPreview: false }])
//         setRedoStack([])
//       }
//       setCurrentShape(null)
//       setIsDrawing(false)
//     }
//   }

//   const handleUndo = () => {
//     if (shapes.length === 0) return
//     const last = shapes[shapes.length - 1]
//     setShapes(shapes.slice(0, -1))
//     setRedoStack(prev => [...prev, last])
//   }

//   const handleRedo = () => {
//     if (redoStack.length === 0) return
//     const last = redoStack[redoStack.length - 1]
//     setRedoStack(redoStack.slice(0, -1))
//     setShapes(prev => [...prev, last])
//   }

//   const setItemReviewStatus = (status: ReviewStatus) => {
//     if (!currentItem) return
//     const id = currentItem.itemId
//     setReviewMap(prev => ({ ...prev, [id]: { ...prev[id], status, comment: prev[id]?.comment || '' } }))
//   }

//   const setItemReviewComment = (comment: string) => {
//     if (!currentItem) return
//     const id = currentItem.itemId
//     setReviewMap(prev => ({ ...prev, [id]: { ...prev[id], status: prev[id]?.status || null, comment } }))
//   }

//   const handleItemSelect = (idx: number) => {
//     if (idx < 0 || idx >= totalItems) return
//     setCurrentIndex(idx)
//     loadItem(dataItems[idx])
//   }

//   const handleSubmitReviews = async () => {
//     if (!taskId) return
//     try {
//       setLoading(true)
//       const payload: ReviewUpdateRequest = { reviews: [] }
//       Object.keys(reviewMap).forEach(itemId => {
//         const review = reviewMap[itemId]
//         if (review.status === 'APPROVED' || review.status === 'REJECTED') {
//           const dItem = dataItems.find(d => d.itemId === itemId)
//           if (dItem) {
//             const rawAnns = (dItem.annotationResponseList || dItem.annotations || []) as ReviewAnnotation[]
//             rawAnns.forEach((ann: ReviewAnnotation) => {
//               payload.reviews.push({
//                 annotationId: ann.annotationId,
//                 reviewStatus: review.status as 'APPROVED' | 'REJECTED',
//                 comment: review.comment || undefined
//               })
//             })
//           }
//         }
//       })
//       if (payload.reviews.length === 0) {
//         message.warning('Approve or reject at least one item before submitting.')
//         setLoading(false); return
//       }
//       await reviewerApi.submitReviewDecision(payload)
//       setIsSubmitted(true)
//     } catch (err) {
//       message.error('Failed to submit reviews.')
//       console.error('Failed to submit reviews:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (isSubmitted) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-[#0f0e17] gap-4">
//         <Result status="success" title={<span className="text-white font-display">Reviews Submitted!</span>}
//           extra={[<Button key="dash" type="primary" onClick={() => navigate('/reviewer/review')} className="bg-violet-600 border-none rounded-lg h-10 font-bold px-6">Back to Dashboard</Button>]} />
//       </div>
//     )
//   }

//   if (loading && totalItems === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-[#111116] gap-4">
//         <Spin size="large" />
//         <span className="text-violet-400 font-mono text-sm">Loading workspace...</span>
//       </div>
//     )
//   }

//   if (error || !currentItem) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-[#111116] gap-4 text-white">
//         <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
//         <span>{error || 'No review data found.'}</span>
//         <Button onClick={() => navigate(-1)} type="link" ghost className="text-violet-400 font-bold">Go Back</Button>
//       </div>
//     )
//   }

//   const currentId = currentItem.itemId
//   const currentReview = reviewMap[currentId] || { status: null, comment: '' }

//   return (
//     <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-[#111116] text-white overflow-hidden font-sans">
//       <div className="absolute top-4 left-4 z-[200]">
//         <button onClick={() => navigate(-1)} className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 flex items-center gap-2 transition text-sm font-medium shadow-xl">
//           <span className="material-symbols-outlined text-[16px]">arrow_back</span>
//           <span>Back</span>
//         </button>
//       </div>

//       <div className="flex flex-1 overflow-hidden h-full">
//         {/* Left Sidebar */}
//         <div style={{ width: leftWidth, minWidth: 160 }} className="border-r border-white/10 overflow-y-auto custom-scrollbar flex flex-col pt-20 pb-4 shrink-0 bg-[#0d0d12]">
//           <div className="flex items-center px-4 py-2 mb-2 gap-3 text-[10px] font-black uppercase tracking-widest text-gray-600">
//             <span className="w-8 text-center">REV</span>
//             <span className="flex-1">THUMBNAIL</span>
//           </div>
//           <div className="flex-1 flex flex-col px-4 gap-4">
//             {dataItems.map((item, idx) => {
//               const itemId = item.itemId
//               const rev = reviewMap[itemId]
//               const isSelected = currentIndex === idx
//               let revColor = 'bg-gray-800'
//               if (rev?.status === 'APPROVED') revColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
//               if (rev?.status === 'REJECTED') revColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
//               return (
//                 <div key={itemId} onClick={() => handleItemSelect(idx)} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}>
//                   <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${revColor}`} />
//                   <img src={item.url} alt="t" className={`w-14 h-11 object-cover rounded-md border-[2px] ${isSelected ? 'border-violet-500' : 'border-white/5'}`} />
//                   <span className="text-[10px] text-gray-500 truncate flex-1 font-mono">{item.filename}</span>
//                 </div>
//               )
//             })}
//           </div>
//         </div>

//         {/* Resizer */}
//         <div className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40" onMouseDown={e => { draggingRef.current = 'left'; dragStartXRef.current = e.clientX; dragStartWidthRef.current = leftWidth; e.preventDefault() }} />

//         {/* Main Viewer */}
//         <div className="flex-[2] flex flex-col relative overflow-hidden bg-[#111116] pt-12 pb-6 px-5 border-l-[2px] border-white/5 mx-2 my-2">
//           <div className="text-left mb-4 flex items-center justify-between">
//             <div>
//               <span className="text-[10px] font-black tracking-widest uppercase text-violet-500/60 block mb-1">Reviewing Item</span>
//               <h2 className="text-xl font-bold text-gray-100 tracking-tight truncate max-w-[70%]">{currentItem.filename}</h2>
//             </div>
//             <div className="px-3 py-1 bg-violet-500/10 rounded-lg border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
//               {shapes.length} Shapes
//             </div>
//           </div>

//           <div className="flex-1 relative flex overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
//             <div className="relative bg-[#0d0d12]/50 overflow-hidden flex items-center justify-center w-full h-full" onWheel={handleWheel}>
//               <div className="relative transition-transform duration-200 ease-out flex items-center justify-center h-full w-full"
//                 style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center' }}>
//                 <img src={currentItem.url} alt="main" className="max-w-full max-h-full object-contain pointer-events-none select-none" />
//                 <svg className={`absolute inset-0 w-full h-full ${tool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDoubleClick={finishPolygon}>
//                   {shapes.map((s, i) => (
//                     <g key={i}>
//                       {s.type === 'bounding_box' ? <rect x={s.x} y={s.y} width={s.width} height={s.height} fill={`${s.color}33`} stroke={s.color} strokeWidth={2 / zoom} />
//                         : s.type === 'polygon' && s.points ? <polyline points={(s.points as [number, number][]).map(p => p.join(',')).join(' ')} fill={`${s.color}33`} stroke={s.color} strokeWidth={2 / zoom} /> : null}
//                     </g>
//                   ))}
//                   {currentShape && (
//                     <g>
//                       {currentShape.type === 'bounding_box' ? <rect x={currentShape.x} y={currentShape.y} width={currentShape.width} height={currentShape.height} fill={`${currentShape.color}66`} stroke={currentShape.color} strokeWidth={2 / zoom} />
//                         : <polyline points={(currentShape.points as [number, number][])?.map(p => p.join(',')).join(' ')} fill={`${currentShape.color}66`} stroke={currentShape.color} strokeWidth={2 / zoom} />}
//                     </g>
//                   )}
//                 </svg>
//               </div>
//             </div>
//             <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 bg-[#1A1625]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl z-20">
//               <ToolbarButton icon="pan_tool" active={tool === 'pan'} onClick={() => setTool('pan')} />
//               <ToolbarButton icon="zoom_in" onClick={handleZoomIn} />
//               <ToolbarButton icon="zoom_out" onClick={handleZoomOut} />
//               <ToolbarButton icon="restart_alt" onClick={handleZoomReset} />
//               <div className="w-full h-px bg-white/5 my-1" />
//               <ToolbarButton icon="crop_free" active={tool === 'box'} onClick={() => setTool('box')} />
//               <ToolbarButton icon="polyline" active={tool === 'polygon'} onClick={() => setTool('polygon')} />
//             </div>
//           </div>

//           <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between">
//             <div className="flex gap-2 items-center">
//               <button onClick={handleUndo} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">undo</button>
//               <button onClick={handleRedo} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">redo</button>
//               <span className="text-xs font-mono text-gray-600 ml-4 font-bold tracking-widest">{currentIndex + 1} / {totalItems} ITEMS</span>
//             </div>
//             <div className="flex gap-3">
//               <button onClick={() => handleItemSelect(currentIndex - 1)} disabled={currentIndex === 0} className="px-5 py-2 disabled:opacity-30 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">Previous</button>
//               <button onClick={() => handleItemSelect(currentIndex + 1)} disabled={currentIndex === totalItems - 1} className="px-5 py-2 disabled:opacity-30 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">Next</button>
//             </div>
//             <button onClick={handleSubmitReviews} className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-violet-900/20 transition-all">Submit Feedback</button>
//           </div>
//         </div>

//         <div className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40" onMouseDown={e => { draggingRef.current = 'right'; dragStartXRef.current = e.clientX; dragStartWidthRef.current = rightWidth; e.preventDefault() }} />

//         {/* Right Action Panel */}
//         <div style={{ width: rightWidth, minWidth: 200 }} className="border-l border-white/10 px-8 py-10 flex flex-col gap-8 overflow-y-auto custom-scrollbar bg-[#0d0d12] shrink-0">
//           <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-6">
//             <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
//               <span className="material-symbols-outlined text-[20px] text-violet-400">rate_review</span>
//             </div>
//             <div><h3 className="text-sm font-bold text-gray-100 italic">Review Decision</h3><span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-600 tracking-widest">Decision Center</span></div>
//           </div>

//           <div className="flex flex-col gap-4">
//             <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Decision</span>
//             <div className="flex gap-3">
//               <button onClick={() => { setItemReviewStatus('APPROVED'); if (currentIndex < totalItems - 1) handleItemSelect(currentIndex + 1); }}
//                 className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-[2px] transition-all font-bold ${currentReview.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}>
//                 <span className="material-symbols-outlined text-[20px]">check_circle</span>
//                 <span className="text-[10px] uppercase tracking-widest">Approve</span>
//               </button>
//               <button onClick={() => setItemReviewStatus('REJECTED')}
//                 className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-[2px] transition-all font-bold ${currentReview.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}>
//                 <span className="material-symbols-outlined text-[20px]">cancel</span>
//                 <span className="text-[10px] uppercase tracking-widest">Reject</span>
//               </button>
//             </div>
//           </div>

//           <div className="flex flex-col gap-3">
//             <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Labels (Active Label)</span>
//             <div className="flex flex-wrap gap-2">
//               {labels.map(l => (
//                 <button key={l.labelId} onClick={() => setCurrentLabel(l)} className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${currentLabel?.labelId === l.labelId ? 'border-violet-500 bg-violet-500/20 text-white' : 'border-white/5 bg-white/5 text-gray-500 hover:text-gray-300'}`} style={{ borderColor: currentLabel?.labelId === l.labelId ? l.color : 'transparent' }}>{l.labelName}</button>
//               ))}
//             </div>
//           </div>

//           <div className="flex flex-col gap-4">
//             <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Review Comments</span>
//             <textarea value={currentReview.comment} onChange={(e) => setItemReviewComment(e.target.value)} placeholder="Provide feedback..."
//               className={`w-full h-32 rounded-2xl border p-5 text-sm text-gray-300 focus:outline-none transition-all resize-none shadow-inner ${currentReview.status === 'REJECTED' ? 'bg-rose-500/5 border-rose-500/20 focus:border-rose-500/50' : 'bg-[#111116] border-white/5 focus:border-violet-500/30'}`} />
//           </div>

//           <div className="mt-auto glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
//             <div className="justify-between text-[10px] font-mono flex">
//               <span className="text-gray-600 uppercase">Progress</span>
//               <span className="text-violet-400 font-bold">{Object.values(reviewMap).filter(r => r.status).length} / {totalItems}</span>
//             </div>
//             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${(Object.values(reviewMap).filter(r => r.status).length / totalItems) * 100}%` }} /></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// function ToolbarButton({ icon, active = false, onClick }: { icon: string; active?: boolean; onClick?: () => void }) {
//   return (
//     <button onClick={onClick} className={`w-11 h-11 flex items-center justify-center transition-all cursor-pointer rounded-xl border-2 ${active ? 'bg-violet-600/20 text-violet-400 border-violet-500/50 shadow-lg shadow-violet-500/20' : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}>
//       <span className="material-symbols-outlined text-[20px]">{icon}</span>
//     </button>
//   )
// }

// export default ReviewerAnnotationPage

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Spin, message } from 'antd'
import taskApi from '@/api/TaskApi'
import annotationApi from '@/api/annotation'
import { reviewerApi } from '@/api/ReviewerApi'
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


interface DataItem {
  itemId: string
  fileName: string
  url: string
  fileFormat: string
  dataType: string
  dataItem?: {
    itemId?: string
    fileName?: string
    url?: string
    fileFormat?: string
    dataType?: string
  }
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
  const [currentIndex, setCurrentIndex] = useState(startIdx)
  const [comment, setComment] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewImages, setReviewImages] = useState<{ id: string; url: string; file: File }[]>([])
  const [confidence, setConfidence] = useState<'LOW' | 'MEDIUM' | 'HIGH' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Zoom and Tool States
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [shapes, setShapes] = useState<Shape[]>([])

  // Resizable sidebars
  const [leftWidth, setLeftWidth] = useState(260)
  const [rightWidth, setRightWidth] = useState(320)
  const draggingRef = useRef<'left' | 'right' | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)
  const viewerRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          const url = URL.createObjectURL(file)
          setReviewImages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url, file }])
        }
      }
    }
  }, [])

  const removeReviewImage = (id: string) => {
    setReviewImages(prev => {
      const filtered = prev.filter(img => img.id !== id)
      // Cleanup URL
      const removed = prev.find(img => img.id === id)
      if (removed) URL.revokeObjectURL(removed.url)
      return filtered
    })
  }

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
    if (!loading && taskId && (sessionAnnotations.length > 0 || currentIndex > 0)) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessionAnnotations))
      localStorage.setItem(STORAGE_KEY_INDEX, String(currentIndex))
    }
  }, [sessionAnnotations, currentIndex, taskId, STORAGE_KEY_SESSIONS, STORAGE_KEY_INDEX, loading])

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

      if (existing) {
        setShapes((existing.annotationData.shapes as Shape[]) || (existing.annotationData.raw as Shape[]) || [])
        setComment(existing.comment || '')
        setConfidence((existing.annotationConfidence as 'LOW' | 'MEDIUM' | 'HIGH') || null)
      } else {
        setShapes([])
        setComment('')
        setConfidence(null)
      }
    },
    [sessionAnnotations]
  )

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return
      setLoading(true)
      try {
        // 1. Fetch task items
        const taskRes = await taskApi.getTaskDataItems(taskId)
        const items = taskRes.data?.data || taskRes.data || []
        setDataItems(Array.isArray(items) ? items : [])

        // Try to recover assignmentId from task if missing (e.g., on refresh)
        let effectiveAssignmentId = assignmentId
        if (!effectiveAssignmentId && items.length > 0) {
          effectiveAssignmentId = items[0].assignmentId
        }

        // 2. Restore from localStorage if available
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
                setConfidence((existing.annotationConfidence as 'LOW' | 'MEDIUM' | 'HIGH') || null)
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
  const currentItemId = currentItem ? (((currentItem as any).dataItemId ||
    (currentItem as any).dataitemId ||
    currentItem.itemId ||
    (currentItem as any).dataItem?.itemId ||
    (currentItem as any).id) as string) : ''
  // Background fetch all remote annotations to populate thumbnail statuses
  useEffect(() => {
    if (dataItems.length === 0) return

    dataItems.forEach(async (item) => {
      const itemId = ((item as any).dataItemId || (item as any).dataitemId || item.itemId || (item as any).dataItem?.itemId || (item as any).id) as string
      if (!itemId) return

      try {
        // Fire and forget
        const res = await annotationApi.getAnnotationByDataItemId(itemId)
        const remoteAnno = res.data?.data || res.data
        if (remoteAnno && remoteAnno.annotationId) {
          const rvComment = remoteAnno.reviews?.[0]?.comment || ''
          let annoData = { shapes: [], raw: [] }
          if (remoteAnno.annotationData) {
            try {
              annoData = typeof remoteAnno.annotationData === 'string'
                ? JSON.parse(remoteAnno.annotationData)
                : remoteAnno.annotationData
            } catch (e) { }
          }

          const newAnno: AnnotationSubmitItem = {
            annotationConfidence: remoteAnno.annotationConfidence || remoteAnno.annotation_confidence || null,
            annotationData: annoData,
            annotationStatus: (remoteAnno.annotationStatus || remoteAnno.annotation_status || 'DRAFT'),
            annotationType: (remoteAnno.annotationType || remoteAnno.annotation_type || 'CLASSIFICATION'),
            comment: remoteAnno.comment || '',
            dataitemId: itemId,
            labelIds: remoteAnno.labels || remoteAnno.labelIds || []
          }
            ; (newAnno as any).reviewerComment = rvComment
            ; (newAnno as any).isRemote = true

          setSessionAnnotations((prev) => {
            const existingIndex = prev.findIndex((a) => a.dataitemId === itemId)
            if (existingIndex >= 0) {
              const existing = prev[existingIndex]

              // Always update if server status is more "definitive" (e.g. APPROVED/REJECTED) vs local SUBMITTED / DRAFT
              // Or if local status is 'DRAFT' but server has real data
              const serverStatus = newAnno.annotationStatus.toUpperCase()
              const localStatus = (existing.annotationStatus || 'DRAFT').toUpperCase()

              // Decision: If server is REJECTED or APPROVED, we should definitely show that. 
              // Also if server changed desde local, we update status/comments/shapes from server
              // (This solves the conflict where local storage still thinks it's SUBMITTED)
              if (serverStatus !== localStatus || !(existing as any).isRemote) {
                const updated = [...prev]
                updated[existingIndex] = {
                  ...newAnno,
                  // If server is REJECTED, we load its exact shapes/labels from server too
                  annotationData: (serverStatus === 'REJECTED' || serverStatus === 'APPROVED')
                    ? newAnno.annotationData
                    : existing.annotationData
                } as any
                return updated
              }
              return prev
            } else {
              return [...prev, newAnno]
            }
          })
        }
      } catch (err) {
        // Ignore errors (e.g. 404 Not Found if no annotation exists yet)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataItems])

  // Fetch remote annotation whenever currentItemId changes
  useEffect(() => {
    if (!currentItemId) return
    let isMounted = true

    const fetchRemote = async () => {
      try {
        const res = await annotationApi.getAnnotationByDataItemId(currentItemId)
        if (!isMounted) return

        const remoteAnno = res.data?.data || res.data
        if (remoteAnno && remoteAnno.annotationId) {
          const rvComment = remoteAnno.reviews?.[0]?.comment || ''
          let annoData = { shapes: [], raw: [] }
          if (remoteAnno.annotationData) {
            try {
              annoData = typeof remoteAnno.annotationData === 'string'
                ? JSON.parse(remoteAnno.annotationData)
                : remoteAnno.annotationData
            } catch (e) {
              console.warn('Failed to parse annotationData', e)
            }
          }

          const newAnno: AnnotationSubmitItem = {
            annotationConfidence: remoteAnno.annotationConfidence || remoteAnno.annotation_confidence || null,
            annotationData: annoData,
            annotationStatus: (remoteAnno.annotationStatus || remoteAnno.annotation_status || 'DRAFT'),
            annotationType: (remoteAnno.annotationType || remoteAnno.annotation_type || 'CLASSIFICATION'),
            comment: remoteAnno.comment || '',
            dataitemId: currentItemId,
            labelIds: remoteAnno.labels || remoteAnno.labelIds || []
          }
            ; (newAnno as any).reviewerComment = rvComment
            ; (newAnno as any).isRemote = true // Mark as fetched from remote

          setSessionAnnotations((prev) => {
            const existingIndex = prev.findIndex((a) => a.dataitemId === currentItemId)
            const existing = prev[existingIndex]

            if (existingIndex >= 0) {
              const serverStatus = newAnno.annotationStatus.toUpperCase()
              const localStatus = (existing.annotationStatus || 'DRAFT').toUpperCase()

              // If server changed (REJECTED/APPROVED), always update the status/cache
              if (serverStatus !== localStatus || !(existing as any).isRemote) {
                const updated = [...prev]
                updated[existingIndex] = {
                  ...newAnno,
                  annotationData: (serverStatus === 'REJECTED' || serverStatus === 'APPROVED')
                    ? newAnno.annotationData
                    : existing.annotationData
                } as any
                return updated
              }
              return prev
            } else {
              return [...prev, newAnno]
            }
          })

          const shapesData = (annoData.shapes as Shape[]) || (annoData.raw as Shape[]) || []
          setShapes(shapesData)
          setComment(remoteAnno.comment || '')
          setConfidence((remoteAnno.annotationConfidence as any) || null)
        }
      } catch (err) {
        console.warn('No remote annotation found or error fetching', err)
      }
    }

    // Only fetch if we don't already have it as remote
    const existing = sessionAnnotations.find(a => a.dataitemId === currentItemId)
    if (!existing || !(existing as any).isRemote) {
      fetchRemote()
    }

    return () => {
      isMounted = false
    }
  }, [currentItemId])

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 10))
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 10))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 1))
  const handleZoomReset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  // Add clamping logic to ensure image stays in view box whenever zoom changes
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

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsPanning(true)
    setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      let nextX = e.clientX - panStart.x
      let nextY = e.clientY - panStart.y

      if (viewerRef.current) {
        const viewerWidth = viewerRef.current.clientWidth
        const viewerHeight = viewerRef.current.clientHeight

        const maxX = Math.max(0, (zoom - 1) * (viewerWidth / 2))
        const maxY = Math.max(0, (zoom - 1) * (viewerHeight / 2))

        nextX = Math.min(Math.max(nextX, -maxX), maxX)
        nextY = Math.min(Math.max(nextY, -maxY), maxY)
      }

      setOffset({
        x: nextX,
        y: nextY
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setNaturalSize({ width: naturalWidth, height: naturalHeight })
  }


  const handleItemSelect = (idx: number) => {
    loadFromSession(dataItems[idx])
    setCurrentIndex(idx)
  }


  const handleReviewDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!taskId || !currentItemId) return

    const annotation = sessionAnnotations.find(a => a.dataitemId === currentItemId)
    const annotationId = (annotation as any)?.annotationId || (annotation as any)?.id

    if (!annotationId) {
      message.error('No annotation ID found for this item.')
      return
    }

    try {
      setLoading(true)

      const evidence = await Promise.all(
        reviewImages.map(async img => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(img.file)
          })
        })
      )

      const payload = {
        reviews: [
          {
            annotationId,
            comment: reviewComment,
            reviewStatus: status,
            envidence: evidence
          }
        ]
      }

      await reviewerApi.submitReviewDecision(payload)

      setSessionAnnotations((prev) => {
        const existingIndex = prev.findIndex((a) => a.dataitemId === currentItemId)
        const updated = [...prev]
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            annotationStatus: status.toLowerCase() as any,
            isRemote: true
          } as any
        }
        return updated
      })

      message.success(`Annotation ${status.toLowerCase()} successfully!`)
    } catch (err) {
      console.error(err)
      message.error(`Failed to ${status.toLowerCase()} annotation.`)
    } finally {
      setLoading(false)
    }
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

              const displayStatus = annotation?.annotationStatus?.toUpperCase()

              const isSelected = currentIndex === idx;
              return (
                <div
                  key={currentId || idx}
                  onClick={() => handleItemSelect(idx)}
                  className="flex items-center gap-3 cursor-pointer transition-all hover:bg-white/5 rounded-lg px-2 py-1.5"
                >
                  {/* Status — w-10 to match header */}
                  <div className="w-10 shrink-0 flex justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${displayStatus === 'APPROVED'
                      ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                      : (displayStatus === 'SUBMITTED')
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : (displayStatus === 'REJECTED' || displayStatus === 'NEEDS_EDITING')
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                          : 'bg-gray-500/50'
                      }`} />
                  </div>

                  {/* Image — w-16 to match header */}
                  <div className="relative shrink-0 w-16">
                    <img
                      src={item.url || (item as any).dataItem?.url || (item as any).dataitem?.url || (item as any).previewUrl}
                      alt={item.fileName || (item as any).dataItem?.fileName || (item as any).dataitem?.fileName || (item as any).filename}
                      className={`w-16 h-12 object-cover rounded-md bg-black/50 border-[2px] ${isSelected ? 'border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'border-white/10'}`}
                    />
                    {/* Shape count badge */}
                    <div className={`absolute -bottom-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold border ${shapeCount > 0
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
        <div className="flex-[2] flex flex-col relative overflow-hidden bg-[#111116] pt-12 pb-6 px-5 mx-2 my-2 min-h-0">

          {/* Image Container */}
          <div className="flex-1 relative flex min-h-0">

            {/* The Viewer */}
            <div
              ref={viewerRef}
              className="relative transition-transform duration-200 ease-out will-change-transform overflow-hidden flex items-center justify-left w-full h-full mx-auto"
              onWheel={handleWheel}
            >
              <div
                className="relative transition-transform duration-200 ease-out will-change-transform flex items-center h-full w-full"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center' }}
              >
                <div 
                  className="relative flex items-center justify-center"
                  style={{ 
                    aspectRatio: naturalSize ? `${naturalSize.width} / ${naturalSize.height}` : 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  <img
                    src={currentItem.url || (currentItem as any).dataItem?.url || (currentItem as any).dataitem?.url || (currentItem as any).previewUrl}
                    alt={currentItem.fileName || (currentItem as any).dataItem?.fileName || (currentItem as any).dataitem?.fileName || (currentItem as any).filename}
                    onLoad={handleImageLoad}
                    className="max-w-full max-h-full object-contain pointer-events-none select-none"
                  />

                  <svg
                    viewBox={naturalSize ? `0 0 ${naturalSize.width} ${naturalSize.height}` : undefined}
                    className="absolute inset-0 w-full h-full cursor-grab"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                  {/* Read-only Shapes */}
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
                          strokeWidth={naturalSize ? (naturalSize.width / 400) : (3 / zoom)}
                        />
                      ) : (
                        <polyline
                          points={shape.points?.map((p: [number, number]) => p.join(',')).join(' ')}
                          fill={`${shape.color}33`}
                          stroke={shape.color}
                          strokeWidth={naturalSize ? (naturalSize.width / 400) : (3 / zoom)}
                        />
                      )}
                    </g>
                  ))}
                </svg>
                </div>
              </div>
            </div>

            {/* Floating Tools on the right */}
            <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-[#1e1b29] px-1.5 py-3 rounded-xl shadow-2xl border border-violet-500/20 z-20" style={{ right: '20px' }}>
              <ToolbarButton icon="pan_tool" active={true} onClick={() => { }} />
              <ToolbarButton icon="zoom_in" onClick={handleZoomIn} />
              <ToolbarButton icon="zoom_out" onClick={handleZoomOut} />
              <ToolbarButton icon="restart_alt" onClick={handleZoomReset} />
            </div>
          </div>


          {/* Bottom Action Bar */}
          <div className="mt-8 border-t border-white/10 pt-5 flex w-full items-center justify-between gap-4">

            {/* Left: task counter */}
            <span className="text-xs  font-mono text-gray-500">task {currentIndex + 1}/{totalItems}</span>

            <div className="flex-1" />


            {/* Review Actions on Right */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleReviewDecision('REJECTED')}
                className="shrink-0 px-6 py-2 rounded-lg text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleReviewDecision('APPROVED')}
                className="shrink-0 px-6 py-2 rounded-lg text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20 transition-all cursor-pointer"
              >
                Approve
              </button>
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

        {/* Right Column: Comment, Labels, Confidence & Geometry */}
        <div style={{ width: rightWidth, minWidth: 200 }} className="border-l border-white/5 px-6 py-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-[#16161a] shrink-0">

          {/* Reviewer Feedback Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-violet-400">rate_review</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Review Feedback</span>
            </div>

            <div className="relative group">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                onPaste={handlePaste}
                placeholder="Type your feedback here... Paste screenshots directly."
                className="w-full h-40 bg-white/5 rounded-xl border border-white/10 p-4 text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 group-focus-within:text-violet-400/60 transition-colors">
                Markdown & Images supported
              </div>
            </div>

            {/* Evidence Gallery */}
            {reviewImages.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pasted Evidence ({reviewImages.length})</span>
                <div className="grid grid-cols-2 gap-2">
                  {reviewImages.map((img) => (
                    <div key={img.id} className="relative aspect-video group bg-black/40 rounded-lg overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all">
                      <img src={img.url} className="w-full h-full object-cover" alt="Review evidence" />
                      <button
                        onClick={() => removeReviewImage(img.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-500"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/5 my-2" />

          {/* Annotator Metadata for context */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400">info</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Annotator Info</span>
            </div>
            <div className="flex flex-col gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Confidence</span>
                <span className={`font-bold ${confidence === 'HIGH' ? 'text-emerald-400' :
                    confidence === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                  }`}>{confidence || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Annotator Comment</span>
                <p className="text-xs text-gray-300 italic bg-white/5 p-2 rounded-lg border border-white/5">
                  {comment || 'No comment provided.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-blue-400">poly</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Geometry</span>
            </div>
            <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 overflow-y-auto min-h-[200px] custom-scrollbar">
              {shapes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono lowercase">no geometry data</div>
              ) : (
                <pre className="text-[10px] font-mono text-blue-400/80 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(
                    {
                      shapes: shapes.map((s) => ({ type: s.type, label: s.label })),
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