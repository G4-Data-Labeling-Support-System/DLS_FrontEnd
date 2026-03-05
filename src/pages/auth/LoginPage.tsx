import { useAuth } from '@/features/auth/hooks';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { themeClasses } from '@/styles';
import { Button } from '@/shared/components/ui/Button';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setErrorMessage(null);
    const { email, password } = values;

    try {
      const user = await login({ email, password });

      if (user) {
        // Redirection logic based on role
        const role = (user.userRole || user.role || '').toLowerCase();

        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'manager') {
          navigate('/manager');
        } else if (role === 'annotator') {
          navigate('/annotator');
        } else {
          navigate('/');
        }
      } else {
        setErrorMessage('Invalid username or password. Please try again.');
      }
    } catch (err: any) {
      // Extract detailed message from backend if available
      const detailMsg = err.response?.data?.message || err.message;
      setErrorMessage(detailMsg || 'An unexpected error occurred');
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen ${themeClasses.backgrounds.deepDark} text-white overflow-hidden`}>

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

      {/* Right Side - Login Form */}
      <div className={`w-full flex items-center justify-center relative ${themeClasses.backgrounds.deepDark} p-6`}>
        <div className="w-full max-w-md flex flex-col gap-10 items-center relative z-10">
          <div className='flex flex-col items-center gap-2'>
            <BrandLogo />
            <p className='font-medium'>
              Redefining AI precision
            </p>
          </div>
          <div className="login-card p-8 rounded-2xl border border-violet-500/20">
            <div className="text-center mb-8">
              <h1 className="font-space text-3xl font-bold tracking-tight text-white">
                Login
              </h1>
            </div>

            {(error || errorMessage) && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error || errorMessage}
              </div>
            )}

            <Form
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              className="space-y-4"
            >
              <Form.Item
                name="email"
                label={<span className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}>Email Address</span>}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined className="text-white mr-3 opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />}
                  className="glass-input"
                  placeholder="name@example.com"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}>Password</span>}
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="text-white mr-3 opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />}
                  className="glass-input"
                  placeholder="••••••••"
                />
              </Form.Item>

              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-violet-400 hover:text-fuchsia-400 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-100 px-4 py-2 rounded-lg font-medium font-inter cursor-pointer"
              >
                {isLoading ? 'Loging in...' : 'Login'}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

