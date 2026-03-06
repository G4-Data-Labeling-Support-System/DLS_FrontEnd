import React, { useState, useEffect } from 'react';
import { Form, Input, Button, notification } from 'antd';
import {
    CloseOutlined,
    CheckCircleFilled,
    MailOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store';
import { userApi } from '@/api/userApi';
import { API_BASE_URL } from '@/lib/axios';

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
    const { user, setUser } = useAuthStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && open) {
            form.setFieldsValue({
                firstName: user.fullName?.split(' ')[0] || '',
                lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                username: user.username,
                country: (user as any).country || 'United States',
            });
        }
    }, [user, open, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const fullName = `${values.firstName} ${values.lastName}`.trim();

            const payload = {
                ...user,
                fullName,
                email: values.email,
                username: values.username,
                // Add other fields if backend supports them
            };

            await userApi.updateUser(user!.id, payload as any);
            setUser({ ...user!, fullName, email: values.email, username: values.username });

            notification.success({ message: 'Profile updated successfully' });
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            notification.error({ message: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = (avatarPath: string | undefined | null) => {
        if (!avatarPath) return "https://cdn-icons-png.flaticon.com/512/9408/9408175.png";
        if (avatarPath.startsWith('http')) return avatarPath;
        const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
        return `${API_BASE_URL}/${cleanPath}`;
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className="relative w-full max-w-[650px] bg-[#0D0D0D] border border-[#333] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[100] w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-black/30 text-white/50 hover:text-white hover:bg-black/50 transition-all border border-white/10"
                >
                    <CloseOutlined />
                </button>

                {/* Banner Section */}
                <div className="relative h-40 w-full overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=1000"
                        alt="Banner"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D0D0D]" />
                </div>

                {/* Content Container */}
                <div className="px-8 pb-8 -mt-12 relative z-10">
                    {/* Profile Header */}
                    <div className="flex justify-between items-end mb-6">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-[#0D0D0D] overflow-hidden shadow-2xl bg-[#1A1A1A]">
                                <img
                                    src={getAvatarUrl(user?.avatar || (user as any)?.coverImage)}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <CheckCircleFilled className="absolute bottom-1 right-1 text-blue-500 text-2xl bg-[#0D0D0D] rounded-full border-2 border-[#0D0D0D]" />
                        </div>
                    </div>

                    {/* User Info Bar */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-white mb-0">
                                {user?.username || 'User Name'}
                            </h2>
                        </div>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>

                    {/* Form Section */}
                    <Form form={form} layout="vertical" className="space-y-6">
                        <Form.Item
                            label={<span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Email address</span>}
                            name="email"
                        >
                            <Input
                                prefix={<MailOutlined className="text-gray-500 mr-2" />}
                                className="dark-form-input h-11"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Username</span>}
                            name="username"
                        >
                            <Input
                                className="dark-form-input h-11"
                            />
                        </Form.Item>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-800/50 mt-10">
                            <Button
                                onClick={onClose}
                                className="bg-transparent border-gray-700 text-white hover:bg-white/5 h-11 px-8 rounded-lg font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={handleSave}
                                className="bg-[#2D2D2D] border-none text-white hover:bg-[#3D3D3D] h-11 px-8 rounded-lg font-bold"
                            >
                                Save changes
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>

            <style>{`
                .dark-form-input {
                    background: #1A1A1A !important;
                    border: 1px solid #333 !important;
                    color: white !important;
                    border-radius: 8px !important;
                    transition: all 0.3s;
                }
                .dark-form-input:focus, .dark-form-input:hover {
                    border-color: #555 !important;
                    background: #222 !important;
                }
                .ant-form-item-label label {
                    color: #9CA3AF !important;
                    padding-bottom: 8px;
                }
            `}</style>
        </div>
    );
};
