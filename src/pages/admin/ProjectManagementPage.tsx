import { useState } from 'react'
import { themeClasses } from '@/styles'
import AddProjectModal from '../../features/admin/components/AddProjectModal'
import { Button } from '@/shared/components/ui/Button'
import {
  FolderAddOutlined,
  PlusOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ProjectOutlined
} from '@ant-design/icons'
import { Dropdown, message, type MenuProps } from 'antd'
import { useProjects, useDeleteProject } from '@/features/admin/hooks/useProjects'

interface Project {
  projectId: string
  id: string
  projectName: string
  description?: string
  projectStatus: string
  status?: string
  createdAt?: string
  coverImage?: string
}

export default function ProjectManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: rawProjects, isLoading } = useProjects()
  const deleteProjectMutation = useDeleteProject()

  const projects = Array.isArray(rawProjects)
    ? (rawProjects as Project[])
    : (rawProjects as { data: Project[] })?.data || []

  const getActionItems = (project: Project): MenuProps['items'] => {
    return [
      {
        key: 'edit',
        label: 'Edit Project (Coming Soon)',
        icon: <EditOutlined />,
        disabled: true
      },
      {
        key: 'delete',
        label: 'Remove Project',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          const projectId = project.projectId || project.id
          if (window.confirm(`Are you sure you want to remove project ${project.projectName}?`)) {
            deleteProjectMutation.mutate(projectId, {
              onSuccess: () => {
                message.success(`Project ${project.projectName} has been removed.`)
              },
              onError: (error) => {
                message.error(`Failed to remove project: ${error.message || 'Unknown error'}`)
              }
            })
          }
        }
      }
    ]
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h2
            className={`text-2xl font-bold tracking-tight ${themeClasses.text.violet} md:text-3xl`}
          >
            Project Management
          </h2>
          <p className={`font-body text-sm ${themeClasses.text.secondary}`}>
            Manage active projects, monitor progress, and access related datasets.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          className="group relative flex items-center gap-2 overflow-hidden px-5 py-2.5 font-body"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
          <FolderAddOutlined className="text-lg" />
          <span>Add Project</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Total Projects */}
        <div
          className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                Total Projects
              </p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {isLoading ? '-' : projects?.length || 0}
              </p>
            </div>
            <div
              className={`h-10 w-10 rounded-lg ${themeClasses.backgrounds.violetAlpha10} flex items-center justify-center ${themeClasses.text.violet}`}
            >
              <ProjectOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
              +0%
            </span>
            <span className={`text-xs ${themeClasses.text.tertiary}`}>vs last month</span>
          </div>
        </div>

        {/* System Status placeholder */}
        <div
          className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                System Status
              </p>
              <p className="text-3xl font-bold tracking-tight text-white">-</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DesktopOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-xs font-medium ${themeClasses.text.secondary}`}>
              All systems fully operational
            </p>
            <div
              className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5}`}
            >
              <div className="h-full w-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
            </div>
          </div>
        </div>

        {/* Storage placeholder */}
        <div
          className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                Storage
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold tracking-tight text-white">
                  -<span className={`text-lg ${themeClasses.text.tertiary} font-medium`}>TB</span>
                </p>
                <span className={`text-xs ${themeClasses.text.tertiary}`}>/ -TB</span>
              </div>
            </div>
            <div
              className={`h-10 w-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center ${themeClasses.text.fuchsia}`}
            >
              <DatabaseOutlined className="text-xl" />
            </div>
          </div>
          <div
            className={`mt-4 h-2 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5} flex`}
          >
            <div className="h-full w-0 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
            <div className="h-full w-0 bg-emerald-500"></div>
            <div className="h-full w-0 bg-amber-500"></div>
          </div>
          <div className={`mt-2 flex gap-4 text-[10px] ${themeClasses.text.secondary}`}>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
              Images
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Labels
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
              Others
            </div>
          </div>
        </div>
      </div>

      {/* Management Table */}
      <div className={`glass-card flex flex-col overflow-hidden rounded-xl`}>
        <div
          className={`border-b ${themeClasses.borders.white5} px-6 py-5 flex justify-between items-center ${themeClasses.backgrounds.card}`}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white">Project List</h3>
            <p className={`text-sm ${themeClasses.text.secondary} font-body`}>
              All projects available in the system ({projects?.length || 0})
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              className="group relative flex items-center gap-2 overflow-hidden px-4 py-2 font-body text-sm font-semibold"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <PlusOutlined className="text-lg" />
              <span>Add Project</span>
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead
              className={`text-[11px] uppercase ${themeClasses.text.tertiary} font-bold tracking-wider border-b ${themeClasses.borders.white5}`}
            >
              <tr>
                <th className="px-6 py-4 font-semibold">Project Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.borders.white5} font-body text-sm`}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading projects...
                  </td>
                </tr>
              ) : projects?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects?.map((project: Project) => {
                  const rawStatus = project.projectStatus || project.status || 'Active'
                  const isProjectActive =
                    rawStatus.toUpperCase() === 'ACTIVE' || rawStatus.toUpperCase() === 'ONGOING'
                  const displayStatus =
                    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()

                  const projectId = project.projectId || project.id
                  const dateStr = project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : '-'

                  return (
                    <tr
                      key={projectId}
                      className={`group transition-colors hover:${themeClasses.backgrounds.whiteAlpha5}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 overflow-hidden rounded-md ${themeClasses.backgrounds.card} ring-1 ring-white/10 transition-all group-hover:ring-violet-500/50 flex items-center justify-center`}
                          >
                            {project.coverImage ? (
                              <img
                                src={project.coverImage}
                                alt={project.projectName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className={`text-sm font-bold ${themeClasses.text.violet}`}>
                                {project.projectName?.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-[15px]">
                              {project.projectName || `Project ${projectId}`}
                            </span>
                            <span className={`text-xs ${themeClasses.text.tertiary}`}>
                              ID: {projectId?.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] truncate text-gray-300">
                          {project.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${isProjectActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-amber-500'}`}
                          ></span>
                          <span
                            className={`${isProjectActive ? 'text-emerald-500' : 'text-amber-400'} text-sm font-medium`}
                          >
                            {displayStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{dateStr}</td>
                      <td className="px-6 py-4 text-right">
                        <Dropdown
                          menu={{ items: getActionItems(project) }}
                          trigger={['click']}
                          placement="bottomRight"
                          overlayClassName="dark-dropdown"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${themeClasses.text.tertiary} hover:text-white transition-colors`}
                          >
                            <MoreOutlined className="text-lg" />
                          </Button>
                        </Dropdown>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddProjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}
