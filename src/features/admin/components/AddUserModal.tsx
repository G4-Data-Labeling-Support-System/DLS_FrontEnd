import { useState } from 'react';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'annotator',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Handle form submission
        console.log('Form submitted:', formData);
        onClose();
    };

    return (
        <>
            {/* Modal Overlay Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                {/* Modal Container */}
                <div className="glass-panel w-full max-w-[560px] rounded-xl overflow-hidden flex flex-col relative">
                    {/* Holographic Accent Line */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>

                    {/* Header */}
                    <div className="px-8 pt-10 pb-6">
                        <h1 className="text-white text-3xl font-bold tracking-tight">
                            Add New User
                        </h1>
                        <p className="text-white/50 text-sm mt-2">
                            Provision a new account with specific access roles.
                        </p>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="px-8 pb-10 flex flex-col gap-6">
                        {/* Full Name Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-white/80 text-sm font-medium ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <input
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-lg px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-0 neon-border-focus transition-all duration-300"
                                    placeholder="e.g. John Doe"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
                                    }
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none group-focus-within:text-primary">
                                    person
                                </span>
                            </div>
                        </div>

                        {/* Email Address Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-white/80 text-sm font-medium ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-lg px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-0 neon-border-focus transition-all duration-300"
                                    placeholder="name@company.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none group-focus-within:text-primary">
                                    mail
                                </span>
                            </div>
                        </div>

                        {/* Initial Password Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-white/80 text-sm font-medium ml-1">
                                Initial Password
                            </label>
                            <div className="relative group">
                                <input
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-lg px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-0 neon-border-focus transition-all duration-300"
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Role Selection Dropdown */}
                        <div className="flex flex-col gap-2">
                            <label className="text-white/80 text-sm font-medium ml-1">
                                Access Role
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-lg px-4 text-white appearance-none focus:outline-none focus:ring-0 neon-border-focus transition-all duration-300 cursor-pointer"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                >
                                    <option className="bg-[#0f0e17] text-white" value="annotator">
                                        Annotator
                                    </option>
                                    <option className="bg-[#0f0e17] text-white" value="reviewer">
                                        Reviewer
                                    </option>
                                    <option className="bg-[#0f0e17] text-white" value="manager">
                                        Manager
                                    </option>
                                    <option className="bg-[#0f0e17] text-white" value="admin">
                                        Administrator
                                    </option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-4">
                            <button
                                className="flex-1 h-12 border border-white/10 hover:bg-white/5 text-white/70 hover:text-white rounded-lg font-medium transition-all duration-200"
                                type="button"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-[2] h-12 bg-gradient-to-r from-[#911DF3] to-[#FF0080] text-white rounded-lg font-bold shadow-[0_0_20px_rgba(145,29,243,0.4)] hover:shadow-[0_0_30px_rgba(145,29,243,0.6)] transition-all duration-300 active:scale-[0.98]"
                                type="submit"
                            >
                                Create Account
                            </button>
                        </div>
                    </form>

                    {/* Bottom Detail Decorations */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 opacity-20">
                        <div className="size-1 rounded-full bg-primary"></div>
                        <div className="size-1 rounded-full bg-primary"></div>
                        <div className="size-1 rounded-full bg-primary"></div>
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF0080]/5 blur-[120px]"></div>
            </div>
        </>
    );
}
