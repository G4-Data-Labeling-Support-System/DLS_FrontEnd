import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface StatsCardProps {
    title: string;
    value: string | number;
    trend?: number;
    trendLabel?: string;
    subText?: string;
    tag?: string;
    isPercentage?: boolean; // kept for compatibility
    isUser?: boolean;
    avatar?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    trend,
    trendLabel,
    subText,
    tag,
    // isPercentage, // Kept for interface consistency but unused
    isUser,
    avatar
}) => {
    return (
        <Card className="h-full bg-[#1A1625] border-gray-800 rounded-xl hover:border-violet-500/50 transition-colors">
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-2">
                    <Text className="text-gray-500 text-xs font-bold tracking-wider uppercase">{title}</Text>
                    {tag && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                            {tag}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 my-2">
                    {isUser && avatar ? (
                        <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                    ) : isUser && !avatar ? (
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-gray-400">
                            <UserOutlined />
                        </div>
                    ) : null}

                    <Title level={isUser ? 4 : 2} className="!text-white !m-0 font-bold">
                        {value}
                    </Title>

                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            <span>{Math.abs(trend)}%</span>
                        </div>
                    )}
                </div>

                {(trendLabel || subText) && (
                    <Text className="text-gray-500 text-xs">
                        {trendLabel && <span className="text-violet-400">● </span>}
                        {trendLabel || subText}
                    </Text>
                )}
            </div>
        </Card>
    );
};
