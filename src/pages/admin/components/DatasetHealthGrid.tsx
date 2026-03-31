import React, { useMemo, useState } from 'react'
import { Card, Tag, Tooltip, Progress, Empty, Input } from 'antd'
import { 
  DatabaseOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  WarningOutlined,
  SearchOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { themeClasses } from '@/styles'

interface DatasetHealthGridProps {
  datasets: any[]
  assignments: any[]
}

export const DatasetHealthGrid: React.FC<DatasetHealthGridProps> = ({ datasets, assignments }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showStuckOnly, setShowStuckOnly] = useState(false)

  const datasetHealth = useMemo(() => {
    return datasets.map(ds => {
      const dsId = String(ds.datasetId || ds.id)
      const dsAssignments = assignments.filter(a => String(a.datasetId) === dsId)
      
      const totalItems = Number(ds.totalItems) || 0
      const completedItems = dsAssignments.reduce((sum, a) => sum + (Number(a.completedItems) || 0), 0)
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      
      const uniqueLabelers = new Set(dsAssignments.map(a => a.assignedTo).filter(Boolean)).size
      
      // Deadline (latest due date)
      const dueDates = dsAssignments
        .map(a => a.dueDate)
        .filter(Boolean)
        .map(d => new Date(d).getTime())
      const latestDeadline = dueDates.length > 0 ? new Date(Math.max(...dueDates)) : null

      // Stuck detection: No updates in 3 days for a non-completed dataset
      const lastUpdate = dsAssignments.length > 0 
        ? Math.max(...dsAssignments.map(a => new Date(a.updatedAt || a.createdAt).getTime()))
        : new Date(ds.createdAt).getTime()
      
      const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24)
      const isStuck = progress < 100 && daysSinceUpdate > 3

      return {
        ...ds,
        key: dsId,
        progress,
        completedItems,
        labelers: uniqueLabelers,
        deadline: latestDeadline,
        isStuck,
        lastUpdate,
        daysSinceUpdate: Math.floor(daysSinceUpdate)
      }
    })
  }, [datasets, assignments])

  const filteredData = datasetHealth.filter(ds => {
    const matchesSearch = ds.datasetName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStuck = showStuckOnly ? ds.isStuck : true
    return matchesSearch && matchesStuck
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
             <DatabaseOutlined className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Dataset Health Overview</h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Real-time completion tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Input
            placeholder="Filter datasets..."
            prefix={<SearchOutlined className="text-gray-500" />}
            className="bg-white/5 border-white/10 text-white rounded-xl w-full sm:w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowStuckOnly(!showStuckOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${
              showStuckOnly 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <WarningOutlined />
            Stuck Only
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-panel rounded-2xl border border-white/5">
            <Empty description={<span className="text-gray-500">No datasets found.</span>} />
          </div>
        ) : (
          filteredData.map(ds => (
            <Card 
              key={ds.key}
              className={`${themeClasses.cards.glass} border-white/5 hover:border-violet-500/20 transition-all duration-300 relative overflow-hidden group`}
              bodyStyle={{ padding: '1.5rem' }}
            >
              {ds.isStuck && (
                <div className="absolute top-0 right-0 p-2">
                  <Tooltip title={`No activity for ${ds.daysSinceUpdate} days`}>
                    <Tag color="error" className="m-0 border-none bg-rose-500/20 text-rose-400 animate-pulse">
                      STUCK
                    </Tag>
                  </Tooltip>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DatabaseOutlined className="text-violet-400 text-xs" />
                    <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">Dataset</span>
                  </div>
                  <h4 className="text-lg font-bold text-white truncate">{ds.datasetName}</h4>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span className="text-gray-400">Completion</span>
                    <span className={ds.progress === 100 ? 'text-emerald-400' : 'text-fuchsia-400'}>
                      {ds.progress}%
                    </span>
                  </div>
                  <Progress 
                    percent={ds.progress} 
                    showInfo={false} 
                    strokeColor={{
                      '0%': '#8b5cf6',
                      '100%': ds.progress === 100 ? '#10b981' : '#d946ef',
                    }}
                    trailColor="rgba(255,255,255,0.05)"
                    className="m-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Total Items</span>
                    <span className="text-sm text-gray-200 font-bold">{ds.totalItems || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Labelers</span>
                    <div className="flex items-center gap-1.5">
                      <TeamOutlined className="text-xs text-gray-400" />
                      <span className="text-sm text-gray-200 font-bold">{ds.labelers}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Deadline</span>
                    <div className="flex items-center gap-1.5">
                      <CalendarOutlined className="text-xs text-gray-400" />
                      <span className="text-xs text-gray-300 font-medium">
                        {ds.deadline ? ds.deadline.toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Status</span>
                    {ds.progress === 100 ? (
                      <Tag color="success" icon={<CheckCircleOutlined />} className="w-fit m-0 rounded border-none bg-emerald-500/20 text-emerald-400">Finished</Tag>
                    ) : (
                      <Tag color="processing" className="w-fit m-0 rounded border-none bg-blue-500/20 text-blue-400">In Progress</Tag>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
