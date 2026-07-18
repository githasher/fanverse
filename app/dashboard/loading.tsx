import React from 'react';

/**
 * Loading Skeleton dashboard fallback for FANVERSE AI.
 * Ensures page transition hydration is smooth and matches deep navy aesthetics.
 */
export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero card loading state */}
      <div className="h-32 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-end space-y-2">
        <div className="h-6 w-1/3 bg-white/10 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="h-4 w-2/3 bg-white/10 rounded" />
            <div className="h-6 w-1/2 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Main panel skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="h-5 w-1/4 bg-white/10 rounded" />
          <div className="h-[300px] bg-white/5 rounded-xl" />
        </div>

        <div className="h-[400px] bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="h-5 w-1/3 bg-white/10 rounded" />
          <div className="h-[300px] bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
