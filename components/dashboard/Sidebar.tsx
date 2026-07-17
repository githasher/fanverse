'use client';

import { useFanverseStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Map,
  Clock,
  ScanLine,
  Settings,
  Bell,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import type { ActiveView } from '@/types';

const navItems: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { view: 'chat', label: 'AI Chat', icon: <MessageSquare size={20} /> },
  { view: 'map', label: 'Stadium Map', icon: <Map size={20} /> },
  { view: 'timeline', label: 'Timeline', icon: <Clock size={20} /> },
  { view: 'scanner', label: 'Scanner', icon: <ScanLine size={20} /> },
  { view: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const phaseLabels: Record<string, { label: string; color: string }> = {
  BEFORE_MATCH: { label: 'Pre-Match', color: 'bg-blue-500' },
  ENTERING: { label: 'Entering', color: 'bg-amber-500' },
  INSIDE: { label: 'Inside', color: 'bg-emerald-500' },
  HALFTIME: { label: 'Halftime', color: 'bg-purple-500' },
  AFTER_MATCH: { label: 'Post-Match', color: 'bg-rose-500' },
};

export default function Sidebar() {
  const activeView = useFanverseStore((s) => s.activeView);
  const setActiveView = useFanverseStore((s) => s.setActiveView);
  const notifications = useFanverseStore((s) => s.notifications);
  const currentPhase = useFanverseStore((s) => s.currentPhase);
  const [collapsed, setCollapsed] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const phaseInfo = phaseLabels[currentPhase] ?? phaseLabels.ENTERING;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`hidden md:flex flex-col h-full bg-white/5 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10 min-h-[72px]">
        <motion.div
          className="relative flex-shrink-0"
          animate={{ boxShadow: ['0 0 12px #00F5FF40', '0 0 24px #00F5FF80', '0 0 12px #00F5FF40'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                FANVERSE AI
              </h1>
              <p className="text-[10px] text-white/40 tracking-widest uppercase">Stadium Intelligence</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <motion.button
              key={item.view}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Chat badge with notification count */}
              {item.view === 'chat' && unreadCount > 0 && !collapsed && (
                <span className="ml-auto flex-shrink-0">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-500 items-center justify-center text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Match Info */}
      <div className="px-3 pb-3">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-white/5 border border-white/10 p-3 mb-3"
            >
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Current Match</p>
              <p className="text-sm font-semibold text-white">Argentina vs France</p>
              <p className="text-xs text-white/50 mt-0.5">Group Stage · 11:00 AM</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${phaseInfo.color} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${phaseInfo.color}`} />
                </span>
                <span className="text-xs text-white/60">{phaseInfo.label}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveView('dashboard')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <div className="relative">
            <Bell size={18} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center text-[9px] font-bold text-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Notifications
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="border-t border-white/10 py-3 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </motion.aside>
  );
}
