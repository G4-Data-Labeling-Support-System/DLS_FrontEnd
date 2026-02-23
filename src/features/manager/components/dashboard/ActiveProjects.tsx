import { useEffect, useState } from 'react';
import { Button, Space, Typography, Spin, message, Modal } from 'antd';
import { FilterOutlined, SortAscendingOutlined, PlusOutlined } from '@ant-design/icons';
import { ProjectCard } from './ProjectCard';
import { Link, useNavigate } from 'react-router-dom';
import { PATH_MANAGER } from '@/routes/paths';

import projectApi, { type GetProjectsParams } from '@/api/project';
const { Title } = Typography;

export const ActiveProjects = () => {
    // Khai báo state sử dụng mảng của GetProjectsParams
    const [projects, setProjects] = useState<GetProjectsParams[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectApi.getProjects();

            const data = response.data?.data || response.data || [];

            if (Array.isArray(data)) {
                setProjects(data);
            } else {
                console.warn("API returned non-array data:", data);
                setProjects([]);
            }
        } catch (error) {
            console.error("Failed to load projects.", error);
            message.error("Không thể tải danh sách dự án.");
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
            title: 'Xoá dự án',
            content: 'Bạn có chắc chắn muốn xoá dự án này không?',
            okText: 'Xoá',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                try {
                    await projectApi.deleteProject(id);
                    message.success('Đã xoá dự án thành công!');
                    setProjects((prev) => prev.filter((p) => p.projectId !== id));
                } catch (error) {
                    console.error("Lỗi xóa dự án:", error);
                    message.error('Có lỗi xảy ra khi xoá dự án.');
                }
            },
        });
    };

    const handleEdit = (id?: string) => {
        if (!id) return;
        // Mở comment dòng dưới đây nếu bạn đã thiết lập route
        navigate(`/manager/projects/edit/${id}`);
        message.info(`Đang chuyển đến trang chỉnh sửa dự án ID: ${id}`);
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {projects.map((p) => {
                    if (!p.projectId) return null; // Bỏ qua nếu data rác không có ID

                    return (
                        <ProjectCard
                            key={p.projectId}
                            {...p} // Spread toàn bộ thuộc tính chuẩn từ API vào Card
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
        </div>
    );
};