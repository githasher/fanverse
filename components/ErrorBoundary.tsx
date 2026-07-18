/**
 * FANVERSE AI — ErrorBoundary Component
 * React Error Boundary to catch UI rendering crashes and offer a fallback restoration option.
 */

'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundaryBoundary', { error, errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleRecover = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0E27] flex flex-col justify-center items-center p-6 text-center select-none font-[family-name:var(--font-inter)]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl max-w-md w-full space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-outfit text-white">Something went wrong</h2>
              <p className="text-xs text-white/50 leading-relaxed">
                An unexpected interface rendering failure occurred. You can attempt to restore the dashboard using the button below.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/45 rounded-xl border border-white/5 text-[10px] text-rose-400 font-mono text-left max-h-[100px] overflow-y-auto break-all">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRecover}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98"
                aria-label="Attempt to recover dashboard locally without full page reload"
              >
                <span>Try Recovering</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-[#0A0E27] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98"
                aria-label="Reload application page"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
