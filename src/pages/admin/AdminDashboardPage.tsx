import { useEffect } from 'react'
import { themeClasses } from '@/styles'
import { TeamOutlined, DatabaseOutlined, ApartmentOutlined, ClockCircleOutlined, CheckCircleOutlined, FileSearchOutlined, SettingOutlined } from '@ant-design/icons'
import { useUsers } from '@/features/admin/hooks/useUsers'
import { useAllLabels } from '@/features/manager/hooks/useLabels'
import { useAllDatasets, useAllAssignments } from '@/features/manager/hooks/useProjectDetail'
import type { User } from '@/shared/types/api.types'
import { Spin } from 'antd'

export default function AdminDashboard() {
  const { data: rawUsers, isLoading: isLoadingUsers, error: usersError } = useUsers()
  const { error: labelsError } = useAllLabels()
  const { data: allDatasets = [], isLoading: isLoadingDatasets, error: datasetsError } = useAllDatasets()
  const { data: allAssignments = [], isLoading: isLoadingAssignments, error: assignmentsError } = useAllAssignments()

  const users = Array.isArray(rawUsers)
    ? (rawUsers as User[])
    : (rawUsers as unknown as { data: User[] })?.data || []

  // Data Aggregation
  const totalDatasets = allDatasets.length
  const totalTasks = allAssignments.length
  const totalDataItems = allDatasets.reduce((sum, ds) => sum + (Number(ds.totalItems) || 0), 0)
  
  const getTaskStatus = (a: any) => (a.assignmentStatus || a.status || '').toUpperCase()

  const tasksPending = allAssignments.filter(a => 
    ['ASSIGNED', 'IN_PROGRESS', 'IN_EDITING'].includes(getTaskStatus(a))
  ).length
  
  const tasksCompleted = allAssignments.filter(a => 
    getTaskStatus(a) === 'COMPLETED'
  ).length
  
  const tasksNeedingReview = allAssignments.filter(a => 
    getTaskStatus(a) === 'REVIEWING'
  ).length

  const activeLabelers = users.filter(u => 
    (u.role || u.userRole || '').toUpperCase() === 'ANNOTATOR' && 
    (u.status || u.userStatus || '').toUpperCase() === 'ACTIVE'
  ).length

  useEffect(() => {
    if (usersError) console.error('[AdminDashboard] Error fetching users:', usersError)
    if (labelsError) console.error('[AdminDashboard] Error fetching labels:', labelsError)
    if (datasetsError) console.error('[AdminDashboard] Error fetching datasets:', datasetsError)
    if (assignmentsError) console.error('[AdminDashboard] Error fetching assignments:', assignmentsError)
  }, [usersError, labelsError, datasetsError, assignmentsError])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h2
            className={`text-2xl font-bold tracking-tight ${themeClasses.text.violet} md:text-3xl`}
          >
            Admin Dashboard
          </h2>
          <p className={`font-body text-sm ${themeClasses.text.secondary}`}>
            Manage users, permissions, and monitor backend performance.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Total Datasets */}
        <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                Total Datasets
              </p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {isLoadingDatasets ? <Spin size="small" /> : totalDatasets}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center ${themeClasses.text.fuchsia}`}>
              <DatabaseOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <span className={`text-xs ${themeClasses.text.tertiary}`}>Managed resource sets</span>
          </div>
        </div>

        {/* Total Tasks / Data Items */}
        <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                🧾 Total Tasks / Data Items
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-white">
                  {isLoadingAssignments ? <Spin size="small" /> : totalTasks}
                </p>
                <span className={`text-lg ${themeClasses.text.tertiary} font-medium`}>
                  / {isLoadingDatasets ? '-' : totalDataItems}
                </span>
              </div>
            </div>
            <div className={`h-10 w-10 rounded-lg ${themeClasses.backgrounds.violetAlpha10} flex items-center justify-center ${themeClasses.text.violet}`}>
              <ApartmentOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <span className={`text-xs ${themeClasses.text.tertiary}`}>System-wide progression</span>
          </div>
        </div>

        {/* Tasks Pending */}
        <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                ⏳ Tasks Pending
              </p>
              <p className="text-3xl font-bold tracking-tight text-amber-400">
                {isLoadingAssignments ? <Spin size="small" /> : tasksPending}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ClockCircleOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`h-1.5 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5}`}>
              <div 
                className="h-full bg-amber-500 transition-all duration-1000" 
                style={{ width: `${totalTasks > 0 ? (tasksPending / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                ✅ Tasks Completed
              </p>
              <p className="text-3xl font-bold tracking-tight text-emerald-400">
                {isLoadingAssignments ? <Spin size="small" /> : tasksCompleted}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircleOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`h-1.5 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5}`}>
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Labelers */}
        <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                👥 Active Labelers
              </p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {isLoadingUsers ? <Spin size="small" /> : activeLabelers}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-lg ${themeClasses.backgrounds.violetAlpha10} flex items-center justify-center ${themeClasses.text.violet}`}>
              <TeamOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className={`text-xs ${themeClasses.text.tertiary}`}>Annotators online today</span>
          </div>
        </div>

        {/* Tasks Needing Review */}
        <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                ⚠️ Tasks Needing Review
              </p>
              <p className="text-3xl font-bold tracking-tight text-rose-400">
                {isLoadingAssignments ? <Spin size="small" /> : tasksNeedingReview}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <FileSearchOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
             <span className={`text-xs ${themeClasses.text.secondary} italic`}>Requires QC attention</span>
          </div>
        </div>
      </div>

      {/* Pipeline Health (Task & Workflow Status) */}
      <div className="flex flex-col gap-6 mt-4">
        <h3 className={`text-xl font-bold ${themeClasses.text.violet}`}>Pipeline Health</h3>
        
        <div className="grid gap-5 lg:grid-cols-4">
          {/* Kanban / Pipeline Flow */}
          <div className={`${themeClasses.cards.glass} lg:col-span-3 p-6 flex flex-col gap-4 overflow-hidden`}>
            <div className="flex justify-between items-center mb-2">
               <h4 className="font-bold text-gray-200 uppercase tracking-widest text-xs">Task Pipeline Status</h4>
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Global Assignments Flow</span>
            </div>
            
            <div className="flex-1 flex items-center justify-between gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {/* CREATED */}
              <PipelineStep
                title="Created"
                count={allAssignments.filter(a => {
                  const s = getTaskStatus(a)
                  return !s || s === 'NOT_STARTED' || s === 'CREATED'
                }).length}
                color="text-gray-400"
                bgColor="bg-gray-500/10"
                borderColor="border-gray-500/20"
                icon={<ClockCircleOutlined />}
              />
              <PipelineArrow />
              
              {/* ASSIGNED */}
              <PipelineStep
                title="Assigned"
                count={allAssignments.filter(a => getTaskStatus(a) === 'ASSIGNED').length}
                color="text-blue-400"
                bgColor="bg-blue-500/10"
                borderColor="border-blue-500/20"
                icon={<TeamOutlined />}
              />
              <PipelineArrow />

             {/* IN PROGRESS */}
              <PipelineStep
                title="In Progress"
                count={allAssignments.filter(a => ['IN_PROGRESS', 'IN_EDITING'].includes(getTaskStatus(a))).length}
                color="text-amber-400"
                bgColor="bg-amber-500/10"
                borderColor="border-amber-500/20"
                icon={<SettingOutlined spin />}
              />
              <PipelineArrow />

              {/* REVIEW */}
              <PipelineStep
                title="Reviewing"
                count={allAssignments.filter(a => getTaskStatus(a) === 'REVIEWING').length}
                color="text-rose-400"
                bgColor="bg-rose-500/10"
                borderColor="border-rose-500/20"
                icon={<FileSearchOutlined />}
                alert={allAssignments.filter(a => getTaskStatus(a) === 'REVIEWING').length >= 5}
              />
              <PipelineArrow />

              {/* COMPLETED */}
              <PipelineStep
                title="Completed"
                count={allAssignments.filter(a => getTaskStatus(a) === 'COMPLETED').length}
                color="text-emerald-400"
                bgColor="bg-emerald-500/10"
                borderColor="border-emerald-500/20"
                icon={<CheckCircleOutlined />}
              />
            </div>
          </div>

          {/* Breakdown by Dataset */}
          <div className={`${themeClasses.cards.glass} p-6 flex flex-col gap-4`}>
             <h4 className="font-bold text-gray-200 uppercase tracking-widest text-xs mb-2 truncate">Tasks by Dataset</h4>
             <div className="flex flex-col gap-4 flex-1 justify-center">
               {(() => {
                  const dsMap: Record<string, number> = {}
                  allAssignments.forEach(a => {
                    const dsId = (a as any).datasetId
                    const foundDs = allDatasets.find(d => String(d.datasetId || (d as any).id) === String(dsId))
                    const dsName = foundDs?.datasetName || (foundDs as any)?.name || 'Uncategorized'
                    dsMap[dsName] = (dsMap[dsName] || 0) + 1
                  })

                  // Also add some mock data if there are no assignments for a better UI demonstration?
                  // No, use real data. Just sort it.
                  const sortedDs = Object.entries(dsMap).sort((a,b) => b[1] - a[1]).slice(0, 5) // top 5
                  if(sortedDs.length === 0) return <div className="text-sm text-gray-500 italic text-center py-4 text-xs font-mono">No dataset data found</div>
                  
                  return sortedDs.map(([name, count]) => (
                    <div key={name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-end gap-2">
                        <span className="text-xs text-gray-300 font-medium truncate flex-1">{name}</span>
                        <span className="text-[10px] text-fuchsia-400 font-bold bg-fuchsia-500/10 px-1.5 py-0.5 rounded shrink-0">{count}</span>
                      </div>
                      <div className={`h-1.5 w-full bg-white/5 rounded-full overflow-hidden`}>
                         <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-all duration-500" style={{ width: `${Math.max(5, (count / Math.max(1, totalTasks)) * 100)}%` }} />
                      </div>
                    </div>
                  ))
               })()}
             </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className={`glass-card flex flex-col overflow-hidden rounded-xl`}></div>
    </div>
  )
}

function PipelineStep({ title, count, color, bgColor, borderColor, icon, alert }: { title: string, count: number, color: string, bgColor: string, borderColor: string, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all hover:bg-white/10 flex-1 min-w-[110px] ${borderColor} ${bgColor} relative shadow-xl`}>
      {alert && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border border-rose-800 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
        </span>
      )}
      <div className={`text-2xl ${color}`}>
        {icon}
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-3xl font-black text-white">{count}</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">{title}</span>
      </div>
    </div>
  )
}

function PipelineArrow() {
  return (
    <div className="flex items-center justify-center shrink-0 opacity-30 text-white">
      <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
    </div>
  )
}