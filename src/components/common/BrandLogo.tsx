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
        <div>
            {/* Icon: Violet with shadow */}
            <a
                href="/"
                className="h-auto w-auto flex flex-row gap-3 items-center"
            >
                <img
                    src="/black-hole.png"
                    alt="logo"
                    width={35}
                    height={35}
                    className="cursor-pointer hover:animate-slowspin"
                />
                {/* Text: Data Labeling System */}
            <span className={`text-white font-bold tracking-wider font-sans ${currentSize.text}`}>
                Data Labeling{' '}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                    System
                </span>
            </span>
            </a>
        </div>
    );
};
