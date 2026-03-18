import { useEffect, useState } from 'react'
import { themeClasses } from '@/styles'
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
export type ReviewerTabType = 'review' | 'project' | 'assignment'

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

// ============ Local Components ============
const ReviewerTabs: React.FC<{
  activeTab: ReviewerTabType
  onTabChange: (tab: ReviewerTabType) => void
}> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-8 border-b border-gray-800 mb-6 pb-2">
      {['review', 'project', 'assignment'].map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab as ReviewerTabType)}
          className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 capitalize ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
          )}
        </button>
      ))}
    </div>
  )
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

const StatsCard: React.FC<{
  title: string
  value: string | number
  icon: string
  gradient: string
  label: string
}> = ({ title, value, icon, gradient, label }) => (
  <div className={`glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className="flex justify-between items-start relative z-10">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">{title}</span>
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500" /> {label}
        </span>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-[1px]`}>
        <div className="w-full h-full bg-[#16161a] rounded-[11px] flex items-center justify-center">
          <span className={`material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-br ${gradient}`}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  </div>
)

export default function ReviewerDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab: ReviewerTabType = location.pathname.includes('/assignment')
    ? 'assignment'
    : location.pathname.includes('/project')
      ? 'project'
      : 'review'

  const handleTabChange = (tab: ReviewerTabType) => {
    navigate(`/reviewer/${tab}`)
  }

  const [assignment, setAssignment] = useState<Assignment>(MOCK_DATA.assignment)
  const [projectDetail, setProjectDetail] = useState<ProjectDetail>(MOCK_DATA.project)
  const [guideline, setGuideline] = useState<Guideline | null>(MOCK_DATA.guideline)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  // Derived stats from mock/api data
  const stats = {
    total: assignment?.totalTasks || 0,
    reviewed: assignment?.completedTasks || 0,
    pending: (assignment?.totalTasks || 0) - (assignment?.completedTasks || 0),
    approved: assignment?.tasks?.filter(t => t.annotationStatus === 'approved').length || 0,
    rejected: assignment?.tasks?.filter(t => t.annotationStatus === 'rejected').length || 0
  }

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
              const actualTasks = Array.isArray(rawAssign.tasks) ? rawAssign.tasks : []
              const completedCount = actualTasks.filter(
                (t: Record<string, unknown>) =>
                  t.taskStatus === 'COMPLETED' || t.annotationStatus === 'COMPLETED'
              ).length

              const normAssign = {
                ...rawAssign,
                id: rawAssign.assignmentId || rawAssign.id,
                name: rawAssign.assignmentName || rawAssign.name || rawAssign.title,
                status: rawAssign.assignmentStatus || rawAssign.status,
                description: rawAssign.descriptionAssignment || rawAssign.description,
                projectId:
                  rawAssign.projectId || rawAssign.project?.projectId || rawAssign.project?.id,
                tasks: actualTasks,
                completedTasks: actualTasks.length > 0 ? completedCount : (rawAssign.completedTasks ?? 0),
                totalTasks: actualTasks.length > 0 ? actualTasks.length : (rawAssign.totalTasks || 0)
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
      <ReviewerTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'review' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Reviewed"
              value={stats.reviewed}
              icon="verified"
              gradient="from-blue-500 to-indigo-500"
              label="Tasks processed"
            />
            <StatsCard
              title="Approved"
              value={stats.approved}
              icon="check_circle"
              gradient="from-emerald-500 to-teal-500"
              label="Passed quality check"
            />
            <StatsCard
              title="Rejected"
              value={stats.rejected}
              icon="cancel"
              gradient="from-rose-500 to-orange-500"
              label="Needs re-annotation"
            />
            <StatsCard
              title="Awaiting Review"
              value={stats.pending}
              icon="hourglass_empty"
              gradient="from-amber-500 to-yellow-500"
              label="In the backlog"
            />
          </div>

          {(!assignment && loading) ? (
            <div className="text-center text-gray-400 py-20 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
              <span className="font-mono text-sm animate-pulse">Scanning assignments...</span>
            </div>
          ) : (
            <div
              className={`${themeClasses.backgrounds.card} border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/5 blur-[100px] -z-10" />
              <TasksSection tasks={assignment?.tasks || []} assignment={assignment} />
            </div>
          )}
        </div>
      )}

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

              {/* Tasks Section removed from here as per request */}
            </div>
          </>
        ))}
    </div>
  )
}
