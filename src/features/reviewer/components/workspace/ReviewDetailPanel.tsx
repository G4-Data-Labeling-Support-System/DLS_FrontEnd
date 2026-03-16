import React from 'react'
import { Typography, Tabs, Timeline, Button, Progress, Avatar, Card } from 'antd'
import {
  HistoryOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import type { Annotation, HistoryEvent } from '@/api/ReviewerApi'

const { Text } = Typography

interface ReviewDetailPanelProps {
  annotations: Annotation[]
  history: HistoryEvent[]
  onApprove: () => void
  onReject: () => void
  annotator?: {
    name: string
    role: string
    level: number
    accuracy: string
    speed: string
    avatar?: string
  }
}

export const ReviewDetailPanel: React.FC<ReviewDetailPanelProps> = ({
  annotations,
  history,
  onApprove,
  onReject,
  annotator
}) => {
  const historyItems = history.map((event) => ({
    color: event.type === 'success' ? 'green' : event.type === 'error' ? 'red' : 'gray',
    children: (
      <div className="pb-4">
        <Text className="text-gray-300 text-xs font-medium block">{event.action}</Text>
        <div className="flex justify-between items-center mt-0.5">
          <Text className="text-gray-500 text-[10px] flex items-center gap-1">
            <UserOutlined /> {event.user}
          </Text>
          <Text className="text-gray-600 text-[10px]">{event.time}</Text>
        </div>
        {event.details && (
          <div className="mt-1 p-2 bg-white/5 rounded text-[10px] text-gray-400 border border-white/5">
            {event.details}
          </div>
        )}
      </div>
    )
  }))

  return (
    <Card
      className="w-full shrink-0 glass-panel border border-white/5 rounded-2xl flex flex-col h-full shadow-2xl overflow-hidden"
      styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
      bordered={false}
    >
      <Tabs
        defaultActiveKey="annotations"
        centered
        className="px-4 pt-2 flex-1 [&_.ant-tabs-nav::before]:!border-white/5 [&_.ant-tabs-tab]:!text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-violet-400 [&_.ant-tabs-ink-bar]:!bg-violet-500 [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content]:h-full"
        items={[
          {
            key: 'annotations',
            label: (
              <span className="flex items-center gap-2 font-bold tracking-tight">
                <UnorderedListOutlined /> Objects
              </span>
            ),
            children: (
              <div className="h-full overflow-y-auto px-1 custom-scrollbar pb-4 space-y-4">
                {annotator && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 mt-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 blur-2xl -z-10" />
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar
                        size="large"
                        icon={<UserOutlined />}
                        className="bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg border-2 border-white/10"
                      />
                      <div>
                        <Text className="text-white block text-sm font-bold">
                          {annotator.name}
                        </Text>
                        <Text className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                          {annotator.role}
                        </Text>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/20 rounded-xl p-2.5 text-center border border-white/5">
                        <Text className="text-gray-500 text-[10px] block font-black tracking-widest uppercase mb-1">Accuracy</Text>
                        <Text className="text-emerald-400 font-bold text-sm">
                          {annotator.accuracy}
                        </Text>
                      </div>
                      <div className="bg-black/20 rounded-xl p-2.5 text-center border border-white/5">
                        <Text className="text-gray-500 text-[10px] block font-black tracking-widest uppercase mb-1">Speed</Text>
                        <Text className="text-blue-400 font-bold text-sm">{annotator.speed}</Text>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block sticky top-0 bg-[#0f0e17]/80 backdrop-blur-sm py-2 z-10 border-b border-white/5">
                    Detected ({annotations.length})
                  </Text>
                  <div className="space-y-3">
                    {annotations.map((obj) => (
                      <div
                        key={obj.id}
                        className="group p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 bg-white/5 flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full shadow-[0_0_12px_currentColor]"
                              style={{ backgroundColor: obj.color, color: obj.color }}
                            />
                            <Text className="text-gray-200 text-xs font-bold">{obj.label}</Text>
                          </div>
                          <Text className="text-gray-400 text-[10px] font-mono font-bold">{obj.confidence}%</Text>
                        </div>
                        <Progress
                          percent={obj.confidence}
                          showInfo={false}
                          strokeColor={obj.color}
                          railColor="rgba(255,255,255,0.05)"
                          size="small"
                          className="!m-0 [&_.ant-progress-bg]:!h-1.5 [&_.ant-progress-bg]:!rounded-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'history',
            label: (
              <span className="flex items-center gap-2 font-bold tracking-tight">
                <HistoryOutlined /> History
              </span>
            ),
            children: (
              <div className="h-full overflow-y-auto px-2 custom-scrollbar">
                <Timeline items={historyItems} className="mt-6 [&_.ant-timeline-item-tail]:border-white/10" />
              </div>
            )
          }
        ]}
      />

      {/* Validation Buttons pinned to bottom */}
      <div className="mt-auto p-6 border-t border-white/5 bg-black/20 shrink-0">
        <div className="flex flex-col gap-3">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onApprove}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none h-12 shadow-xl shadow-emerald-900/20 rounded-xl font-bold text-sm tracking-wide"
          >
            Approve Work
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={onReject}
            className="w-full bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500 h-10 rounded-xl font-bold text-[13px]"
          >
            Reject / Request Edit
          </Button>
        </div>
      </div>
    </Card>
  )
}
