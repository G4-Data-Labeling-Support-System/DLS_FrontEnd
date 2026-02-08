import React from 'react';
import { Select, Typography, Card } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export const ReviewerFilters: React.FC = () => {
    return (
        <Card className="h-full bg-[#1A1625] border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-6">
                <FilterOutlined className="text-violet-400 text-xl" />
                <Title level={5} className="!text-white !m-0 !font-normal !font-display">Filters</Title>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Text className="text-gray-500 text-xs uppercase font-semibold pl-1">Project</Text>
                    <Select
                        defaultValue="all"
                        className="w-full [&_.ant-select-selector]:!bg-[#1a1625] [&_.ant-select-selector]:!border-white/10 [&_.ant-select-selector]:!text-white [&_.ant-select-arrow]:!text-white/50"
                        size="large"
                        options={[
                            { value: 'all', label: 'All Active Projects' },
                            { value: 'autonomous', label: 'Autonomous Vehicle L4' },
                            { value: 'medical', label: 'Medical Imaging' },
                        ]}
                        popupClassName="bg-[#1a1625] border border-white/10 text-white"
                        dropdownStyle={{ backgroundColor: '#1a1625' }}
                    />
                </div>
                {/* Add more filters here easily */}
            </div>
        </Card>
    );
};
