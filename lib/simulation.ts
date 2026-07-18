// =============================================================================
// FANVERSE AI — Real-Time Simulation Engine
// Generates realistic, phase-aware crowd / queue / weather patterns
// =============================================================================

import type {
  StadiumState,
  MatchDayPhase,
  GateStatus,
} from '@/types';
import { createInitialStadiumState } from './stadiumData';

// -----------------------------------------------------------------------------
// Seeded pseudo-random generator for demo reproducibility
// (Mulberry32 — a fast 32-bit PRNG)
// -----------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// -----------------------------------------------------------------------------
// Phase-based multipliers
// These define how "busy" each aspect of the stadium is per phase.
// -----------------------------------------------------------------------------

const CROWD_MULTIPLIER: Record<MatchDayPhase, number> = {
  BEFORE_MATCH: 0.3,
  ENTERING: 0.85,
  INSIDE: 0.65,
  HALFTIME: 0.9,
  AFTER_MATCH: 0.75,
};

const QUEUE_MULTIPLIER: Record<MatchDayPhase, number> = {
  BEFORE_MATCH: 0.2,
  ENTERING: 0.5,
  INSIDE: 0.4,
  HALFTIME: 1.0,
  AFTER_MATCH: 0.3,
};

const FOOD_QUEUE_MULTIPLIER: Record<MatchDayPhase, number> = {
  BEFORE_MATCH: 0.35,
  ENTERING: 0.6,
  INSIDE: 0.5,
  HALFTIME: 1.0,
  AFTER_MATCH: 0.15,
};

const TRANSPORT_DEMAND: Record<MatchDayPhase, number> = {
  BEFORE_MATCH: 0.7,
  ENTERING: 0.9,
  INSIDE: 0.2,
  HALFTIME: 0.15,
  AFTER_MATCH: 1.0,
};

// Phase durations in ticks (each tick = 3 s real-time)
const PHASE_DURATION_TICKS: Record<MatchDayPhase, number> = {
  BEFORE_MATCH: 40, // ~2 min demo
  ENTERING: 30,     // ~1.5 min
  INSIDE: 60,       // ~3 min
  HALFTIME: 30,     // ~1.5 min
  AFTER_MATCH: 40,  // ~2 min
};

export const PHASE_ORDER: MatchDayPhase[] = [
  'BEFORE_MATCH',
  'ENTERING',
  'INSIDE',
  'HALFTIME',
  'AFTER_MATCH',
];

// -----------------------------------------------------------------------------
// Simulation Engine Class
// -----------------------------------------------------------------------------

export class SimulationEngine {
  private state: StadiumState;
  private rng: () => number;
  private phaseTickCounter: number = 0;
  private gateClosureSchedule: Map<string, number> = new Map();

