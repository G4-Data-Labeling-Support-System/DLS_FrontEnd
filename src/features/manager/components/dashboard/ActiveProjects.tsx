
import { useEffect, useState } from 'react';
import { Button, Space, Typography, Spin } from 'antd';
import { FilterOutlined, SortAscendingOutlined, PlusOutlined } from '@ant-design/icons';
import { ProjectCard } from './ProjectCard';
import { Link } from 'react-router-dom';
import { PATH_MANAGER } from '@/routes/paths';
import { managerApi, type ProjectSummary } from '@/api';

const { Title } = Typography;

export const ActiveProjects = () => {
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Ensure managerApi is using the proxy-based client
                const data = await managerApi.getActiveProjects();
                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    console.warn("API returned non-array data:", data);
                    setProjects([]);
                }
            } catch (error) {
                console.error("Failed to load projects. Check network tab for 403/CORS details.", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <Title level={4} className="!text-white !m-0 !font-display">Active Projects</Title>
                <Space>
                    <Button icon={<FilterOutlined />} className="bg-[#1A1625] border-gray-700 text-gray-300 hover:text-white hover:border-violet-500">Filter</Button>
                    <Button icon={<SortAscendingOutlined />} className="bg-[#1A1625] border-gray-700 text-gray-300 hover:text-white hover:border-violet-500">Sort</Button>
                </Space>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {projects.map((p) => (
                    <ProjectCard key={p.id} {...p} />
                ))}

                {/* Start New Project Card */}
                <Link to={PATH_MANAGER.createProject} className="block group">
                    <div className="h-full min-h-[180px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-4 bg-[#1A1625]/30 hover:bg-[#1A1625] hover:border-violet-500 transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-[#231e31] group-hover:bg-violet-600 flex items-center justify-center transition-colors">
                            <PlusOutlined className="text-gray-400 group-hover:text-white text-xl" />
                        </div>
                        <span className="text-gray-400 group-hover:text-white font-medium font-display">Start New Project</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};
