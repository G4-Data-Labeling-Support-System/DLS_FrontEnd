import { App, Spin, Empty, Input, Space, Typography, Button } from 'antd'
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import datasetApi, { type GetDatasetsParams } from '@/api/DatasetApi'
import { DatasetCard } from './DatasetCard'
import { DatasetDetail } from './DatasetDetail'
import { CreateDatasetModal } from './CreateDatasetModal'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { useState } from 'react'

const { Title } = Typography

interface AllDatasetProps {
  datasets: GetDatasetsParams[]
  loading: boolean
  selectedDatasetId?: string | null
  onDatasetSelect?: (id: string | null) => void
  onCreate?: () => void
}

const AllDataset: React.FC<AllDatasetProps> = ({
  datasets,
  loading,
  selectedDatasetId,
  onDatasetSelect,
  onCreate
}) => {
  const { message } = App.useApp()
  const [searchText, setSearchText] = useState<string>('')
  const [internalDatasetId, setInternalDatasetId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingDatasetId, setDeletingDatasetId] = useState<string | null>(null)
  const [deletingDatasetName, setDeletingDatasetName] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingDataset, setEditingDataset] = useState<GetDatasetsParams | null>(null)

  const currentDatasetId =
    selectedDatasetId !== undefined ? selectedDatasetId : internalDatasetId

  const handleDatasetSelect = (id: string | null) => {
    if (onDatasetSelect) {
      onDatasetSelect(id)
    } else {
      setInternalDatasetId(id)
    }
  }

  const handleDelete = (id?: string) => {
    if (!id) return
    const ds = datasets.find((d) => d.datasetId === id)
    setDeletingDatasetId(id)
    setDeletingDatasetName(ds?.datasetName || 'this dataset')
    setDeleteModalOpen(true)
  }

  const handleEdit = (ds: GetDatasetsParams) => {
    setEditingDataset(ds)
    setEditModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingDatasetId) return
    setDeleting(true)
    try {
      await datasetApi.deleteDataset(deletingDatasetId)
      message.success('Dataset deleted successfully!')
      setDeleteModalOpen(false)
      setDeletingDatasetId(null)
      setDeletingDatasetName('')
      window.location.reload()
    } catch {
      message.error('An error occurred while deleting the dataset.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && !currentDatasetId) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (currentDatasetId) {
    return (
      <DatasetDetail
        datasetId={currentDatasetId}
        onBack={() => handleDatasetSelect(null)}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!text-white !m-0 !font-display">
          All Datasets
        </Title>
        <Space>
          <Input
            placeholder="Search datasets..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
          />
        </Space>
      </div>

      {datasets.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No datasets created yet.</span>}
          className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 items-stretch w-full">
          {datasets
            .filter(
              (ds) =>
                !searchText ||
                (ds.datasetName &&
                  ds.datasetName.toLowerCase().includes(searchText.toLowerCase()))
            )
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .map((ds) => {
              const uniqueId = ds.datasetId || ''
              return (
                <DatasetCard
                  key={uniqueId}
                  {...ds}
                  onClick={() => handleDatasetSelect(uniqueId)}
                  onEdit={() => handleEdit(ds)}
                  onDelete={() => handleDelete(uniqueId)}
                />
              )
            })}

          {/* Start New Dataset Card */}
          <div
            onClick={onCreate}
            className="block group h-full min-h-[160px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-4 bg-[#1A1625]/30 hover:bg-[#1A1625] hover:border-violet-500 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#231e31] group-hover:bg-violet-600 flex items-center justify-center transition-colors">
              <PlusOutlined className="text-gray-400 group-hover:text-white text-xl" />
            </div>
            <span className="text-gray-400 group-hover:text-white font-medium font-display">
              Create Dataset
            </span>
          </div>
        </div>
      )}

      <GlassModal
        open={deleteModalOpen}
        onCancel={() => { setDeleteModalOpen(false); setDeletingDatasetId(null); setDeletingDatasetName('') }}
        destroyOnHidden
        width={480}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="text-center pb-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-red-500 text-2xl" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
              Delete Dataset
            </h2>
            <p className="text-white/50 text-sm">
              Are you sure you want to delete <span className="text-white/80 font-medium">{deletingDatasetName}</span>? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              onClick={() => { setDeleteModalOpen(false); setDeletingDatasetId(null); setDeletingDatasetName('') }}
              className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
            >
              Cancel
            </Button>
            <Button
              danger
              type="primary"
              loading={deleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 border-none"
            >
              Delete Dataset
            </Button>
          </div>
        </div>
      </GlassModal>

      <CreateDatasetModal
        open={editModalOpen}
        isEdit={true}
        initialData={editingDataset ? {
          datasetId: editingDataset.datasetId!,
          datasetName: editingDataset.datasetName || '',
          description: editingDataset.description,
          projectId: editingDataset.projectId
        } : undefined}
        onCancel={() => {
          setEditModalOpen(false)
          setEditingDataset(null)
        }}
        onSuccess={() => {
          setEditModalOpen(false)
          setEditingDataset(null)
          window.location.reload()
        }}
      />
    </div>
  )
}

export default AllDataset
