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
import { CreateProjectModal } from '@/features/manager/components/dashboard/CreateProjectModal'
import { ProjectDetail } from '@/features/manager/components/dashboard/ProjectDetail'
import { CreateDatasetModal } from '@/features/manager/components/dataset/CreateDatasetModal'
import { DatasetQuickActions } from '@/features/manager/components/dataset/DatasetQuickActions'
import AllDataset from '@/features/manager/components/dataset/AllDataset'
import { AllLabels } from '@/features/manager/components/dashboard/AllLabels'
import { LabelQuickActions } from '@/features/manager/components/dashboard/LabelQuickActions'

import { useInvalidateAssignments, useDatasetsByProject, useAllDatasets } from '@/features/manager/hooks/useProjectDetail'

const ManagerDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const invalidateAssignments = useInvalidateAssignments()

  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<GetAssignmentsParams | undefined>(
    undefined
  )

  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [editProjectId, setEditProjectId] = useState<string | undefined>(undefined)
  const [projectRefreshTrigger, setProjectRefreshTrigger] = useState(0)

  const [createDatasetOpen, setCreateDatasetOpen] = useState(false)
  const [createLabelOpen, setCreateLabelOpen] = useState(false)

  const tabParam = searchParams.get('tab')
  const activeTab: DashboardTabType =
    ['project', 'assignments', 'datasets', 'labels'].includes(tabParam as string)
      ? (tabParam as DashboardTabType)
      : 'project'

  const selectedProjectId = searchParams.get('projectId')
  const selectedAssignmentId = searchParams.get('assignmentId')
  const selectedDatasetId = searchParams.get('datasetId')
  const selectedLabelId = searchParams.get('labelId')

  const { data: projectDatasets = [], isLoading: datasetsLoading } = useDatasetsByProject(selectedProjectId || '')
  const { data: allDatasets = [], isLoading: allDatasetsLoading } = useAllDatasets()

  const currentDatasets = selectedProjectId ? projectDatasets : allDatasets
  const currentDatasetsLoading = selectedProjectId ? datasetsLoading : allDatasetsLoading

  const handleTabChange = (tab: DashboardTabType) => {
    if (selectedProjectId) {
      setSearchParams({ tab, projectId: selectedProjectId })
    } else {
      setSearchParams({ tab })
    }
  }

  const handleProjectSelect = (id: string | null) => {
    if (id) {
      setSearchParams({ tab: 'project', projectId: id })
    } else {
      searchParams.delete('projectId')
      setSearchParams(searchParams)
    }
  }

  const handleAssignmentSelect = (id: string | null) => {
    if (id) {
      setSearchParams({ tab: 'assignments', assignmentId: id, projectId: selectedProjectId || '' })
    } else {
      setSearchParams({ tab: 'assignments', projectId: selectedProjectId || '' })
    }
  }

  const handleDatasetSelect = (id: string | null) => {
    if (id) {
      if (selectedProjectId) {
        setSearchParams({ tab: 'datasets', datasetId: id, projectId: selectedProjectId })
      } else {
        setSearchParams({ tab: 'datasets', datasetId: id })
      }
    } else {
      if (selectedProjectId) {
        setSearchParams({ tab: 'datasets', projectId: selectedProjectId })
      } else {
        setSearchParams({ tab: 'datasets' })
      }
    }
  }

  const handleLabelSelect = (id: string | null) => {
    if (id) {
      if (selectedProjectId) {
        setSearchParams({ tab: 'labels', labelId: id, projectId: selectedProjectId })
      } else {
        setSearchParams({ tab: 'labels', labelId: id })
      }
    } else {
      if (selectedProjectId) {
        setSearchParams({ tab: 'labels', projectId: selectedProjectId })
      } else {
        setSearchParams({ tab: 'labels' })
      }
    }
  }

  const handleCloseModal = () => {
    setCreateAssignmentOpen(false)
    setEditingAssignment(undefined)
  }

  const handleCloseProjectModal = () => {
    setCreateProjectOpen(false)
    setEditProjectId(undefined)
  }

  const handleCreateProjectSuccess = () => {
    handleCloseProjectModal()
    // Always refresh the project list and reset selection to go back to list view
    searchParams.delete('projectId')
    searchParams.delete('tab')
    setSearchParams(searchParams)
    setProjectRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="p-6">
      {!selectedProjectId ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative animate-fade-in">
          {/* All Projects - Main Content (3 cols) */}
          <div className="xl:col-span-3">
            <AllProjects
              selectedProjectId={selectedProjectId}
              onProjectSelect={handleProjectSelect}
              refreshTrigger={projectRefreshTrigger}
              onEdit={(id: string) => {
                setEditProjectId(id)
                setCreateProjectOpen(true)
              }}
              onCreate={() => {
                setEditProjectId(undefined)
                setCreateProjectOpen(true)
              }}
            />
          </div>

          {/* Quick Actions - Sticky Sidebar (1 col) */}
          <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
            <QuickActions
              onCreateProject={() => {
                setEditProjectId(undefined)
                setCreateProjectOpen(true)
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleProjectSelect(null)}
              className="px-4 py-2 bg-[#231e31] hover:bg-violet-600/20 text-gray-600 hover:text-[#111] rounded-lg border border-gray-800 hover:border-violet-500/50 transition-all font-medium text-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Projects
            </button>
          </div>

          {/* Custom Tab Navigation */}
          <DashboardTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabLabels={{
              project: selectedProjectId ? 'Project Detail' : 'Projects',
              assignments: 'Assignments',
              datasets: 'Datasets',
              labels: 'Labels'
            }}
          />

          {activeTab === 'project' && (
            <ProjectDetail projectId={selectedProjectId as string} onBack={() => handleProjectSelect(null)} />
          )}

          {activeTab === 'assignments' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
              {/* All Assignments - Main Content (3 cols or 4 if detail active) */}
              <div className={selectedAssignmentId ? 'xl:col-span-4' : 'xl:col-span-3'}>
                <AllAssignments
                  projectId={selectedProjectId as string}
                  selectedAssignmentId={selectedAssignmentId}
                  onAssignmentSelect={handleAssignmentSelect}
                  onEdit={(asn) => {
                    setEditingAssignment(asn)
                    setCreateAssignmentOpen(true)
                  }}
                />
              </div>

              {/* Quick Actions - Sticky Sidebar (1 col) */}
              {!selectedAssignmentId && (
                <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
                  <AssignmentQuickActions
                    onCreateAssignment={() => {
                      setEditingAssignment(undefined)
                      setCreateAssignmentOpen(true)
                    }}
                  />
                </div>
              )}

              <CreateAssignmentModal
                open={createAssignmentOpen}
                initialData={editingAssignment}
                projectId={selectedProjectId || undefined}
                onCancel={handleCloseModal}
                onSuccess={() => {
                  handleCloseModal()
                  // Keep the assignments view active but maintain the project filter if we were inside a project
                  if (selectedProjectId) {
                    setSearchParams({ tab: 'assignments', projectId: selectedProjectId })
                  } else {
                    setSearchParams({ tab: 'assignments' })
                  }
                  invalidateAssignments(selectedProjectId || undefined)
                }}
              />
            </div>
          )}

          {activeTab === 'datasets' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
              <div className={selectedDatasetId ? 'xl:col-span-4' : 'xl:col-span-3'}>
                <AllDataset
                  datasets={currentDatasets}
                  loading={currentDatasetsLoading}
                  selectedDatasetId={selectedDatasetId}
                  onDatasetSelect={handleDatasetSelect}
                  onCreate={() => setCreateDatasetOpen(true)}
                />
              </div>
              {!selectedDatasetId && (
                <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
                  <DatasetQuickActions onCreateDataset={() => setCreateDatasetOpen(true)} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
              <div className={selectedLabelId ? 'xl:col-span-4' : 'xl:col-span-3'}>
                <AllLabels
                  projectId={selectedProjectId as string}
                  selectedLabelId={selectedLabelId}
                  onLabelSelect={handleLabelSelect}
                />
              </div>
              {!selectedLabelId && (
                <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
                  <LabelQuickActions onCreateLabel={() => setCreateLabelOpen(true)} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CreateProjectModal
        open={createProjectOpen}
        onCancel={handleCloseProjectModal}
        onSuccess={handleCreateProjectSuccess}
        editId={editProjectId}
      />

      <CreateDatasetModal
        open={createDatasetOpen}
        initialProjectId={selectedProjectId || undefined}
        onCancel={() => setCreateDatasetOpen(false)}
        onSuccess={() => {
          setCreateDatasetOpen(false)
          window.location.reload()
        }}
      />

      {createLabelOpen && (
        <div className="hidden">
          <AllLabels
            openCreateModal={true}
            onCreateModalClose={() => setCreateLabelOpen(false)}
            projectId={selectedProjectId || undefined}
          />
        </div>
      )}
    </div>
  )
}

export default ManagerDashboardPage

