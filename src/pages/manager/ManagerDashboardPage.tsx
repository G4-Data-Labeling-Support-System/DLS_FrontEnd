import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { AllProjects } from '@/features/manager/components/dashboard/AllProjects'
import { AllAssignments } from '@/features/manager/components/dashboard/AllAssignments'
import { QuickActions } from '@/features/manager/components/dashboard/QuickActions'
import {
  DashboardTabs,
  type DashboardTabType
} from '@/features/manager/components/dashboard/DashboardTabs'

const ManagerDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

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
        <div className="w-full relative mt-6">
          <AllAssignments
            selectedAssignmentId={selectedAssignmentId}
            onAssignmentSelect={handleAssignmentSelect}
          />
        </div>
      )}
    </div>
  )
}

export default ManagerDashboardPage
