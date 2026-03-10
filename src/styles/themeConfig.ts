import { theme } from 'antd'

export const managerTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#8b5cf6', // Violet
    fontFamily: "'Public Sans', sans-serif",
    colorBgContainer: 'transparent' // Giúp các component lồng nhau không bị đè nền
  },
  components: {
    Input: {
      colorBgContainer: 'rgba(26, 22, 37, 0.6)',
      activeBorderColor: '#8b5cf6'
    },
    Select: {
      colorBgContainer: 'rgba(26, 22, 37, 0.6)',
      colorPrimary: '#8b5cf6'
    }
    // Thêm các override khác nếu cần
  }
}

export const reviewerTheme = managerTheme
