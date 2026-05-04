import { useEffect, useState } from 'react'
import { Space, Typography, Spin, Input, Empty, App, Form, Select, ColorPicker, Button } from 'antd'
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { LabelCard } from './LabelCard'
import { LabelDetail } from './LabelDetail'
import { GlassModal } from '@/shared/components/ui/GlassModal'

import labelApiClient, {
  type GetLabelsParams,
  type CreateLabelPayload,
  type UpdateLabelPayload
} from '@/api/LabelApi'
import datasetApi, { type GetDatasetsParams } from '@/api/DatasetApi'
import { useDatasetsByProject } from '@/features/manager/hooks/useProjectDetail'
import { useAllLabels, useInvalidateLabels } from '@/features/manager/hooks/useLabels'
const { Title } = Typography

interface AllLabelsProps {
  selectedLabelId?: string | null
  onLabelSelect?: (id: string | null) => void
  openCreateModal?: boolean
  onCreateModalClose?: () => void
  projectId?: string
}

export const AllLabels: React.FC<AllLabelsProps> = ({
  selectedLabelId: _selectedLabelId,
  onLabelSelect,
  openCreateModal,
  onCreateModalClose,
  projectId
}) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const { data: labels = [], isLoading: loading } = useAllLabels()
  const invalidateLabels = useInvalidateLabels()
  const { data: projectDatasets = [] } = useDatasetsByProject(projectId || '')
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [_internalLabelId, setInternalLabelId] = useState<string | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [datasets, setDatasets] = useState<GetDatasetsParams[]>([])
  const [datasetsLoading, setDatasetsLoading] = useState(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState<GetLabelsParams | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingLabelId, setDeletingLabelId] = useState<string | null>(null)
  const [deletingLabelName, setDeletingLabelName] = useState<string>('')

  const handleLabelSelect = (id: string | null) => {
    if (onLabelSelect) {
      onLabelSelect(id)
    } else {
      setInternalLabelId(id)
    }
  }

  const fetchLabels = async () => {
    invalidateLabels()
  }


  useEffect(() => {
    if (openCreateModal) {
      handleOpenCreateModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreateModal])

  const handleDelete = (id?: string) => {
    if (!id) return
    const label = labels.find((l) => l.labelId === id)
    setDeletingLabelId(id)
    setDeletingLabelName(label?.labelName || 'this label')
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingLabelId) return
    try {
      setDeleting(true)
      await labelApiClient.deleteLabel(deletingLabelId)
      message.success('Label deleted successfully!')
      invalidateLabels()
      setDeleteModalOpen(false)
      setDeletingLabelId(null)
      setDeletingLabelName('')
    } catch (error) {
      console.error('Delete label error:', error)
      message.error('An error occurred while deleting the label.')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (editModalOpen && editingLabel) {
      editForm.setFieldsValue({
        labelName: editingLabel.labelName || '',
        color: editingLabel.color || '#1677ff',
        description: editingLabel.description || ''
      })
    }
  }, [editModalOpen, editingLabel, editForm])

  const handleEdit = (id?: string) => {
    if (!id) return
    const label = labels.find((l) => l.labelId === id)
    if (!label) return
    setEditingLabelId(id)
    setEditingLabel(label)
    setEditModalOpen(true)
  }

  const handleUpdateLabel = async () => {
    if (!editingLabelId || !editingLabel) return
    try {
      const values = await editForm.validateFields()
      setEditing(true)

      const colorValue =
        typeof values.color === 'string'
          ? values.color
          : values.color?.toHexString?.() || editingLabel.color || '#1677ff'

      const payload: UpdateLabelPayload = {
        labelName: values.labelName || editingLabel.labelName,
        color: colorValue,
        description: values.description ?? editingLabel.description ?? ''
      }

      await labelApiClient.updateLabel(editingLabelId, payload)
      message.success('Label updated successfully!')
      setEditModalOpen(false)
      setEditingLabelId(null)
      setEditingLabel(null)
      fetchLabels()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('Failed to update label:', error)
      message.error('Failed to update label.')
    } finally {
      setEditing(false)
    }
  }

  const fetchDatasets = async () => {
    setDatasetsLoading(true)
    try {
      const response = projectId
        ? await datasetApi.getDatasetsByProjectId(projectId)
        : await datasetApi.getDatasets()
      const rawData = response.data?.data || response.data?.content || response.data || []
      if (Array.isArray(rawData)) {
        const mapped: GetDatasetsParams[] = rawData
          .map(
            (d: Record<string, unknown>) =>
              ({
                datasetId: String(d.id || d.datasetId || ''),
                datasetName: String(d.name || d.datasetName || ''),
                datasetStatus: String(d.datasetStatus || d.status || d.dataset_status || '')
              }) as GetDatasetsParams
          )
          .filter(
            (d) =>
              d.datasetId &&
              d.datasetId !== 'undefined' &&
              d.datasetId !== 'null' &&
              d.datasetStatus?.toUpperCase() === 'ACTIVE'
          )
        setDatasets(mapped)
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error)
      message.error('Failed to load datasets.')
    } finally {
      setDatasetsLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true)
    fetchDatasets()
  }

  const handleCreateLabel = async () => {
    try {
      const values = await form.validateFields()
      setCreating(true)

      const colorValue =
        typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#1677ff'

      const payload: CreateLabelPayload = {
        labelName: values.labelName,
        color: colorValue,
        description: values.description || ''
      }

      await labelApiClient.createLabel(values.datasetId, payload)
      message.success('Label created successfully!')
      setCreateModalOpen(false)
      onCreateModalClose?.()
      fetchLabels()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('Failed to create label:', error)
      message.error('Failed to create label.')
    } finally {
      setCreating(false)
    }
  }

  const filteredLabels = labels
    .filter((l) => {
      if (!projectId) return true
      return projectDatasets.some((d) => String(d.datasetId) === String(l.datasetId))
    })
    .filter((l) => {
      const matchesSearch =
        !searchText || (l.labelName && l.labelName.toLowerCase().includes(searchText.toLowerCase()))
      const matchesStatus = statusFilter === 'ALL' || l.labelStatus === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aIsInactive = a.labelStatus?.toUpperCase() === 'INACTIVE'
      const bIsInactive = b.labelStatus?.toUpperCase() === 'INACTIVE'

      if (aIsInactive && !bIsInactive) return 1
      if (!aIsInactive && bIsInactive) return -1

      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

  const currentLabelId = _selectedLabelId !== undefined ? _selectedLabelId : _internalLabelId

  if (loading && !currentLabelId) {
    return (
      <div className="w-full flex justify-center py-10">
        <Spin size="large" />
      </div>
    )
  }

  if (currentLabelId) {
    return <LabelDetail labelId={currentLabelId} onBack={() => handleLabelSelect(null)} />
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!text-[#111] !m-0 !font-display">
          All Labels
        </Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-36"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' }
            ]}
          />
          <Input
            placeholder="Search labels..."
            prefix={<SearchOutlined className="text-gray-500" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1A1625] border-gray-700 text-[#111] hover:border-violet-500 focus:border-violet-500 w-64"
          />
        </Space>
      </div>

      {filteredLabels.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No labels created yet.</span>}
          className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 items-stretch">
          {filteredLabels.map((l, index) => {
            const uniqueId = l.labelId || String(index)
            return (
              <LabelCard
                key={uniqueId}
                {...l}
                onClick={() => handleLabelSelect(uniqueId)}
                onEdit={() => handleEdit(uniqueId)}
                onDelete={() => handleDelete(uniqueId)}
              />
            )
          })}
        </div>
      )}

      <GlassModal
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          onCreateModalClose?.()
        }}
        destroyOnHidden
        width={640}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-[#111] text-2xl font-bold tracking-tight mb-2 font-display">
              Create Label
            </h2>
            <p className="text-[#111]/50 text-sm">Add a new label to a dataset.</p>
          </div>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Label Name"
              name="labelName"
              rules={[{ required: true, message: 'Please enter a label name' }]}
            >
              <Input placeholder="Enter label name" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Dataset"
                name="datasetId"
                rules={[{ required: true, message: 'Please select a dataset' }]}
              >
                <Select
                  placeholder="Select a dataset"
                  loading={datasetsLoading}
                  showSearch
                  optionFilterProp="children"
                >
                  {datasets.map((d) => (
                    <Select.Option key={d.datasetId} value={d.datasetId}>
                      {d.datasetName || d.datasetId}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Color"
                name="color"
                rules={[{ required: true, message: 'Please select a color' }]}
              >
                <ColorPicker format="hex" showText />
              </Form.Item>
            </div>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <Input.TextArea placeholder="Enter label description" rows={4} />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  form.resetFields()
                  setCreateModalOpen(false)
                  onCreateModalClose?.()
                }}
                className="border-gray-300 text-[#111]/70 hover:text-[#111] hover:border-white/30"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={creating}
                onClick={handleCreateLabel}
                className="bg-violet-600 hover:bg-violet-500 border-none"
              >
                Create Label
              </Button>
            </div>
          </Form>
        </div>
      </GlassModal>

      <GlassModal
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false)
          setEditingLabelId(null)
          setEditingLabel(null)
        }}
        destroyOnHidden
        width={640}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-[#111] text-2xl font-bold tracking-tight mb-2 font-display">
              Edit Label
            </h2>
            <p className="text-[#111]/50 text-sm">Update label information.</p>
          </div>
          <Form form={editForm} layout="vertical">
            <Form.Item
              label="Label Name"
              name="labelName"
              rules={[{ required: true, message: 'Please enter a label name' }]}
            >
              <Input placeholder="Enter label name" />
            </Form.Item>

            <Form.Item
              label="Color"
              name="color"
              rules={[{ required: true, message: 'Please select a color' }]}
            >
              <ColorPicker format="hex" showText />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <Input.TextArea placeholder="Enter label description" rows={4} />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  editForm.resetFields()
                  setEditModalOpen(false)
                  setEditingLabelId(null)
                  setEditingLabel(null)
                }}
                className="border-gray-300 text-[#111]/70 hover:text-[#111] hover:border-white/30"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={editing}
                onClick={handleUpdateLabel}
                className="bg-violet-600 hover:bg-violet-500 border-none"
              >
                Update Label
              </Button>
            </div>
          </Form>
        </div>
      </GlassModal>

      <GlassModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false)
          setDeletingLabelId(null)
          setDeletingLabelName('')
        }}
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
            <h2 className="text-[#111] text-2xl font-bold tracking-tight mb-2 font-display">
              Deactivate Label
            </h2>
            <p className="text-[#111]/50 text-sm">
              Are you sure you want to deactivate{' '}
              <span className="text-[#111]/80 font-medium">{deletingLabelName}</span>? This action
              cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => {
                setDeleteModalOpen(false)
                setDeletingLabelId(null)
                setDeletingLabelName('')
              }}
              className="border-gray-300 text-[#111]/70 hover:text-[#111] hover:border-white/30"
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
              Deactivate Label
            </Button>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}

