import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import assignmentApi from '@/api/AssignmentApi'
import guidelineApi from '@/api/GuidelineApi'
import projectApi from '@/api/ProjectApi'
import { themeClasses } from '@/styles'
import {
  DashboardTabs,
  type DashboardTabType
} from '@/features/manager/components/dashboard/DashboardTabs'
import { useAuthStore } from '@/store/auth.store'
import AssignmentHeader from './components/AssignmentHeader'
import TasksSection from './components/TaskSection'
import GuidelineSection from './components/GuidelineSection'
import AnnotatorProjectDetail from './components/AnnotationProjectDetail'
import AnnotatorDatasetCard from './components/AnnotatorDatasetCard'

// ============ Types ============
interface AssignmentTask {
  id: string
  name: string
  taskStatus: string
  annotationStatus: string
  batchLabel: string
  timeTaken: string
  [key: string]: string | number | boolean | undefined | object | null
}

interface Assignment {
  id: string
  name: string
  status: string
  description: string
  projectId: string
  completedTasks: number
  totalTasks: number
  tasks: AssignmentTask[]
}

interface ProjectDetail {
  id: string
  name: string
  status: string
  description: string
}

interface Guideline {
  id: string
  content: string
  status: string
}



export default function AnnotatorDashboardPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab: DashboardTabType = location.pathname.includes('/assignment')
    ? 'assignment'
    : 'project'

  const handleTabChange = (tab: DashboardTabType) => {
    if (tab === 'project') {
      navigate(assignmentId ? `/annotator/project/${assignmentId}` : '/annotator/project')
    } else {
      navigate(assignmentId ? `/annotator/assignment/${assignmentId}` : '/annotator/assignment')
    }
  }

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null)
  const [guideline, setGuideline] = useState<Guideline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (assignmentId && !assignmentId.startsWith('ASGN-MOCK')) {
          // Fetch Assignment Data
          const assignmentRes = await assignmentApi.getAssignmentById(assignmentId)
          const assignmentData = assignmentRes.data?.data || assignmentRes.data

          // Normalize assignment
          const normAssignment = {
            ...assignmentData,
            id: assignmentData.assignmentId || assignmentData.id,
            name: assignmentData.assignmentName || assignmentData.name || assignmentData.title,
            status: assignmentData.assignmentStatus || assignmentData.status,
            description: assignmentData.descriptionAssignment || assignmentData.description,
            projectId:
              assignmentData.projectId ||
              assignmentData.project?.projectId ||
              assignmentData.project?.id,
            // Fallback to mock tasks and counts if missing
            tasks: assignmentData.tasks || [],
            completedTasks: assignmentData.completedTasks ?? 0,
            totalTasks: assignmentData.totalTasks || 0
          }
          setAssignment(normAssignment)

          // Fetch associated Guideline
          const projectIdToFetch = normAssignment.projectId
          if (projectIdToFetch && !projectIdToFetch.startsWith('PROJ-MOCK')) {
            const guidelineRes = await guidelineApi.getGuidelines(projectIdToFetch)
            const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
            const activeGuide = Array.isArray(guidelinesList)
              ? (guidelinesList.find(
                (g: Guideline) => g.status === 'ACTIVE' || g.status === 'active'
              ) ??
                guidelinesList[0] ??
                null)
              : guidelinesList
            setGuideline(activeGuide)

            // Also fetch the project details for the project tab
            const projectRes = await projectApi.getProjectById(projectIdToFetch)
            const rawProj = projectRes.data?.data || projectRes.data
            setProjectDetail({
              ...rawProj,
              id: rawProj.projectId || rawProj.id,
              name: rawProj.projectName || rawProj.name,
              status: rawProj.projectStatus || rawProj.status
            })
          }
        } else {
          // No assignmentId (e.g., viewing normal dashboard screen)
          // Fetch the user's assignments
          if (user?.id) {
            let hasFetchedProject = false
            try {
              const assignRes = await assignmentApi.getAssignmentsByAnnotator(user.id)
              const assignsList = assignRes.data?.data || assignRes.data || []

              if (assignsList.length > 0) {
                const rawAssign = assignsList[0]
                const normAssign = {
                  ...rawAssign,
                  id: rawAssign.assignmentId || rawAssign.id,
                  name: rawAssign.assignmentName || rawAssign.name || rawAssign.title,
                  status: rawAssign.assignmentStatus || rawAssign.status,
                  description: rawAssign.descriptionAssignment || rawAssign.description,
                  projectId:
                    rawAssign.projectId || rawAssign.project?.projectId || rawAssign.project?.id,
                  // Fallback to mock tasks and counts if missing
                  tasks: rawAssign.tasks || [],
                  completedTasks: rawAssign.completedTasks ?? 0,
                  totalTasks: rawAssign.totalTasks || 0
                }
                setAssignment(normAssign)

                const projectIdToFetch = normAssign.projectId
                if (projectIdToFetch && !projectIdToFetch.startsWith('PROJ-MOCK')) {
                  const guidelineRes = await guidelineApi.getGuidelines(projectIdToFetch)
                  const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
                  const activeGuide = Array.isArray(guidelinesList)
                    ? (guidelinesList.find(
                      (g: Guideline) => g.status === 'ACTIVE' || g.status === 'active'
                    ) ??
                      guidelinesList[0] ??
                      null)
                    : guidelinesList
                  setGuideline(activeGuide)

                  const projectRes = await projectApi.getProjectById(projectIdToFetch)
                  const rawProj = projectRes.data?.data || projectRes.data
                  setProjectDetail({
                    ...rawProj,
                    id: rawProj.projectId || rawProj.id,
                    name: rawProj.projectName || rawProj.name,
                    status: rawProj.projectStatus || rawProj.status
                  })
                  hasFetchedProject = true
                }
              }
            } catch (err: unknown) {
              console.warn('Could not fetch assignments or user has no assignments', err)
            }

            // Fallback: If we couldn't fetch a project via assignments, fetch projects directly
            if (!hasFetchedProject) {
              try {
                const projectsRes = await projectApi.getProjects()
                const projectsList = projectsRes.data?.data || projectsRes.data || []

                if (projectsList.length > 0) {
                  const firstProjRaw = projectsList[0]
                  const firstProjId = firstProjRaw.projectId || firstProjRaw.id
                  if (firstProjId && !String(firstProjId).startsWith('PROJ-MOCK')) {
                    const detailRes = await projectApi.getProjectById(firstProjId)
                    const rawProj = detailRes.data?.data || detailRes.data
                    setProjectDetail({
                      ...rawProj,
                      id: rawProj.projectId || rawProj.id,
                      name: rawProj.projectName || rawProj.name,
                      status: rawProj.projectStatus || rawProj.status
                    })

                    const guidelineRes = await guidelineApi.getGuidelines(firstProjId)
                    const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
                    const activeGuide = Array.isArray(guidelinesList)
                      ? (guidelinesList.find(
                        (g: Guideline) => g.status === 'ACTIVE' || g.status === 'active'
                      ) ??
                        guidelinesList[0] ??
                        null)
                      : guidelinesList
                    setGuideline(activeGuide)
                    hasFetchedProject = true
                  }
                }
              } catch (err) {
                console.error('Failed to fetch fallback projects', err)
              }
            }

            if (!hasFetchedProject) {
              setError('No data found for this user.')
            }
          }
        }
      } catch (err: unknown) {
        console.error('API Error:', err)
        setError('Failed to load dashboard data. Please try again later.')

      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [assignmentId, user?.id])

  return (
    <div className="p-6">
      <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'project' &&
        (!projectDetail && loading ? (
          <div className="text-center text-gray-400 py-20">Loading project...</div>
        ) : projectDetail ? (
          <>
            {loading && (
              <div className="flex items-center gap-2 mb-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                <span className="text-xs text-violet-400 font-mono">Syncing with server...</span>
              </div>
            )}
            <div className="rounded-2xl grid md:grid-cols-2 sm:grid-cols-1 gap-6">
              <AnnotatorProjectDetail project={projectDetail} />
              {guideline && <GuidelineSection guideline={guideline.content} />}
              <div className="md:col-span-2">
                <AnnotatorDatasetCard projectId={projectDetail.id} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-10 glass-panel rounded-2xl">
            No project found.
          </div>
        ))}

      {activeTab === 'assignment' &&
        (!assignment && loading ? (
          <div className="text-center text-gray-400 py-20">Loading assignment...</div>
        ) : error || !assignment ? (
          <div className="text-center text-red-400 py-20">{error ?? 'Assignment not found'}</div>
        ) : (
          <>
            <div className="rounded-2xl grid md:grid-cols-2 sm:grid-cols-1 gap-6">
              {/* Assignment Header */}
              <AssignmentHeader assignment={assignment} />

              {/* Guideline Section */}
              {guideline && <GuidelineSection guideline={guideline.content ?? ''} />}

              {/* Tasks Section */}
              {assignment.tasks && (
                <div
                  className={`${themeClasses.backgrounds.card} border ${themeClasses.borders.violet10} rounded-2xl p-6 md:col-span-2`}
                >
                  <TasksSection tasks={assignment.tasks} />
                </div>
              )}
            </div>
          </>
        ))}
    </div>
  )
}
