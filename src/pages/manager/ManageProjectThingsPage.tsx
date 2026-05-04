import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import datasetApi, { type GetDatasetsParams } from '@/api/DatasetApi'
import { type GetAssignmentsParams } from '@/api/AssignmentApi'
import { useInvalidateAssignments } from '@/features/manager/hooks/useProjectDetail'

import { AllAssignments } from '@/features/manager/components/dashboard/AllAssignments'
import { AssignmentQuickActions } from '@/features/manager/components/dashboard/AssignmentQuickActions'
import { CreateAssignmentModal } from '@/features/manager/components/dashboard/CreateAssignmentModal'

import AllDataset from '@/features/manager/components/dataset/AllDataset'
import { DatasetQuickActions } from '@/features/manager/components/dataset/DatasetQuickActions'
import { DatasetDetail } from '@/features/manager/components/dataset/DatasetDetail'
import { CreateDatasetModal } from '@/features/manager/components/dataset/CreateDatasetModal'

import { AllLabels } from '@/features/manager/components/dashboard/AllLabels'
import { LabelQuickActions } from '@/features/manager/components/dashboard/LabelQuickActions'

import { ManageProjectThingsTabs, type ManageProjectThingsTabType } from '@/features/manager/components/dataset/ManageProjectThingsTabs'

const ManageProjectThingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const invalidateAssignments = useInvalidateAssignments()

  const [datasets, setDatasets] = useState<GetDatasetsParams[]>([])
  const [loadingDatasets, setLoadingDatasets] = useState(false)
  
  const [openCreateLabelModal, setOpenCreateLabelModal] = useState(false)
  const [openCreateDatasetModal, setOpenCreateDatasetModal] = useState(false)

  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<GetAssignmentsParams | undefined>(undefined)

  const selectedDatasetId = searchParams.get('datasetId')
  const selectedLabelId = searchParams.get('labelId')
  const selectedAssignmentId = searchParams.get('assignmentId')

  // Derive activeTab from URL params
  const activeTab: ManageProjectThingsTabType = (() => {
    const tab = searchParams.get('tab')
    if (tab === 'label' || tab === 'upload' || tab === 'assignment' || tab === 'dataset') return tab as ManageProjectThingsTabType
    
    // Infer tab from presence of ids
    if (selectedAssignmentId) return 'assignment'
    if (selectedLabelId) return 'label'
    return 'dataset' // default
  })()

  const setActiveTab = useCallback(
    (tab: ManageProjectThingsTabType) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', tab)
        
        // clean up other parameters when switching tabs generically
        if (tab === 'dataset') {
          next.delete('labelId')
          next.delete('assignmentId')
        } else if (tab === 'label') {
          next.delete('datasetId')
          next.delete('assignmentId')
          next.delete('viewProjectId')
          next.delete('viewDatasetId')
        } else if (tab === 'assignment') {
          next.delete('datasetId')
          next.delete('labelId')
          next.delete('viewProjectId')
          next.delete('viewDatasetId')
        }
        
        return next
      })
    },
    [setSearchParams]
  )

  useEffect(() => {
    if (searchParams.get('createLabel') === 'true') {
      setActiveTab('label')
      setOpenCreateLabelModal(true)
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('createLabel')
        return next
      })
    }
  }, [searchParams, setSearchParams, setActiveTab])

  const setSelectedDatasetId = useCallback(
    (id: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (id) {
          next.set('datasetId', id)
          next.set('tab', 'dataset')
        } else {
          next.delete('datasetId')
        }
        return next
      })
    },
    [setSearchParams]
  )

  const setSelectedLabelId = useCallback(
    (id: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (id) {
          next.set('labelId', id)
          next.set('tab', 'label')
        } else {
          next.delete('labelId')
        }
        return next
      })
    },
    [setSearchParams]
  )
  
  const setSelectedAssignmentId = useCallback(
    (id: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (id) {
          next.set('assignmentId', id)
          next.set('tab', 'assignment')
        } else {
          next.delete('assignmentId')
        }
        return next
      })
    },
    [setSearchParams]
  )

  const fetchDatasets = useCallback(async () => {
    setLoadingDatasets(true)
    try {
      const response = await datasetApi.getDatasets()
      const rawData = response.data?.data || response.data?.content || response.data || []

      if (Array.isArray(rawData)) {
        const mappedDatasets: GetDatasetsParams[] = rawData
          .map(
            (d: Record<string, unknown>) =>
              ({
                datasetId: String(d.id || d.datasetId || ''),
                datasetName: String(d.name || d.datasetName || ''),
                totalItems: Number(d.itemCount || d.totalItems) || 0,
                createdAt: String(d.createdAt || d.created_at || d.createdDate || ''),
                description: String(d.description || ''),
                datasetStatus: String(d.datasetStatus || d.status || d.dataset_status || '')
              }) as unknown as GetDatasetsParams
          )
          .filter((d) => d.datasetId && d.datasetId !== 'undefined' && d.datasetId !== 'null')
        setDatasets(mappedDatasets)
      } else {
        setDatasets([])
      }
    } catch (error) {
      console.error('Error fetching datasets:', error)
    } finally {
      setLoadingDatasets(false)
    }
  }, [])

  useEffect(() => {
    fetchDatasets()
  }, [fetchDatasets])

  const handleCreateDatasetSuccess = () => {
    setOpenCreateDatasetModal(false)
    fetchDatasets()
  }

  const handleCloseAssignmentModal = () => {
    setCreateAssignmentOpen(false)
    setEditingAssignment(undefined)
  }

  return (
    <div className="p-6">
      <ManageProjectThingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* ─── ASSIGNMENTS TAB ────────────────────────────────────────────── */}
      {activeTab === 'assignment' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          <div className={selectedAssignmentId ? 'xl:col-span-4' : 'xl:col-span-3'}>
            <AllAssignments
              selectedAssignmentId={selectedAssignmentId}
              onAssignmentSelect={setSelectedAssignmentId}
              onEdit={(asn) => {
                setEditingAssignment(asn)
                setCreateAssignmentOpen(true)
              }}
            />
          </div>

          {!selectedAssignmentId && (
            <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
              <AssignmentQuickActions
                isGlobalView={true}
                onCreateAssignment={() => {
                  setEditingAssignment(undefined)
                  setCreateAssignmentOpen(true)
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── DATASETS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'dataset' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          <div className={selectedDatasetId ? 'xl:col-span-4' : 'xl:col-span-3'}>
            {selectedDatasetId ? (
              <DatasetDetail
                datasetId={selectedDatasetId}
                onBack={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete('datasetId')
                    return next
                  })
                }}
              />
            ) : (
                <AllDataset
                  datasets={datasets}
                  loading={loadingDatasets}
                  selectedDatasetId={selectedDatasetId}
                  onDatasetSelect={setSelectedDatasetId}
                  onCreate={() => setOpenCreateDatasetModal(true)}
                />
            )}
          </div>

          {!selectedDatasetId && (
            <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
              <DatasetQuickActions isGlobalView={true} onCreateDataset={() => setOpenCreateDatasetModal(true)} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="text-gray-500 py-10 text-center font-display border-2 border-dashed border-gray-800 rounded-xl bg-[#1A1625]/50 flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-4xl mb-4 text-violet-500 opacity-50">
            cloud_upload
          </span>
          <p>Upload functionality is currently under development.</p>
        </div>
      )}

      {/* ─── LABELS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'label' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          <div className={selectedLabelId ? 'xl:col-span-4' : 'xl:col-span-3'}>
            <AllLabels
              selectedLabelId={selectedLabelId}
              onLabelSelect={setSelectedLabelId}
              openCreateModal={openCreateLabelModal}
              onCreateModalClose={() => setOpenCreateLabelModal(false)}
            />
          </div>

          {!selectedLabelId && (
            <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
              <LabelQuickActions isGlobalView={true} onCreateLabel={() => setOpenCreateLabelModal(true)} />
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS ─────────────────────────────────────────────────────── */}
      <CreateDatasetModal
        open={openCreateDatasetModal}
        onCancel={() => setOpenCreateDatasetModal(false)}
        onSuccess={handleCreateDatasetSuccess}
      />
      
      <CreateAssignmentModal
        open={createAssignmentOpen}
        initialData={editingAssignment}
        onCancel={handleCloseAssignmentModal}
        onSuccess={() => {
          handleCloseAssignmentModal()
          invalidateAssignments()
        }}
      />
    </div>
  )
}

export default ManageProjectThingsPage

