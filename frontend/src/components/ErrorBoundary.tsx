import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary ${new Date().toISOString()}]`, error, errorInfo);
    this.setState({ errorInfo });

    // Release pointer lock if active
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black p-4">
          <div className="bond-error-card max-w-lg w-full">
            <div className="bond-card-accent-line" />
            <div className="p-8 flex flex-col gap-6">
              <div className="text-center">
                <div className="bond-error-icon-lg mb-4">⊘</div>
                <h1 className="bond-error-title">CRITICAL SYSTEM FAILURE</h1>
                <p className="bond-error-subtitle">An unexpected error has occurred</p>
              </div>

              {this.state.error && (
                <div className="bond-error-details">
                  <p className="bond-error-msg">{this.state.error.message}</p>
                </div>
              )}

              <button
                className="bond-hud-label text-left underline cursor-pointer"
                onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
              >
                {this.state.showDetails ? 'HIDE DETAILS' : 'SHOW DETAILS'}
              </button>

              {this.state.showDetails && this.state.errorInfo && (
                <pre className="bond-error-stack">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}

              <button className="bond-btn-gold w-full" onClick={this.handleReset}>
                REINITIALIZE SYSTEM
              </button>
            </div>
            <div className="bond-card-accent-line" />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
