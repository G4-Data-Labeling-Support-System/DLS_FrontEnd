import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Search, FilterX } from 'lucide-react'



import { useAuthStore } from '@/store/auth.store'
import assignmentApi, { type GetAssignmentsParams } from '@/services/AssignmentApi'
import { AssignmentCard } from '@/features/manager/components/dashboard/AssignmentCard'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'
import AnnotatorAssignmentDetailPage from './AnnotatorAssignmentDetailPage'



interface RawAssignment extends GetAssignmentsParams {
  project?: {
    projectId?: string
    id?: string
  }
}

export default function AnnotatorProjectAssignmentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedAssignmentId = searchParams.get('assignmentId')

  const [assignments, setAssignments] = useState<GetAssignmentsParams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!projectId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        const assignRes = await assignmentApi.getAssignmentsByAnnotator(user.id)
        const rawList = assignRes.data?.data || assignRes.data || []

        const projectAssigns = (rawList as RawAssignment[])
          .filter((a) => (a.projectId || a.project?.projectId || a.project?.id) === projectId)
          .map((a) => ({
            ...a,
            id: a.assignmentId || a.id,
            assignmentName: a.assignmentName || a.name || `Assignment ${a.assignmentId?.split('-').pop() || ''}`,
            status: a.assignmentStatus || a.status || 'PENDING'
          }))

        setAssignments(projectAssigns)
      } catch (err) {
        console.error('Failed to fetch assignments:', err)
        setError('Failed to load assignments.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [projectId, user?.id])

  const filteredAssignments = assignments
    .filter((a) => {
      const status = (a.status || '').toUpperCase()
      return status !== 'CANCELLED' && status !== 'INACTIVE'
    })
    .filter((a) =>
      !searchText || (a.assignmentName && a.assignmentName.toLowerCase().includes(searchText.toLowerCase()))
    )
    .filter((a) => statusFilter === 'ALL' || (a.status && a.status.toUpperCase() === statusFilter))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

  const handleAssignmentClick = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('assignmentId', id)
      return next
    })
  }

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/annotator/projects/${projectId}`)}
        className="text-gray-500 hover:text-[#111] mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>


      {/* Tabs Menu */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab="assignment" />}

      {selectedAssignmentId ? (
        <div className="mt-0">
          <AnnotatorAssignmentDetailPage />
        </div>
      ) : (
        <>
          {/* Header with Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-0">
            <h1 className="text-2xl font-bold text-[#111] tracking-tight">
              Project Assignments
            </h1>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 w-full md:w-64 bg-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
                <SelectTrigger className="w-[160px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEWING">Reviewing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-0">
            {loading && assignments.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map((a, idx) => (
                  <AssignmentCard
                    key={a.assignmentId || idx}
                    {...a}
                    onClick={() => handleAssignmentClick(a.assignmentId || a.id || '')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FilterX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found matching your filters.</p>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}

