import React from 'react'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { CreateDatasetForm } from '../CreateDatasetForm'

interface CreateDatasetModalProps {
  open: boolean
  projectId?: string
  onCancel: () => void
  onSuccess: (datasetId?: string) => void
}

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = ({
  open,
  projectId,
  onCancel,
  onSuccess
}) => {
  return (
    <GlassModal open={open} onCancel={onCancel} width={1000} destroyOnHidden>
      <div className="px-8 pt-10 pb-8">
        <div className="text-center border-b border-white/5 pb-6 mb-8">
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
            Create New Dataset
          </h2>
          <p className="text-gray-400 text-sm">
            Fill in the details below to create a new dataset for your project.
          </p>
        </div>

        <CreateDatasetForm
          initialProjectId={projectId}
          onSuccess={onSuccess}
          onBack={onCancel}
          submitLabel="CREATE DATASET"
        />
      </div>
    </GlassModal>
  )
}
