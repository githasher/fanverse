/**
 * FANVERSE AI — SustainabilityWidget Component
 * Renders live, simulated sustainability telemetry metrics (carbon offset, recycling volume, water saved),
 * and provides context-aware eco-friendly directives.
 */

'use client';

import React from 'react';
import { Leaf, Recycle, Droplet, Navigation } from 'lucide-react';
import type { StadiumState } from '@/types';

interface SustainabilityWidgetProps {
  /** The current live sensory state of the stadium simulation. */
  stadiumState: StadiumState;
}

/**
 * Sustainability Widget showing MetLife stadium green-goals stats and public eco recommendations.
 *
 * @param props Contains the current StadiumState.
 * @returns React.JSX.Element showing green metrics.
 */
export default function SustainabilityWidget({ stadiumState }: SustainabilityWidgetProps): React.JSX.Element {
  // Compute simulated dynamic metrics derived from visitors
  const averageDensity =
    stadiumState.zones.reduce((acc, curr) => acc + curr.crowdDensity, 0) /
    stadiumState.zones.length;
  
  const estimatedVisitors = Math.round(82500 * averageDensity);
  
  // Calculate dynamic offsets based on visitor count
  const carbonSavedKg = Math.round(estimatedVisitors * 0.12); // approx 120g offset per public transit rider
  const wasteRecycledKg = Math.round(estimatedVisitors * 0.08); // 80g recycled per fan
  const waterSavedL = Math.round(estimatedVisitors * 0.25); // 250ml water saved per fan using smart taps

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 font-[family-name:var(--font-inter)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-outfit text-white flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>GreenGoal™ Sustainability Hub</span>
          </h3>
          <p className="text-[10px] text-white/50">FIFA World Cup 2026 eco-initiatives at MetLife Stadium</p>
        </div>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Active
        </span>
      </div>

      {/* Grid of sustainability metrics */}
      <div className="grid grid-cols-3 gap-3">
        {/* Carbon Offset */}
        <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <Leaf className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase tracking-wider font-semibold">Carbon Saved</span>
          </div>
          <p className="text-sm md:text-base font-black font-outfit text-white mt-1">
            {carbonSavedKg.toLocaleString()} <span className="text-[10px] font-normal text-white/40">kg</span>
          </p>
        </div>

        {/* Recycling */}
        <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-cyan-400">
            <Recycle className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase tracking-wider font-semibold">Recycled</span>
          </div>
          <p className="text-sm md:text-base font-black font-outfit text-white mt-1">
            {wasteRecycledKg.toLocaleString()} <span className="text-[10px] font-normal text-white/40">kg</span>
          </p>
        </div>

        {/* Water saved */}
        <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <Droplet className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase tracking-wider font-semibold">Water Saved</span>
          </div>
          <p className="text-sm md:text-base font-black font-outfit text-white mt-1">
            {waterSavedL.toLocaleString()} <span className="text-[10px] font-normal text-white/40">L</span>
          </p>
        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
        <span className="text-lg mt-0.5">🌱</span>
        <div className="space-y-1">
          <h4 className="font-bold text-[11px] text-emerald-400 font-outfit uppercase tracking-wider flex items-center gap-1">
            <Navigation className="w-3 h-3" /> AI Sustainability Suggestion
          </h4>
          <p className="text-[10px] text-white/70 leading-relaxed">
            MetLife train connectivity is currently running at <strong>92% availability</strong> with green offsets. 
            Choose the NJ Transit rail option over ridesharing to save up to <strong>1.4kg CO₂ emissions</strong> per party!
            Dispose of single-use bottles at our designated **GreenGoal Recycling Hubs** (Section K & Section F).
          </p>
        </div>
      </div>
    </div>
  );
}
