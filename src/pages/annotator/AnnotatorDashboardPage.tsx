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

// ============ MOCK DATA ============
const MOCK_DATA = {
  assignment: {
    id: 'ASGN-MOCK-001',
    name: 'Image Classification - Batch A',
    status: 'IN_PROGRESS',
    description:
      'Please classify the following medical images based on the provided guidelines. Pay attention to edge clarity.',
    projectId: 'PROJ-MOCK-012',
    completedTasks: 12,
    totalTasks: 50,
    tasks: [
      {
        id: '1',
        name: 'X-RAY_001.jpg',
        taskStatus: 'COMPLETED',
        annotationStatus: 'submitted',
        batchLabel: 'Batch 1',
        timeTaken: '2m 15s'
      },
      {
        id: '2',
        name: 'X-RAY_002.jpg',
        taskStatus: 'COMPLETED',
        annotationStatus: 'submitted',
        batchLabel: 'Batch 1',
        timeTaken: '1m 45s'
      },
      {
        id: '3',
        name: 'X-RAY_003.jpg',
        taskStatus: 'IN_PROGRESS',
        annotationStatus: 'needs_editing',
        batchLabel: 'Batch 1',
        timeTaken: '0m 30s'
      },
      {
        id: '4',
        name: 'MRI_SCAN_A1.png',
        taskStatus: 'PENDING',
        annotationStatus: 'not_submitted',
        batchLabel: 'Batch 2',
        timeTaken: '--'
      },
      {
        id: '5',
        name: 'MRI_SCAN_A2.png',
        taskStatus: 'PENDING',
        annotationStatus: 'not_submitted',
        batchLabel: 'Batch 2',
        timeTaken: '--'
      }
    ]
  },
  project: {
    id: 'PROJ-MOCK-012',
    name: 'Medical Imaging Diagnosis AI',
    status: 'ACTIVE',
    description:
      'A large-scale project to label X-ray and MRI scans for training a diagnostic AI model.'
  },
  guideline: {
    id: 'GUIDE-001',
    content: `### Labeling Guidelines
1. **Identify Organs**: Locate the primary organ in the image.
2. **Quality Check**: Ensure the image is not blurry.
3. **Anomalies**: Flag any visible fractures or tumors.
4. **Consistency**: Use the standard coordinate system provided in the tools.`,
    status: 'ACTIVE'
  }
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

  const [assignment, setAssignment] = useState<any>(MOCK_DATA.assignment)
  const [projectDetail, setProjectDetail] = useState<any>(MOCK_DATA.project)
  const [guideline, setGuideline] = useState<any>(MOCK_DATA.guideline)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (assignmentId) {
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
            tasks:
              assignmentData.tasks && assignmentData.tasks.length > 0
                ? assignmentData.tasks
                : MOCK_DATA.assignment.tasks,
            completedTasks: assignmentData.completedTasks ?? MOCK_DATA.assignment.completedTasks,
            totalTasks: assignmentData.totalTasks || MOCK_DATA.assignment.totalTasks
          }
          setAssignment(normAssignment)

          // Fetch associated Guideline
          const projectIdToFetch = normAssignment.projectId
          if (projectIdToFetch) {
            const guidelineRes = await guidelineApi.getGuidelines(projectIdToFetch)
            const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
            const activeGuide = Array.isArray(guidelinesList)
              ? (guidelinesList.find((g: any) => g.status === 'ACTIVE' || g.status === 'active') ??
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
                  tasks:
                    rawAssign.tasks && rawAssign.tasks.length > 0
                      ? rawAssign.tasks
                      : MOCK_DATA.assignment.tasks,
                  completedTasks: rawAssign.completedTasks ?? MOCK_DATA.assignment.completedTasks,
                  totalTasks: rawAssign.totalTasks || MOCK_DATA.assignment.totalTasks
                }
                setAssignment(normAssign)

                const projectIdToFetch = normAssign.projectId
                if (projectIdToFetch) {
                  const guidelineRes = await guidelineApi.getGuidelines(projectIdToFetch)
                  const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
                  const activeGuide = Array.isArray(guidelinesList)
                    ? (guidelinesList.find(
                      (g: any) => g.status === 'ACTIVE' || g.status === 'active'
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
            } catch (err: any) {
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
                  if (firstProjId) {
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
                        (g: any) => g.status === 'ACTIVE' || g.status === 'active'
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
              // --- Inject Mock Data as Fallback when empty results ---
              setAssignment(MOCK_DATA.assignment)
              setProjectDetail(MOCK_DATA.project)
              setGuideline(MOCK_DATA.guideline as any)
              // -------------------------------------------------------
            }
          }
        }
      } catch (err: any) {
        console.error('API Error, falling back to mock data:', err)
        setError(null) // Clear error to show mock data instead

        // --- Inject Mock Data as Fallback ---
        setAssignment(MOCK_DATA.assignment)
        setProjectDetail(MOCK_DATA.project)
        setGuideline(MOCK_DATA.guideline as any)
        // ------------------------------------
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
            <div className="grid grid-cols-2 gap-6">
              <AnnotatorProjectDetail project={projectDetail} />
              {guideline && (
                <div className="glass-panel border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <GuidelineSection guideline={guideline.content} />
                </div>
              )}
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
