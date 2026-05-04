import { theme, type ThemeConfig } from 'antd'

export const antdThemeConfig: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorSuccess: '#10b981',
    colorPrimary: '#111111',
    colorBgElevated: '#ffffff',
    colorText: '#111111',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8
  },
  components: {
    Modal: {
      contentBg: '#ffffff',
      headerBg: '#ffffff',
      footerBg: '#ffffff',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    },
    Message: {
      contentBg: '#ffffff',
      colorText: '#111111'
    },
    Notification: {
      colorBgElevated: '#ffffff',
      colorText: '#111111',
      colorTextHeading: '#111111',
      colorIcon: '#111111',
      colorIconHover: '#555555'
    },
    Input: {
      colorBgContainer: '#ffffff',
      colorBorder: 'rgba(0, 0, 0, 0.1)',
      colorTextPlaceholder: 'rgba(0, 0, 0, 0.4)',
      colorText: '#111111',
      activeBorderColor: '#111111',
      hoverBorderColor: '#555555'
    },
    Select: {
      colorBgContainer: '#ffffff',
      colorBorder: 'rgba(0, 0, 0, 0.1)',
      colorTextPlaceholder: 'rgba(0, 0, 0, 0.4)',
      colorText: '#111111',
      multipleItemBg: 'rgba(0, 0, 0, 0.05)',
      selectorBg: '#ffffff',
      optionSelectedBg: 'rgba(0, 0, 0, 0.05)'
    }
  }
}
