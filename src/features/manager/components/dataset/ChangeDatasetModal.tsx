import React, { useEffect, useState } from 'react'
import { Form, Select, Button, App, Spin } from 'antd'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import datasetApi from '@/api/DatasetApi'
import assignmentApi from '@/api/AssignmentApi'

interface ChangeDatasetModalProps {
  open: boolean
  assignmentId: string
  projectId: string
  currentDatasetId?: string
  onCancel: () => void
  onSuccess: () => void
}

interface DatasetOption {
  datasetId?: string
  id?: string
  datasetName?: string
  name?: string
  [key: string]: unknown
}

export const ChangeDatasetModal: React.FC<ChangeDatasetModalProps> = ({
  open,
  assignmentId,
  projectId,
  currentDatasetId,
  onCancel,
  onSuccess
}) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [datasets, setDatasets] = useState<DatasetOption[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !projectId) return

    const fetchDatasets = async () => {
      setLoading(true)
      try {
        const [datasetRes, asmRes] = await Promise.all([
          datasetApi.getDatasetsByProjectId(projectId),
          assignmentApi.getAssignmentsByProjectId(projectId).catch(() => ({ data: { data: [] } }))
        ])
        
        const data = datasetRes.data?.data || datasetRes.data
        const dsArray = Array.isArray(data) ? data : []

        const asmData = asmRes.data?.data || asmRes.data
        const asmArray = Array.isArray(asmData) ? asmData : []
        const assignedDatasetIds = asmArray
          .map((a: Record<string, unknown>) => String(a.datasetId || (a.dataset as Record<string, unknown>)?.id || (a.dataset as Record<string, unknown>)?.datasetId || ''))
          .filter(Boolean)

        setDatasets(
          dsArray.filter((d: DatasetOption) => {
            const status = String(
              d.datasetStatus || d.status || d.dataset_status || ''
            ).toUpperCase()
            
            if (status !== 'ACTIVE') return false
            
            const dsId = String(d.datasetId || d.id || '')
            if (currentDatasetId && dsId === String(currentDatasetId)) {
              return true
            }
            
            return !assignedDatasetIds.includes(dsId)
          })
        )
      } catch (error) {
        console.error('Failed to load datasets:', error)
        message.error('Failed to load datasets for this project.')
      } finally {
        setLoading(false)
      }
    }

    fetchDatasets()
    form.setFieldsValue({ datasetId: currentDatasetId })
  }, [open, projectId, currentDatasetId, message, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setIsSubmitting(true)

      await assignmentApi.changeAssignmentDataset(assignmentId, values.datasetId)

      message.success('Assignment dataset changed successfully!')
      onSuccess()
    } catch (error: unknown) {
      console.error('Failed to change dataset:', error)
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string }
      const apiError =
        errorObj.response?.data?.message || errorObj.message || 'Failed to change dataset'
      message.error(String(apiError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GlassModal open={open} onCancel={onCancel} destroyOnHidden width={480}>
      <div className="px-8 pt-10 pb-8">
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-[#111] text-xl font-bold tracking-tight mb-2 font-display">
            Change Assignment Dataset
          </h2>
          <p className="text-[#111]/50 text-sm">Select a new dataset for this assignment.</p>
        </div>

        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            <Form.Item
              label={
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  Select Dataset
                </span>
              }
              name="datasetId"
              rules={[{ required: true, message: 'Please select a dataset' }]}
            >
              <Select
                placeholder="Choose a dataset"
                showSearch
                optionFilterProp="children"
                className="custom-select"
              >
                {datasets.map((d: DatasetOption) => (
                  <Select.Option key={d.datasetId || d.id || ''} value={d.datasetId || d.id || ''}>
                    {d.datasetName || d.name || ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
              <Button
                onClick={onCancel}
                className="border-gray-300 text-[#111]/70 hover:text-[#111] hover:border-white/30"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={isSubmitting}
                onClick={handleSubmit}
                className="bg-violet-600 hover:bg-violet-500 border-none"
              >
                Change Dataset
              </Button>
            </div>
          </Form>
        </Spin>
      </div>

      <style>{`
        .custom-select .ant-select-selector {
          background: rgba(15, 14, 23, 0.5) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 12px !important;
          height: 42px !important;
          display: flex !important;
          items-center !important;
        }
        .custom-select .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
          line-height: 40px !important;
        }
        .custom-select .ant-select-selection-item {
          line-height: 40px !important;
        }
      `}</style>
    </GlassModal>
  )
}

