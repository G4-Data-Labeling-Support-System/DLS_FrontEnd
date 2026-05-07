import { useState, useCallback, useEffect } from 'react'
import taskApi from '@/services/TaskApi'
import assignmentApi from '@/services/AssignmentApi'

import type { DataItem, Label } from '../types'
import type { AnnotationSubmitItem } from '@/shared/types/api.types'



export function useAnnotationSession(taskId: string | undefined, assignmentId: string | undefined) {
  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionAnnotations, setSessionAnnotations] = useState<AnnotationSubmitItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const STORAGE_KEY_SESSIONS = `annotation_session_${taskId}`
  const STORAGE_KEY_INDEX = `annotation_index_${taskId}`

  const fetchSessionData = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    try {
      // 1. Fetch task items
      const taskRes = await taskApi.getTaskDataItems(taskId)
      const items = taskRes.data?.data || taskRes.data || []
      setDataItems(Array.isArray(items) ? items : [])

      let effectiveAssignmentId = assignmentId
      if (!effectiveAssignmentId && items.length > 0) {
        effectiveAssignmentId = items[0].assignmentId
      }

      // 2. Fetch labels
      if (effectiveAssignmentId) {
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
        }
      }

      // 3. Restore from localStorage
      const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS)
      const savedIndex = localStorage.getItem(STORAGE_KEY_INDEX)

      if (savedSessions) {
        const parsed = JSON.parse(savedSessions)
        setSessionAnnotations(parsed)
        if (savedIndex !== null) {
          const idx = parseInt(savedIndex)
          if (idx >= 0 && idx < items.length) setCurrentIndex(idx)
        }
      }
    } catch (err) {
      console.error('Failed to load annotation data:', err)
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [taskId, assignmentId, STORAGE_KEY_SESSIONS, STORAGE_KEY_INDEX])

  useEffect(() => {
    fetchSessionData()
  }, [fetchSessionData])

  // Auto-save to localStorage
  useEffect(() => {
    if (!loading && taskId) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessionAnnotations))
      localStorage.setItem(STORAGE_KEY_INDEX, String(currentIndex))
    }
  }, [sessionAnnotations, currentIndex, taskId, loading, STORAGE_KEY_SESSIONS, STORAGE_KEY_INDEX])

  return {
    dataItems,
    labels,
    currentIndex,
    setCurrentIndex,
    sessionAnnotations,
    setSessionAnnotations,
    loading,
    error,
    fetchSessionData
  }
}
