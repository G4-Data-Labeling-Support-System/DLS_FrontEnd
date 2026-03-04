import { useEffect, useState } from 'react';
import { Space, Typography, Spin, message, Modal, Input, Select, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AssignmentCard } from './AssignmentCard';
// import { AssignmentDetail } from './AssignmentDetail'; // To be implemented later

import assignmentApi, { type GetAssignmentsParams } from '@/api/assignment';
const { Title } = Typography;

interface AllAssignmentsProps {
    selectedAssignmentId?: string | null;
    onAssignmentSelect?: (id: string | null) => void;
}

export const AllAssignments: React.FC<AllAssignmentsProps> = ({ selectedAssignmentId, onAssignmentSelect }) => {
    const [assignments, setAssignments] = useState<GetAssignmentsParams[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [internalAssignmentId, setInternalAssignmentId] = useState<string | null>(null);

    const currentAssignmentId = selectedAssignmentId !== undefined ? selectedAssignmentId : internalAssignmentId;

    const handleAssignmentSelect = (id: string | null) => {
        if (onAssignmentSelect) {
            onAssignmentSelect(id);
        } else {
            setInternalAssignmentId(id);
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await assignmentApi.getAssignments();
            const data = response.data?.data || response.data || [];

            if (Array.isArray(data)) {
                // Dynamically map properties checking multiple possible backend formats natively
                const mappedAssignments: GetAssignmentsParams[] = data.map((a: Record<string, unknown>) => {
                    const mapped: GetAssignmentsParams = {};
                    if (a.assignmentId || a.id) {
                        mapped.assignmentId = String(a.assignmentId || a.id);
                    }
                    if (a.assignmentName || a.name) {
                        mapped.assignmentName = String(a.assignmentName || a.name);
                    }
                    if (a.assignmentStatus || a.status) {
                        mapped.assignmentStatus = String(a.assignmentStatus || a.status);
                    }
                    if (a.descriptionAssignment || a.description) {
                        mapped.descriptionAssignment = String(a.descriptionAssignment || a.description);
                    }
                    if (a.projectId || a.project_id) {
                        mapped.projectId = String(a.projectId || a.project_id);
                    }
                    if (a.datasetId || a.dataset_id) {
                        mapped.datasetId = String(a.datasetId || a.dataset_id);
                    }
                    if (a.createdAt) {
                        mapped.createdAt = String(a.createdAt);
                    }
                    if (a.updatedAt) {
                        mapped.updatedAt = String(a.updatedAt);
                    }
                    return mapped;
                });
                setAssignments(mappedAssignments);
            } else {
                console.warn("API returned non-array data:", data);
                setAssignments([]);
            }
        } catch (error) {
            const assignError = error as Record<string, unknown>;
            const responseData = assignError?.response as Record<string, unknown>;
            const data = responseData?.data as Record<string, unknown>;
            const isNotFoundError = data?.code === 404 && data?.message === 'Assignment not found';

            if (isNotFoundError) {
                // Backend confirmed 0 assignments exist system-wide
                setAssignments([]);
            } else {
                console.error("Failed to load assignments.", error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleDelete = (id?: string) => {
        if (!id) return;

        Modal.confirm({
            title: 'Delete Assignment',
            content: 'Are you sure you want to delete this assignment?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    await assignmentApi.deleteAssignment(id);
                    message.success('Assignment deleted successfully!');
                    setAssignments((prev) => prev.filter((a) => a.assignmentId !== id));
                } catch (error) {
                    console.error("Delete assignment error:", error);
                    message.error('An error occurred while deleting the assignment.');
                }
            },
        });
    };

    const handleEdit = (id?: string) => {
        if (!id) return;
        message.info(`Editing assignment ID: ${id} is currently not supported.`);
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (currentAssignmentId) {
        // Fallback placeholder logic for Detailed View injection later
        return (
            <div className="w-full bg-[#1A1625] border-gray-800 rounded-xl p-6 text-center">
                <h2 className="text-xl text-white font-bold mb-4">Assignment View (ID: {currentAssignmentId})</h2>
                <p className="text-gray-400 mb-6">Assignment details are currently under development.</p>
                <button onClick={() => handleAssignmentSelect(null)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded text-white transition-colors">Go Back</button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <Title level={4} className="!text-white !m-0 !font-display">All Assignments</Title>
                <Space>
                    <Select
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        className="w-36"
                        options={[
                            { value: 'ALL', label: 'All Statuses' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'PAUSED', label: 'Paused' },
                            { value: 'COMPLETED', label: 'Completed' },
                            { value: 'ARCHIVE', label: 'Archive' },
                        ]}
                    />
                    <Input
                        placeholder="Search assignments..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
                    />
                </Space>
            </div>

            {assignments.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span className="text-gray-500">No assignments created yet.</span>}
                    className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {assignments
                        .filter(a => !searchText || (a.assignmentName && a.assignmentName.toLowerCase().includes(searchText.toLowerCase())))
                        .filter(a => statusFilter === 'ALL' || (a.assignmentStatus && a.assignmentStatus.toUpperCase() === statusFilter))
                        .map((a, index) => {
                            const uniqueId = a.assignmentId || String(index);
                            return (
                                <AssignmentCard
                                    key={uniqueId}
                                    {...a}
                                    onClick={() => handleAssignmentSelect(uniqueId)}
                                    onEdit={() => handleEdit(uniqueId)}
                                    onDelete={() => handleDelete(uniqueId)}
                                />
                            );
                        })}
                </div>
            )}
        </div>
    );
};
