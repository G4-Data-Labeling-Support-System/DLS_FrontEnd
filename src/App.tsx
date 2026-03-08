import { queryClient } from '@/lib/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { App as AntdApp } from 'antd'
import './App.css'
import { router } from './routes'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </QueryClientProvider>
  )
}

export default App
