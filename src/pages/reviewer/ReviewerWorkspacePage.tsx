import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { App, Spin, Button, Result, message } from 'antd'
import type { AxiosError } from 'axios'
import { reviewerApi, type ReviewerItem, type ReviewerItemDetail } from '@/api/ReviewerApi'
import assignmentApi from '@/api/AssignmentApi'
import taskApi from '@/api/TaskApi'

// ⚡ Cache for item details - prevents refetching
const detailCache = new Map<string, ReviewerItemDetail>()

const ReviewerWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  // State
  const [items, setItems] = useState<ReviewerItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [itemDetail, setItemDetail] = useState<ReviewerItemDetail | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [prefetchedIds, setPrefetchedIds] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Zoom and Pan States
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [tool, setTool] = useState<'pan' | 'box' | 'polygon'>('pan')

  // Resizable sidebars
  const [leftWidth, setLeftWidth] = useState(300)
  const [rightWidth, setRightWidth] = useState(320)
  const draggingRef = useRef<'left' | 'right' | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)

  const abortControllerRef = useRef<AbortController | null>(null)
  const prefetchAbortRef = useRef<AbortController | null>(null)

  // Review status per item
  const [reviewMap, setReviewMap] = useState<Record<string, { status: 'approved' | 'rejected' | null; reason: string }>>({})

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

  const getNextItemId = useCallback(
    (currentId: string): string | null => {
      const currentIndex = items.findIndex((i) => i.id === currentId)
      return currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1].id : null
    },
    [items]
  )

  const prefetchNextItem = useCallback(
    async (currentId: string) => {
      const nextId = getNextItemId(currentId)
      if (!nextId || prefetchedIds.has(nextId) || detailCache.has(nextId)) return
      if (prefetchAbortRef.current) prefetchAbortRef.current.abort()
      prefetchAbortRef.current = new AbortController()
      try {
        const data = await reviewerApi.getItemDetail(nextId)
        detailCache.set(nextId, data)
        setPrefetchedIds((prev) => new Set(prev).add(nextId))
      } catch (error) { }
    },
    [getNextItemId, prefetchedIds]
  )

  useEffect(() => {
    if (!projectId) return
    const fetchItems = async () => {
      setLoadingItems(true)
      try {
        const assignRes = await assignmentApi.getAssignmentsByProjectId(projectId)
        const assignments = assignRes.data?.data || assignRes.data || []
        if (assignments.length === 0) {
          message.warning('No assignments found for this project')
          setItems([]); return
        }
        const assignmentId = assignments[0].assignmentId || assignments[0].id
        const taskRes = await taskApi.getTasksByAssignmentId(assignmentId)
        const tasks = taskRes.data?.data || taskRes.data || []
        const mappedItems: ReviewerItem[] = tasks.map((t: any) => ({
          id: t.taskId || t.id,
          filename: t.taskName || t.name || `Task ${t.taskId}`,
          status: (t.taskStatus || 'pending').toLowerCase() as any,
          imageUrl: '',
          lastModified: t.createdAt || ''
        }))
        setItems(mappedItems)
        if (mappedItems.length > 0) setSelectedId(mappedItems[0].id)
      } catch (error) {
        message.error('Failed to load project tasks')
      } finally {
        setLoadingItems(false)
      }
    }
    fetchItems()
  }, [projectId])

  useEffect(() => {
    if (!selectedId) return
    if (abortControllerRef.current) abortControllerRef.current.abort()
    const fetchDetail = async () => {
      if (detailCache.has(selectedId)) {
        setItemDetail(detailCache.get(selectedId)!)
        prefetchNextItem(selectedId); return
      }
      setLoadingDetail(true)
      abortControllerRef.current = new AbortController()
      try {
        const data = await reviewerApi.getItemDetail(selectedId)
        detailCache.set(selectedId, data)
        setItemDetail(data)
        prefetchNextItem(selectedId)
      } catch (error) {
        const axiosError = error as AxiosError
        if (axiosError.name !== 'AbortError') message.error('Failed to load task details')
      } finally {
        setLoadingDetail(false)
      }
    }
    fetchDetail()
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort() }
  }, [selectedId, prefetchNextItem])

  const handleReviewDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedId || !itemDetail?.annotations) return
    setIsSubmitting(true)
    try {
      const currentRev = reviewMap[selectedId] || { reason: '' }
      const reviews = itemDetail.annotations
        .filter((ann: any) => ann.id || ann.annotationId)
        .map((ann: any) => ({
          annotationId: ann.id || ann.annotationId,
          reviewStatus: (status === 'approved' ? 'APPROVED' : 'REJECTED') as any,
          comment: currentRev.reason || ''
        }))
      if (reviews.length === 0) {
        message.warning('No annotations to review')
        setIsSubmitting(false); return
      }
      await reviewerApi.submitReviewDecision({ reviews })
      message.success(`Item ${status} successfully`)

      // Update local state and move to next item
      setReviewMap(prev => ({ ...prev, [selectedId]: { status, reason: currentRev.reason } }))
      const nextId = getNextItemId(selectedId)
      if (nextId) setSelectedId(nextId)
      else message.info('You have reached the end of the project tasks.')
    } catch (error) {
      message.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 10))
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tool === 'pan') {
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }

  const handleMouseUp = () => { if (isPanning) setIsPanning(false) }

  const handleZoomReset = () => { setZoom(1); setOffset({ x: 0, y: 0 }) }

  if (error) {
    return <div className="h-screen bg-[#111116] flex items-center justify-center text-white"><Result status="warning" title="Failed to load workspace" extra={<Button onClick={() => navigate(-1)}>Go Back</Button>} /></div>
  }

  const currentReview = reviewMap[selectedId || ''] || { status: null, reason: '' }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-[#111116] text-white overflow-hidden font-sans">
      <div className="absolute top-4 left-4 z-[200]">
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 flex items-center gap-2 transition text-sm font-medium shadow-xl">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Exit Workspace</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Sidebar: Tasks List */}
        <div style={{ width: leftWidth, minWidth: 160 }} className="border-r border-white/10 overflow-y-auto custom-scrollbar flex flex-col pt-20 pb-4 shrink-0 bg-[#0d0d12]">
          <div className="px-6 mb-6">
            <h1 className="text-xl font-bold tracking-tight text-gray-100">Project Workspace</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-violet-500/60 mt-1">Reviewing Tasks</p>
          </div>

          <div className="flex-1 flex flex-col px-4 gap-3">
            {loadingItems ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Spin size="small" />
                <span className="text-[10px] font-mono text-gray-600">Loading tasks...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 text-gray-600 text-[10px] font-bold uppercase tracking-widest">No tasks found</div>
            ) : items.map((item) => {
              const isSelected = selectedId === item.id
              const rev = reviewMap[item.id]
              let statusColor = 'bg-gray-800'
              if (item.status === 'completed' || rev?.status === 'approved') statusColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              else if (item.status === 'rejected' || rev?.status === 'rejected') statusColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
              else if (item.status === 'in_progress') statusColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'

              return (
                <div key={item.id} onClick={() => setSelectedId(item.id)} className={`group relative flex items-center gap-4 cursor-pointer p-3 rounded-xl transition-all border ${isSelected ? 'bg-violet-600/10 border-violet-500/30' : 'bg-white/2 border-transparent hover:bg-white/5'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-300 truncate">{item.filename}</span>
                    <span className="text-[9px] font-mono text-gray-600 mt-1">{item.lastModified.split('T')[0]}</span>
                  </div>
                  {isSelected && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Resizer */}
        <div className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40 z-30" onMouseDown={e => { draggingRef.current = 'left'; dragStartXRef.current = e.clientX; dragStartWidthRef.current = leftWidth; e.preventDefault() }} />

        {/* Middle Viewer */}
        <div className="flex-[2] flex flex-col relative overflow-hidden bg-[#111116] pt-12 pb-6 px-5 border-l-[2px] border-white/5 mx-2 my-2">
          {loadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Spin size="large" />
              <span className="text-violet-400 font-mono text-sm animate-pulse tracking-widest uppercase font-bold">Retrieving Task Detail</span>
            </div>
          ) : itemDetail ? (
            <>
              <div className="text-left mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-violet-500/60 block mb-1">Active Selection</span>
                  <h2 className="text-xl font-bold text-gray-100 tracking-tight truncate max-w-[70%]">{itemDetail.filename || 'Untitled Task'}</h2>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Annotator</span>
                    <span className="text-[11px] font-bold text-violet-300">{itemDetail.annotator || 'System'}</span>
                  </div>
                  <div className="px-3 py-1 bg-violet-500/10 rounded-lg border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest self-center">
                    {itemDetail.annotations?.length || 0} Annotations
                  </div>
                </div>
              </div>

              <div className="flex-1 relative flex overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                <div className="relative bg-[#0d0d12]/50 overflow-hidden flex items-center justify-center w-full h-full" onWheel={handleWheel}>
                  <div className="relative transition-transform duration-200 ease-out flex items-center justify-center h-full w-full"
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center' }}>
                    <img src={itemDetail.imageUrl} alt="main" className="max-w-full max-h-full object-contain pointer-events-none select-none" />
                    <svg className={`absolute inset-0 w-full h-full cursor-grab`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                      {itemDetail.annotations?.map((ann: any, i: number) => {
                        const data = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : ann.annotationData
                        if (!data || !data.shapes) return null
                        return data.shapes.map((s: any, j: number) => (
                          <g key={`${i}-${j}`}>
                            {s.type === 'bounding_box' ? (
                              <rect x={s.x} y={s.y} width={s.width} height={s.height} fill={`${s.color || '#8b5cf6'}33`} stroke={s.color || '#8b5cf6'} strokeWidth={2 / zoom} />
                            ) : s.type === 'polygon' && s.points ? (
                              <polyline points={s.points.map((p: any) => p.join(',')).join(' ')} fill={`${s.color || '#8b5cf6'}33`} stroke={s.color || '#8b5cf6'} strokeWidth={2 / zoom} />
                            ) : null}
                          </g>
                        ))
                      })}
                    </svg>
                  </div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 bg-[#1A1625]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl z-20">
                  <ToolbarButton icon="pan_tool" active={tool === 'pan'} onClick={() => setTool('pan')} />
                  <ToolbarButton icon="zoom_in" onClick={() => setZoom(prev => Math.min(prev + 0.2, 10))} />
                  <ToolbarButton icon="zoom_out" onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))} />
                  <ToolbarButton icon="restart_alt" onClick={handleZoomReset} />
                </div>
              </div>

              <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-600 mb-1">Queue Status</span>
                    <span className="text-xs font-mono text-gray-400 font-bold">{items.findIndex(i => i.id === selectedId) + 1} / {items.length} Tasks</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => {
                    const idx = items.findIndex(i => i.id === selectedId)
                    if (idx > 0) setSelectedId(items[idx - 1].id)
                  }} disabled={items.findIndex(i => i.id === selectedId) === 0} className="px-6 py-2.5 disabled:opacity-30 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5 shadow-lg">Previous</button>
                  <button onClick={() => {
                    const idx = items.findIndex(i => i.id === selectedId)
                    if (idx < items.length - 1) setSelectedId(items[idx + 1].id)
                  }} disabled={items.findIndex(i => i.id === selectedId) === items.length - 1} className="px-6 py-2.5 disabled:opacity-30 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5 shadow-lg">Next</button>
                  <div className="w-px h-10 bg-white/5 mx-2" />
                  <button onClick={() => navigate(`/reviewer/task/${selectedId}/annotate`)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-violet-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-violet-500/20">Open High-Def Editor</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-30">
              <span className="material-symbols-outlined text-8xl">space_dashboard</span>
              <span className="text-sm font-bold tracking-[0.3em] uppercase">Select a task to review</span>
            </div>
          )}
        </div>

        <div className="w-1 shrink-0 cursor-col-resize hover:bg-violet-500/40 z-30" onMouseDown={e => { draggingRef.current = 'right'; dragStartXRef.current = e.clientX; dragStartWidthRef.current = rightWidth; e.preventDefault() }} />

        {/* Right Action Panel */}
        <div style={{ width: rightWidth, minWidth: 200 }} className="border-l border-white/10 px-8 py-10 flex flex-col gap-8 overflow-y-auto custom-scrollbar bg-[#0d0d12] shrink-0">
          <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-violet-400">gavel</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100 italic">Review Panel</h3>
              <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-600">Decision Center</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Quick Actions</span>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleReviewDecision('approved')} disabled={isSubmitting || !itemDetail}
                className={`h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border-[2px] transition-all font-bold group ${currentReview.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500' : 'bg-white/5 text-gray-600 border-transparent hover:bg-white/10 hover:text-gray-300'} disabled:opacity-30`}>
                <span className="material-symbols-outlined text-[24px]">verified</span>
                <span className="text-[10px] uppercase tracking-widest">Approve</span>
              </button>
              <button onClick={() => handleReviewDecision('rejected')} disabled={isSubmitting || !itemDetail}
                className={`h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border-[2px] transition-all font-bold group ${currentReview.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500' : 'bg-white/5 text-gray-600 border-transparent hover:bg-white/10 hover:text-gray-300'} disabled:opacity-30`}>
                <span className="material-symbols-outlined text-[24px]">cancel</span>
                <span className="text-[10px] uppercase tracking-widest">Reject</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">Review Feedback</span>
            <textarea
              value={reviewMap[selectedId || '']?.reason || ''}
              onChange={(e) => setReviewMap(prev => ({ ...prev, [selectedId || '']: { ...prev[selectedId || ''], reason: e.target.value } }))}
              placeholder="Provide feedback for the annotator..."
              className={`w-full h-48 rounded-2xl border p-5 text-sm text-gray-300 focus:outline-none transition-all resize-none shadow-inner ${currentReview.status === 'rejected' ? 'bg-rose-500/5 border-rose-500/20 focus:border-rose-500/50' : 'bg-[#111116] border-white/5 focus:border-violet-500/30'}`}
            />
          </div>

          <div className="mt-auto glass-panel p-6 rounded-3xl border border-white/5 space-y-5 bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-violet-400">history</span>
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">History Log</span>
            </div>

            <div className="space-y-4 max-h-40 overflow-y-auto custom-scrollbar-thin pr-4">
              {itemDetail?.history?.map((h: any, i: number) => (
                <div key={i} className="relative pl-4 border-l border-white/10">
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{h.message || 'Updated annotation'}</p>
                  <span className="text-[9px] text-gray-600 font-mono italic">{h.timestamp || 'Just now'}</span>
                </div>
              )) || (
                  <div className="text-[10px] text-gray-600 italic font-mono text-center py-4">No recent activity</div>
                )}
            </div>
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

export default ReviewerWorkspacePage
