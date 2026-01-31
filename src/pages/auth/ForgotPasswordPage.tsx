import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function ForgotPasswordPage() {
    return (
        <div className="h-screen flex flex-col bg-[#0f0e17] text-gray-100 font-sans antialiased overflow-hidden">
            <main className="flex-1 flex overflow-hidden relative">
                <div className="absolute top-8 left-8 z-50 flex items-center gap-3 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]">
                        polyline
                    </span>
                    <span className="font-space font-bold text-2xl tracking-tighter">
                        DLSS{' '}
                        <span className="text-xs font-mono text-violet-400 align-top opacity-70 ml-1">
                            v2.4
                        </span>
                    </span>
                </div>
                <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-[#0f0e17] border-r border-violet-500/10 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_rgba(15,14,23,1)_70%)]"></div>
                    <div className="absolute inset-0 grid-mesh opacity-30"></div>
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-500 rounded-full blur-[2px] animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-fuchsia-500 rounded-full blur-[3px] animate-bounce"></div>
                    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center scale-90">
                        <div className="absolute inset-0 border border-violet-500/20 rounded-full scale-110"></div>
                        <div className="absolute inset-0 border border-fuchsia-500/10 rounded-full scale-125 animate-[spin_20s_linear_infinite]"></div>
                        <div className="relative z-20 w-3/4 aspect-square overflow-hidden rounded-full border border-violet-500/40 p-1 bg-black/40 backdrop-blur-sm group shadow-[0_0_100px_rgba(139,92,246,0.2)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/20 via-transparent to-fuchsia-500/20 z-10 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-violet-400 shadow-[0_0_15px_rgba(139,92,246,1)] z-30 animate-[bounce_4s_ease-in-out_infinite]"></div>
                            <img
                                alt="Digital Brain Scanned"
                                className="w-full h-full object-cover grayscale opacity-60 mix-blend-screen transition-transform duration-1000 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_EaB7RHFbnMAxm5qhXoXa1OjP7NyHWv_hML9QE4y-bo7kUG49benz-Vw0MkTcVgmcX4lJ2-XXVVJoFTq5RfYwZR4hVi-lwf0_BPA2ZtyZRLJ3yaw6lygzB64gYPGuc8tGbPERP-_xwtdyQVTNrK0NKWhoPanC5mfnyfyxsA1VhLu4qgBScI5J0CfDakEBgTXB0YpjFj8aFKD8iBK7pRUugOKcBplm1UkcToLFhM5TLe5OS01TQqPXSBDpl2VS1E5lNyGOz0U2Ln2v"
                            />
                        </div>
                        <div className="absolute top-0 right-0 glass-card p-3 rounded-lg border-l-2 border-violet-500 flex items-center gap-3 scale-90 translate-x-4 -translate-y-4 animate-[pulse_4s_ease-in-out_infinite]">
                            <span className="material-symbols-outlined text-violet-400">
                                neurology
                            </span>
                            <div className="text-left">
                                <p className="text-[8px] uppercase tracking-widest text-gray-500">
                                    System
                                </p>
                                <p className="text-xs font-bold text-violet-300">Online</p>
                            </div>
                        </div>
                        <div className="absolute bottom-10 left-0 glass-card p-3 rounded-lg border-l-2 border-fuchsia-500 flex items-center gap-3 scale-90 -translate-x-4 animate-[pulse_5s_ease-in-out_infinite]">
                            <span className="material-symbols-outlined text-fuchsia-400">
                                lock
                            </span>
                            <div className="text-left">
                                <p className="text-[8px] uppercase tracking-widest text-gray-500">
                                    Security
                                </p>
                                <p className="text-xs font-bold text-fuchsia-300">Encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-[#0f0e17] p-6">
                    <div className="absolute inset-0 grid-mesh opacity-10 pointer-events-none"></div>
                    <div className="w-full max-w-md relative z-10">
                        <div className="login-card p-8 rounded-2xl border border-violet-500/20">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-gray-500 hover:text-violet-400 transition-colors mb-8 group w-fit"
                            >
                                <ArrowLeftOutlined className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Back to Login</span>
                            </Link>
                            <div className="mb-8">
                                <h1 className="font-space text-3xl font-bold tracking-tight text-white mb-3">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Enter your email to receive a password reset link.
                                </p>
                            </div>
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider pl-1">
                                        Email Address
                                    </label>
                                    <div className="glass-input rounded-lg flex items-center px-4 transition-all group">
                                        <span className="material-symbols-outlined text-gray-500 group-focus-within:text-violet-400 text-xl mr-3">
                                            mail
                                        </span>
                                        <input
                                            className="w-full bg-transparent border-none py-3 text-white placeholder-gray-600 focus:ring-0 text-sm font-medium focus:outline-none"
                                            placeholder="name@example.com"
                                            type="email"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="primary"
                                    className="w-full py-3.5 mt-4 hover:scale-[1.01] active:scale-[0.99] font-bold text-sm tracking-wider"
                                >
                                    SEND RESET LINK
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
