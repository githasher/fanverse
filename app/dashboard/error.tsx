'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level Error Boundary for FANVERSE AI.
 * Catches runtime crashes gracefully and provides a clean UI fallback.
 */
export default function ErrorBoundary({ error, reset }: ErrorProps): React.JSX.Element {
  useEffect(() => {
    // Log the error using our environment-aware structured logger
    logger.error('DashboardErrorBoundary', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold font-outfit text-white">Something went wrong</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          The FANVERSE AI dashboard encountered an unexpected error. Don&apos;t worry — live stadium sensors and security systems remain fully operational.
        </p>
        {error.digest && (
          <p className="text-[10px] text-white/40 font-mono">Digest ID: {error.digest}</p>
        )}
      </div>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-[#0A0E27] font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/20 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reset Dashboard</span>
      </button>
    </div>
  );
}
