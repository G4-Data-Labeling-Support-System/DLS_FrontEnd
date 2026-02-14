import React from 'react';
import { Typography, Tabs, Timeline, Button, Progress, Avatar, Card } from 'antd';
import { HistoryOutlined, UserOutlined, CheckOutlined, CloseOutlined, UnorderedListOutlined } from '@ant-design/icons';
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
        <Card
            className="w-full shrink-0 bg-[#1A1625] border-gray-800 rounded-2xl flex flex-col h-full shadow-xl overflow-hidden"
            styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
            bordered={true}
        >
            <Tabs
                defaultActiveKey="annotations"
                centered
                className="px-4 pt-2 flex-1 [&_.ant-tabs-nav::before]:!border-gray-800 [&_.ant-tabs-tab]:!text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-violet-400 [&_.ant-tabs-ink-bar]:!bg-violet-500 [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content]:h-full"
                items={[
                    {
                        key: 'annotations',
                        label: <span className="flex items-center gap-2 font-display"><UnorderedListOutlined /> Objects</span>,
                        children: (
                            <div className="h-full overflow-y-auto px-1 custom-scrollbar pb-4 space-y-4">
                                {annotator && (
                                    <div className="bg-[#231e31] rounded-xl p-3 border border-gray-700 mt-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar size="small" icon={<UserOutlined />} className="bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md" />
                                            <div>
                                                <Text className="text-white block text-xs font-medium">{annotator.name}</Text>
                                                <Text className="text-gray-500 text-[10px] uppercase">{annotator.role}</Text>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-[#1A1625] rounded-lg p-1.5 text-center border border-gray-800">
                                                <Text className="text-gray-500 text-[10px] block font-bold">ACCURACY</Text>
                                                <Text className="text-violet-400 font-bold text-xs">{annotator.accuracy}</Text>
                                            </div>
                                            <div className="bg-[#1A1625] rounded-lg p-1.5 text-center border border-gray-800">
                                                <Text className="text-gray-500 text-[10px] block font-bold">SPEED</Text>
                                                <Text className="text-white font-bold text-xs">{annotator.speed}</Text>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 block sticky top-0 bg-[#1A1625] py-1 z-10">Detected ({annotations.length})</Text>
                                    <div className="space-y-2">
                                        {annotations.map(obj => (
                                            <div key={obj.id} className="group p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5 bg-[#231e31]/50">
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
                                                    trailColor="#1A1625"
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
                        label: <span className="flex items-center gap-2 font-display"><HistoryOutlined /> History</span>,
                        children: (
                            <div className="h-full overflow-y-auto px-2 custom-scrollbar">
                                <Timeline items={historyItems} className="mt-4" />
                            </div>
                        )
                    },
                ]}
            />

            {/* Validation Buttons pinned to bottom */}
            <div className="mt-auto p-4 border-t border-gray-800 bg-[#1A1625] shrink-0">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={onReject}
                        className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 h-10 rounded-xl"
                    >
                        Reject
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={onApprove}
                        className="bg-violet-600 hover:bg-violet-500 border-none h-10 shadow-lg shadow-violet-900/20 rounded-xl"
                    >
                        Approve
                    </Button>
                </div>
            </div>
        </Card>
    );
};
