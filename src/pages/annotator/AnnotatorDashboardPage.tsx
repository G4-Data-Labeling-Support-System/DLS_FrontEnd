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
import {
  AssignmentHeader,
  TasksSection,
  GuidelineSection,
  AnnotationProjectDetail,
  AnnotatorDatasetCard,
  MOCK_TEST_TASK
} from '@/features/annotator'

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
          const actualTasks = Array.isArray(assignmentData.tasks) ? assignmentData.tasks : []
          const fallbackTasks = actualTasks.length > 0 ? actualTasks : [MOCK_TEST_TASK]
          const calcCompleted = actualTasks.filter(
            (t: AssignmentTask) =>
              t.taskStatus === 'COMPLETED' || t.annotationStatus === 'COMPLETED'
          ).length

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
            tasks: fallbackTasks,
            completedTasks:
              actualTasks.length > 0 ? calcCompleted : (assignmentData.completedTasks ?? 0),
            totalTasks: actualTasks.length > 0 ? actualTasks.length : assignmentData.totalTasks || 1
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
            const pStatus = (rawProj.projectStatus || rawProj.status || '').toUpperCase()
            
            if (pStatus && pStatus !== 'INACTIVE') {
              setProjectDetail({
                ...rawProj,
                id: rawProj.projectId || rawProj.id,
                name: rawProj.projectName || rawProj.name,
                status: rawProj.projectStatus || rawProj.status
              })
            } else {
              setAssignment(null)
              setProjectDetail(null)
              setGuideline(null)
            }
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
                for (const rawAssign of assignsList) {
                  const pId = rawAssign.projectId || rawAssign.project?.projectId || rawAssign.project?.id
                  if (pId && !String(pId).startsWith('PROJ-MOCK')) {
                    const pRes = await projectApi.getProjectById(pId)
                    const rawP = pRes.data?.data || pRes.data
                    const pStatus = (rawP.projectStatus || rawP.status || '').toUpperCase()

                    if (pStatus && pStatus !== 'INACTIVE') {
                      const actualTasks2 = Array.isArray(rawAssign.tasks) ? rawAssign.tasks : []
                      const fallbackTasks2 = actualTasks2.length > 0 ? actualTasks2 : [MOCK_TEST_TASK]
                      const calcCompleted2 = actualTasks2.filter(
                        (t: Record<string, unknown>) =>
                          t.taskStatus === 'COMPLETED' || t.annotationStatus === 'COMPLETED'
                      ).length

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

                      const guidelineRes = await guidelineApi.getGuidelines(pId)
                      const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
                      const activeGuide = Array.isArray(guidelinesList)
                        ? (guidelinesList.find(
                            (g: Guideline) => g.status === 'ACTIVE' || g.status === 'active'
                          ) ??
                          guidelinesList[0] ??
                          null)
                        : guidelinesList
                      setGuideline(activeGuide)

                      setProjectDetail({
                        ...rawP,
                        id: rawP.projectId || rawP.id,
                        name: rawP.projectName || rawP.name,
                        status: rawP.projectStatus || rawP.status
                      })
                      hasFetchedProject = true
                      break
                    }
                  }
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
                  for (const firstProjRaw of projectsList) {
                    const firstProjId = firstProjRaw.projectId || firstProjRaw.id
                    if (firstProjId && !String(firstProjId).startsWith('PROJ-MOCK')) {
                      const detailRes = await projectApi.getProjectById(firstProjId)
                      const rawProj = detailRes.data?.data || detailRes.data
                      const pStatus = (rawProj.projectStatus || rawProj.status || '').toUpperCase()

                      if (pStatus && pStatus !== 'INACTIVE') {
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
              setError('No project and no assignment found for this user.')
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
              <AnnotationProjectDetail project={projectDetail} />
              {guideline && <GuidelineSection guideline={guideline.content} />}
              <div className="md:col-span-2">
                <AnnotatorDatasetCard 
                  projectId={projectDetail.id} 
                  assignmentId={assignmentId}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-10 glass-panel rounded-2xl">
            {error ?? 'No project found.'}
          </div>
        ))}

      {activeTab === 'assignment' &&
        (!assignment && loading ? (
          <div className="text-center text-gray-400 py-20">Loading assignment...</div>
        ) : error || !assignment ? (
          <div className="text-center text-red-400 py-20">{error ?? 'No assignment found.'}</div>
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
                  <TasksSection tasks={assignment.tasks} assignmentId={assignment.id} />
                </div>
              )}
            </div>
          </>
        ))}
    </div>
  )
}
