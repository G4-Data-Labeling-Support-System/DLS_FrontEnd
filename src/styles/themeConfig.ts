import { theme } from 'antd'

export const managerTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#111111',
    fontFamily: "'Public Sans', sans-serif",
    colorBgContainer: 'transparent'
  },
  components: {
    Input: {
      colorBgContainer: '#ffffff',
      activeBorderColor: '#111111'
    },
    Select: {
      colorBgContainer: '#ffffff',
      colorPrimary: '#111111'
    }
  }
}

export const reviewerTheme = managerTheme
export const annotatorTheme = managerTheme
export const adminTheme = managerTheme
