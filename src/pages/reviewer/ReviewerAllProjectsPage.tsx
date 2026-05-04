import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import assignmentApi from '@/api/AssignmentApi'
import projectApi from '@/api/ProjectApi'
import { ProjectCard } from '@/features/reviewer/components/ProjectCard'
import { FolderOpenOutlined } from '@ant-design/icons'
import { type AxiosResponse } from 'axios'

interface Project {
  id: string
  name: string
  status: string
  createdAt?: string
  updatedAt?: string
  descriptionProject?: string
  description?: string
  projectStatus?: string
  projectName?: string
  projectId?: string
  [key: string]: unknown
}

export default function ReviewerAllProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
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

        // 1. Lấy danh sách Assignments của reviewer
        const assignRes = await assignmentApi.getAssignmentsByReviewer(user.id)
        const assignments = assignRes.data?.data || assignRes.data || []

        // 2. Lọc ra danh sách projectId duy nhất
        const projectIds = [
          ...new Set(
            assignments
              .map((a: { projectId?: string; project?: { projectId?: string; id?: string } }) => a.projectId || a.project?.projectId || a.project?.id)
              .filter((id: string | undefined) => id && !String(id).startsWith('PROJ-MOCK'))
          )
        ] as string[]

        if (projectIds.length > 0) {
          // 3. Lấy thông tin chi tiết của từng project
          const projectPromises = projectIds.map((pId) => projectApi.getProjectById(pId))
          const projectResponses = await Promise.allSettled(projectPromises)

          const validProjects = projectResponses
            .filter((res): res is PromiseFulfilledResult<AxiosResponse<any>> => res.status === 'fulfilled')
            .map((res) => {
              const d = res.value.data as Record<string, unknown>
              return (d?.data || d) as Project
            })
            .filter((p: Project) => {
              const status = (p.projectStatus || p.status || '').toUpperCase()
              return status && status !== 'INACTIVE'
            })
            .map((p: Project) => ({
              ...p,
              id: p.projectId || p.id,
              name: p.projectName || p.name,
              status: p.projectStatus || p.status
            }))

          setProjects(validProjects)
        } else {
          // Fallback: Nếu reviewer chưa được gán assignment nào nhưng vẫn muốn xem danh sách project (theo logic annotator)
          const projectsRes = await projectApi.getProjects()
          const projectsList = projectsRes.data?.data || projectsRes.data || []

          const validProjects = projectsList
            .filter((p: Project) => {
              const status = (p.projectStatus || p.status || '').toUpperCase()
              return status && status !== 'INACTIVE' && !String(p.projectId || p.id).startsWith('PROJ-MOCK')
            })
            .map((p: Project) => ({
              ...p,
              id: p.projectId || p.id,
              name: p.projectName || p.name,
              status: p.projectStatus || p.status
            }))

          setProjects(validProjects)
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
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Review Projects</h1>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
          <span className="text-xs text-violet-400 font-mono">Syncing projects with server...</span>
        </div>
      ) : error ? (
        <div className="text-center text-gray-500 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          {error}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
        <div className="text-center text-gray-500 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          No projects available for review.
        </div>
      )}
    </div>
  )
}

