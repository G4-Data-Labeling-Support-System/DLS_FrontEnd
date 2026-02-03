import { theme } from 'antd';

export const managerTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: '#8b5cf6', // Violet
        fontFamily: "'Public Sans', sans-serif",
        colorBgContainer: 'transparent',
        colorTextPlaceholder: 'rgba(255, 255, 255, 0.3)',
    },
    components: {
        Input: {
            colorBgContainer: 'rgba(15, 14, 23, 0.6)',
            colorBorder: 'rgba(255, 255, 255, 0.1)',
            activeBorderColor: '#8b5cf6',
            colorText: 'white',
            borderRadius: 12,
            controlPaddingHorizontal: 16,
        },
        Select: {
            colorBgContainer: 'rgba(15, 14, 23, 0.6)',
            colorBorder: 'rgba(255, 255, 255, 0.1)',
            colorPrimary: '#8b5cf6',
            colorText: 'white',
            borderRadius: 12,
            optionSelectedBg: 'rgba(139, 92, 246, 0.3)',
            optionSelectedColor: 'white',
        },
        Form: {
            labelColor: 'rgba(255, 255, 255, 0.9)',
            labelFontSize: 14,
        },
        Button: {
            borderRadius: 8,
        }
    },
};