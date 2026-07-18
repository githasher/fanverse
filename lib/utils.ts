/**
 * Shared utility functions for FANVERSE AI
 */

/**
 * Returns Tailwind utility classes representing security gate or facility wait time status.
 *
 * @param value The numerical sensory state (wait minutes or density level).
 * @param yellowMax The upper boundary for the yellow/warning state.
 * @returns string containing Tailwind CSS classes.
 */
export function getSensoryStatusColor(value: number, yellowMax: number): string {
  if (value <= yellowMax * 0.4) {
    return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  }
  if (value <= yellowMax) {
    return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  }
  return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
}

/**
 * Returns Tailwind background classes based on capacity thresholds.
 *
 * @param level Capacity level (between 0.0 and 1.0).
 * @returns string background class.
 */
export function getSensoryBgColor(level: number): string {
  if (level < 0.4) return 'bg-emerald-500';
  if (level < 0.75) return 'bg-amber-500';
  return 'bg-rose-500';
}

/**
 * Returns Tailwind SVG classes representing crowd density for SVG mapping.
 *
 * @param density The crowd density level (between 0.0 and 1.0).
 * @returns string Tailwind SVG fill/stroke classes.
 */
export function getSensorySvgColor(density: number): string {
  if (density < 0.3) return 'fill-emerald-500/20 stroke-emerald-500/30';
  if (density < 0.65) return 'fill-amber-500/20 stroke-amber-500/30';
  return 'fill-rose-500/30 stroke-rose-500/50';
}
