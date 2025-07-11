import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Store error details for debugging
    (window as any).__lastError = { error, errorInfo };
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or default error message
      return this.props.fallback || (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">
              An error occurred while loading this component.
            </p>
            <details className="text-left">
              <summary className="cursor-pointer text-red-700 font-medium">Error Details</summary>
              <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                {this.state.error?.message}
                {'\n'}
                {this.state.error?.stack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;