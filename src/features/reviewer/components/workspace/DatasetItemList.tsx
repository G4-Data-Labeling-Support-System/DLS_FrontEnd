import React from 'react';
import { Typography, Badge, Input } from 'antd';
import { SearchOutlined, CheckCircleFilled, CloseCircleFilled, ClockCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

export interface DatasetItem {
    id: string;
    filename: string;
    status: 'approved' | 'rejected' | 'pending';
    imageUrl: string;
    lastModified: string;
}

interface DatasetItemListProps {
    items: DatasetItem[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const DatasetItemList: React.FC<DatasetItemListProps> = ({ items, selectedId, onSelect }) => {
    return (
        <div className="flex flex-col h-full bg-[#15141e] border-r border-white/10 w-72 shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                    <Text className="text-white font-medium">Dataset Items</Text>
                    <Badge count={items.length} style={{ backgroundColor: '#2b2639', color: '#a78bfa', boxShadow: 'none' }} />
                </div>
                <Input
                    prefix={<SearchOutlined className="text-gray-500" />}
                    placeholder="Search file..."
                    className="bg-[#1a1924] border-white/10 text-white placeholder:text-gray-600 hover:border-violet-500/50 focus:border-violet-500"
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`
                            group flex items-center gap-3 p-3 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors
                            ${selectedId === item.id ? 'bg-violet-500/10 border-l-2 border-l-violet-500' : 'border-l-2 border-l-transparent'}
                        `}
                    >
                        {/* Thumbnail */}
                        <div className="w-10 h-10 bg-black/30 rounded overflow-hidden shrink-0 border border-white/10">
                            <img src={item.imageUrl} alt={item.filename} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <Text className={`block text-xs font-medium truncate mb-0.5 ${selectedId === item.id ? 'text-white' : 'text-gray-300'}`}>
                                {item.filename}
                            </Text>
                            <div className="flex items-center gap-1.5">
                                {item.status === 'approved' && <CheckCircleFilled className="text-[10px] text-green-500" />}
                                {item.status === 'rejected' && <CloseCircleFilled className="text-[10px] text-red-500" />}
                                {item.status === 'pending' && <ClockCircleFilled className="text-[10px] text-yellow-500" />}
                                <Text className="text-[10px] text-gray-500">{item.lastModified}</Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
