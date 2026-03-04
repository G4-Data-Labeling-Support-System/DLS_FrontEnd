import { useEffect, useState } from 'react';
import { Space, Typography, Spin, message, Modal, Input, Select, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { ProjectCard } from './ProjectCard';
import { ProjectDetail } from './ProjectDetail';
import { Link, useNavigate } from 'react-router-dom';
import { PATH_MANAGER } from '@/routes/paths';

import projectApi, { type GetProjectsParams } from '@/api/project';
const { Title } = Typography;

interface AllProjectsProps {
    selectedProjectId?: string | null;
    onProjectSelect?: (id: string | null) => void;
}

export const AllProjects: React.FC<AllProjectsProps> = ({ selectedProjectId, onProjectSelect }) => {
    // Khai báo state sử dụng mảng của GetProjectsParams
    const [projects, setProjects] = useState<GetProjectsParams[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [internalProjectId, setInternalProjectId] = useState<string | null>(null);
    const navigate = useNavigate();

    const currentProjectId = selectedProjectId !== undefined ? selectedProjectId : internalProjectId;
    const handleProjectSelect = (id: string | null) => {
        if (onProjectSelect) {
            onProjectSelect(id);
        } else {
            setInternalProjectId(id);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectApi.getProjects();

            const data = response.data?.data || response.data || [];

            if (Array.isArray(data)) {
                // Map the data to ensure properties match GetProjectsParams expected by ProjectCard
                const mappedProjects: GetProjectsParams[] = data.map((p: Record<string, unknown>) => {
                    const mapped: GetProjectsParams = {};
                    if (p.projectId || p.id) {
                        mapped.projectId = String(p.projectId || p.id);
                    }
                    if (p.projectName || p.name) {
                        mapped.projectName = String(p.projectName || p.name);
                    }
                    if (p.projectStatus || p.status) {
                        mapped.projectStatus = String(p.projectStatus || p.status);
                    }
                    if (p.description) {
                        mapped.description = String(p.description);
                    }
                    if (p.createdAt) {
                        mapped.createdAt = String(p.createdAt);
                    }
                    if (p.updatedAt) {
                        mapped.updatedAt = String(p.updatedAt);
                    }
                    return mapped;
                });
                setProjects(mappedProjects);
            } else {
                console.warn("API returned non-array data:", data);
                setProjects([]);
            }
        } catch (error) {
            console.error("Failed to load projects.", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = (id?: string) => {
        if (!id) return;

        Modal.confirm({
            title: 'Delete Project',
            content: 'Are you sure you want to delete this project?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    await projectApi.deleteProject(id);
                    message.success('Project deleted successfully!');
                    setProjects((prev) => prev.filter((p) => p.projectId !== id));
                } catch (error) {
                    console.error("Delete project error:", error);
                    message.error('An error occurred while deleting the project.');
                }
            },
        });
    };

    const handleEdit = (id?: string) => {
        if (!id) return;
        // Mở comment dòng dưới đây nếu bạn đã thiết lập route
        navigate(`/manager/projects/edit/${id}`);
        message.info(`Redirecting to edit project ID: ${id}`);
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (currentProjectId) {
        return (
            <ProjectDetail
                projectId={currentProjectId}
                onBack={() => handleProjectSelect(null)}
            />
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <Title level={4} className="!text-white !m-0 !font-display">All Projects</Title>
                <Space>
                    <Select
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        className="w-36"
                        options={[
                            { value: 'ALL', label: 'All Statuses' },
                            { value: 'NOT_STARTED', label: 'Not Started' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'INPROCESS', label: 'In Process' },
                            { value: 'COMPLETED', label: 'Completed' },
                            { value: 'INACTIVE', label: 'Inactive' },
                        ]}
                    />
                    <Input
                        placeholder="Search projects..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
                    />
                </Space>
            </div>

            {projects.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span className="text-gray-500">No projects created yet.</span>}
                    className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {projects
                        .filter(p => !searchText || (p.projectName && p.projectName.toLowerCase().includes(searchText.toLowerCase())))
                        .filter(p => statusFilter === 'ALL' || (p.projectStatus && p.projectStatus.toUpperCase() === statusFilter))
                        .map((p) => {
                            if (!p.projectId) return null; // Bỏ qua nếu data rác không có ID

                            return (
                                <ProjectCard
                                    key={p.projectId}
                                    {...p} // Spread toàn bộ thuộc tính chuẩn từ API vào Card
                                    onClick={() => handleProjectSelect(p.projectId as string)}
                                    onEdit={() => handleEdit(p.projectId)}
                                    onDelete={() => handleDelete(p.projectId)}
                                />
                            );
                        })}

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
            )}
        </div>
    );
};