import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} className="text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              An unexpected error occurred. Try refreshing the page. If the problem persists, contact support.
            </p>
          </div>
          {this.state.message && (
            <p className="text-xs text-muted-foreground bg-secondary rounded-xl px-4 py-3 font-mono text-left break-all">
              {this.state.message}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={15} /> Refresh Page
            </button>
            <button
              type="button"
              onClick={() => { this.setState({ hasError: false, message: '' }); window.location.href = '/'; }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
            >
              <Home size={15} /> Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
