import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  eventId: string | null
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree.
 * Reports errors to Sentry and displays a German error message with Bloghead styling.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, eventId: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Report to Sentry in production
    const eventId = Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    })

    this.setState({ eventId })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, eventId: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI with Bloghead styling
      return (
        <div className="min-h-screen bg-[#171717] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#232323] rounded-2xl p-8 text-center shadow-xl border border-white/10">
            {/* Error icon */}
            <div className="text-6xl mb-6">
              <span role="img" aria-label="Fehler">😕</span>
            </div>

            {/* Title with gradient */}
            <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[#610AD1] to-[#F92B02] bg-clip-text text-transparent">
              Ups! Etwas ist schiefgelaufen
            </h1>

            {/* Description */}
            <p className="text-white/70 mb-4">
              Ein unerwarteter Fehler ist aufgetreten. Unser Team wurde automatisch benachrichtigt.
            </p>

            {/* Error ID for support */}
            {this.state.eventId && (
              <p className="text-white/40 text-xs mb-6">
                Fehler-ID: {this.state.eventId}
              </p>
            )}

            {/* Error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors">
                  Technische Details
                </summary>
                <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-red-400 overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#F92B02] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Erneut versuchen
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Zur Startseite
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap functional components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary
