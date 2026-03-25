import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import assignmentApi from '@/api/AssignmentApi'
import projectApi from '@/api/ProjectApi'
import { ProjectCard } from '@/features/reviewer/components/ProjectCard'
import { Spin, Empty } from 'antd'
import { LoadingOutlined, FolderOpenOutlined } from '@ant-design/icons'

export default function ReviewerAllProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user?.id) {
          setError('User information is missing.')
          return
        }

        // 1. Get assignments for reviewer
        const assignRes = await assignmentApi.getAssignmentsByReviewer(user.id)
        const assignments = assignRes.data?.data || assignRes.data || []

        // 2. Extract unique project IDs
        const projectIds = [
          ...new Set(
            assignments
              .map((a: any) => a.projectId || a.project?.projectId || a.project?.id)
              .filter((id: any) => id && !String(id).startsWith('PROJ-MOCK'))
          )
        ] as string[]

        if (projectIds.length > 0) {
          // 3. Fetch project details
          const projectPromises = projectIds.map((pId) => projectApi.getProjectById(pId))
          const projectResponses = await Promise.allSettled(projectPromises)

          const validProjects = projectResponses
            .filter((res) => res.status === 'fulfilled')
            .map((res: any) => res.value.data?.data || res.value.data)
            .filter((p) => {
              const status = (p.projectStatus || p.status || '').toUpperCase()
              return status && status !== 'INACTIVE'
            })
            .map((p) => ({
              ...p,
              id: p.projectId || p.id,
              name: p.projectName || p.name,
              status: p.projectStatus || p.status
            }))

          setProjects(validProjects)
        } else {
          setProjects([])
        }
      } catch (err) {
        console.error('Failed to fetch projects for reviewer:', err)
        setError('Failed to load projects. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user?.id])

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <FolderOpenOutlined className="text-2xl text-fuchsia-400" />
        <h1 className="text-2xl font-bold text-white tracking-tight">Review Projects</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
          <span className="mt-4 text-violet-400 font-mono animate-pulse">Syncing projects with server...</span>
        </div>
      ) : error ? (
        <div className="text-center text-gray-400 py-20 glass-panel rounded-xl border border-dashed border-gray-700">
          {error}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              projectName={p.name}
              status={p.status}
              createdAt={p.createdAt}
              updatedAt={p.updatedAt}
              description={p.descriptionProject || p.description}
              onClick={() => navigate(`/reviewer/projects/${p.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-xl border border-dashed border-gray-700">
          <Empty description={<span className="text-gray-400">No projects assigned for review.</span>} />
        </div>
      )}
    </div>
  )
}
