import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AllProjects } from '@/features/manager/components/dashboard/AllProjects'
import { AllAssignments } from '@/features/manager/components/dashboard/AllAssignments'
import { QuickActions } from '@/features/manager/components/dashboard/QuickActions'
import { AssignmentQuickActions } from '@/features/manager/components/dashboard/AssignmentQuickActions'
import { CreateAssignmentModal } from '@/features/manager/components/dashboard/CreateAssignmentModal'
import { type GetAssignmentsParams } from '@/api/AssignmentApi'
import {
  DashboardTabs,
  type DashboardTabType
} from '@/features/manager/components/dashboard/DashboardTabs'

const ManagerDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<GetAssignmentsParams | undefined>(undefined)
  const [assignmentRefreshTrigger, setAssignmentRefreshTrigger] = useState(0)

  const tabParam = searchParams.get('tab')
  const activeTab: DashboardTabType =
    tabParam === 'assignment' || tabParam === 'project' ? (tabParam as DashboardTabType) : 'project'

  const selectedProjectId = searchParams.get('projectId')
  const selectedAssignmentId = searchParams.get('assignmentId')

  const handleTabChange = (tab: DashboardTabType) => {
    setSearchParams({ tab })
  }

  const handleProjectSelect = (id: string | null) => {
    if (id) {
      setSearchParams({ tab: 'project', projectId: id })
    } else {
      setSearchParams({ tab: 'project' })
    }
  }

  const handleAssignmentSelect = (id: string | null) => {
    if (id) {
      setSearchParams({ tab: 'assignment', assignmentId: id })
    } else {
      setSearchParams({ tab: 'assignment' })
    }
  }

  const handleCloseModal = () => {
    setCreateAssignmentOpen(false)
    setEditingAssignment(undefined)
  }

  return (
    <div className="p-6">
      {/* Custom Tab Navigation */}
      <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'project' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          {/* All Projects - Main Content (3 cols) */}
          <div className="xl:col-span-3">
            <AllProjects
              selectedProjectId={selectedProjectId}
              onProjectSelect={handleProjectSelect}
            />
          </div>

          {/* Quick Actions - Sticky Sidebar (1 col) */}
          <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
            <QuickActions />
          </div>
        </div>
      )}

      {activeTab === 'assignment' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          {/* All Assignments - Main Content (3 cols) */}
          <div className="xl:col-span-3">
            <AllAssignments
              selectedAssignmentId={selectedAssignmentId}
              onAssignmentSelect={handleAssignmentSelect}
              onEdit={(asn) => {
                setEditingAssignment(asn)
                setCreateAssignmentOpen(true)
              }}
              refreshTrigger={assignmentRefreshTrigger}
            />
          </div>

          {/* Quick Actions - Sticky Sidebar (1 col) */}
          <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
<<<<<<< Updated upstream
            <AssignmentQuickActions
              onCreateAssignment={() => {
                setEditingAssignment(undefined)
                setCreateAssignmentOpen(true)
              }}
            />
=======
            <AssignmentQuickActions onCreateAssignment={() => setCreateAssignmentOpen(true)} />
>>>>>>> Stashed changes
          </div>

          <CreateAssignmentModal
            open={createAssignmentOpen}
            initialData={editingAssignment}
            projectId=""
            onCancel={handleCloseModal}
            onSuccess={() => {
              handleCloseModal()
              setSearchParams({ tab: 'assignment' })
              setAssignmentRefreshTrigger((prev) => prev + 1)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ManagerDashboardPage
