import React from 'react';
import { Typography, Badge, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface SubmissionItem {
    id: string;
    imageUrl: string;
    status: 'reviewing' | 'pending' | 'approved' | 'rejected';
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
}

interface SubmissionQueueProps {
    items: SubmissionItem[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const SubmissionQueue: React.FC<SubmissionQueueProps> = ({ items, selectedId, onSelect }) => {
    return (
        <div className="flex flex-col h-full bg-[#15141e] border-r border-white/10 w-80 shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Text className="text-white font-medium uppercase tracking-wider text-xs">Queue</Text>
                    <Badge count={items.length} style={{ backgroundColor: '#2b2639', color: '#a78bfa', boxShadow: 'none' }} />
                </div>
                <Button type="text" icon={<FilterOutlined />} size="small" className="text-gray-400 hover:text-white" />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`
                            relative group cursor-pointer rounded-lg overflow-hidden border transition-all duration-200
                            ${selectedId === item.id
                                ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20'
                                : 'border-white/5 bg-[#1a1924] hover:border-white/20'
                            }
                        `}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2 z-10">
                            {item.status === 'reviewing' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500 text-white font-bold uppercase tracking-wide">
                                    Reviewing
                                </span>
                            )}
                            {item.status === 'pending' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-700/50 text-gray-300 font-bold uppercase tracking-wide border border-white/10">
                                    Pending
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex p-2 gap-3">
                            <div className="w-20 h-16 bg-black/20 rounded-md overflow-hidden shrink-0">
                                <img src={item.imageUrl} alt={item.id} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <Text className={`text-sm font-semibold mb-1 ${selectedId === item.id ? 'text-white' : 'text-gray-300'}`}>
                                    {item.id}
                                </Text>
                                <div className="flex items-center gap-2">
                                    {item.priority === 'high' && <span className="text-[10px] text-red-400">High Priority</span>}
                                    <span className="text-[10px] text-gray-500">{item.timestamp}</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Highlight Line */}
                        {selectedId === item.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
