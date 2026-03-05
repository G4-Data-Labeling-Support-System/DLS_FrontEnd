import { themeClasses } from '@/styles';
import type { ErrorInfo, ReactNode } from 'react';
// eslint-disable-next-line no-duplicate-imports
import React, { Component } from 'react'
import { useNavigate } from 'react-router-dom';

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
          className={`relative flex flex-col items-center justify-center min-h-screen ${themeClasses.backgrounds.deepDark} text-white overflow-hidden`}
          role="alert"
        >

          {/* Top Right Decoration */}
          <div className="absolute top-0 right-0">
            <div className="grid grid-cols-2">
              <div className="w-16 h-16 bg-cyan-100"></div>
              <div className="w-16 h-16 bg-black"></div>
              <div className="w-16 h-16 bg-violet-400"></div>
              <div className="w-16 h-16 bg-violet-200"></div>
            </div>
          </div>

          {/* Bottom Left Decoration */}
          <div className="absolute bottom-0 left-0">
            <div className="grid grid-cols-2">
              <div className="w-16 h-16 bg-cyan-100"></div>
              <div className="w-16 h-16 bg-violet-400"></div>
              <div className="w-16 h-16 bg-black"></div>
              <div className="w-16 h-16 bg-violet-200"></div>
            </div>
          </div>

          {/* Oops Text */}
          <h1 className="text-[180px] font-bold bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-200 bg-clip-text text-transparent leading-none">
            Oops !!!
          </h1>

          {/* Message */}
          <p className="text-3xl mt-4 text-gray-200">
            Something went wrong
          </p>

          <p className="text-sm text-gray-400 mt-6">
            Please try refreshing the page
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
