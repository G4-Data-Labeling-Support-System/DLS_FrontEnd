import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { App, Spin } from 'antd'

import {
  DatasetItemList,
  type DatasetItem
} from '@/features/reviewer/components/workspace/DatasetItemList'
import { AnnotationCanvas } from '@/features/reviewer/components/workspace/AnnotationCanvas'
import { ReviewDetailPanel } from '@/features/reviewer/components/workspace/ReviewDetailPanel'
import { ReviewerEmptyState } from '@/features/reviewer/components/workspace/ReviewerEmptyState'
import { ReviewerLoadingState } from '@/features/reviewer/components/workspace/ReviewerLoadingState'
import { ApproveModal } from '@/features/reviewer/components/workspace/ApproveModal'
import { RejectModal } from '@/features/reviewer/components/workspace/RejectModal'
import { reviewerApi, type ReviewerItem, type ReviewerItemDetail } from '@/api/ReviewerApi'
import { LoadingOutlined } from '@ant-design/icons'

// ⚡ Cache for item details - prevents refetching
const detailCache = new Map<string, ReviewerItemDetail>()

const ReviewerWorkspacePage: React.FC = () => {
  const { message } = App.useApp()
  const { projectId } = useParams()
  const navigate = useNavigate()

  // State
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [items, setItems] = useState<ReviewerItem[]>([])
  const [itemDetail, setItemDetail] = useState<ReviewerItemDetail | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [prefetchedIds, setPrefetchedIds] = useState<Set<string>>(new Set())

  // Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const prefetchAbortRef = useRef<AbortController | null>(null)

  // 🎯 Memoized dataset items - prevents unnecessary recalculation
  const datasetListItems: DatasetItem[] = useMemo(
    () =>
      items.map((i) => ({
        id: i.id,
        filename: i.filename,
        status: i.status,
        imageUrl: i.imageUrl,
        lastModified: i.lastModified
      })),
    [items]
  )

  // 🎯 Get next item ID for prefetch
  const getNextItemId = useCallback(
    (currentId: string): string | null => {
      const currentIndex = items.findIndex((i) => i.id === currentId)
      if (currentIndex >= 0 && currentIndex < items.length - 1) {
        return items[currentIndex + 1].id
      }
      return null
    },
    [items]
  )

  // ⚡ Prefetch next item detail in background
  const prefetchNextItem = useCallback(
    async (currentId: string) => {
      const nextId = getNextItemId(currentId)
      if (!nextId || prefetchedIds.has(nextId) || detailCache.has(nextId)) return

      // Cancel previous prefetch
      if (prefetchAbortRef.current) {
        prefetchAbortRef.current.abort()
      }

      prefetchAbortRef.current = new AbortController()

      try {
        const data = await reviewerApi.getItemDetail(nextId)
        detailCache.set(nextId, data)
        setPrefetchedIds((prev) => new Set(prev).add(nextId))
      } catch (error: any) {
        // Silent fail for prefetch
        if (error.name !== 'AbortError') {
          // console.debug('Prefetch failed for next item:', error);
        }
      }
    },
    [getNextItemId, prefetchedIds]
  )

  // 📥 Fetch Items on mount
  useEffect(() => {
    if (!projectId) return

    const fetchItems = async () => {
      setLoadingItems(true)
      try {
        const data = await reviewerApi.getProjectItems(projectId)
        if (Array.isArray(data)) {
          setItems(data)
          if (data.length > 0) {
            setSelectedId(data[0].id)
          }
        } else {
          setItems([])
          // console.error("API returned non-array for project items:", data);
          message.warning('No items found in project')
        }
      } catch {
        message.error('Failed to load dataset items')
        // console.error('Error fetching items:', error);
      } finally {
        setLoadingItems(false)
      }
    }

    fetchItems()
  }, [projectId, message])

  // 📥 Fetch Detail with cache and prefetch
  useEffect(() => {
    if (!selectedId) return

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const fetchDetail = async () => {
      // ⚡ Check cache first - instant load
      if (detailCache.has(selectedId)) {
        setItemDetail(detailCache.get(selectedId)!)
        // Prefetch next in background
        prefetchNextItem(selectedId)
        return
      }

      setLoadingDetail(true)
      abortControllerRef.current = new AbortController()

      try {
        const data = await reviewerApi.getItemDetail(selectedId)
        detailCache.set(selectedId, data)
        setItemDetail(data)

        // ⚡ Prefetch next item in background
        prefetchNextItem(selectedId)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          message.error('Failed to load item details')
          // console.error('Error fetching detail:', error);
        }
      } finally {
        setLoadingDetail(false)
      }
    }

    fetchDetail()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [selectedId, prefetchNextItem, message])

  // ⚡ Optimistic review decision with instant feedback
  const handleReviewDecision = useCallback(
    async (status: 'approved' | 'rejected', _reason?: string, _feedback?: string[]) => {
      if (!selectedId) return

      setIsSubmitting(true)

      try {
        // Include reason/feedback if api supports it (mocking support for now)
        // console.log(`Submitting ${status} for ${selectedId}`, { reason, feedback });

        await reviewerApi.submitReviewDecision(selectedId, status)

        message.success({
          content: `Item ${status} successfully`,
          key: 'review',
          duration: 2
        })

        // ⚡ Navigate to dashboard for both Approved and Rejected
        // console.log('Navigating to dashboard...');
        navigate('/reviewer', { replace: true })
      } catch {
        setIsSubmitting(false)
        message.error({
          content: 'Failed to submit review',
          key: 'review',
          duration: 3
        })
        // console.error('Error submitting review:', error);
      }
    },
    [selectedId, navigate, message]
  )

  // ⌨️ Keyboard shortcuts for faster workflow
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea or if modals are open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isApproveModalOpen ||
        isRejectModalOpen
      ) {
        return
      }

      if (!selectedId || items.length === 0) return

      const currentIndex = items.findIndex((i) => i.id === selectedId)

      // Arrow Right or J - Next item
      if ((e.key === 'ArrowRight' || e.key === 'j') && currentIndex < items.length - 1) {
        e.preventDefault()
        setSelectedId(items[currentIndex + 1].id)
      }

      // Arrow Left or K - Previous item
      if ((e.key === 'ArrowLeft' || e.key === 'k') && currentIndex > 0) {
        e.preventDefault()
        setSelectedId(items[currentIndex - 1].id)
      }

      // A - Approve (Open Modal)
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        setIsApproveModalOpen(true)
      }

      // R - Reject (Open Modal)
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        setIsRejectModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedId, items, isApproveModalOpen, isRejectModalOpen])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (prefetchAbortRef.current) {
        prefetchAbortRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="h-[calc(100vh-160px)]">
      <div className="flex gap-6 h-full">
        {/* 📋 Left Panel - Dataset List */}
        <div className="relative w-80 shrink-0 flex-none">
          <div
            className={`h-full transition-all duration-300 ${loadingItems ? 'opacity-60' : 'opacity-100'}`}
          >
            {loadingItems && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-transparent z-50 flex items-center justify-center backdrop-blur-sm rounded-2xl border border-purple-500/40 shadow-2xl shadow-purple-500/20">
                <Spin
                  indicator={<LoadingOutlined className="text-4xl text-purple-400" spin />}
                  size="large"
                />
              </div>
            )}
            <DatasetItemList
              items={datasetListItems}
              selectedId={selectedId || ''}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        {/* 🖼️ Center Panel - Annotation Canvas */}
        <div className="flex-1 relative min-w-0 overflow-hidden">
          {loadingDetail ? (
            <ReviewerLoadingState />
          ) : itemDetail ? (
            <div className="h-full transition-all duration-300 ease-out animate-in fade-in zoom-in-95">
              <AnnotationCanvas
                imageUrl={itemDetail.imageUrl}
                annotations={itemDetail.annotations}
              />
            </div>
          ) : (
            <ReviewerEmptyState />
          )}
        </div>

        {/* 📝 Right Panel - Review Details */}
        <div className="relative w-80 shrink-0 flex-none">
          <div
            className={`h-full transition-all duration-300 ${loadingDetail ? 'opacity-60' : 'opacity-100'}`}
          >
            {loadingDetail && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-transparent z-50 flex items-center justify-center backdrop-blur-sm rounded-2xl border border-purple-500/40 shadow-2xl shadow-purple-500/20">
                <Spin indicator={<LoadingOutlined className="text-3xl text-purple-400" spin />} />
              </div>
            )}
            <ReviewDetailPanel
              annotations={itemDetail?.annotations || []}
              history={(itemDetail as any)?.history || []}
              annotator={itemDetail?.annotator}
              onApprove={() => setIsApproveModalOpen(true)}
              onReject={() => setIsRejectModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApproveModal
        open={isApproveModalOpen}
        onCancel={() => setIsApproveModalOpen(false)}
        onConfirm={() => handleReviewDecision('approved')}
        confirmLoading={isSubmitting}
      />

      <RejectModal
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onConfirm={(reason, feedback) => handleReviewDecision('rejected', reason, feedback)}
        confirmLoading={isSubmitting}
      />
    </div>
  )
}

export default ReviewerWorkspacePage
