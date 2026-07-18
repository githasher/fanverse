/**
 * FANVERSE AI — TransitBoard Component
 * Renders real-time public transit connection diagnostic logs (metro status, rideshare pricing, parking space availability),
 * and provides transit guidance for FIFA match-day crowds.
 */

'use client';

import React from 'react';
import { Train } from 'lucide-react';
import type { StadiumState } from '@/types';

interface TransitBoardProps {
  /** The current live sensory state of the stadium simulation. */
  stadiumState: StadiumState;
}

/**
 * Transit connection status board for fans to plan transit exit/entry logic.
 *
 * @param props Contains the current StadiumState.
 * @returns React.JSX.Element showing transit status logs.
 */
export default function TransitBoard({ stadiumState }: TransitBoardProps): React.JSX.Element {
  const { transport } = stadiumState;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'delayed':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'suspended':
      default:
        return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 font-[family-name:var(--font-inter)]">
      <div>
        <h3 className="text-sm font-bold font-outfit text-white flex items-center gap-1.5">
          <Train className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Transit Connection Board</span>
        </h3>
        <p className="text-[10px] text-white/50">Real-time MetLife Stadium transit options & exit delays</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metro line */}
        <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-white/40 block font-semibold">NJ Transit Metro</span>
            <p className="text-xs font-bold text-white">
              {transport.metro.available ? `Next Train: ${transport.metro.estimatedWait}m` : 'Unavailable'}
            </p>
            <span className="text-[8px] text-white/60 block">{transport.metro.notes}</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getStatusBadge(transport.metro.status)}`}>
            {transport.metro.status}
          </span>
        </div>

        {/* Bus connection */}
        <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-white/40 block font-semibold">Express Bus</span>
            <p className="text-xs font-bold text-white">
              {transport.bus.available ? `Next Bus: ${transport.bus.estimatedWait}m` : 'Unavailable'}
            </p>
            <span className="text-[8px] text-white/60 block">{transport.bus.notes}</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getStatusBadge(transport.bus.status)}`}>
            {transport.bus.status}
          </span>
        </div>

        {/* Rideshare surge */}
        <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-white/40 block font-semibold">Rideshare Hub</span>
            <p className="text-xs font-bold text-white">
              Surge: {transport.rideshare.surgeMultiplier?.toFixed(1) || '1.0'}x
            </p>
            <span className="text-[8px] text-white/60 block">Wait: {transport.rideshare.estimatedWait} min</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getStatusBadge(transport.rideshare.status)}`}>
            {transport.rideshare.status}
          </span>
        </div>

        {/* Parking Lot capacity */}
        <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-white/40 block font-semibold">Parking Lots</span>
            <p className="text-xs font-bold text-white">
              Spots: {transport.parking.availableSpots} / {transport.parking.totalSpots}
            </p>
            <span className="text-[8px] text-white/60 block">Shuttle: {transport.parking.shuttleWait}m wait</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border text-cyan-400 border-cyan-500/20 bg-cyan-500/5">
            {transport.parking.nearestLot}
          </span>
        </div>
      </div>
    </div>
  );
}
