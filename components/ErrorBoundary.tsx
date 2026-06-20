'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Props pour ErrorBoundary
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

/**
 * State du ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary pour capturer les erreurs dans l'arborescence
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur pour monitoring
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Fallback UI par défaut pour les erreurs
 */
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-center text-lg font-semibold text-gray-900 mb-2">
          Oups! Une erreur s'est produite
        </h2>

        <p className="text-center text-sm text-gray-600 mb-6">
          {error.message || 'Une erreur inattendue s\'est produite'}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
            <p className="text-xs text-red-700 font-mono break-words">
              {error.stack}
            </p>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

/**
 * Wrapper pour ErrorBoundary avec reset automatique au changement de route
 */
export function ErrorBoundaryWithRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Reset l'erreur au changement de route
    const handleRouteChange = () => {
      setError(null);
    };

    // Écouter les changements de route
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [router]);

  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <DefaultErrorFallback
          error={error}
          reset={() => {
            setError(null);
            reset();
          }}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
