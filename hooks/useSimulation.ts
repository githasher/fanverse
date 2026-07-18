// =============================================================================
// FANVERSE AI — useSimulation Hook
// Drives the real-time simulation and generates proactive notifications
// =============================================================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { simulation } from '@/lib/simulation';
import { useFanverseStore } from '@/lib/store';
import type {
  StadiumState,
  MatchDayPhase,
  Notification,
  NotificationType,
  NotificationPriority,
} from '@/types';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

/** Simulation tick interval in milliseconds */
const TICK_INTERVAL_MS = 3_000;

/** Thresholds that trigger proactive notifications */
const THRESHOLDS = {
  /** Gate crowd level (0-1) above which we alert */
  gateCrowdHigh: 0.8,
  /** Facility queue wait in minutes above which we alert */
  queueWaitHigh: 15,
  /** Precipitation probability above which we warn */
  precipitationWarning: 50,
  /** Rideshare surge multiplier above which we warn */
  surgePricingHigh: 2.5,
  /** Temperature above which we warn about heat */
  heatWarning: 90,
  /** Wind speed above which we warn */
  highWind: 20,
} as const;

/** Cooldown per notification type to avoid spamming (in ticks) */
const NOTIFICATION_COOLDOWN_TICKS = 10;

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNotifiedRef = useRef<Map<string, number>>(new Map());

  const updateStadiumState = useFanverseStore((s) => s.updateStadiumState);
  const setPhase = useFanverseStore((s) => s.setPhase);
  const addNotification = useFanverseStore((s) => s.addNotification);
  const stadiumState = useFanverseStore((s) => s.stadiumState);
  const currentPhase = useFanverseStore((s) => s.currentPhase);

  // ---------------------------------------------------------------------------
  // Notification generator
  // ---------------------------------------------------------------------------

  const canNotify = useCallback(
    (key: string, currentTick: number): boolean => {
      const lastTick = lastNotifiedRef.current.get(key) ?? -999;
      return currentTick - lastTick >= NOTIFICATION_COOLDOWN_TICKS;
    },
    []
  );

  const emitNotification = useCallback(
    (
      key: string,
      type: NotificationType,
      priority: NotificationPriority,
      title: string,
      message: string,
      currentTick: number,
      actionUrl?: string
    ) => {
      if (!canNotify(key, currentTick)) return;

      lastNotifiedRef.current.set(key, currentTick);

      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        priority,
        title,
        message,
        timestamp: Date.now(),
        read: false,
        actionUrl,
      };

      addNotification(notification);
    },
    [canNotify, addNotification]
  );

  // ---------------------------------------------------------------------------
  // Check state for threshold breaches and emit notifications
  // ---------------------------------------------------------------------------

  const checkThresholds = useCallback(
    (state: StadiumState) => {
      const tick = state.tick;

      // --- Gate crowd alerts ---
      for (const gate of state.gates) {
        if (gate.status === 'closed') {
          emitNotification(
            `gate-closed-${gate.id}`,
            'gate',
            'high',
            `${gate.name} Closed`,
            `${gate.name} is temporarily closed. Please use an alternative entrance.`,
            tick
          );
        } else if (gate.crowdLevel > THRESHOLDS.gateCrowdHigh) {
          const leastBusy = [...state.gates]
            .filter((g) => g.status === 'open')
            .sort((a, b) => a.crowdLevel - b.crowdLevel)[0];

          emitNotification(
            `gate-crowd-${gate.id}`,
            'crowd',
            'medium',
            `High Crowd at ${gate.name}`,
            `${gate.name} is at ${Math.round(gate.crowdLevel * 100)}% capacity (${gate.waitMinutes} min wait). Try ${leastBusy?.name ?? 'another gate'} instead (${leastBusy?.waitMinutes ?? '?'} min).`,
            tick
          );
        }
      }

      // --- Facility queue alerts ---
      for (const facility of state.facilities) {
        if (facility.waitMinutes > THRESHOLDS.queueWaitHigh) {
          // Find the nearest alternative of the same type
          const alternatives = state.facilities
            .filter((f) => f.type === facility.type && f.id !== facility.id && f.open)
            .sort((a, b) => a.waitMinutes - b.waitMinutes);

          const alt = alternatives[0];

          emitNotification(
            `queue-${facility.id}`,
            'queue',
            'medium',
            `Long Queue: ${facility.name}`,
            `~${facility.waitMinutes} min wait at ${facility.name}.${alt ? ` ${alt.name} has only ~${alt.waitMinutes} min wait.` : ''}`,
            tick
          );
        }
      }

      // --- Weather alerts ---
      if (state.weather.precipitation > THRESHOLDS.precipitationWarning) {
        emitNotification(
          'weather-rain',
          'weather',
          state.weather.precipitation > 70 ? 'high' : 'medium',
          'Rain Expected',
          `${state.weather.precipitation}% chance of rain. ${state.weather.condition === 'thunderstorm' ? '⛈️ Thunderstorm warning — seek covered areas!' : 'Consider carrying rain gear. MetLife is an open-air stadium.'}`,
          tick
        );
      }

      if (state.weather.temperature > THRESHOLDS.heatWarning) {
        emitNotification(
          'weather-heat',
          'weather',
          'high',
          'Heat Advisory',
          `Temperature is ${state.weather.temperature}°F (feels like ${state.weather.feelsLike}°F). Stay hydrated! Visit our free Hydration Stations.`,
          tick
        );
      }

      if (state.weather.windSpeed > THRESHOLDS.highWind) {
        emitNotification(
          'weather-wind',
          'weather',
          'medium',
          'High Winds',
          `Wind speed is ${state.weather.windSpeed} mph. Secure loose items and be cautious on upper levels.`,
          tick
        );
      }

      // --- Transport alerts ---
      if (
        state.transport.rideshare.surgeMultiplier &&
        state.transport.rideshare.surgeMultiplier > THRESHOLDS.surgePricingHigh
      ) {
        emitNotification(
          'transport-surge',
          'transport',
          'medium',
          'Rideshare Surge Pricing',
          `Rideshare surge is at ${state.transport.rideshare.surgeMultiplier}x. Consider NJ Transit (~${state.transport.metro.estimatedWait} min wait) to save money.`,
          tick
        );
      }

      if (state.transport.metro.status === 'delayed') {
        emitNotification(
          'transport-metro-delay',
          'transport',
          'high',
          'Metro Delays',
          `NJ Transit is experiencing delays (~${state.transport.metro.estimatedWait} min wait). Consider bus (${state.transport.bus.estimatedWait} min) or rideshare as alternatives.`,
          tick
        );
      }

      // --- Phase transition notifications ---
      const phaseMessages: Record<MatchDayPhase, { title: string; msg: string }> = {
        BEFORE_MATCH: {
          title: 'Welcome to MetLife Stadium!',
          msg: 'Gates are opening soon. Check your gate assignment and plan your route.',
        },
        ENTERING: {
          title: 'Gates Are Open! 🚪',
          msg: 'The stadium is now open for entry. Head to your assigned gate for the smoothest experience.',
        },
        INSIDE: {
          title: 'Kick-Off! ⚽',
          msg: 'The match has started! Enjoy the beautiful game. I\'m here if you need anything.',
        },
        HALFTIME: {
          title: 'Half-Time Break ⏸️',
          msg: 'Great time to grab food or visit the restroom. I can find the shortest queues for you!',
        },
        AFTER_MATCH: {
          title: 'Full Time! 🏁',
          msg: 'What a match! Check transport options now to beat the rush home.',
        },
      };

      const pm = phaseMessages[state.phase];
      emitNotification(
        `phase-${state.phase}`,
        'timing',
        'high',
        pm.title,
        pm.msg,
        tick
      );
    },
    [emitNotification]
  );

  // ---------------------------------------------------------------------------
  // Simulation loop
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Start the simulation loop

    intervalRef.current = setInterval(() => {
      const newState = simulation.tick();
      updateStadiumState(newState);

      // Update phase in store if it changed
      const newPhase = simulation.getPhase();
      setPhase(newPhase);

      // Check for threshold breaches and emit notifications
      checkThresholds(newState);
    }, TICK_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    };
  }, [updateStadiumState, setPhase, checkThresholds]);

  return {
    stadiumState,
    currentPhase,
    isRunning,
  };
}
