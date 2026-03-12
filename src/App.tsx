import { queryClient } from '@/lib/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import { antdThemeConfig } from '@/styles/antdConfig'
import './App.css'
import { router } from './routes'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdThemeConfig}>
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
