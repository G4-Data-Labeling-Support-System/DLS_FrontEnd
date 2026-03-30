import React from 'react'
import { Timeline, Tag, Spin, Empty, Card } from 'antd'
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  PlusCircleOutlined,
  LogoutOutlined,
  LoginOutlined,
  FileSearchOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { themeClasses } from '@/styles'
import type { LogEntry } from '@/api/LogsApi'

interface ActivityFeedProps {
  logs: LogEntry[]
  loading: boolean
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs, loading }) => {
  const getActionIcon = (action: string) => {
    const act = action?.toUpperCase()
    if (act.includes('LOGIN')) return <LoginOutlined className="text-emerald-400" />
    if (act.includes('LOGOUT')) return <LogoutOutlined className="text-gray-400" />
    if (act.includes('SUBMIT')) return <CheckCircleOutlined className="text-blue-400" />
    if (act.includes('REVIEW')) return <FileSearchOutlined className="text-violet-400" />
    if (act.includes('CREATE')) return <PlusCircleOutlined className="text-fuchsia-400" />
    if (act.includes('ASSIGN')) return <UserOutlined className="text-amber-400" />
    return <ClockCircleOutlined className="text-gray-400" />
  }

  const getActionColor = (action: string) => {
    const act = action?.toUpperCase()
    if (act.includes('LOGIN')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (act.includes('SUBMIT')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (act.includes('REVIEW')) return 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    if (act.includes('CREATE')) return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
    return 'bg-white/5 text-gray-400 border-white/10'
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 glass-panel rounded-2xl border border-white/5">
        <Spin indicator={<div className="w-8 h-8 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />} />
        <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing system logs...</span>
      </div>
    )
  }

  return (
    <Card className={`${themeClasses.cards.glass} border-white/5 h-full`} bodyStyle={{ padding: '1.5rem', height: '100%' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
             <ExclamationCircleOutlined className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">System Activity</h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Global real-time feed</p>
          </div>
        </div>
        {loading && <span className="text-[10px] text-violet-400 animate-pulse font-bold tracking-widest uppercase">Refreshing...</span>}
      </div>

      <div className="overflow-y-auto pr-4 max-h-[600px] custom-scrollbar">
        {logs.length === 0 ? (
          <Empty description={<span className="text-gray-500 italic">No activity recorded yet.</span>} />
        ) : (
          <Timeline
            pending={loading ? "Polling latest records..." : false}
            className="activity-timeline"
          >
            {logs.map((log, index) => (
              <Timeline.Item 
                key={`${log.timestamp}-${index}`}
                dot={getActionIcon(log.action)}
                className="pb-8"
              >
                <div className="flex flex-col gap-2 group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-100 group-hover:text-violet-400 transition-colors">
                        {log.username || 'Anonymous'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <Tag className={`m-0 text-[9px] font-bold uppercase tracking-wider h-fit rounded border ${getActionColor(log.action)}`}>
                      {log.action}
                    </Tag>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group-hover:bg-white/10">
                    <p className="text-xs text-gray-300 leading-relaxed m-0 font-medium">
                      {log.description}
                    </p>
                    {log.entityName && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Target:</span>
                        <Tag className="m-0 text-[10px] bg-black/40 border-white/5 text-violet-400 font-mono">
                          {log.entityName} {log.entityId && `#${log.entityId.slice(-4)}`}
                        </Tag>
                      </div>
                    )}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </div>

      <style>{`
        .activity-timeline .ant-timeline-item-tail {
          border-left: 2px dashed rgba(255, 255, 255, 0.05) !important;
        }
        .activity-timeline .ant-timeline-item-head {
          background: transparent !important;
        }
        .activity-timeline .ant-timeline-item-content {
          margin-left: 32px !important;
        }
      `}</style>
    </Card>
  )
}
