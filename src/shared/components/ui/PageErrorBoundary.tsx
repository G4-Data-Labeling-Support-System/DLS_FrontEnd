import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class PageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-500"
          role="alert"
        >
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p>Please try refreshing the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}
