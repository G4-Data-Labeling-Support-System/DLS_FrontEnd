import { SettingOutlined } from '@ant-design/icons';


interface BrandLogoProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo = ({ className = '', size = 'md' }: BrandLogoProps) => {
    // Size mapping
    const sizes = {
        sm: { icon: 'text-xl', text: 'text-lg' },
        md: { icon: 'text-2xl', text: 'text-xl' },
        lg: { icon: 'text-3xl', text: 'text-2xl' },
        xl: { icon: 'text-4xl', text: 'text-3xl' },
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Icon: Violet with shadow */}
            <div className={`text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] ${currentSize.icon}`}>
                <SettingOutlined spin />
            </div>

            {/* Text: Data Labeling System */}
            <span className={`text-white font-bold tracking-wider font-sans ${currentSize.text}`}>
                Data Labeling{' '}
                <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    System
                </span>
            </span>
        </div>
    );
};
