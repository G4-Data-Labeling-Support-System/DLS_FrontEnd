import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import assignmentApi from '@/services/AssignmentApi'
import projectApi from '@/services/ProjectApi'
import { ProjectCard } from '@/features/annotator/components/ProjectCard'
import { Skeleton } from '@/components/ui/skeleton'
import { FolderOpen, AlertCircle } from 'lucide-react'



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
      <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
        <FolderOpen className="w-6 h-6 text-violet-500" />
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">All Projects</h1>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-32 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You haven't been assigned to any projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              projectName={project.projectName || project.name}
              onClick={() => navigate(`/annotator/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

