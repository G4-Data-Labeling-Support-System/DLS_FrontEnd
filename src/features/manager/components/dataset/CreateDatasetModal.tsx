import React, { useState, useEffect, useRef } from 'react'
import { App, Form, Input, Select, Upload, Button, Progress, Checkbox } from 'antd'
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import type { UploadChangeParam } from 'antd/es/upload'
import axios, { type AxiosProgressEvent } from 'axios'
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
  const [fetching, setFetching] = useState(false)
  const [projects, setProjects] = useState<GetProjectsParams[]>([])
  const [fileList, setFileList] = useState<(UploadFile & { preview?: string })[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showAllPreviews, setShowAllPreviews] = useState(false)

  const fileListRef = useRef(fileList)
  useEffect(() => {
    fileListRef.current = fileList
  }, [fileList])

  // 1. Fetch initial dataset details if editing
  useEffect(() => {
    const fetchDetails = async () => {
      if (open && isEdit && initialData?.datasetId) {
        setFetching(true)
        try {
          const res = await datasetApi.getDatasetById(initialData.datasetId)
          const data = res.data?.data || res.data
          if (data) {
            form.setFieldsValue({
              datasetName: data.datasetName || data.name,
              description: data.description,
              projectId: data.projectId || data.project?.id
            })
          }
        } catch (error) {
          console.error('Failed to fetch dataset details:', error)
          message.error('Failed to refresh dataset details.')
        } finally {
          setFetching(false)
        }
      } else if (open && !isEdit) {
        form.resetFields()
        setFileList([])
        if (initialProjectId) {
          form.setFieldsValue({ projectId: initialProjectId })
        }
      }
    }
    fetchDetails()
  }, [open, isEdit, initialData?.datasetId, initialProjectId, form, message])

  // 2. Load active projects list
  useEffect(() => {
    const fetchProjects = async () => {
      if (!open) return
      try {
        const response = await projectApi.getProjects({ projectStatus: 'ACTIVE' })
        const data = response.data?.data || response.data || []
        if (Array.isArray(data)) {
          setProjects(data)
        }
      } catch (error) {
        console.error('Failed to fetch projects list:', error)
      }
    }
    fetchProjects()
  }, [open])

  useEffect(() => {
    return () => {
      fileListRef.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [])

  const handleUploadChange = (info: UploadChangeParam<UploadFile & { preview?: string }>) => {
    let newFileList = [...info.fileList]
    
    // performance: only generate preview for the first 12 files (unless expanded) to avoid browser lag
    const limit = showAllPreviews ? newFileList.length : 12
    newFileList = newFileList.map((file, index) => {
      if (index < limit && !file.preview && file.originFileObj) {
        file.preview = URL.createObjectURL(file.originFileObj as Blob)
      }
      return file
    })
    setFileList(newFileList)
  }

  // Generate missing previews when expanding
  useEffect(() => {
    if (showAllPreviews && fileList.some(f => !f.preview && f.originFileObj)) {
      setFileList(prev => prev.map(file => {
        if (!file.preview && file.originFileObj) {
          file.preview = URL.createObjectURL(file.originFileObj as Blob)
        }
        return file
      }))
    }
  }, [showAllPreviews, fileList])

  const handleRemoveFile = (uid: string) => {
    setFileList((prev) => {
      const newFile = prev.find((item) => item.uid === uid)
      if (newFile?.preview) URL.revokeObjectURL(newFile.preview)
      return prev.filter((item) => item.uid !== uid)
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setFileList([])
    onCancel()
  }

  const onFinish = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (isEdit && initialData?.datasetId) {
        await datasetApi.updateDataset(initialData.datasetId, {
          datasetName: values.datasetName,
          description: values.description
        })
        message.success('Dataset updated successfully!')
        if (onSuccess) onSuccess(initialData.datasetId)
        handleCancel()
        return
      }

      let files = fileList
        .map((f) => f.originFileObj as File | undefined)
        .filter((f): f is File => !!f)

      if (values.compressImages && !isEdit) {
        const totalFiles = files.length
        message.loading({ content: `Compressing 0/${totalFiles} images...`, key: 'compressing', duration: 0 })
        
        const compressedResults: File[] = []
        for (let i = 0; i < files.length; i++) {
          try {
            const compressed = await compressImage(files[i])
            compressedResults.push(compressed)
          } catch (err) {
            console.error(`Compression failed for ${files[i].name}:`, err)
            compressedResults.push(files[i])
          }
          if (i % 10 === 0 || i === files.length - 1) {
            message.loading({ content: `Compressing ${i + 1}/${totalFiles} images...`, key: 'compressing', duration: 0 })
          }
        }
        files = compressedResults
        message.success({ content: 'Compression complete!', key: 'compressing', duration: 2 })
      }

      const totalSize = files.reduce((acc, f) => acc + f.size, 0)

      if (files.length < 30) {
        message.warning({
          content: `Please upload at least 30 images (Current: ${files.length}).`,
          key: 'min_imgs_val'
        })
        setLoading(false)
        return
      }

      const response = await datasetApi.createDataset(
        {
          projectId: values.projectId,
          datasetName: values.datasetName,
          description: values.description,
          files: files.length > 0 ? files : undefined
        },
        (progressEvent: AxiosProgressEvent) => {
          const total = progressEvent.total || totalSize
          const percent = Math.round((progressEvent.loaded * 100) / total)
          setUploadProgress(percent)
        }
      )
      message.success('Dataset created successfully!')
      if (onSuccess) {
        const createdDataset = response.data?.data || response.data
        const newDatasetId = createdDataset?.datasetId || createdDataset?.id
        onSuccess(newDatasetId)
      }
      handleCancel()
    } catch (error: unknown) {
      setUploadProgress(0)
      if (error && typeof error === 'object' && 'errorFields' in error) return
      
      let errorMessage = 'Unknown error'
      
      if (axios.isAxiosError(error)) {
        console.error('🚢 API ERROR: CREATE/UPDATE DATASET', {
          error: error,
          responseData: error.response?.data,
          responseStatus: error.response?.status,
          code: error.code
        })
        
        errorMessage = error.response?.data?.message || error.message
        
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_RESET') {
          errorMessage = 'Network Error: Connection reset. This often happens because the upload is very large or takes too long. Please stay on the page until upload completes.'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

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
    <GlassModal
      open={open}
      onCancel={handleCancel}
      width={800}
      destroyOnHidden
    >
      <div className="px-8 pt-10 pb-8">
        <div className="text-center border-b border-white/5 pb-6 mb-8">
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
            {isEdit ? 'Edit Dataset' : 'Create New Dataset'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isEdit
              ? 'Update the details below to modify your dataset.'
              : 'Fill in the details below to create a new dataset for your project.'}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="mt-6"
          initialValues={{
            datasetName: initialData?.datasetName,
            description: initialData?.description,
            projectId: initialProjectId || initialData?.projectId
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Form.Item
                name="datasetName"
                label={<span className="text-white/90">Dataset Name</span>}
                rules={[{ required: true, message: 'Please enter dataset name' }]}
              >
                <Input
                  size="large"
                  placeholder="e.g. Image_Training_Set_Alpha"
                  className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 focus:!border-violet-500 hover:!border-violet-500/50"
                />
              </Form.Item>

              {!isEdit && (
                <Form.Item
                  name="projectId"
                  label={<span className="text-white/90">Select Project</span>}
                  rules={[{ required: true, message: 'Please select a project' }]}
                >
                  <Select
                    size="large"
                    placeholder="Select a project for this dataset"
                    className="w-full"
                    classNames={{ popup: { root: "!bg-[#1a1625] !border !border-white/10 [&_.ant-select-item]:!text-gray-300 [&_.ant-select-item-option-active]:!bg-violet-500/20 [&_.ant-select-item-option-selected]:!bg-violet-500/40 [&_.ant-select-item-option-selected]:!text-white" } }}
                    loading={projects.length === 0 && open && !fetching}
                    showSearch
                    optionFilterProp="children"
                    disabled={!!initialProjectId}
                    options={projects.map((p) => ({
                      label: p.projectName || 'Unnamed Project',
                      value: p.projectId
                    }))}
                  />
                </Form.Item>
              )}

              <Form.Item
                name="description"
                label={<span className="text-white/90">Description</span>}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Briefly describe the purpose of this dataset..."
                  className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
                />
              </Form.Item>

              {!isEdit && (
                <Form.Item
                  name="compressImages"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Checkbox className="!text-gray-400 [&_.ant-checkbox-inner]:!bg-[#1a1625] [&_.ant-checkbox-inner]:!border-white/10">
                    <span className="text-xs">
                      Compress images before upload (Recommended for <span className="text-violet-400 font-bold">reliability</span>)
                    </span>
                  </Checkbox>
                </Form.Item>
              )}
            </div>

            {!isEdit && (
              <div className="space-y-4">
                <label className="text-white/90 font-medium block text-sm mb-2">
                  Image Uploads (Required - Min 30)
                </label>
                <div className="rounded-xl overflow-hidden bg-[#1a1625]/30 border border-dashed border-white/20 hover:border-violet-500/50 transition-all group">
                  <Dragger
                    multiple
                    directory
                    name="file"
                    beforeUpload={() => false}
                    fileList={fileList}
                    onChange={handleUploadChange}
                    showUploadList={false}
                    className="!border-0 !bg-transparent p-4"
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <InboxOutlined className="text-violet-500 text-3xl mb-2" />
                      <p className="text-white font-medium text-xs mb-1">Click or drag images or folders</p>
                    </div>
                  </Dragger>

                  {fileList.length > 0 && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 max-h-[150px] overflow-y-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Preview ({fileList.length}) - Total: {(fileList.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <span
                          className="text-[10px] text-violet-500 font-bold cursor-pointer hover:text-white"
                          onClick={() => setFileList([])}
                        >
                          Clear all
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(showAllPreviews ? fileList : fileList.slice(0, 12)).map((file) => (
                          <div
                            key={file.uid}
                            className="aspect-square rounded-lg bg-gray-800 border border-white/10 relative group/thumb overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer z-10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFile(file.uid)
                              }}
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
                        {fileList.length > 12 && !showAllPreviews && (
                          <div 
                            className="aspect-square rounded-lg bg-gray-800/50 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-violet-500/20 transition-colors"
                            onClick={() => setShowAllPreviews(true)}
                          >
                            <span className="text-[10px] text-violet-400 font-bold">+{fileList.length - 12} more</span>
                          </div>
                        )}
                        {showAllPreviews && fileList.length > 12 && (
                           <div 
                           className="aspect-square rounded-lg bg-gray-800/50 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-violet-500/20 transition-colors"
                           onClick={() => setShowAllPreviews(false)}
                         >
                           <span className="text-[10px] text-violet-400 font-bold">Show less</span>
                         </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                  <p className="text-gray-400 text-[11px] leading-relaxed m-0">
                    <span className="text-violet-400 font-bold mr-1">TIP:</span>
                    A dataset must contain at least <span className="text-violet-400 font-bold">30 images</span> for initial creation. You can upload individual files or entire folders.
                  </p>
                </div>

                {uploadProgress > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-fuchsia-400 font-bold mb-1 uppercase tracking-wider">
                      <span>Uploading Data...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress 
                      percent={uploadProgress} 
                      showInfo={false} 
                      strokeColor={{ '0%': '#8b5cf6', '100%': '#d946ef' }}
                      railColor="rgba(255,255,255,0.05)"
                      size="small"
                    />
                  </div>
                )}
              </div>
            )}

            {isEdit && (
              <div className="flex items-center justify-center h-full">
                <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10 w-full">
                  <h4 className="text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
                    Manager Information
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed m-0">
                    Updating a dataset's name and description doesn't affect existing items. Project assignment cannot be changed after creation.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-white/5">
            <Button
              onClick={handleCancel}
              className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={onFinish}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 border-none px-8 shadow-[0_0_15px_rgba(192,38,211,0.3)]"
            >
              {isEdit ? 'Update Dataset' : 'Create Dataset'}
            </Button>
          </div>
        </Form>
      </div>
    </GlassModal>
  )
}
