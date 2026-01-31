import { Modal, ConfigProvider, type ModalProps } from 'antd';
import { antdThemeConfig } from '@/styles/antdConfig';
import React, { type CSSProperties } from 'react';

interface GlassModalProps extends ModalProps {
    children: React.ReactNode;
    contentClassName?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({ children, styles, contentClassName, ...props }) => {
    // Glass effect styles for the inner container
    const glassContainerStyle: CSSProperties = {
        background: 'rgba(20, 20, 30, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <ConfigProvider theme={antdThemeConfig}>
            <Modal
                footer={null}
                centered
                closeIcon={null}
                styles={{
                    mask: { backdropFilter: 'blur(4px)' },
                    body: { padding: 0 },
                    ...styles // Allow overriding styles
                }}
                {...props}
            >
                <div style={glassContainerStyle} className={contentClassName}>
                    {/* Holographic Accent Line */}
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60"></div>

                    {children}
                </div>
            </Modal>
        </ConfigProvider>
    );
};
