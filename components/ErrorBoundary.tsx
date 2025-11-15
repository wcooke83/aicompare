'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-slate-300">
                    An error occurred while rendering this component
                  </p>
                </div>
              </div>

              {this.state.error && (
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-mono text-red-300 mb-2">
                    {this.state.error.message}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                    <pre className="text-xs text-slate-400 overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
