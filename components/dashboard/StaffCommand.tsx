// =============================================================================
// FANVERSE AI — Staff Command Center Component
// Real-time operations dashboard for stadium organizers and volunteers
// =============================================================================

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useFanverseStore } from '@/lib/store';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Activity,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import VolunteerHub from './VolunteerHub';
import PredictiveAnalytics from './PredictiveAnalytics';
import type { VolunteerTask } from '@/types';
import {
  STAFF_GATE_CROWD_THRESHOLD,
  STAFF_GATE_QUIET_THRESHOLD,
  STAFF_FACILITY_WAIT_CRITICAL_MIN,
  STAFF_FOOD_WAIT_CRITICAL_MIN,
  STAFF_FOOD_WAIT_QUIET_MIN,
  STAFF_RAIN_WARNING_THRESHOLD
} from '@/lib/constants';

/**
 * StaffCommand Dashboard Component.
 * Operations panel for organizers and volunteers. Shows real-time warnings,
 * dispatch logs, and manual volunteer task assignments.
 *
 * @returns React.JSX.Element representing the staff operations view.
 */
export default function StaffCommand(): React.JSX.Element {
  const stadiumState = useFanverseStore((state) => state.stadiumState);
  const addNotification = useFanverseStore((state) => state.addNotification);
  const [tasks, setTasks] = useState<VolunteerTask[]>([
    {
      id: 'v1',
      assignee: 'Alice Martinez',
      task: 'Direct fans from Gate C to Gate D (Gate C has 25m wait, Gate D has 3m wait)',
      status: 'pending'
    },
    {
      id: 'v2',
      assignee: 'Robert Chen',
      task: 'Deliver extra wheelchair ramp to Section 124 accessibility lane',
      status: 'completed'
    },
    {
      id: 'v3',
      assignee: 'Sarah Jenkins',
      task: 'Assist with ticketing terminal reset at Gate A entrance',
      status: 'pending'
    }
  ]);

  const [newAssignee, setNewAssignee] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  // 1. Identify critical alerts dynamically from sensor states (useMemo for optimal render execution)
  const alerts = useMemo((): string[] => {
    const list: string[] = [];
    stadiumState.gates.forEach(gate => {
      if (gate.crowdLevel > STAFF_GATE_CROWD_THRESHOLD) {
        list.push(`Gate ${gate.name} is severely congested (${gate.waitMinutes} min wait).`);
      }
    });
    stadiumState.facilities.forEach(fac => {
      if (fac.waitMinutes > STAFF_FACILITY_WAIT_CRITICAL_MIN) {
        list.push(`${fac.name} queue wait time is critical (${fac.waitMinutes} mins).`);
      }
    });
    if (stadiumState.weather.precipitation > STAFF_RAIN_WARNING_THRESHOLD) {
      list.push(`Rain warning: ${stadiumState.weather.precipitation}% probability. Prep poncho distribution.`);
    }
    return list;
  }, [stadiumState.gates, stadiumState.facilities, stadiumState.weather.precipitation]);

  // 2. Calculate AI dispatch directives based on alerts (useMemo for optimal render execution)
  const aiDispatchDirectives = useMemo((): string[] => {
    const directives: string[] = [];
    stadiumState.gates.forEach(gate => {
      if (gate.crowdLevel > STAFF_GATE_CROWD_THRESHOLD) {
        // Find a quiet gate nearby to redirect to
        const alternateGate = stadiumState.gates.find(g => g.status === 'open' && g.crowdLevel < STAFF_GATE_QUIET_THRESHOLD);
        if (alternateGate) {
          directives.push(
            `Congestion at Gate ${gate.name}: Dispatch 4 volunteers from Gate ${alternateGate.name} (wait time: ${alternateGate.waitMinutes}m) to set up overflow lanes and redirect arriving fans.`
          );
        }
      }
    });

    const foodOverload = stadiumState.foodVendors.find(v => v.waitMinutes > STAFF_FOOD_WAIT_CRITICAL_MIN);
    const quietFood = stadiumState.foodVendors.find(v => v.waitMinutes < STAFF_FOOD_WAIT_QUIET_MIN);
    if (foodOverload && quietFood) {
      directives.push(
        `High food queue at ${foodOverload.name}: Direct digital signboards at Section ${foodOverload.zone} to suggest alternative dining at ${quietFood.name} (only ${quietFood.waitMinutes} min wait).`
      );
    }

    if (directives.length === 0) {
      directives.push('All systems operating normally. Monitor gates for pre-kickoff surges.');
    }
    return directives;
  }, [stadiumState.gates, stadiumState.foodVendors]);

  const handleCreateTask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignee.trim() || !newRequirement.trim()) return;

    const newTask: VolunteerTask = {
      id: `v-${Date.now()}`,
      assignee: newAssignee,
      task: newRequirement,
      status: 'pending'
    };

    setTasks(prev => [newTask, ...prev]);
    setNewAssignee('');
    setNewRequirement('');

    addNotification({
      id: `staff-${Date.now()}`,
      type: 'gate',
      priority: 'medium',
      title: 'Volunteer Dispatched',
      message: `Task assigned to ${newTask.assignee}: ${newTask.task}`,
      timestamp: Date.now(),
      read: false
    });
  }, [newAssignee, newRequirement, addNotification]);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  }, []);

  // Operations stats
  const averageGateWait = useMemo((): number => {
    if (stadiumState.gates.length === 0) return 0;
    return Math.round(
      stadiumState.gates.reduce((acc, curr) => acc + curr.waitMinutes, 0) / stadiumState.gates.length
    );
  }, [stadiumState.gates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white font-outfit uppercase">
              Operations Control Center
            </h1>
          </div>
          <p className="text-sm text-white/50">
            Real-time stadium operational diagnostics & volunteer resource dispatching
          </p>
        </div>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> Staff Mode Active
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Gate Queue', value: `${averageGateWait} min`, icon: Clock, color: 'text-cyan-400 bg-cyan-400/5 border-cyan-400/10' },
          { label: 'Active Alerts', value: alerts.length, icon: AlertTriangle, color: alerts.length > 0 ? 'text-amber-400 bg-amber-400/5 border-amber-400/10' : 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10' },
          { label: 'Assigned Staff', value: '42 volunteers', icon: Users, color: 'text-amber-400 bg-amber-400/5 border-amber-400/10' },
          { label: 'Telemetry Health', value: '100% Online', icon: Activity, color: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 ${stat.color}`}>
            <div className="p-3 rounded-lg bg-black/25">
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-white font-outfit">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Warnings Panel */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white font-outfit flex items-center gap-2 border-b border-white/10 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Operational Diagnostics
            </h2>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                  <p className="text-sm font-bold text-white">All Terminals Clear</p>
                  <p className="text-xs text-white/40">Stadium crowd flows are within safe operating limits.</p>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex gap-2.5 items-start"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/40 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Sensors refresh every 3 seconds automatically</span>
            </div>
          </div>
        </div>

        {/* AI Operations Dispatch Engine */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
          <h2 className="text-sm font-bold text-white font-outfit flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" /> AI Co-Pilot Recommendation Engine
          </h2>

          <div className="mt-4 space-y-4">
            {aiDispatchDirectives.map((dir, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex gap-3 items-start relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-cyan-400 uppercase tracking-widest text-[9px] block">
                    AI Auto-Reroute Advice
                  </span>
                  <p className="text-white/80 leading-relaxed font-medium">{dir}</p>
                </div>
              </div>
            ))}

            {/* Manual Dispatch Form */}
            <form onSubmit={handleCreateTask} className="mt-6 p-4 rounded-xl border border-white/10 bg-white/0 space-y-4">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">
                Deploy Volunteer Task Assignment
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Volunteer Name (e.g. Abhinash)"
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text"
                  placeholder="Task Assignment details..."
                  value={newRequirement}
                  onChange={e => setNewRequirement(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A0E27] font-black text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/10"
                >
                  <Send className="w-3.5 h-3.5" /> Deploy Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Staff task logs */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
        <h2 className="text-sm font-bold text-white font-outfit flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
          <Users className="w-4 h-4 text-amber-400" /> Active Volunteer Dispatch Logs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTaskStatus(task.id)}
              className={`p-4 rounded-xl border cursor-pointer hover:bg-white/5 transition-all flex flex-col justify-between h-[120px] ${
                task.status === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-500/5 opacity-70'
                  : 'border-white/10 bg-white/0'
              }`}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white font-outfit">{task.assignee}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      task.status === 'completed' ? 'bg-emerald-500 text-black' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 line-clamp-3 leading-relaxed">{task.task}</p>
              </div>

              <div className="flex items-center gap-1 text-[9px] text-white/40">
                <MapPin className="w-3 h-3" /> MetLife Stadium Operations
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Coordination Hub & Predictive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <VolunteerHub />
        <PredictiveAnalytics />
      </div>
    </div>
  );
}
