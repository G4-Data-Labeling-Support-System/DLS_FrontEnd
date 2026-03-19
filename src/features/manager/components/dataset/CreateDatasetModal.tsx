import React, { useState, useEffect, useRef } from 'react'
import { App, Form, Input, Upload, Button, Progress, Checkbox, Select, Segmented, Spin } from 'antd'
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import type { UploadChangeParam } from 'antd/es/upload'
import { isAxiosError, type AxiosProgressEvent } from 'axios'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import datasetApi from '@/api/DatasetApi'
import projectApi, { type GetProjectsParams } from '@/api/ProjectApi'
import { compressImage } from '@/shared/utils/imageCompression'

const { Dragger } = Upload

interface CreateDatasetModalProps {
  open: boolean
  onCancel: () => void
  onSuccess?: (datasetId?: string) => void
  initialProjectId?: string
  initialData?: {
    datasetId: string
    datasetName: string
    description?: string
    projectId?: string
  }
  isEdit?: boolean
}

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialProjectId,
  initialData,
  isEdit
}) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<GetProjectsParams[]>([])
  const [fileList, setFileList] = useState<(UploadFile & { preview?: string })[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showAllPreviews, setShowAllPreviews] = useState(false)
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([])
  const [uploadMode, setUploadMode] = useState<'file' | 'folder'>('file')
  const [fetchingDetails, setFetchingDetails] = useState(false)
  const [hasAssignments, setHasAssignments] = useState(false)

  const fileListRef = useRef(fileList)
  useEffect(() => {
    fileListRef.current = fileList
  }, [fileList])

  // 2. Combined loading: Load projects then resolve current project if editing
  useEffect(() => {
    const initData = async () => {
      if (!open) return
      setLoading(true)
      try {
        // First fetch all projects
        const projRes = await projectApi.getProjects()
        const projData = projRes.data?.data || projRes.data || []
        let activeProjects: GetProjectsParams[] = []
        if (Array.isArray(projData)) {
          activeProjects = projData
            .map((p: Record<string, unknown>) => ({
              projectId: String((p.projectId as string) || (p.id as string) || ''),
              projectName: String(
                (p.projectName as string) || (p.name as string) || 'Unknown Project'
              ),
              projectStatus: String((p.projectStatus as string) || (p.status as string) || 'ACTIVE')
            }))
            .filter((p) => p.projectId && p.projectStatus?.toUpperCase() !== 'INACTIVE')
        }

        if (isEdit && initialData?.datasetId) {
          setFetchingDetails(true)
          const res = await datasetApi.getDatasetById(initialData.datasetId)
          const data = res.data?.data || res.data
          if (data) {
            const pId = String(data.projectId)
            form.setFieldsValue({
              datasetName: data.datasetName,
              description: data.description,
              projectId: pId
            })

            // Resolve current project info
            const projectInfo = data.project || {}
            const resolvedPId = String(projectInfo.projectId)
            const resolvedPName = String(projectInfo.projectName)
            const resolvedStatus = String(projectInfo.projectStatus)

            // If the current project is NOT in the active projects list, add it
            if (resolvedPId && !activeProjects.find((p) => String(p.projectId) === resolvedPId)) {
              activeProjects = [
                {
                  projectId: resolvedPId,
                  projectName: resolvedPName,
                  projectStatus: resolvedStatus
                },
                ...activeProjects
              ]
            }

            setHasAssignments(
              !!(data.assignmentId || (data.assignments && data.assignments.length > 0))
            )
          }

          // Fetch items
          const itemsRes = await datasetApi.getDatasetItems(initialData.datasetId)
          const items = itemsRes.data?.data || itemsRes.data || []
          if (Array.isArray(items)) {
            const initialFileList = items
              .map((item: Record<string, unknown>) => {
                const url =
                  (item.content as string) ||
                  (item.url as string) ||
                  (item.imageUrl as string) ||
                  (item.previewUrl as string) ||
                  (item.path as string) ||
                  ''
                return {
                  uid: String((item.dataItemId as string) || (item.id as string) || Math.random()),
                  name: (item.name as string) || (item.filename as string) || 'Existing File',
                  status: 'done' as const,
                  url: url,
                  thumbUrl: url,
                  originFileObj: undefined
                }
              })
              .filter((f) => !!f.url)
            setFileList(initialFileList)
          }
        } else if (!isEdit) {
          form.resetFields()
          setFileList([])
          setDeletedItemIds([])
          setHasAssignments(false)
          if (initialProjectId) {
            form.setFieldsValue({ projectId: initialProjectId })
          }
        }

        setProjects(activeProjects)
      } catch (error) {
        console.error('Initialization failed:', error)
        if (isEdit) message.error('Failed to load dataset details.')
      } finally {
        setFetchingDetails(false)
        setLoading(false)
      }
    }

    initData()
  }, [open, isEdit, initialData?.datasetId, initialProjectId, form, message])

  useEffect(() => {
    return () => {
      fileListRef.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [])

  const handleUploadChange = (info: UploadChangeParam<UploadFile & { preview?: string }>) => {
    let newFileList = [...info.fileList]
    const limit = showAllPreviews ? newFileList.length : 12
    newFileList = newFileList.map((file, index) => {
      if (index < limit && !file.preview && file.originFileObj) {
        file.preview = URL.createObjectURL(file.originFileObj as Blob)
      }
      return file
    })
    setFileList(newFileList)
  }

  useEffect(() => {
    if (showAllPreviews && fileList.some((f) => !f.preview && f.originFileObj)) {
      setFileList((prev) =>
        prev.map((file) => {
          if (!file.preview && file.originFileObj) {
            file.preview = URL.createObjectURL(file.originFileObj as Blob)
          }
          return file
        })
      )
    }
  }, [showAllPreviews, fileList])

  const handleRemoveFile = (uid: string) => {
    setFileList((prev) => {
      const fileToRemove = prev.find((f) => f.uid === uid)
      if (fileToRemove) {
        if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview)
        if (fileToRemove.status === 'done' && !fileToRemove.originFileObj && isEdit) {
          setDeletedItemIds((prevDeleted) => [...prevDeleted, uid])
        }
      }
      return prev.filter((item) => item.uid !== uid)
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setFileList([])
    setDeletedItemIds([])
    onCancel()
  }

  const onFinish = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Check if project is in the list
      const selectedProject = projects.find((p) => String(p.projectId) === String(values.projectId))

      // If updating and project hasn't changed, allow it even if not in the list (could be INACTIVE)
      const projectIsSame =
        isEdit &&
        initialData?.projectId &&
        String(initialData.projectId) === String(values.projectId)

      if (!selectedProject && !projectIsSame) {
        message.warning('The selected project is not in the project list.')
        setLoading(false)
        return
      }

      // 1. Process deletions if editing
      if (isEdit && deletedItemIds.length > 0) {
        await Promise.all(
          deletedItemIds.map((id) =>
            datasetApi
              .deleteItem(id)
              .catch((err) => console.error(`Delete item ${id} failed:`, err))
          )
        )
      }

      // 2. Process new files (compression)
      let filesToUpload = fileList
        .map((f) => f.originFileObj as File | undefined)
        .filter((f): f is File => !!f)

      if (values.compressImages && filesToUpload.length > 0) {
        message.loading({
          content: `Compressing ${filesToUpload.length} images...`,
          key: 'compressing',
          duration: 0
        })
        const compressed = []
        for (const file of filesToUpload) {
          try {
            compressed.push(await compressImage(file))
          } catch (err) {
            console.error('Compression failed:', err)
            compressed.push(file)
          }
        }
        filesToUpload = compressed
        message.success({ content: 'Compression complete!', key: 'compressing', duration: 2 })
      }

      // 3. Mandatory check for new datasets
      if (!isEdit && filesToUpload.length < 10) {
        message.warning({ content: 'Please upload at least 10 images.', key: 'min_imgs_val' })
        setLoading(false)
        return
      }

      const totalSize = filesToUpload.reduce((acc, f) => acc + f.size, 0)
      const progressHandler = (progressEvent: AxiosProgressEvent) => {
        const total = progressEvent.total || totalSize
        if (total > 0) setUploadProgress(Math.round((progressEvent.loaded * 100) / total))
      }

      // 4. API Call
      const payload = {
        ...values,
        projectId: String(values.projectId || initialData?.projectId || ''), // Ensure correct projectId string
        files: filesToUpload.length > 0 ? filesToUpload : undefined
      }
      const res = isEdit
        ? await datasetApi.updateDataset(initialData!.datasetId, payload, progressHandler)
        : await datasetApi.createDataset(payload, progressHandler)

      message.success(`Dataset ${isEdit ? 'updated' : 'created'} successfully!`)
      if (onSuccess) {
        const data = res.data?.data || res.data
        onSuccess(data?.datasetId || data?.id)
      }
      handleCancel()
    } catch (error: unknown) {
      setUploadProgress(0)
      if (typeof error === 'object' && error !== null && 'errorFields' in error) return

      const errorMessage = isAxiosError(error)
        ? (error.response?.data?.message as string) || error.message
        : error instanceof Error
          ? error.message
          : 'Unknown error'
      message.error({
        content: `Failed to ${isEdit ? 'update' : 'create'} dataset: ${errorMessage}`,
        duration: 10
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <GlassModal open={open} onCancel={handleCancel} width={800} destroyOnHidden>
      {fetchingDetails ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4">
          <Spin size="large" />
          <p className="text-violet-400 font-medium animate-pulse">
            Fetching latest dataset information...
          </p>
        </div>
      ) : (
        <div className="px-8 pt-10 pb-8">
          <div className="text-center border-b border-white/5 pb-6 mb-8">
            <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
              {isEdit ? 'Edit Dataset' : 'Create New Dataset'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isEdit
                ? 'Update the details below to modify your dataset.'
                : 'Fill in the details below to create a new dataset.'}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              datasetName: initialData?.datasetName,
              description: initialData?.description,
              projectId: initialProjectId || initialData?.projectId
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Form.Item
                  name="projectId"
                  label={<span className="text-white/90">Project</span>}
                  rules={[{ required: true, message: 'Please select a project' }]}
                >
                  <Select
                    size="large"
                    placeholder="Select a project"
                    className="!bg-[#1a1625] !border-white/10 !text-white"
                    disabled={isEdit ? hasAssignments : !!initialProjectId}
                    showSearch
                    optionFilterProp="children"
                  >
                    {projects.map((p) => (
                      <Select.Option key={p.projectId} value={p.projectId}>
                        {p.projectName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="datasetName"
                  label={<span className="text-white/90">Dataset Name</span>}
                  rules={[{ required: true, message: 'Please enter dataset name' }]}
                >
                  <Input size="large" className="!bg-[#1a1625] !border-white/10 !text-white" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="text-white/90">Description</span>}
                >
                  <Input.TextArea
                    rows={4}
                    className="!bg-[#1a1625] !border-white/10 !text-white resize-none"
                  />
                </Form.Item>

                <Form.Item name="compressImages" valuePropName="checked" initialValue={true}>
                  <Checkbox className="!text-gray-400">
                    <span className="text-xs">Compress images before upload</span>
                  </Checkbox>
                </Form.Item>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/90 font-medium text-sm">Image Uploads</span>
                  <Segmented
                    options={[
                      { label: 'Files', value: 'file' },
                      { label: 'Folder', value: 'folder' }
                    ]}
                    value={uploadMode}
                    onChange={(val) => setUploadMode(val as 'file' | 'folder')}
                    className="!bg-[#1a1625]"
                  />
                </div>
                <div className="rounded-xl overflow-hidden bg-[#1a1625]/30 border border-dashed border-white/20 hover:border-violet-500/50 transition-all p-4">
                  <Dragger
                    multiple
                    directory={uploadMode === 'folder'}
                    beforeUpload={() => false}
                    fileList={fileList}
                    onChange={handleUploadChange}
                    showUploadList={false}
                    className="!bg-transparent"
                  >
                    <div className="flex flex-col items-center py-4">
                      <InboxOutlined className="text-violet-500 text-3xl mb-2" />
                      <p className="text-white text-xs">
                        {uploadMode === 'folder' ? 'Drag folder here' : 'Drag images here'}
                      </p>
                    </div>
                  </Dragger>

                  {fileList.length > 0 && (
                    <div className="mt-4 max-h-[150px] overflow-y-auto">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">
                          Preview ({fileList.length})
                        </span>
                        <span
                          className="text-[10px] text-violet-500 font-bold cursor-pointer"
                          onClick={() => setFileList([])}
                        >
                          Clear all
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(showAllPreviews ? fileList : fileList.slice(0, 12)).map((file) => (
                          <div
                            key={file.uid}
                            className="aspect-square rounded-lg bg-gray-800 border border-white/10 relative group overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                              onClick={() => handleRemoveFile(file.uid)}
                            >
                              <DeleteOutlined className="text-red-400 text-xs" />
                            </div>
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url('${file.preview || file.thumbUrl || file.url || ''}')`
                              }}
                            />
                          </div>
                        ))}
                        {fileList.length > 12 && (
                          <div
                            className="aspect-square rounded-lg bg-gray-800/50 flex items-center justify-center cursor-pointer text-[10px] text-violet-400 font-bold"
                            onClick={() => setShowAllPreviews(!showAllPreviews)}
                          >
                            {showAllPreviews ? 'Show less' : `+${fileList.length - 12} more`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {uploadProgress > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-fuchsia-400 font-bold mb-1">
                      <span>UPLOADING...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress
                      percent={uploadProgress}
                      showInfo={false}
                      strokeColor={{ '0%': '#8b5cf6', '100%': '#d946ef' }}
                      size="small"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-white/5">
              <Button
                onClick={handleCancel}
                className="bg-transparent border-white/10 text-white/70"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={loading}
                disabled={fetchingDetails}
                onClick={onFinish}
                className="bg-fuchsia-600 border-none px-8"
              >
                {isEdit ? 'Update Dataset' : 'Create Dataset'}
              </Button>
            </div>
          </Form>
        </div>
      )}
    </GlassModal>
  )
}
