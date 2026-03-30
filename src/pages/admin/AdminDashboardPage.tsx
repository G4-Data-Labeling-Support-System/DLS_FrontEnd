import { useState, useEffect } from 'react'
import { themeClasses } from '@/styles'
import { 
  TeamOutlined, 
  DatabaseOutlined, 
  ApartmentOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  FileSearchOutlined, 
  SettingOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons'
import { useUsers } from '@/features/admin/hooks/useUsers'
import { useAllLabels } from '@/features/manager/hooks/useLabels'
import { useAllDatasets, useAllAssignments } from '@/features/manager/hooks/useProjectDetail'
import { useLogs } from '@/features/admin/hooks/useLogs'
import type { User } from '@/shared/types/api.types'
import { Spin } from 'antd'
import { DatasetHealthGrid } from './components/DatasetHealthGrid'
import { ActivityFeed } from './components/ActivityFeed'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'logs'>('overview')
  
  const { data: rawUsers, isLoading: isLoadingUsers, error: usersError } = useUsers()
  const { error: labelsError } = useAllLabels()
  const { data: allDatasets = [], isLoading: isLoadingDatasets, error: datasetsError } = useAllDatasets()
  const { data: allAssignments = [], isLoading: isLoadingAssignments, error: assignmentsError } = useAllAssignments()
  const { data: activityLogs = [], isLoading: isLoadingLogs } = useLogs({ pollingInterval: 15000 })

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
    // Error logging could go here
  }, [usersError, labelsError, datasetsError, assignmentsError])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-1 mb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all relative ${
            activeTab === 'overview' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <LineChartOutlined />
          Overview
          {activeTab === 'overview' && <div className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all relative ${
            activeTab === 'health' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <CheckCircleOutlined />
          Dataset Health
          {activeTab === 'health' && <div className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all relative ${
            activeTab === 'logs' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <ExclamationCircleOutlined />
          System logs
          {activeTab === 'logs' && <div className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {/* Total Datasets */}
            <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full p-6`}>
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
            </div>

            {/* Total Tasks */}
            <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                    Total Tasks / Items
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
            </div>

            {/* Tasks Pending */}
            <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                    Tasks Pending
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-amber-400">
                    {isLoadingAssignments ? <Spin size="small" /> : tasksPending}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <ClockCircleOutlined className="text-xl" />
                </div>
              </div>
            </div>

            {/* Tasks Completed */}
            <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                    Tasks Completed
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-emerald-400">
                    {isLoadingAssignments ? <Spin size="small" /> : tasksCompleted}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircleOutlined className="text-xl" />
                </div>
              </div>
            </div>

            {/* Active Labelers */}
            <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                    Active Labelers
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-white">
                    {isLoadingUsers ? <Spin size="small" /> : activeLabelers}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${themeClasses.backgrounds.violetAlpha10} flex items-center justify-center ${themeClasses.text.violet}`}>
                  <TeamOutlined className="text-xl" />
                </div>
              </div>
            </div>

            {/* Needing Review */}
            <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                    Needs Review
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-rose-400">
                    {isLoadingAssignments ? <Spin size="small" /> : tasksNeedingReview}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <FileSearchOutlined className="text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Health */}
          <div className="flex flex-col gap-4">
            <h3 className={`text-xl font-bold ${themeClasses.text.violet}`}>Pipeline Health</h3>
            <div className="grid gap-5 lg:grid-cols-4">
              <div className={`${themeClasses.cards.glass} lg:col-span-3 p-6 flex flex-col gap-4 overflow-hidden`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-200 uppercase tracking-widest text-xs">Task Pipeline Status</h4>
                </div>
                
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 custom-scrollbar">
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
                  <PipelineStep
                    title="Assigned"
                    count={allAssignments.filter(a => getTaskStatus(a) === 'ASSIGNED').length}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                    borderColor="border-blue-500/20"
                    icon={<TeamOutlined />}
                  />
                  <PipelineArrow />
                  <PipelineStep
                    title="In Progress"
                    count={allAssignments.filter(a => ['IN_PROGRESS', 'IN_EDITING'].includes(getTaskStatus(a))).length}
                    color="text-amber-400"
                    bgColor="bg-amber-500/10"
                    borderColor="border-amber-500/20"
                    icon={<SettingOutlined spin />}
                  />
                  <PipelineArrow />
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

              <div className={`${themeClasses.cards.glass} p-6 flex flex-col gap-4`}>
                <h4 className="font-bold text-gray-200 uppercase tracking-widest text-xs mb-2">Tasks by Dataset</h4>
                <div className="flex flex-col gap-4">
                  {(() => {
                    const dsMap: Record<string, number> = {}
                    allAssignments.forEach(a => {
                      const dsId = (a as any).datasetId
                      const foundDs = allDatasets.find(d => String(d.datasetId || (d as any).id) === String(dsId))
                      const dsName = foundDs?.datasetName || (foundDs as any)?.name || 'Uncategorized'
                      dsMap[dsName] = (dsMap[dsName] || 0) + 1
                    })
                    const sortedDs = Object.entries(dsMap).sort((a,b) => b[1] - a[1]).slice(0, 5)
                    if(sortedDs.length === 0) return <div className="text-xs text-gray-500 italic py-4">No data</div>
                    return sortedDs.map(([name, count]) => (
                      <div key={name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-300 truncate pr-2">{name}</span>
                          <span className="text-fuchsia-400 font-bold">{count}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500" style={{ width: `${(count / Math.max(1, totalTasks)) * 100}%` }} />
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'health' ? (
        <DatasetHealthGrid datasets={allDatasets} assignments={allAssignments} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <ActivityFeed logs={activityLogs} loading={isLoadingLogs} />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className={`${themeClasses.cards.glass} p-6`}>
              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest mb-4">Monitoring Info</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Activity logs track system-wide events including logins, submissions, and status changes.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Real-time update active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PipelineStep({ title, count, color, bgColor, borderColor, icon, alert }: { title: string, count: number, color: string, bgColor: string, borderColor: string, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all hover:bg-white/10 flex-1 min-w-[110px] ${borderColor} ${bgColor} relative`}>
      {alert && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
      )}
      <div className={`text-xl ${color}`}>{icon}</div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-white">{count}</span>
        <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">{title}</span>
      </div>
    </div>
  )
}

function PipelineArrow() {
  return (
    <div className="flex items-center justify-center opacity-30 text-white shrink-0">
      <LineChartOutlined className="rotate-90 text-[12px]" />
    </div>
  )
}