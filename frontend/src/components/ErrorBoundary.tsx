import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree.
 * Displays a German error message with Bloghead styling.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // TODO: Send to error tracking service in production
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleGoHome = (): void => {
    window.location.href = '/'
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
            <p className="text-white/70 mb-6">
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder kehre zur Startseite zurueck.
            </p>

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
                onClick={this.handleReload}
                className="px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#F92B02] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Seite neu laden
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

export default ErrorBoundary
