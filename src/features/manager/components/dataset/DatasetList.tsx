import { Link } from 'react-router-dom'
import { App, Spin, Empty, Input, Space, Typography } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import datasetApi, { type GetDatasetsParams } from '@/api/DatasetApi'
import { DatasetCard } from './DatasetCard'
import { DatasetDetail } from './DatasetDetail'
import { useState } from 'react'

const { Title } = Typography

interface DatasetListProps {
  datasets: GetDatasetsParams[]
  loading: boolean
  selectedDatasetId?: string | null
  onDatasetSelect?: (id: string | null) => void
}

const DatasetList: React.FC<DatasetListProps> = ({
  datasets,
  loading,
  selectedDatasetId,
  onDatasetSelect
}) => {
  const { message, modal } = App.useApp()
  const [searchText, setSearchText] = useState<string>('')
  const [internalDatasetId, setInternalDatasetId] = useState<string | null>(null)

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
    modal.confirm({
      title: 'Delete Dataset',
      content: 'Are you sure you want to delete this dataset?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await datasetApi.deleteDataset(id)
          message.success('Dataset deleted successfully!')
          window.location.reload()
        } catch {
          message.error('An error occurred while deleting the dataset.')
        }
      }
    })
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-stretch w-full">
          {datasets
            .filter(
              (ds) =>
                !searchText ||
                (ds.datasetName &&
                  ds.datasetName.toLowerCase().includes(searchText.toLowerCase()))
            )
            .map((ds) => {
              const uniqueId = ds.datasetId || ''
              return (
                <DatasetCard
                  key={uniqueId}
                  {...ds}
                  onClick={() => handleDatasetSelect(uniqueId)}
                  onEdit={() => handleDatasetSelect(uniqueId)}
                  onDelete={() => handleDelete(uniqueId)}
                />
              )
            })}

          {/* Start New Dataset Card */}
          <Link to="/manager/datasets/create" className="block group">
            <div className="h-full min-h-[160px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-4 bg-[#1A1625]/30 hover:bg-[#1A1625] hover:border-violet-500 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#231e31] group-hover:bg-violet-600 flex items-center justify-center transition-colors">
                <PlusOutlined className="text-gray-400 group-hover:text-white text-xl" />
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium font-display">
                Create Dataset
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}

export default DatasetList
