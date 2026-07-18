'use client';

import React, { memo, useMemo } from 'react';
import { useFanverseStore } from '@/lib/store';
import { TrendingUp, TrendingDown, Minus, Brain, Clock } from 'lucide-react';

/** Single prediction data point */
interface Prediction {
  id: string;
  label: string;
  currentValue: string;
  predictedValue: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Generates a simple sparkline SVG path from an array of data points.
 *
 * @param values Array of numerical values to plot.
 * @param width SVG viewport width.
 * @param height SVG viewport height.
 * @returns SVG path `d` attribute string.
 */
function generateSparkline(values: number[], width: number, height: number): string {
  if (values.length < 2) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

/**
 * PredictiveAnalytics — Forward-looking AI predictions widget.
 * Displays crowd surge forecasts, queue time predictions, and transport
 * demand projections using simulation trend extrapolation.
 */
function PredictiveAnalyticsComponent(): React.JSX.Element {
  const stadiumState = useFanverseStore((s) => s.stadiumState);
  const currentPhase = useFanverseStore((s) => s.currentPhase);

  const predictions = useMemo((): Prediction[] => {
    const avgCrowdDensity =
      stadiumState.zones.reduce((sum, z) => sum + z.crowdDensity, 0) / stadiumState.zones.length;

    const busiestGate = [...stadiumState.gates]
      .filter((g) => g.status === 'open')
      .sort((a, b) => b.crowdLevel - a.crowdLevel)[0];

    const avgFoodWait =
      stadiumState.foodVendors.reduce((sum, v) => sum + v.waitMinutes, 0) /
      stadiumState.foodVendors.length;

    const rideshare = stadiumState.transport.rideshare;

    return [
      {
        id: 'crowd-surge',
        label: 'Overall Crowd Density',
        currentValue: `${Math.round(avgCrowdDensity * 100)}%`,
        predictedValue:
          currentPhase === 'HALFTIME'
            ? `${Math.min(99, Math.round(avgCrowdDensity * 100 + 15))}%`
            : currentPhase === 'AFTER_MATCH'
            ? `${Math.max(10, Math.round(avgCrowdDensity * 100 - 20))}%`
            : `${Math.round(avgCrowdDensity * 100 + 8)}%`,
        trend: currentPhase === 'AFTER_MATCH' ? 'down' : 'up',
        confidence: 87,
        timeframe: '~15 min',
        impact: avgCrowdDensity > 0.7 ? 'high' : 'medium',
      },
      {
        id: 'gate-forecast',
        label: `${busiestGate?.name ?? 'Busiest Gate'} Wait`,
        currentValue: `${busiestGate?.waitMinutes ?? 0} min`,
        predictedValue:
          currentPhase === 'ENTERING'
            ? `${(busiestGate?.waitMinutes ?? 0) + 5} min`
            : `${Math.max(1, (busiestGate?.waitMinutes ?? 0) - 3)} min`,
        trend: currentPhase === 'ENTERING' ? 'up' : 'down',
        confidence: 82,
        timeframe: '~10 min',
        impact: 'medium',
      },
      {
        id: 'food-queue',
        label: 'Avg Food Queue Wait',
        currentValue: `${Math.round(avgFoodWait)} min`,
        predictedValue:
          currentPhase === 'HALFTIME'
            ? `${Math.round(avgFoodWait + 7)} min`
            : `${Math.max(1, Math.round(avgFoodWait - 2))} min`,
        trend: currentPhase === 'HALFTIME' ? 'up' : 'down',
        confidence: 91,
        timeframe: currentPhase === 'HALFTIME' ? '~5 min' : '~15 min',
        impact: currentPhase === 'HALFTIME' ? 'high' : 'low',
      },
      {
        id: 'rideshare-surge',
        label: 'Rideshare Surge',
        currentValue: `${rideshare.surgeMultiplier?.toFixed(1) ?? '1.0'}x`,
        predictedValue:
          currentPhase === 'AFTER_MATCH'
            ? `${((rideshare.surgeMultiplier ?? 1) + 1.2).toFixed(1)}x`
            : `${(rideshare.surgeMultiplier ?? 1).toFixed(1)}x`,
        trend: currentPhase === 'AFTER_MATCH' ? 'up' : 'stable',
        confidence: 78,
        timeframe: '~20 min',
        impact: currentPhase === 'AFTER_MATCH' ? 'high' : 'low',
      },
    ];
  }, [stadiumState, currentPhase]);

  /** Simulated sparkline data per prediction */
  const sparklineData = useMemo((): Record<string, number[]> => {
    const tick = stadiumState.tick;
    return {
      'crowd-surge': Array.from({ length: 8 }, (_, i) => 40 + Math.sin((tick + i) * 0.3) * 20 + i * 3),
      'gate-forecast': Array.from({ length: 8 }, (_, i) => 5 + Math.sin((tick + i) * 0.5) * 4 + i * 0.5),
      'food-queue': Array.from({ length: 8 }, (_, i) => 3 + Math.cos((tick + i) * 0.4) * 3 + i * 0.8),
      'rideshare-surge': Array.from({ length: 8 }, (_, i) => 1 + Math.sin((tick + i) * 0.2) * 0.5 + i * 0.15),
    };
  }, [stadiumState.tick]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable'): React.JSX.Element => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />;
    return <Minus className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />;
  };

  const getImpactBadge = (impact: 'high' | 'medium' | 'low'): React.JSX.Element => {
    const styles: Record<string, string> = {
      high: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${styles[impact]}`}>
        {impact}
      </span>
    );
  };

  return (
    <section
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
      aria-label="Predictive analytics dashboard"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-violet-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-[family-name:var(--font-outfit)]">
            AI Predictive Analytics
          </h3>
          <p className="text-[10px] text-white/40">Forward-looking forecasts · Updated live</p>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="space-y-3">
        {predictions.map((pred) => (
          <div
            key={pred.id}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
            role="status"
            aria-label={`${pred.label}: currently ${pred.currentValue}, predicted ${pred.predictedValue} in ${pred.timeframe}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">{pred.label}</span>
                {getImpactBadge(pred.impact)}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/40">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>{pred.timeframe}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] text-white/40">Now</div>
                  <div className="text-sm font-bold text-white">{pred.currentValue}</div>
                </div>
                <div className="flex items-center gap-1 px-2">
                  {getTrendIcon(pred.trend)}
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Predicted</div>
                  <div className={`text-sm font-bold ${
                    pred.trend === 'up' ? 'text-rose-400' : pred.trend === 'down' ? 'text-emerald-400' : 'text-white'
                  }`}>{pred.predictedValue}</div>
                </div>
              </div>

              {/* Sparkline */}
              <svg
                width="60"
                height="24"
                className="opacity-60"
                role="img"
                aria-label={`${pred.label} trend sparkline`}
              >
                <path
                  d={generateSparkline(sparklineData[pred.id] ?? [], 60, 24)}
                  fill="none"
                  stroke={pred.trend === 'up' ? '#F87171' : pred.trend === 'down' ? '#34D399' : '#6B7280'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Confidence bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500/50 transition-all duration-500"
                  style={{ width: `${pred.confidence}%` }}
                />
              </div>
              <span className="text-[9px] text-white/30">{pred.confidence}% confidence</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const PredictiveAnalytics = memo(PredictiveAnalyticsComponent);
export default PredictiveAnalytics;
