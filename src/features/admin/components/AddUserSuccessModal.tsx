import { Button } from '@/shared/components/ui/Button';
import { GlassModal } from '@/shared/components/ui/GlassModal';
import { themeClasses } from '@/styles';

interface AddUserSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAnother: () => void;
    userData?: {
        name: string;
        email: string;
        role: string;
    };
}

export default function AddUserSuccessModal({ isOpen, onClose, onAddAnother, userData }: AddUserSuccessModalProps) {
    // Default data if none provided (for preview)
    const data = userData || {
        name: 'Alex Morgan',
        email: 'alex@company.com',
        role: 'Annotator'
    };

    return (
        <GlassModal
            open={isOpen}
            onCancel={onClose}
            width={480}
            contentClassName="!bg-[rgba(15,14,23,0.85)] !border-[rgba(137,90,246,0.3)] !shadow-[0_0_60px_rgba(137,90,246,0.15),inset_0_0_20px_rgba(137,90,246,0.05)]"
        >
            <div className="flex flex-col items-center text-center relative overflow-hidden p-8">
                {/* Top Holographic Line Override */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-80"></div>

                {/* Icon Container using HTML structure */}
                <div className="relative mb-6 mt-4">
                    {/* Glow Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-violet-500/20 bg-violet-500/5 blur-sm"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-emerald-400/10 blur-xl"></div>

                    {/* Icon */}
                    <span
                        className="material-symbols-outlined text-[80px] relative z-10"
                        style={{
                            background: 'linear-gradient(135deg, #00ffa3 20%, #895af6 80%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            filter: 'drop-shadow(0 0 15px rgba(0, 255, 163, 0.4))'
                        }}
                    >
                        check_circle
                    </span>
                </div>

                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    Account Created<br />Successfully!
                </h2>

                <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-[90%]">
                    User <strong className="text-white font-medium">{data.name}</strong> ({data.email}) has been added to the system as an <span className="text-violet-500 font-medium capitalize">{data.role}</span>.
                </p>

                <div className="flex flex-col w-full gap-3 z-20">
                    <Button
                        onClick={onClose} // "Go to User List" implies closing purely if we are already on User List, or navigation. Assuming close for now.
                        className="w-full h-12 rounded-lg bg-gradient-to-r from-[#895af6] to-[#FF0080] text-white font-bold shadow-[0_0_25px_rgba(137,90,246,0.35)] hover:shadow-[0_0_35px_rgba(137,90,246,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] border-none"
                    >
                        Go to User List
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onAddAnother}
                        className="w-full h-12 rounded-lg border border-violet-500/50 text-violet-400 hover:bg-violet-500/5 hover:border-violet-500 font-medium transition-all duration-300 text-base"
                    >
                        Add Another User
                    </Button>
                </div>

                {/* Decorative Background Particles */}
                <div className="absolute top-10 left-8 w-1 h-1 bg-white/40 rounded-full blur-[0.5px]"></div>
                <div className="absolute top-24 right-10 w-1.5 h-1.5 bg-violet-500/40 rounded-full blur-[0.5px]"></div>
                <div className="absolute bottom-32 left-12 w-1 h-1 bg-emerald-400/30 rounded-full"></div>
                <div className="absolute bottom-8 right-8 w-1 h-1 bg-fuchsia-500/30 rounded-full blur-[1px]"></div>
                <div className="absolute top-1/2 right-4 w-0.5 h-0.5 bg-white/20 rounded-full"></div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none"></div>
            </div>
        </GlassModal>
    );
}
