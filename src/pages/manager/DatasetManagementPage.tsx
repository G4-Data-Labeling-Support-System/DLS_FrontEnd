import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import datasetApi, { type GetDatasetsParams } from '@/api/DatasetApi'
import DatasetList from '@/features/manager/components/dataset/DatasetList'
import { DatasetQuickActions } from '@/features/manager/components/dataset/DatasetQuickActions'
import { DatasetTabs, type DatasetTabType } from '@/features/manager/components/dataset/DatasetTabs'
import { AllLabels } from '@/features/manager/components/dashboard/AllLabels'
import { LabelQuickActions } from '@/features/manager/components/dashboard/LabelQuickActions'
import { DatasetDetail } from '@/features/manager/components/dataset/DatasetDetail'

const DatasetManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [datasets, setDatasets] = useState<GetDatasetsParams[]>([])
  const [loading, setLoading] = useState(false)
  const [openCreateLabelModal, setOpenCreateLabelModal] = useState(false)

  const selectedDatasetId = searchParams.get('datasetId')
  const selectedLabelId = searchParams.get('labelId')

  // Derive activeTab from URL params
  const activeTab: DatasetTabType = (() => {
    const tab = searchParams.get('tab')
    if (tab === 'label' || tab === 'upload') return tab
    if (tab === 'dataset') return 'dataset'
    // Infer tab from presence of labelId
    if (selectedLabelId) return 'label'
    return 'dataset'
  })()

  const setActiveTab = useCallback(
    (tab: DatasetTabType) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (tab === 'dataset') {
          next.delete('tab')
          next.delete('labelId')
        } else {
          next.set('tab', tab)
          if (tab === 'label') {
            next.delete('datasetId')
          }
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

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true)
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
                  description: String(d.description || '')
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
        setLoading(false)
      }
    }
    fetchDatasets()
  }, [])

  return (
    <div className="p-6">
      <DatasetTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'dataset' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          <div className="xl:col-span-3 flex flex-col w-full items-center">
            <DatasetList
              datasets={datasets}
              loading={loading}
              selectedDatasetId={selectedDatasetId}
              onDatasetSelect={setSelectedDatasetId}
            />
          </div>

          <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
            <DatasetQuickActions />
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="text-gray-400 py-10 text-center font-display border-2 border-dashed border-gray-800 rounded-xl bg-[#1A1625]/50 flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-4xl mb-4 text-violet-500 opacity-50">
            cloud_upload
          </span>
          <p>Upload functionality is currently under development.</p>
        </div>
      )}

      {activeTab === 'label' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          <div className="xl:col-span-3">
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
              <AllLabels
                selectedLabelId={selectedLabelId}
                onLabelSelect={setSelectedLabelId}
                openCreateModal={openCreateLabelModal}
                onCreateModalClose={() => setOpenCreateLabelModal(false)}
              />
            )}
          </div>

          <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
            <LabelQuickActions onCreateLabel={() => setOpenCreateLabelModal(true)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default DatasetManagementPage
