'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { useFanverseStore } from '@/lib/store';
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Radio,
} from 'lucide-react';

/** Volunteer task assignment */
interface VolunteerTask {
  id: string;
  title: string;
  zone: string;
  priority: 'urgent' | 'normal' | 'low';
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedMinutes: number;
}

/**
 * VolunteerHub — Staff-mode volunteer coordination dashboard.
 * Shows task assignments, volunteer status, and AI-generated dispatch
 * recommendations based on real-time stadium conditions.
 */
function VolunteerHubComponent(): React.JSX.Element {
  const stadiumState = useFanverseStore((s) => s.stadiumState);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /** Generate dynamic tasks based on current stadium state */
  const tasks = useMemo((): VolunteerTask[] => {
    const dynamicTasks: VolunteerTask[] = [];
    let taskId = 1;

    // Generate crowd control tasks for busy gates
    for (const gate of stadiumState.gates) {
      if (gate.crowdLevel > 0.75) {
        dynamicTasks.push({
          id: `task-${taskId++}`,
          title: `Crowd control at ${gate.name}`,
          zone: gate.name,
          priority: gate.crowdLevel > 0.9 ? 'urgent' : 'normal',
          assignee: `Volunteer ${taskId}`,
          status: gate.crowdLevel > 0.9 ? 'in-progress' : 'pending',
          estimatedMinutes: 15,
        });
      }
    }

    // Generate facility tasks for long queues
    for (const facility of stadiumState.facilities) {
      if (facility.waitMinutes > 12 && facility.open) {
        dynamicTasks.push({
          id: `task-${taskId++}`,
          title: `Queue management at ${facility.name}`,
          zone: facility.name,
          priority: facility.waitMinutes > 20 ? 'urgent' : 'normal',
          assignee: `Volunteer ${taskId + 5}`,
          status: 'pending',
          estimatedMinutes: 20,
        });
      }
    }

    // Always have some baseline tasks
    dynamicTasks.push(
      {
        id: `task-${taskId++}`,
        title: 'GreenGoal recycling station check',
        zone: 'Section F & K',
        priority: 'low',
        assignee: 'Volunteer 12',
        status: 'completed',
        estimatedMinutes: 10,
      },
      {
        id: `task-${taskId++}`,
        title: 'Accessibility assistance patrol',
        zone: 'All Sections',
        priority: 'normal',
        assignee: 'Volunteer 8',
        status: 'in-progress',
        estimatedMinutes: 30,
      }
    );

    return dynamicTasks.sort((a, b) => {
      const priorityOrder = { urgent: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [stadiumState.gates, stadiumState.facilities]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const urgent = tasks.filter((t) => t.priority === 'urgent').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    return { total, completed, urgent, inProgress };
  }, [tasks]);

  const getPriorityBadge = (priority: VolunteerTask['priority']): React.JSX.Element => {
    const styles: Record<string, string> = {
      urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      normal: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusIcon = (status: VolunteerTask['status']): React.JSX.Element => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />;
    if (status === 'in-progress') return <Clock className="w-4 h-4 text-amber-400 animate-pulse" aria-hidden="true" />;
    return <AlertCircle className="w-4 h-4 text-white/30" aria-hidden="true" />;
  };

  return (
    <section
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
      aria-label="Volunteer coordination hub"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-[family-name:var(--font-outfit)]">
              Volunteer Coordination Hub
            </h3>
            <p className="text-[10px] text-white/40">AI-prioritized task assignments</p>
          </div>
        </div>
        <button
          onClick={toggleExpanded}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={isExpanded ? 'Collapse volunteer hub' : 'Expand volunteer hub'}
          aria-expanded={isExpanded}
        >
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-white/50" aria-hidden="true" />
            : <ChevronDown className="w-4 h-4 text-white/50" aria-hidden="true" />}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Active', value: stats.inProgress, color: 'text-amber-400' },
          { label: 'Urgent', value: stats.urgent, color: 'text-rose-400' },
          { label: 'Done', value: stats.completed, color: 'text-emerald-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5"
            role="status"
            aria-label={`${stat.label}: ${stat.value}`}
          >
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[9px] text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      {isExpanded && (
        <div className="space-y-2" role="list" aria-label="Volunteer task assignments">
          {tasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                task.status === 'completed'
                  ? 'bg-white/[0.02] border-white/5 opacity-60'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/15'
              }`}
              role="listitem"
            >
              {getStatusIcon(task.status)}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{task.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    <span>{task.zone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Radio className="w-3 h-3" aria-hidden="true" />
                    <span>{task.assignee}</span>
                  </div>
                </div>
              </div>
              {getPriorityBadge(task.priority)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const VolunteerHub = memo(VolunteerHubComponent);
export default VolunteerHub;
