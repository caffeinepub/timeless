import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  timestamp: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('🔴 ErrorBoundary.getDerivedStateFromError:', error);
    return {
      hasError: true,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const timestamp = new Date().toISOString();
    console.error('🔴 ErrorBoundary caught an error at', timestamp);
    console.error('🔴 Error:', error);
    console.error('🔴 Error name:', error.name);
    console.error('🔴 Error message:', error.message);
    console.error('🔴 Error stack:', error.stack);
    console.error('🔴 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
      timestamp,
    });
  }

  handleReset = () => {
    console.log('🔄 Resetting error boundary and reloading page at', new Date().toISOString());
    
    // Release pointer lock before reload
    if (document.pointerLockElement) {
      document.exitPointerLock();
      console.log('🔓 Pointer lock released before reload');
    }
    
    // Reset state first
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null,
    });
    
    // Small delay to ensure state is cleared
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-background p-4">
          <div className="game-card max-w-2xl w-full p-8 space-y-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-12 h-12 text-destructive flex-shrink-0" />
              <div>
                <h1 className="game-title text-2xl font-bold">Application Error</h1>
                <p className="text-sm text-muted-foreground">
                  {this.state.timestamp && `Occurred at ${new Date(this.state.timestamp).toLocaleString()}`}
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="space-y-2">
                <h2 className="font-semibold text-lg">Error Details:</h2>
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
                  <p className="font-mono text-sm text-destructive">
                    <strong>{this.state.error.name}:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-background/50 rounded overflow-x-auto text-muted-foreground">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {this.state.errorInfo?.componentStack && (
              <div className="space-y-2">
                <h2 className="font-semibold text-lg">Component Stack:</h2>
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Show Component Stack
                  </summary>
                  <pre className="mt-2 p-4 bg-muted/50 rounded overflow-x-auto text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={this.handleReset} className="game-button flex-1" size="lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Application
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
              If this error persists, please try clearing your browser cache or using a different browser.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
