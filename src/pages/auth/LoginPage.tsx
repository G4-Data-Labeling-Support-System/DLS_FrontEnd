import { useAuth } from '@/features/auth/hooks';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { themeClasses, commonPatterns } from '@/styles';
import { Button } from '@/shared/components/ui/Button';
import { ArrowRightOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      const success = await login({ email, password });
      if (success) {
        navigate('/'); // Redirect to home on success
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className={`h-screen flex flex-col ${themeClasses.backgrounds.deepDark} ${themeClasses.text.primary} font-sans antialiased overflow-hidden`}>
      <main className="flex-1 flex overflow-hidden relative">
        {/* Logo */}
        <div className="absolute top-8 left-8 z-50 flex items-center gap-3 pointer-events-none">
          <span className={commonPatterns.logo.icon}>
            polyline
          </span>
          <span className={commonPatterns.logo.text}>
            DLSS{' '}
            <span className={commonPatterns.logo.version}>
              v2.4
            </span>
          </span>
        </div>

        {/* Back to Home Button */}
        <Link
          to="/"
          className={`absolute top-8 right-8 z-50 flex items-center gap-2 ${themeClasses.buttons.secondary} pointer-events-auto group`}
        >
          <span className="material-symbols-outlined text-lg group-hover:text-violet-400 transition-colors">
            arrow_back
          </span>
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className={`hidden lg:flex w-1/2 relative items-center justify-center ${themeClasses.backgrounds.deepDark} border-r ${themeClasses.borders.violet10} overflow-hidden`}>
          <div className={`absolute inset-0 ${themeClasses.gradients.radialViolet}`}></div>
          <div className={`absolute inset-0 ${themeClasses.effects.gridMesh} opacity-30`}></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-500 rounded-full blur-[2px] animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-fuchsia-500 rounded-full blur-[3px] animate-bounce"></div>
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center scale-90">
            <div className={`absolute inset-0 border ${themeClasses.borders.violet20} rounded-full scale-110`}></div>
            <div className={`absolute inset-0 border ${themeClasses.borders.violet10} rounded-full scale-125 animate-[spin_20s_linear_infinite]`}></div>
            <div className={`relative z-20 w-3/4 aspect-square overflow-hidden rounded-full border ${themeClasses.borders.violet40} p-1 ${themeClasses.backgrounds.blackAlpha} backdrop-blur-sm group shadow-[0_0_100px_rgba(139,92,246,0.2)]`}>
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/20 via-transparent to-fuchsia-500/20 z-10 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-violet-400 shadow-[0_0_15px_rgba(139,92,246,1)] z-30 animate-[bounce_4s_ease-in-out_infinite]"></div>
              <img
                alt="Digital Brain Scanned"
                className="w-full h-full object-cover grayscale opacity-60 mix-blend-screen transition-transform duration-1000 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_EaB7RHFbnMAxm5qhXoXa1OjP7NyHWv_hML9QE4y-bo7kUG49benz-Vw0MkTcVgmcX4lJ2-XXVVJoFTq5RfYwZR4hVi-lwf0_BPA2ZtyZRLJ3yaw6lygzB64gYPGuc8tGbPERP-_xwtdyQVTNrK0NKWhoPanC5mfnyfyxsA1VhLu4qgBScI5J0CfDakEBgTXB0YpjFj8aFKD8iBK7pRUugOKcBplm1UkcToLFhM5TLe5OS01TQqPXSBDpl2VS1E5lNyGOz0U2Ln2v"
              />
            </div>
            <div className={`absolute top-0 right-0 ${themeClasses.cards.glass} p-3 rounded-lg border-l-2 border-violet-500 flex items-center gap-3 scale-90 translate-x-4 -translate-y-4 animate-[pulse_4s_ease-in-out_infinite]`}>
              <span className={`material-symbols-outlined ${themeClasses.text.violet}`}>
                neurology
              </span>
              <div className="text-left">
                <p className={`text-[8px] uppercase tracking-widest ${themeClasses.text.tertiary}`}>
                  System
                </p>
                <p className="text-xs font-bold text-violet-300">Online</p>
              </div>
            </div>
            <div className={`absolute bottom-10 left-0 ${themeClasses.cards.glass} p-3 rounded-lg border-l-2 border-fuchsia-500 flex items-center gap-3 scale-90 -translate-x-4 animate-[pulse_5s_ease-in-out_infinite]`}>
              <span className={`material-symbols-outlined ${themeClasses.text.fuchsia}`}>
                lock
              </span>
              <div className="text-left">
                <p className={`text-[8px] uppercase tracking-widest ${themeClasses.text.tertiary}`}>
                  Security
                </p>
                <p className="text-xs font-bold text-fuchsia-300">Encrypted</p>
              </div>
            </div>
          </div>
        </div>
        <div className={`w-full lg:w-1/2 flex items-center justify-center relative ${themeClasses.backgrounds.deepDark} p-6`}>
          <div className={`absolute inset-0 ${themeClasses.effects.gridMesh} opacity-10 pointer-events-none`}></div>
          <div className="w-full max-w-md relative z-10">
            <div className="login-card p-8 rounded-2xl border border-violet-500/20">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                  <span className="material-symbols-outlined text-white text-2xl">
                    lock
                  </span>
                </div>
                <h1 className="font-space text-3xl font-bold tracking-tight text-white">
                  Login
                </h1>
              </div>

              {(error || errorMessage) && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error || errorMessage}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}>
                    Email Address
                  </label>
                  <div className="glass-input rounded-lg flex items-center px-4 transition-all group">
                    <span className={`material-symbols-outlined ${themeClasses.text.tertiary} group-focus-within:text-violet-400 text-xl mr-3`}>
                      mail
                    </span>
                    <input
                      className="w-full bg-transparent border-none py-3 text-white placeholder-gray-600 focus:ring-0 text-sm font-medium focus:outline-none"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}>
                    Password
                  </label>
                  <div className="glass-input rounded-lg flex items-center px-4 transition-all group">
                    <span className={`material-symbols-outlined ${themeClasses.text.tertiary} group-focus-within:text-violet-400 text-xl mr-3`}>
                      key
                    </span>
                    <input
                      className="w-full bg-transparent border-none py-3 text-white placeholder-gray-600 focus:ring-0 text-sm font-medium focus:outline-none"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`ml-2 ${themeClasses.text.tertiary} hover:text-violet-400 transition-colors focus:outline-none`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
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
                  className="w-full flex items-center justify-center gap-2 group mt-2 hover:scale-[1.01] active:scale-[0.99] text-sm tracking-wider"
                >
                  {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                  {!isLoading && (
                    <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

