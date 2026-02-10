import React from 'react';
import { Typography, Tabs, Timeline, Button, Tag, Progress, Avatar } from 'antd';
import { HistoryOutlined, InfoCircleOutlined, UserOutlined, CheckOutlined, CloseOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { Annotation, HistoryEvent } from '@/api/reviewer';

const { Text } = Typography;

interface ReviewDetailPanelProps {
    annotations: Annotation[];
    history: HistoryEvent[];
    onApprove: () => void;
    onReject: () => void;
    annotator?: {
        name: string;
        role: string;
        level: number;
        accuracy: string;
        speed: string;
        avatar?: string;
    };
}

export const ReviewDetailPanel: React.FC<ReviewDetailPanelProps> = ({ annotations, history, onApprove, onReject, annotator }) => {

    const historyItems = history.map(event => ({
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
    }));

    return (
        <div className="w-80 shrink-0 bg-[#15141e] border-l border-white/10 flex flex-col h-full">
            <Tabs
                defaultActiveKey="annotations"
                className="px-4 pt-2 flex-1 [&_.ant-tabs-nav::before]:!border-white/10 [&_.ant-tabs-tab]:!text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-violet-400 [&_.ant-tabs-ink-bar]:!bg-violet-500 [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content]:h-full"
                items={[
                    {
                        key: 'annotations',
                        label: <span className="flex items-center gap-2"><UnorderedListOutlined /> Objects</span>,
                        children: (
                            <div className="h-full overflow-y-auto px-1 custom-scrollbar pb-4 space-y-4">
                                {annotator && (
                                    <div className="bg-[#1a1924] rounded-xl p-3 border border-white/5 mt-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar size="small" icon={<UserOutlined />} className="bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                                            <div>
                                                <Text className="text-white block text-xs font-medium">{annotator.name}</Text>
                                                <Text className="text-gray-500 text-[10px] uppercase">{annotator.role}</Text>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-[#232130] rounded p-1.5 text-center">
                                                <Text className="text-gray-500 text-[10px] block">ACCURACY</Text>
                                                <Text className="text-violet-400 font-bold text-xs">{annotator.accuracy}</Text>
                                            </div>
                                            <div className="bg-[#232130] rounded p-1.5 text-center">
                                                <Text className="text-gray-500 text-[10px] block">SPEED</Text>
                                                <Text className="text-white font-bold text-xs">{annotator.speed}</Text>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 block sticky top-0 bg-[#15141e] py-1 z-10">Detected ({annotations.length})</Text>
                                    <div className="space-y-2">
                                        {annotations.map(obj => (
                                            <div key={obj.id} className="group p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: obj.color, color: obj.color }} />
                                                        <Text className="text-gray-300 text-xs font-medium">{obj.label}</Text>
                                                    </div>
                                                    <Text className="text-gray-500 text-[10px]">{obj.confidence}%</Text>
                                                </div>
                                                <Progress
                                                    percent={obj.confidence}
                                                    showInfo={false}
                                                    strokeColor={obj.color}
                                                    trailColor="#232130"
                                                    size="small"
                                                    className="!m-0 [&_.ant-progress-bg]:!h-1"
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
                        label: <span className="flex items-center gap-2"><HistoryOutlined /> History</span>,
                        children: (
                            <div className="h-full overflow-y-auto px-2 custom-scrollbar">
                                <Timeline items={historyItems} className="mt-4" />
                            </div>
                        )
                    },
                    {
                        key: 'details',
                        label: <span className="flex items-center gap-2"><InfoCircleOutlined /> Info</span>,
                        children: (
                            <div className="p-4 space-y-4 h-full overflow-y-auto custom-scrollbar">
                                <div>
                                    <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block mb-2">Metadata</Text>
                                    <div className="space-y-3 bg-[#1a1924] p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between">
                                            <Text className="text-gray-400 text-xs">Resolution</Text>
                                            <Text className="text-white text-xs">1920x1080</Text>
                                        </div>
                                        <div className="flex justify-between">
                                            <Text className="text-gray-400 text-xs">File Size</Text>
                                            <Text className="text-white text-xs">2.4 MB</Text>
                                        </div>
                                        <div className="flex justify-between">
                                            <Text className="text-gray-400 text-xs">Format</Text>
                                            <Tag className="bg-blue-500/10 text-blue-400 border-blue-500/20 m-0 text-[10px]">JPG</Tag>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                ]}
            />

            {/* Validation Buttons pinned to bottom */}
            <div className="mt-auto p-4 border-t border-white/10 bg-[#15141e] shrink-0">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={onReject}
                        className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 h-10"
                    >
                        Reject
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={onApprove}
                        className="bg-violet-600 hover:bg-violet-500 border-none h-10 shadow-lg shadow-violet-900/20"
                    >
                        Approve
                    </Button>
                </div>
            </div>
        </div>
    );
};
