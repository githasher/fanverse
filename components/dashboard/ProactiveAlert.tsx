'use client';

import React from 'react';
import { useFanverseStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Shield, CloudRain, Clock, AlertOctagon } from 'lucide-react';
import type { Notification, NotificationType } from '@/types';

export default function ProactiveAlert() {
  const notifications = useFanverseStore((state) => state.notifications);
  const markNotificationRead = useFanverseStore((state) => state.markNotificationRead);

  // Show only unread notifications, max 3 in the toast stack
  const activeToasts = notifications.filter((n) => !n.read).slice(0, 3);

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-rose-500';
      case 'high':
        return 'border-l-amber-500';
      case 'medium':
        return 'border-l-cyan-400';
      case 'low':
      default:
        return 'border-l-white/20';
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'emergency':
        return <AlertOctagon className="w-5 h-5 text-rose-500 animate-bounce" />;
      case 'weather':
        return <CloudRain className="w-5 h-5 text-indigo-400" />;
      case 'gate':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'queue':
      case 'crowd':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'transport':
      case 'timing':
      default:
        return <Bell className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-[340px] md:w-[380px] pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`p-4 rounded-xl border-y border-r border-l-4 border-white/10 bg-[#0A0E27]/90 backdrop-blur-2xl shadow-2xl flex gap-3 items-start pointer-events-auto ${getBorderColor(
              notif.priority
            )}`}
          >
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 shrink-0">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs md:text-sm text-white font-outfit truncate">
                  {notif.title}
                </span>
                <span className="text-[9px] text-white/30 shrink-0 ml-2">
                  {new Date(notif.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-white/60 leading-relaxed">
                {notif.message}
              </p>
            </div>

            <button
              onClick={() => markNotificationRead(notif.id)}
              className="text-white/40 hover:text-white shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
