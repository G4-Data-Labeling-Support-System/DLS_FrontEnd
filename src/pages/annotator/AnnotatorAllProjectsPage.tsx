import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import assignmentApi from '@/api/AssignmentApi'
import projectApi from '@/api/ProjectApi'
import { ProjectCard } from '@/features/annotator/components/ProjectCard'

export default function AnnotatorAllProjectsPage() {
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

        // 1. Lấy danh sách Assignments của annotator
        const assignRes = await assignmentApi.getAssignmentsByAnnotator(user.id)
        const assignments = assignRes.data?.data || assignRes.data || []

        // 2. Lọc ra danh sách projectId duy nhất
        const projectIds = [
          ...new Set(
            assignments
              .map((a: any) => a.projectId || a.project?.projectId || a.project?.id)
              .filter((id: any) => id && !String(id).startsWith('PROJ-MOCK'))
          )
        ] as string[]

        if (projectIds.length > 0) {
          // 3. Lấy thông tin chi tiết của từng project
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
          // Fallback: nếu annotator chưa được gán assignment nào nhưng dự án được mở (tuỳ logic hệ thống)
          const projectsRes = await projectApi.getProjects()
          const projectsList = projectsRes.data?.data || projectsRes.data || []
          
          const validProjects = projectsList
            .filter((p: any) => {
              const status = (p.projectStatus || p.status || '').toUpperCase()
              return status && status !== 'INACTIVE' && !String(p.projectId || p.id).startsWith('PROJ-MOCK')
            })
            .map((p: any) => ({
              ...p,
              id: p.projectId || p.id,
              name: p.projectName || p.name,
              status: p.projectStatus || p.status
            }))

          setProjects(validProjects)
        }
      } catch (err) {
        console.error('Failed to fetch projects for annotator:', err)
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
        <span className="material-symbols-outlined text-[24px] text-fuchsia-400">folder_open</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">All Projects</h1>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
          <span className="text-xs text-violet-400 font-mono">Syncing projects with server...</span>
        </div>
      ) : error ? (
        <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          {error}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
             <ProjectCard
                key={p.id}
                id={p.id}
                projectName={p.name}
                status={p.status}
                createdAt={p.createdAt}
                updatedAt={p.updatedAt}
                description={p.descriptionProject || p.description}
                onClick={() => navigate(`/annotator/projects/${p.id}`)}
             />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          No projects available.
        </div>
      )}
    </div>
  )
}
