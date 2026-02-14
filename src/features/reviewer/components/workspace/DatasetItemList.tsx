import React from 'react';
import { Typography, Badge, Input, Card } from 'antd';
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
        <Card
            className="h-full bg-[#1A1625] border-gray-800 rounded-2xl w-full shadow-xl overflow-hidden flex flex-col"
            styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
            bordered={true}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 space-y-3 shrink-0">
                <div className="flex justify-between items-center">
                    <Text className="text-white font-medium font-display">Dataset Items</Text>
                    <Badge count={items.length} style={{ backgroundColor: '#2b2639', color: '#a78bfa', boxShadow: 'none' }} />
                </div>
                <Input
                    prefix={<SearchOutlined className="text-gray-500" />}
                    placeholder="Search file..."
                    className="bg-[#231e31] border-gray-700 text-white placeholder:text-gray-500 hover:border-violet-500/50 focus:border-violet-500 rounded-lg"
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`
                            group flex items-center gap-3 p-3 cursor-pointer rounded-xl border border-transparent transition-all
                            ${selectedId === item.id
                                ? 'bg-violet-600/10 border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
                                : 'hover:bg-white/5 hover:border-white/10'
                            }
                        `}
                    >
                        {/* Thumbnail */}
                        <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border ${selectedId === item.id ? 'border-violet-500/50' : 'border-gray-700'}`}>
                            <img src={item.imageUrl} alt={item.filename} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <Text className={`block text-xs font-medium truncate mb-0.5 ${selectedId === item.id ? 'text-violet-200' : 'text-gray-300 group-hover:text-white'}`}>
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
        </Card>
    );
};
