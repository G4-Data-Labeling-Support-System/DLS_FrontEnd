import { Card, Progress, Button, Typography, Dropdown, type MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ProjectCardProps {
    id: string;
    name: string;
    progress: number;
    completed: number;
    total: number;
    active: number;
    approved: number;
    rejected: number;
    color?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    id, name, progress, completed, total, active, approved, rejected, color = '#c026d3'
}) => {
    const items: MenuProps['items'] = [
        { key: '1', label: 'View Details' },
        { key: '2', label: 'Edit Project' },
        { key: '3', label: 'Pause' },
    ];

    return (
        <Card className="bg-[#1A1625] border-gray-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }}></div>
                        <Text className="text-gray-400 text-xs">ID: {id}</Text>
                    </div>
                    <Title level={5} className="!text-white !m-0 !text-sm leading-tight h-10 line-clamp-2" title={name}>{name}</Title>
                </div>
                <Dropdown menu={{ items }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined className="text-gray-400" />} />
                </Dropdown>
            </div>

            <div className="mb-6 flex items-center gap-4">
                <Progress type="circle" percent={progress} size={45} strokeColor={color} trailColor="#374151" format={() => <span className="text-white text-xs font-bold">{progress}%</span>} />
                <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-gray-300">{completed} / {total}</span>
                    </div>
                    <Progress percent={progress} size="small" showInfo={false} strokeColor={color} trailColor="#374151" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#231e31] p-2 rounded-lg">
                <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Active</div>
                    <div className="text-white font-semibold">{active}</div>
                </div>
                <div className="text-center border-l border-gray-700">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Approved</div>
                    <div className="text-green-400 font-semibold">{approved}</div>
                </div>
                <div className="text-center border-l border-gray-700">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Rejected</div>
                    <div className="text-red-400 font-semibold">{rejected}</div>
                </div>
            </div>
        </Card>
    );
};
