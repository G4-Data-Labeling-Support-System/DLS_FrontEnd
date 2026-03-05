import { Button } from '@/shared/components/ui/Button';
import { MailOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import { BrandLogo } from '@/components/common/BrandLogo';
import { themeClasses } from '@/styles';

export default function ForgotPasswordPage() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen ${themeClasses.backgrounds.deepDark} text-white overflow-hidden">
            {/* Top Right Decoration */}
            <div className="absolute top-0 right-0">
                <div className="grid grid-cols-2">
                    <div className="w-16 h-16 bg-cyan-100"></div>
                    <div className="w-16 h-16 bg-black"></div>
                    <div className="w-16 h-16 bg-violet-400"></div>
                    <div className="w-16 h-16 bg-violet-200"></div>
                </div>
            </div>

            {/* Bottom Left Decoration */}
            <div className="absolute bottom-0 left-0">
                <div className="grid grid-cols-2">
                    <div className="w-16 h-16 bg-cyan-100"></div>
                    <div className="w-16 h-16 bg-violet-400"></div>
                    <div className="w-16 h-16 bg-black"></div>
                    <div className="w-16 h-16 bg-violet-200"></div>
                </div>
            </div>

            {/* Forgot password Form */}
            <div className={`w-full flex items-center justify-center relative ${themeClasses.backgrounds.deepDark} p-6`}>
                <div className="w-full max-w-md flex flex-col gap-10 items-center relative z-10">
                    <div className='flex flex-col items-center gap-2'>
                        <BrandLogo />
                        <p className='font-medium'>
                            Redefining AI precision
                        </p>
                    </div>
                    <div className="login-card p-8 rounded-2xl border border-violet-500/20">
                        <div className="mb-8">
                            <h1 className="font-space text-3xl font-bold tracking-tight text-white mb-3">
                                Forgot Password?
                            </h1>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Enter your email to receive a password reset link.
                            </p>
                        </div>
                        <Form
                            layout="vertical"
                            requiredMark={false}
                            className="space-y-4"
                        >
                            <Form.Item
                                name="email"
                                label={<span className="text-xs font-medium text-gray-400 uppercase tracking-wider pl-1">Email Address</span>}
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<MailOutlined className="text-white opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />}
                                    className="glass-input"
                                    placeholder="name@example.com"
                                />
                            </Form.Item>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-100 px-4 py-2 rounded-lg font-medium font-inter cursor-pointer"
                            >
                                Send reset link
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
