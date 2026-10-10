import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Layers } from 'lucide-react';

interface Props {
  children: ReactNode;
  tabName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-3xl mx-auto my-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  Rendering Notice
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {this.props.tabName || 'Admin Panel Component'}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                {this.props.tabName || 'Component'} encountered an issue
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                The system prevented a blank screen. Your database and existing products remain completely safe and intact.
              </p>

              {this.state.error && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-[10px] font-mono text-slate-400 mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload {this.props.tabName || 'Component'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Refresh Entire Page
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
