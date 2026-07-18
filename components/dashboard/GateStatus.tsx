'use client';

import React, { useMemo } from 'react';
import { useFanverseStore } from '@/lib/store';
import { DoorClosed, Clock } from 'lucide-react';
import { getSensoryBgColor } from '@/lib/utils';

/**
 * GateStatus Dashboard Component.
 * Renders MetLife Stadium security gate statuses, crowd capacities, wait times,
 * and highlights recommended gates to enter.
 *
 * @returns React.JSX.Element representing security gate lists.
 */
function GateStatus(): React.JSX.Element {
  const stadiumState = useFanverseStore((state) => state.stadiumState);

  // Find recommended gate (open, lowest crowd level) using useMemo for render efficiency
  const recommendedGate = useMemo(() => {
    const openGates = stadiumState.gates.filter((g) => g.status === 'open');
    return [...openGates].sort((a, b) => a.crowdLevel - b.crowdLevel)[0];
  }, [stadiumState.gates]);

  /**
   * Helper to return CSS styles for security gate state indicators.
   *
   * @param status Active gate status (open, restricted, closed).
   * @returns string CSS styles.
   */
  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'open':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'restricted':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'closed':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Recommended Banner */}
      {recommendedGate && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-xs md:text-sm text-emerald-400 font-outfit">
                AI Recommendation: Enter via {recommendedGate.name.split(' — ')[0]}
              </h4>
              <p className="text-[10px] md:text-xs text-white/60">
                Wait time is only {recommendedGate.waitMinutes} minutes. Serves sections{' '}
                {recommendedGate.servingSections.join(', ')}.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase text-emerald-400 font-bold block">Wait Time</span>
            <span className="text-lg font-black font-outfit text-white">{recommendedGate.waitMinutes}m</span>
          </div>
        </div>
      )}

      {/* Grid of Gates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stadiumState.gates.map((gate) => {
          const isRecommended = gate.id === recommendedGate?.id;
          return (
            <div
              key={gate.id}
              className={`p-3 rounded-xl border flex flex-col justify-between h-[120px] transition-all relative ${
                isRecommended
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5'
                  : 'border-white/10 bg-white/0 hover:bg-white/5'
              }`}
            >
              {isRecommended && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-400 text-[#0A0E27] font-black text-[8px] uppercase tracking-wide">
                  ⭐ BEST
                </div>
              )}
              
              <div className="space-y-1">
                <span className="font-bold text-xs md:text-sm text-white font-outfit truncate block max-w-[90%]">
                  {gate.name.split(' — ')[0]}
                </span>
                <span className="text-[10px] text-white/50 truncate block">
                  {gate.name.split(' — ')[1] || 'Security Entry'}
                </span>
              </div>

              <div className="space-y-2">
                {/* Progress bar of crowd capacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-white/50">
                    <span>Crowd</span>
                    <span>{Math.round(gate.crowdLevel * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getSensoryBgColor(gate.crowdLevel)}`}
                      style={{ width: `${gate.crowdLevel * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status & Wait */}
                <div className="flex items-center justify-between">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getStatusBadge(gate.status)}`}>
                    {gate.status}
                  </span>
                  
                  {gate.status === 'closed' ? (
                    <span className="text-[9px] text-rose-400 font-bold flex items-center gap-0.5">
                      <DoorClosed className="w-3 h-3" /> Closed
                    </span>
                  ) : (
                    <span className="text-[9px] text-white/70 font-semibold flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-cyan-400" /> {gate.waitMinutes}m wait
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(GateStatus);