  constructor(seed: number = 2026) {
    this.rng = mulberry32(seed);
    this.state = createInitialStadiumState();
    this.scheduleGateClosures();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Advance the simulation by one tick */
  tick(): StadiumState {
    this.state.tick += 1;
    this.state.timestamp = new Date().toISOString();
    this.phaseTickCounter += 1;

    // Phase transition
    this.advancePhaseIfNeeded();

    // Update every subsystem
    this.updateGates();
    this.updateZones();
    this.updateFacilities();
    this.updateFoodVendors();
    this.updateWeather();
    this.updateTransport();

    return this.getState();
  }

  /** Return a deep copy of the current state */
  getState(): StadiumState {
    return structuredClone(this.state);
  }

  /** Get the current match-day phase */
  getPhase(): MatchDayPhase {
    return this.state.phase;
  }

  /** Force a specific phase (useful for demos) */
  setPhase(phase: MatchDayPhase): void {
    this.state.phase = phase;
    this.phaseTickCounter = 0;
  }

  /** Reset the simulation to initial state */
  reset(seed: number = 2026): void {
    this.rng = mulberry32(seed);
    this.state = createInitialStadiumState();
    this.phaseTickCounter = 0;
    this.gateClosureSchedule.clear();
    this.scheduleGateClosures();
  }

  // ---------------------------------------------------------------------------
  // Phase management
  // ---------------------------------------------------------------------------

  private advancePhaseIfNeeded(): void {
    const currentIdx = PHASE_ORDER.indexOf(this.state.phase);
    const phaseDuration = PHASE_DURATION_TICKS[this.state.phase];

    if (this.phaseTickCounter >= phaseDuration && currentIdx < PHASE_ORDER.length - 1) {
      this.state.phase = PHASE_ORDER[currentIdx + 1];
      this.phaseTickCounter = 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Gate simulation
  // ---------------------------------------------------------------------------

  private scheduleGateClosures(): void {
    // Schedule 1-2 brief gate closures for realism
    const gateIdx1 = Math.floor(this.rng() * 8);
    this.gateClosureSchedule.set(this.state.gates[gateIdx1].id, 25 + Math.floor(this.rng() * 30));

    const gateIdx2 = (gateIdx1 + 3) % 8;
    this.gateClosureSchedule.set(this.state.gates[gateIdx2].id, 70 + Math.floor(this.rng() * 40));
  }

  private updateGates(): void {
    const phase = this.state.phase;
    const mult = CROWD_MULTIPLIER[phase];

    this.state.gates = this.state.gates.map((gate) => {
      // Check scheduled closures
      let status: GateStatus = 'open';
      const closureTick = this.gateClosureSchedule.get(gate.id);
      if (closureTick && this.state.tick >= closureTick && this.state.tick < closureTick + 8) {
        status = 'closed';
      }

      // Crowd level with phase multiplier + noise
      const baseCrowd = gate.crowdLevel;
      const noise = (this.rng() - 0.5) * 0.12;
      const crowdLevel = clamp(baseCrowd * mult + noise + (phase === 'ENTERING' ? 0.25 : 0), 0, 1);

      // Wait time correlates with crowd
      const waitMinutes = Math.max(0, Math.round(crowdLevel * 20 + (this.rng() - 0.5) * 4));

      return { ...gate, status, crowdLevel, waitMinutes };
    });
  }

  // ---------------------------------------------------------------------------
  // Zone simulation
  // ---------------------------------------------------------------------------

  private updateZones(): void {
    const phase = this.state.phase;
    const mult = CROWD_MULTIPLIER[phase];

    this.state.zones = this.state.zones.map((zone) => {
      const noise = (this.rng() - 0.5) * 0.1;
      const crowdDensity = clamp(zone.crowdDensity * mult + noise, 0, 1);

      // Temperature fluctuates slightly
      const tempNoise = (this.rng() - 0.5) * 2;
      const temperature = Math.round(zone.temperature + tempNoise);

      return { ...zone, crowdDensity, temperature };
    });
  }

  // ---------------------------------------------------------------------------
  // Facility simulation
  // ---------------------------------------------------------------------------

  private updateFacilities(): void {
    const phase = this.state.phase;
    const mult = QUEUE_MULTIPLIER[phase];

    this.state.facilities = this.state.facilities.map((fac) => {
      if (fac.type === 'medical' || fac.type === 'information') {
        // Medical/info have minimal queues
        const q = Math.max(0, Math.round(fac.queueLength + (this.rng() - 0.5) * 2));
        return { ...fac, queueLength: q, waitMinutes: q * 2 };
      }

      const noise = (this.rng() - 0.5) * 6;
      const queueLength = Math.max(0, Math.round(fac.queueLength * mult + noise));
      const waitMinutes = Math.max(0, Math.round(queueLength * 0.4 + (this.rng() - 0.5) * 2));

      return { ...fac, queueLength, waitMinutes };
    });
  }

  // ---------------------------------------------------------------------------
  // Food vendor simulation
  // ---------------------------------------------------------------------------

  private updateFoodVendors(): void {
    const phase = this.state.phase;
    const mult = FOOD_QUEUE_MULTIPLIER[phase];

    this.state.foodVendors = this.state.foodVendors.map((vendor) => {
      const noise = (this.rng() - 0.5) * 8;
      const queueLength = Math.max(0, Math.round(vendor.queueLength * mult + noise));
      const waitMinutes = Math.max(0, Math.round(queueLength * 0.45 + (this.rng() - 0.5) * 2));

      return { ...vendor, queueLength, waitMinutes };
    });
  }

  // ---------------------------------------------------------------------------
  // Weather simulation (gradual changes)
  // ---------------------------------------------------------------------------

  private updateWeather(): void {
    const w = this.state.weather;

    // Temperature drifts slowly
    const tempDrift = (this.rng() - 0.5) * 0.5;
    const temperature = Math.round((w.temperature + tempDrift) * 10) / 10;
    const feelsLike = Math.round(temperature + (w.humidity > 70 ? 4 : 2));

    // Humidity drifts
    const humidityDrift = (this.rng() - 0.5) * 1.5;
    const humidity = clamp(Math.round(w.humidity + humidityDrift), 30, 100);

    // Wind changes slowly
    const windDrift = (this.rng() - 0.5) * 1;
    const windSpeed = clamp(Math.round((w.windSpeed + windDrift) * 10) / 10, 0, 35);

    // Precipitation probability drifts
    const precipDrift = (this.rng() - 0.5) * 3;
    const precipitation = clamp(Math.round(w.precipitation + precipDrift), 0, 100);

    // Condition changes based on precipitation probability
    let condition = w.condition;
    if (precipitation > 70) condition = 'thunderstorm';
    else if (precipitation > 50) condition = 'rain';
    else if (precipitation > 30) condition = 'cloudy';
    else if (precipitation > 15) condition = 'partly_cloudy';
    else if (this.state.tick > 80) condition = 'clear'; // evening
    else condition = 'sunny';

    // UV index drops as "evening" progresses in simulation
    const uvIndex = Math.max(0, Math.round(w.uvIndex - 0.02));

    this.state.weather = {
      temperature,
      feelsLike,
      condition,
      humidity,
      windSpeed,
      windDirection: w.windDirection,
      uvIndex,
      precipitation,
      updatedAt: Date.now(),
    };
  }

  // ---------------------------------------------------------------------------
  // Transport simulation
  // ---------------------------------------------------------------------------

  private updateTransport(): void {
    const phase = this.state.phase;
    const demand = TRANSPORT_DEMAND[phase];
    const t = this.state.transport;

    // Metro wait scales with demand
    const metroWait = Math.max(3, Math.round(6 * demand + (this.rng() - 0.5) * 3));
    const metroStatus = metroWait > 15 ? 'delayed' as const : 'normal' as const;

    // Bus
    const busWait = Math.max(5, Math.round(10 * demand + (this.rng() - 0.5) * 4));
    const busStatus = busWait > 20 ? 'delayed' as const : 'normal' as const;

    // Rideshare — surge pricing correlates with demand
    const surgeMultiplier = Math.round((1.0 + demand * 1.5 + (this.rng() - 0.3) * 0.5) * 10) / 10;
    const rideshareWait = Math.max(5, Math.round(12 * demand + (this.rng() - 0.5) * 5));

    // Parking spots decrease during ENTERING, stabilize, then don't recover
    let availableSpots = t.parking.availableSpots;
    if (phase === 'BEFORE_MATCH' || phase === 'ENTERING') {
      availableSpots = Math.max(0, availableSpots - Math.floor(this.rng() * 300));
    }
    const shuttleWait = Math.max(2, Math.round(5 * demand + (this.rng() - 0.5) * 3));

    this.state.transport = {
      metro: { ...t.metro, estimatedWait: metroWait, status: metroStatus },
      bus: { ...t.bus, estimatedWait: busWait, status: busStatus },
      rideshare: {
        ...t.rideshare,
        estimatedWait: rideshareWait,
        surgeMultiplier: clamp(surgeMultiplier, 1.0, 4.0),
      },
      parking: { ...t.parking, availableSpots, shuttleWait },
    };
  }
}

// -----------------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// -----------------------------------------------------------------------------
// Singleton export for the app
// -----------------------------------------------------------------------------

export const simulation = new SimulationEngine(2026);
