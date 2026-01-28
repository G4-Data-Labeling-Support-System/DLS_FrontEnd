
import React from 'react';
import { Card, Typography, List } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

const { Text } = Typography;

const tips = [
    {
        title: 'Project Name',
        description: 'Choose a descriptive name that clearly identifies the project purpose.'
    },
    {
        title: 'Dataset',
        description: 'Ensure your dataset follows the required format (CSV, JSON) and structure.'
    },
    {
        title: 'Guidelines',
        description: 'Providing clear guidelines helps labelers understand the task better.'
    }
];

const SidebarTips: React.FC = () => {
    return (
        <Card
            className="bg-white/10 backdrop-blur-sm border-white/20"
            title={
                <div className="flex items-center gap-2 text-white">
                    <BulbOutlined className="text-yellow-400" />
                    <span>Quick Tips</span>
                </div>
            }
            bordered={false}
        >
            <List
                itemLayout="vertical"
                dataSource={tips}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<Text strong className="text-gray-200">{item.title}</Text>}
                            description={<Text className="text-gray-400">{item.description}</Text>}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default SidebarTips;
