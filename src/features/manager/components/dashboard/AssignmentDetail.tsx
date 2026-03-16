import React, { useEffect, useState } from 'react'
import { App, Spin, Typography, Card, Button, Descriptions, Tag, Empty } from 'antd'
import { EditOutlined, FolderOutlined, DatabaseOutlined } from '@ant-design/icons'
import assignmentApi, { type GetAssignmentsParams } from '@/api/AssignmentApi'
import taskApi from '@/api/TaskApi'
import projectApi from '@/api/ProjectApi'
import datasetApi from '@/api/DatasetApi'
import { ProjectDetail } from './ProjectDetail'
import { DatasetDetail } from '../dataset/DatasetDetail'
import { useSearchParams } from 'react-router-dom'

const { Title } = Typography

interface AssignmentDetailProps {
  assignmentId: string
  onBack: () => void
  onEdit?: (assignment: GetAssignmentsParams) => void
}

interface Task {
  taskId: string
  completedCount: number
  createdAt: string
  taskName: string
  reviewStatus: string
  taskStatus: string
  taskType: string
  assignmentId: string
}

interface Task {
  taskId: string
  completedCount: number
  createdAt: string
  taskName: string
  reviewStatus: string
  taskStatus: string
  taskType: string
  assignmentId: string
}

export const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  assignmentId,
  onBack,
  onEdit
}) => {
  const { message } = App.useApp()
  const [assignment, setAssignment] = useState<GetAssignmentsParams | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [datasetName, setDatasetName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState<boolean>(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const viewProjectId = searchParams.get('viewProjectId')
  const viewDatasetId = searchParams.get('viewDatasetId')

  const setViewProjectId = (id: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) {
        next.set('viewProjectId', id)
      } else {
        next.delete('viewProjectId')
      }
      return next
    })
  }

  const setViewDatasetId = (id: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) {
        next.set('viewDatasetId', id)
      } else {
        next.delete('viewDatasetId')
      }
      return next
    })
  }

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await assignmentApi.getAssignmentById(assignmentId)
        const data = response.data?.data || response.data

        if (data && isMounted) {
          const extractedProjectId = data.projectId || data.project?.id || data.project?.projectId
          const extractedDatasetId = data.datasetId || data.dataset?.id || data.dataset?.datasetId

          setAssignment({
            assignmentId: String(data.assignmentId || data.id),
            assignmentName: String(data.assignmentName || data.name),
            status: String(data.status || data.assignmentStatus),
            description: data.description
              ? String(data.description)
              : data.descriptionAssignment
                ? String(data.descriptionAssignment)
                : undefined,
            projectId: extractedProjectId ? String(extractedProjectId) : undefined,
            datasetId: extractedDatasetId ? String(extractedDatasetId) : undefined,
            createdAt: data.createdAt ? String(data.createdAt) : undefined,
            updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
            assignedTo:
              data.assignedTo || data.user_id || data.annotatorId
                ? String(data.assignedTo || data.user_id || data.annotatorId)
                : undefined,
            reviewedBy:
              data.reviewedBy || data.reviewerId
                ? String(data.reviewedBy || data.reviewerId)
                : undefined,
            dueDate:
              data.dueDate || data.due_date ? String(data.dueDate || data.due_date) : undefined,
            assignedBy:
              data.assignedBy || data.creatorId
                ? String(data.assignedBy || data.creatorId)
                : undefined
          })

          // Fetch associated project name if projectId exists
          if (extractedProjectId) {
            try {
              const projRes = await projectApi.getProjectById(extractedProjectId)
              const projData = projRes.data?.data || projRes.data
              if (projData && isMounted) {
                setProjectName(String(projData.projectName || projData.name || extractedProjectId))
              }
            } catch (projErr) {
              console.error('Failed to fetch associated project details:', projErr)
            }
          }

          // Fetch associated dataset name if datasetId exists
          if (extractedDatasetId) {
            try {
              const dsRes = await datasetApi.getDatasetById(extractedDatasetId)
              const dsData = dsRes.data?.data || dsRes.data
              if (dsData && isMounted) {
                setDatasetName(String(dsData.datasetName || dsData.name || extractedDatasetId))
              }
            } catch (dsErr) {
              console.error('Failed to fetch associated dataset details:', dsErr)
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching assignment details:', error)
          message.error('Cannot load assignment details.')
          onBack() // Fallback to list if error
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const fetchTasks = async () => {
      try {
        setTasksLoading(true)
        const response = await taskApi.getTasksByAssignmentId(assignmentId)
        const data = response.data?.data || response.data || []
        if (isMounted) {
          setTasks(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
        // We don't necessarily want to block the whole view if tasks fail,
        // but it's good to log it.
      } finally {
        if (isMounted) {
          setTasksLoading(false)
        }
      }
    }

    if (assignmentId) {
      fetchDetail()
      fetchTasks()
    }

    return () => {
      isMounted = false
    }
  }, [assignmentId, onBack, message])

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'processing'
      case 'COMPLETED':
        return 'success'
      case 'PAUSED':
        return 'warning'
      case 'ARCHIVE':
        return 'error'
      case 'PENDING':
        return 'default'
      case 'IN_PROGRESS':
        return 'processing'
      case 'REJECTED':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="w-full text-center py-10 text-gray-400">
        Error loading assignment information.
      </div>
    )
  }

  if (viewProjectId) {
    return (
      <ProjectDetail
        projectId={viewProjectId}
        onBack={() => setViewProjectId(null)}
        isInline={true}
      />
    )
  }

  if (viewDatasetId) {
    return <DatasetDetail datasetId={viewDatasetId} onBack={() => setViewDatasetId(null)} />
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Title level={3} className="!text-white !m-0 !font-display">
            {assignment.assignmentName}
          </Title>
          <div className="mt-2">
            <Tag
              color={getStatusColor(assignment.status)}
              className="m-0 font-medium text-sm px-3 py-1"
            >
              {assignment.status || 'UNKNOWN'}
            </Tag>
          </div>
        </div>
        {/* 
                  Quick Action removed specifically as requested by user.
                  "không bao gồm quick action" could also mean omitting the Edit button if considered a quick action,
                  but Edit is standard. If needed to remove edit, we can just comment it out. Let's keep the Edit button for now
                  but omit features like "Add Subtask", etc. Actually, I will remove the edit button to be safe, since there is no edit endpoint connected safely in AllAssignments either yet.
                  Wait, ProjectDetail has an Edit button. Let's include it but maybe it does a message.info for now.
                */}
        {onEdit && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="bg-violet-600 hover:bg-violet-500 border-none"
            onClick={() => onEdit(assignment)}
          >
            Edit
          </Button>
        )}
      </div>

      <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6">
        <Descriptions
          title={
            <span className="text-white text-lg font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-400">info</span>Assignment
              Information
            </span>
          }
          column={1}
          className="custom-descriptions"
          styles={{
            label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
            content: { color: '#d1d5db' }
          }}
        >
          <Descriptions.Item label="Assignment ID">
            <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
              {assignment.assignmentId}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {assignment.description || <span className="text-gray-600 italic">No description</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(assignment.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {formatDate(assignment.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-1 mb-6 mt-1">
        <Card className="bg-[#1A1625] border-gray-800 rounded-xl h-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-lg font-display flex items-center gap-2">
              <FolderOutlined className="text-blue-400" />
              Associated Project
            </span>
          </div>
          {assignment.projectId ? (
            <div
              className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer"
              onClick={() => setViewProjectId(assignment.projectId || null)}
            >
              <h4 className="text-white font-bold text-sm truncate">
                {projectName ? projectName : `Project ID: ${assignment.projectId}`}
              </h4>
              <div className="text-gray-400 text-xs mt-1">Click to view project details</div>
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">No associated project</span>}
            />
          )}
        </Card>

        <Card className="bg-[#1A1625] border-gray-800 rounded-xl h-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-lg font-display flex items-center gap-2">
              <DatabaseOutlined className="text-fuchsia-400" />
              Assigned Dataset
            </span>
          </div>
          {assignment.datasetId ? (
            <div
              className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-fuchsia-500/30 transition-colors cursor-pointer"
              onClick={() => setViewDatasetId(assignment.datasetId || null)}
            >
              <h4 className="text-white font-bold text-sm truncate">
                {datasetName ? datasetName : `Dataset ID: ${assignment.datasetId}`}
              </h4>
              <div className="text-gray-400 text-xs mt-1">Click to view dataset details</div>
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">No assigned dataset</span>}
            />
          )}
        </Card>
      </div>

      <Card
        className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 flex flex-col"
        styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-lg font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">task</span>
            Assignment Tasks
          </span>
          <Tag
            color="#10b981"
            className="border-0 bg-emerald-600/20 text-emerald-300 font-bold px-3 rounded-full"
          >
            {tasks.length} Tasks
          </Tag>
        </div>

        {tasksLoading ? (
          <div className="w-full h-32 flex justify-center items-center">
            <Spin />
          </div>
        ) : tasks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500">No Data</span>}
            className="my-4"
          />
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-white font-bold text-sm truncate">
                      {task.taskName || 'Unspecified Name'}
                    </span>
                    <span className="text-gray-500 text-xs font-mono">ID: {task.taskId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag
                      color={getStatusColor(task.taskStatus || task.reviewStatus)}
                      className="m-0 text-xs px-2 py-0.5"
                    >
                      {(task.taskStatus || task.reviewStatus || 'UNKNOWN').toUpperCase()}
                    </Tag>
                    {task.createdAt && (
                      <span className="text-gray-500 text-xs hidden md:inline">
                        {new Date(task.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <style>{`
                .custom-descriptions .ant-descriptions-title {
                    margin-bottom: 20px;
                }
                .custom-descriptions .ant-descriptions-item-container {
                    border-bottom: 1px solid #2d263b;
                    padding-bottom: 12px;
                    margin-bottom: 12px;
                }
                .custom-descriptions .ant-descriptions-item-container:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
            `}</style>
    </div>
  )
}
