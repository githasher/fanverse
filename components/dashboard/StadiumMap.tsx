'use client';

import React, { useState } from 'react';
import { useFanverseStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Compass } from 'lucide-react';
import type { Zone, Facility, FoodVendor } from '@/types';
import { getSensorySvgColor } from '@/lib/utils';

/**
 * StadiumMap Dashboard Component.
 * Renders an interactive SVG Digital Twin map of MetLife Stadium.
 * Highlights section-by-section crowd densities, gate coordinates, and facilities.
 *
 * @returns React.JSX.Element representing the interactive stadium layout.
 */
const StadiumMap = React.memo(function StadiumMap(): React.JSX.Element {
  const stadiumState = useFanverseStore((state) => state.stadiumState);
  const userProfile = useFanverseStore((state) => state.userProfile);

  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | FoodVendor | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'restroom' | 'food'>('all');

  const { zones, facilities, foodVendors } = stadiumState;

  /**
   * Helper to return standard user-facing text labels representing zone crowd density.
   *
   * @param density Active zone crowd density.
   * @returns string crowd density classification.
   */
  const getDensityText = (density: number): string => {
    if (density < 0.3) return '🟢 Low Crowd';
    if (density < 0.65) return '🟡 Moderate Crowd';
    return '🔴 High Crowd Density';
  };

  const isWheelchair = userProfile.accessibility.wheelchair;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold font-outfit text-white">Stadium Twin Overlay</h3>
          <p className="text-xs text-white/50">Live digital model showing crowd density & facility queues</p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
          {(['all', 'food', 'restroom'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setSelectedFacility(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                filterType === type
                  ? 'bg-cyan-500 text-[#0A0E27]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Items' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Box */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: SVG Map representation */}
        <div className="lg:col-span-3 bg-[#0A0E27] border border-white/5 rounded-2xl p-4 flex items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute top-4 left-4 p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[9px] text-white/40 uppercase block">Legend</span>
            <div className="space-y-1 text-[9px] text-white/70">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500/20 border border-emerald-500" /> Low Density</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500/20 border border-amber-500" /> Moderate Density</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-rose-500/20 border border-rose-500" /> High Density</div>
              {isWheelchair && (
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-cyan-400/40 border border-cyan-400" /> Step-free route enabled</div>
              )}
            </div>
          </div>

          {/* Interactive SVG Stadium Floor-plan */}
          <svg viewBox="0 0 100 100" className="w-full max-w-[420px] aspect-square">
            {/* outer stadium boundary ring */}
            <ellipse cx="50" cy="50" rx="45" ry="40" className="fill-none stroke-white/10 stroke-[2]" />
            
            {/* Inner seating ring */}
            <ellipse cx="50" cy="50" rx="35" ry="28" className="fill-none stroke-white/5 stroke-[1]" />

            {/* Playing Pitch Field */}
            <rect x="36" y="38" width="28" height="24" rx="1.5" className="fill-emerald-500/10 stroke-emerald-500/20 stroke-[0.8]" />
            <line x1="50" y1="38" x2="50" y2="62" className="stroke-emerald-500/20 stroke-[0.5]" />
            <circle cx="50" cy="50" r="5" className="fill-none stroke-emerald-500/20 stroke-[0.5]" />

            {/* Stadium zones (sections) */}
            {zones.map((zone) => {
              // Convert normalization map positions to coordinates
              const cx = zone.position.x;
              const cy = zone.position.y;
              return (
                <g
                  key={zone.id}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4"
                    className={`transition-colors ${getSensorySvgColor(zone.crowdDensity)}`}
                  />
                  {/* Small text section marker */}
                  <text
                    x={cx}
                    y={cy + 1}
                    textAnchor="middle"
                    className="fill-white/40 text-[2.5px] font-bold pointer-events-none select-none font-outfit"
                  >
                    {zone.section}
                  </text>
                </g>
              );
            })}

            {/* Restroom Coordinates Overlay */}
            {(filterType === 'all' || filterType === 'restroom') &&
              facilities
                .filter((f) => f.type === 'restroom' && f.open)
                .map((fac) => (
                  <circle
                    key={fac.id}
                    cx={fac.position.x}
                    cy={fac.position.y}
                    r="1.8"
                    tabIndex={0}
                    role="button"
                    aria-label={`Restroom: ${fac.name}, wait time ${fac.waitMinutes} minutes`}
                    onClick={() => setSelectedFacility(fac)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedFacility(fac);
                      }
                    }}
                    className={`cursor-pointer stroke-[#0A0E27] stroke-[0.3] hover:r-[2.2] transition-all focus:outline-none focus:stroke-white ${
                      selectedFacility?.id === fac.id
                        ? 'fill-cyan-400 animate-pulse'
                        : 'fill-indigo-500'
                    }`}
                  />
                ))}

            {/* Food Vendor Coordinates Overlay */}
            {(filterType === 'all' || filterType === 'food') &&
              foodVendors
                .filter((v) => v.open)
                .map((vendor) => (
                  <circle
                    key={vendor.id}
                    cx={vendor.position.x}
                    cy={vendor.position.y}
                    r="1.8"
                    tabIndex={0}
                    role="button"
                    aria-label={`Food Vendor: ${vendor.name}, wait time ${vendor.waitMinutes} minutes`}
                    onClick={() => setSelectedFacility(vendor)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedFacility(vendor);
                      }
                    }}
                    className={`cursor-pointer stroke-[#0A0E27] stroke-[0.3] hover:r-[2.2] transition-all focus:outline-none focus:stroke-white ${
                      selectedFacility?.id === vendor.id
                        ? 'fill-cyan-400 animate-pulse'
                        : 'fill-amber-500'
                    }`}
                  />
                ))}

            {/* Step-free path line if wheelchair user and facility is selected */}
            {isWheelchair && selectedFacility && (
              <line
                x1="20"
                y1="50"
                x2={selectedFacility.position.x}
                y2={selectedFacility.position.y}
                className="stroke-cyan-400 stroke-[0.6] stroke-dasharray-[2]"
                strokeDasharray="1.5 1"
              />
            )}
          </svg>

          {/* Hovered Zone Floating Card */}
          <AnimatePresence>
            {hoveredZone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-4 p-3 bg-[#0A0E27]/90 backdrop-blur border border-white/10 rounded-xl space-y-1 text-xs select-none pointer-events-none"
              >
                <div className="font-bold text-white font-outfit">{hoveredZone.name}</div>
                <div className="text-[10px] text-white/50">{getDensityText(hoveredZone.crowdDensity)}</div>
                <div className="text-[10px] text-white/50">Temp: {hoveredZone.temperature}°F</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Selected Facility Inspection Details */}
        <div className="flex flex-col justify-between p-4 bg-white/5 border border-white/5 rounded-2xl min-h-[300px]">
          {selectedFacility ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm md:text-base text-white font-outfit leading-tight">
                      {selectedFacility.name}
                    </h4>
                    <span className="text-[10px] text-white/40 block mt-0.5">
                      Section {selectedFacility.zone}
                    </span>
                  </div>
                  <span className="text-xl">
                    {'cuisine' in selectedFacility ? '🍔' : '🚻'}
                  </span>
                </div>

                <div className="p-3 bg-[#0A0E27] rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Queue Wait Time:</span>
                    <span className="font-bold text-cyan-400">{selectedFacility.waitMinutes} min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Queue Length:</span>
                    <span className="text-white/80">{selectedFacility.queueLength} people</span>
                  </div>
                  {'cuisine' in selectedFacility && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Cuisine:</span>
                      <span className="text-white/80 capitalize">{(selectedFacility as FoodVendor).cuisine}</span>
                    </div>
                  )}
                </div>

                {isWheelchair && (
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-white/80 leading-relaxed">
                      ♿ Step-free pathway mapped from Gate A. Elevator lobby located 50ft East.
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    useFanverseStore.getState().addMessage({
                      id: `nav-query-${Date.now()}`,
                      role: 'user',
                      content: `How do I get to ${selectedFacility.name} in Section ${selectedFacility.zone}? Please provide walking directions.`,
                      timestamp: Date.now(),
                      type: 'text',
                    });
                    
                    useFanverseStore.getState().setActiveView('chat');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-[#0A0E27] font-bold text-xs rounded-xl active:scale-95 transition-all text-center"
                >
                  Navigate to Location
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center gap-2">
              <Compass className="w-10 h-10 text-white/20 animate-pulse" />
              <span className="text-xs font-bold text-white/60">Select map marker</span>
              <p className="text-[10px] text-white/40 max-w-[200px]">
                Click on any Restroom (blue/indigo) or Dining vendor (amber) marker on the map to inspect live queues.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default StadiumMap;
