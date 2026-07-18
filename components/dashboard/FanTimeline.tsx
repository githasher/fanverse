'use client';

import React from 'react';
import { useFanverseStore } from '@/lib/store';
import { CheckCircle2, Clock } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

/**
 * FanTimeline Dashboard Component.
 * Renders a vertical, phase-aware fan journey timeline tracking key match-day milestones.
 *
 * @returns React.JSX.Element representing the fan milestone logs.
 */
function FanTimeline(): React.JSX.Element {
  const timeline = useFanverseStore((state) => state.timeline);
  const currentPhase = useFanverseStore((state) => state.currentPhase);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold font-outfit text-white">AI Fan Timeline</h3>
        <p className="text-xs text-white/50">Personalized timeline schedule driven by live stadium context</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative border-l-2 border-white/10 ml-3 space-y-6 pb-4"
      >
        {timeline.map((event, idx) => {
          const isCompleted = event.status === 'completed';
          const isCurrent = event.status === 'current';

          return (
            <motion.div
              variants={itemVariants}
              key={idx}
              className="relative pl-6 flex flex-col md:flex-row gap-2 md:gap-4 items-start"
            >
              {/* Timeline marker node */}
              <div className="absolute -left-[9px] top-1">
                {isCompleted ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border border-[#0A0E27]">
                    <CheckCircle2 className="w-3 h-3 text-[#0A0E27]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center border border-[#0A0E27] relative">
                    <span className="absolute -inset-1 rounded-full bg-cyan-400/30 animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-[#0A0E27]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center" />
                )}
              </div>

              {/* Event card details */}
              <div className={`flex-1 p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-cyan-500 bg-cyan-500/5 shadow-md shadow-cyan-500/5'
                  : isCompleted
                  ? 'border-white/5 bg-white/0 opacity-55'
                  : 'border-white/10 bg-white/0'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{event.icon}</span>
                    <span className="font-bold text-sm md:text-base text-white font-outfit">
                      {event.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{event.time}</span>
                  </div>
                </div>

                <p className="text-[10px] md:text-xs text-white/60 leading-relaxed">
                  {event.description}
                </p>
                
                {isCurrent && (
                  <div className="mt-3 text-[9px] uppercase tracking-wider text-cyan-400 font-extrabold flex items-center gap-1">
                    <span>⚡ Current Phase: {currentPhase.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default React.memo(FanTimeline);
