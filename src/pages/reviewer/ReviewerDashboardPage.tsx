import { useEffect, useState } from 'react'
import { themeClasses } from '@/styles'
import {
  DashboardTabs,
  type DashboardTabType
} from '@/features/manager/components/dashboard/DashboardTabs'
import { useLocation, useNavigate } from 'react-router-dom'
import AssignmentHeader from './components/AssignmentHeader'
import GuidelineSection from './components/GuidelineSection'
import TasksSection from './components/TaskSection'
import AnnotatorProjectDetail from './components/AnnotationProjectDetail'
import assignmentApi from '@/api/AssignmentApi'
import guidelineApi from '@/api/GuidelineApi'
import projectApi from '@/api/ProjectApi'
import { useAuthStore } from '@/store/auth.store'

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

// ============ MOCK DATA ============
const MOCK_DATA = {
  assignment: {
    id: 'REV-ASGN-001',
    name: 'Review - Medical Imaging Batch A',
    status: 'IN_PROGRESS',
    description:
      'Please review and approve/reject the following annotated medical images based on the provided guidelines.',
    projectId: 'PROJ-MOCK-012',
    completedTasks: 8,
    totalTasks: 30,
    tasks: [
      {
        id: '1',
        name: 'X-RAY_001.jpg',
        taskStatus: 'COMPLETED',
        annotationStatus: 'approved',
        batchLabel: 'Batch 1',
        timeTaken: '1m 05s'
      },
      {
        id: '2',
        name: 'X-RAY_002.jpg',
        taskStatus: 'COMPLETED',
        annotationStatus: 'rejected',
        batchLabel: 'Batch 1',
        timeTaken: '0m 55s'
      },
      {
        id: '3',
        name: 'X-RAY_003.jpg',
        taskStatus: 'IN_PROGRESS',
        annotationStatus: 'needs_editing',
        batchLabel: 'Batch 1',
        timeTaken: '0m 20s'
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
    content: `### Review Guidelines
1. **Accuracy**: Verify annotations match the image content precisely.
2. **Completeness**: Ensure all objects/regions of interest are labeled.
3. **Consistency**: Check that labels use the standard coordinate system.
4. **Quality**: Reject blurry or low-quality images that cannot be reliably annotated.`,
    status: 'ACTIVE'
  }
}

export default function ReviewerDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab: DashboardTabType = location.pathname.includes('/assignment')
    ? 'assignment'
    : 'project'

  const handleTabChange = (tab: DashboardTabType) => {
    if (tab === 'project') {
      navigate('/reviewer')
    } else {
      navigate('/reviewer/assignment')
    }
  }

  const [assignment, setAssignment] = useState<Assignment>(MOCK_DATA.assignment)
  const [projectDetail, setProjectDetail] = useState<ProjectDetail>(MOCK_DATA.project)
  const [guideline, setGuideline] = useState<Guideline | null>(MOCK_DATA.guideline)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (user?.id) {
          let hasFetchedProject = false
          try {
            // Try to fetch reviewer's assignments
            const assignRes = await assignmentApi.getAssignmentsByReviewer(user.id)
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
            console.warn('Could not fetch assignments for reviewer', err)
          }

          if (!hasFetchedProject) {
            setAssignment(MOCK_DATA.assignment)
            setProjectDetail(MOCK_DATA.project)
            setGuideline(MOCK_DATA.guideline as Guideline)
          }
        }
      } catch (err: unknown) {
        console.error('API Error, falling back to mock data:', err)
        setError(null)
        setAssignment(MOCK_DATA.assignment)
        setProjectDetail(MOCK_DATA.project)
        setGuideline(MOCK_DATA.guideline as Guideline)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

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
