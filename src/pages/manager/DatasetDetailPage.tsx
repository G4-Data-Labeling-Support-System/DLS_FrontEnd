import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DatasetDetail } from '@/features/manager/components/dataset/DatasetDetail'

const DatasetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <p className="text-lg">Dataset not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <DatasetDetail datasetId={id} onBack={() => navigate('/manager/datasets')} />
    </div>
  )
}

export default DatasetDetailPage
