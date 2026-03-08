import { theme, type ThemeConfig } from 'antd'

export const antdThemeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  components: {
    Modal: {
      contentBg: 'transparent',
      headerBg: 'transparent',
      footerBg: 'transparent',
      boxShadow: 'none'
    },
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.3)',
      colorText: '#ffffff',
      activeBorderColor: '#8b5cf6', // Violet-500
      hoverBorderColor: '#8b5cf6'
    },
    Select: {
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.3)',
      colorText: '#ffffff',
      multipleItemBg: 'rgba(255, 255, 255, 0.1)',
      selectorBg: 'rgba(255, 255, 255, 0.05)',
      optionSelectedBg: 'rgba(139, 92, 246, 0.2)' // Violet selection
    }
  }
}
