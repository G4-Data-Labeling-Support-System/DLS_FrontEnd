import React from 'react';
import { Typography, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const ReviewerLoadingState: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1625] via-[#0D0B14] to-[#1A1625] border border-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm">
            <Spin
                indicator={<LoadingOutlined className="text-5xl text-purple-400" spin />}
                size="large"
            />
            <Text className="mt-6 text-gray-400 text-base animate-pulse">
                Loading annotation details...
            </Text>
        </div>
    );
};
