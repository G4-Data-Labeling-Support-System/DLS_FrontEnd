import { useState } from 'react';
import { Form, Input, Select } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Button } from '@/shared/components/ui/Button';
import { GlassModal } from '@/shared/components/ui/GlassModal';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            // TODO: Implement API call
            console.log('Form values:', values);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            onClose();
            form.resetFields();
        } catch (error) {
            console.error('Failed to create user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassModal
            open={isOpen}
            onCancel={onClose}
            width={560}
        >
            {/* Header */}
            <div className="px-8 pt-10 pb-6 text-center border-b border-white/5">
                <h2 className="text-white text-3xl font-bold tracking-tight mb-2">
                    Add New User
                </h2>
                <p className="text-white/50 text-sm">
                    Provision a new account with specific access roles.
                </p>
            </div>

            {/* Form Content */}
            <div className="px-8 py-8">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ role: 'annotator' }}
                    className="flex flex-col gap-2"
                    requiredMark={false}
                >
                    {/* Username Field - NEW */}
                    <Form.Item
                        name="username"
                        label={<span className="text-gray-300 font-medium">Username</span>}
                        rules={[{ required: true, message: 'Please enter a username' }]}
                    >
                        <Input
                            size="large"
                            prefix={<UserOutlined className="text-gray-500" />}
                            placeholder="e.g. jdoe123"
                        />
                    </Form.Item>

                    {/* Full Name Field */}
                    <Form.Item
                        name="fullName"
                        label={<span className="text-gray-300 font-medium">Full Name</span>}
                        rules={[{ required: true, message: 'Please enter full name' }]}
                    >
                        <Input
                            size="large"
                            prefix={<UserOutlined className="text-gray-500" />}
                            placeholder="e.g. John Doe"
                        />
                    </Form.Item>

                    {/* Email Address Field */}
                    <Form.Item
                        name="email"
                        label={<span className="text-gray-300 font-medium">Email Address</span>}
                        rules={[
                            { required: true, message: 'Please enter email address' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<MailOutlined className="text-gray-500" />}
                            placeholder="name@company.com"
                        />
                    </Form.Item>

                    {/* Password Field */}
                    <Form.Item
                        name="password"
                        label={<span className="text-gray-300 font-medium">Initial Password</span>}
                        rules={[{ required: true, message: 'Please enter password' }]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-gray-500" />}
                            placeholder="••••••••"
                        />
                    </Form.Item>

                    {/* Role Selection Dropdown */}
                    <Form.Item
                        name="role"
                        label={<span className="text-gray-300 font-medium">Access Role</span>}
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select
                            size="large"
                            className="custom-select"
                            suffixIcon={<SafetyCertificateOutlined className="text-gray-500" />}
                            popupClassName="glass-dropdown"
                            options={[
                                { label: 'Annotator', value: 'annotator' },
                                { label: 'Reviewer', value: 'reviewer' },
                                { label: 'Manager', value: 'manager' },
                            ]}
                        />
                    </Form.Item>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            className="flex-1 h-11 border-white/10 bg-transparent text-gray-300 hover:text-white hover:border-white/30"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={loading}
                            className="flex-[2] h-11"
                        >
                            Create Account
                        </Button>
                    </div>
                </Form>
            </div>
        </GlassModal>
    );
}
