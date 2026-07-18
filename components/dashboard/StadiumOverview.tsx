'use client';

import React, { useMemo } from 'react';
import { useFanverseStore } from '@/lib/store';
import { motion, type Variants } from 'framer-motion';
import { Users, Clock, DoorOpen, CloudSun, TrendingDown, ArrowUpRight } from 'lucide-react';
import QueueCards from './QueueCards';
import GateStatus from './GateStatus';
import WeatherWidget from './WeatherWidget';
import SustainabilityWidget from './SustainabilityWidget';
import TransitBoard from './TransitBoard';
import PredictiveAnalytics from './PredictiveAnalytics';

/**
 * StadiumOverview Dashboard Component.
 * Serves as the primary public fan view, mapping real-time derived stadium metrics
 * (total active visitors, average queue wait times, open security gates, live weather conditions),
 * and integrating sustainability widgets.
 *
 * @returns React.JSX.Element representing the core dashboard overview.
 */
export default function StadiumOverview(): React.JSX.Element {
  const stadiumState = useFanverseStore((state) => state.stadiumState);
  const userProfile = useFanverseStore((state) => state.userProfile);
  const setActiveView = useFanverseStore((state) => state.setActiveView);

  // Derive summary metrics from the live stadiumState using useMemo for render efficiency
  const derivedStats = useMemo(() => {
    const totalGates = stadiumState.gates.length;
    const openGates = stadiumState.gates.filter((g) => g.status === 'open').length;

    const waitFacilities = stadiumState.facilities.filter((f) => f.type === 'restroom' || f.type === 'food');
    const averageWaitTime = waitFacilities.length > 0
      ? Math.round(waitFacilities.reduce((acc, curr) => acc + curr.waitMinutes, 0) / waitFacilities.length)
      : 0;

    const averageCrowdDensity = stadiumState.zones.reduce((acc, curr) => acc + curr.crowdDensity, 0) / stadiumState.zones.length;
    const simulatedVisitors = Math.round(82500 * averageCrowdDensity);

    return { totalGates, openGates, averageWaitTime, simulatedVisitors };
  }, [stadiumState.gates, stadiumState.facilities, stadiumState.zones]);

  const { totalGates, openGates, averageWaitTime, simulatedVisitors } = derivedStats;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-blue-900/60 to-[#0A0E27] p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-outfit text-white">
            Welcome back, {userProfile.name || 'Champion'}!
          </h2>
          <p className="text-sm text-white/60 max-w-xl">
            {stadiumState.phase === 'BEFORE_MATCH' &&
              "Stadium gates are opening. Scanned your ticket? Let's check recommended gates and parking lots."}
            {stadiumState.phase === 'ENTERING' &&
              "High entry traffic detected. Gate C and Gate G are currently offering the fastest security queues."}
            {stadiumState.phase === 'INSIDE' &&
              'Enjoy the match! Live tracking restrooms and food lines near you. Halftime alerts will trigger.'}
            {stadiumState.phase === 'HALFTIME' &&
              'Halftime active. Queue times have peaked! Green Goal and Green Cafe have low queue lengths.'}
            {stadiumState.phase === 'AFTER_MATCH' &&
              'Match completed. exit corridors are dense. We recommend relaxing in Section L for 15m to beat Metro crowds.'}
          </p>
        </div>

        <button
          onClick={() => setActiveView('chat')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-[#0A0E27] font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all text-sm self-start md:self-auto"
        >
          <span>Ask FANVERSE AI</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Stats Summary Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Stat Card 1: Visitors */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="space-y-2">
            <span className="text-xs md:text-sm text-white/60 flex items-center gap-1">
              Live Visitors
            </span>
            <div className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight">
              {simulatedVisitors.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3 inline rotate-180" /> Peak rate
            </span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </motion.div>

        {/* Stat Card 2: Avg Wait Time */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="space-y-2">
            <span className="text-xs md:text-sm text-white/60 flex items-center gap-1">
              Avg Wait Time
            </span>
            <div className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight">
              {averageWaitTime} min
            </div>
            <span className="text-[10px] text-cyan-400">Restrooms & Food</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </motion.div>

        {/* Stat Card 3: Open Gates */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="space-y-2">
            <span className="text-xs md:text-sm text-white/60 flex items-center gap-1">
              Open Entries
            </span>
            <div className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight">
              {openGates} / {totalGates}
            </div>
            <span className="text-[10px] text-cyan-400">Security gates</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DoorOpen className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </motion.div>

        {/* Stat Card 4: Weather */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="space-y-2">
            <span className="text-xs md:text-sm text-white/60 flex items-center gap-1">
              Stadium Weather
            </span>
            <div className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight">
              {Math.round(stadiumState.weather.temperature)}°F
            </div>
            <span className="text-[10px] capitalize text-white/60">
              {stadiumState.weather.condition.replaceAll('_', ' ')}
            </span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CloudSun className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </motion.div>
      </motion.div>

      {/* Transit Connection Board */}
      <motion.div variants={itemVariants}>
        <TransitBoard stadiumState={stadiumState} />
      </motion.div>

      {/* Main Grid: Map / Gate status & queues */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: Gate Status & Weather */}
        <div className="xl:col-span-2 space-y-6">
          {/* Gate status component */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-outfit">Security & Gate Entrances</h3>
                <p className="text-xs text-white/50">Select recommended gate below to see details</p>
              </div>
            </div>
            <GateStatus />
          </div>

          {/* Detailed queues */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-outfit">Queue Intel & Dining</h3>
                <p className="text-xs text-white/50">Halftime-ready dining & restrooms tracker</p>
              </div>
            </div>
            <QueueCards />
          </div>
        </div>

        {/* Right column: Weather detailed & Assistant twin preview */}
        <div className="space-y-6">
          <SustainabilityWidget stadiumState={stadiumState} />
          <WeatherWidget />
          <PredictiveAnalytics />

          {/* Interactive map prompt */}
          <div className="bg-gradient-to-b from-blue-950/40 to-[#0A0E27] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-4 flex flex-col justify-center items-center h-[300px]">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
              📍
            </div>
            <h4 className="font-bold text-lg font-outfit text-white">
              Launch Stadium Digital Twin
            </h4>
            <p className="text-xs text-white/60 max-w-[200px]">
              Visualize real-time crowd heatmaps, restroom status, and get seat directions.
            </p>
            <button
              onClick={() => setActiveView('map')}
              className="px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl text-xs font-semibold tracking-wide transition-all"
            >
              Open Interactive Map
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
