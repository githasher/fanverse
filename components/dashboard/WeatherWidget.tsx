'use client';

import React from 'react';
import { useFanverseStore } from '@/lib/store';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle } from 'lucide-react';

/**
 * WeatherWidget Dashboard Component.
 * Displays real-time outdoor weather sensor stats (wind speed, rain risk, humidity, UV index)
 * and issues warning alerts for rain or high winds.
 *
 * @returns React.JSX.Element representing the weather status card.
 */
function WeatherWidget(): React.JSX.Element {
  const stadiumState = useFanverseStore((state) => state.stadiumState);
  const { weather } = stadiumState;

  /**
   * Helper to resolve the appropriate animated weather icon.
   *
   * @param condition The weather state (sunny, rain, cloudy, etc.).
   * @returns React.JSX.Element corresponding to the weather icon.
   */
  const getWeatherIcon = (condition: string): React.JSX.Element => {
    switch (condition) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />;
      case 'rain':
      case 'thunderstorm':
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'cloudy':
      case 'partly_cloudy':
      default:
        return <Cloud className="w-8 h-8 text-slate-300" />;
    }
  };

  const isRainRisk = weather.precipitation >= 50;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold font-outfit text-white">Live Weather</h3>
        <span className="text-[10px] text-white/40">MetLife Stadium</span>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.condition)}
          <div>
            <div className="text-2xl font-black font-outfit text-white leading-none">
              {Math.round(weather.temperature)}°F
            </div>
            <span className="text-xs text-white/50 capitalize mt-1 block">
              {weather.condition.replaceAll('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-white/40 uppercase block">Feels Like</span>
          <span className="text-sm font-bold text-white">{Math.round(weather.feelsLike)}°F</span>
        </div>
      </div>

      {/* Weather stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-center">
          <div className="flex justify-center text-cyan-400 mb-1">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="text-[9px] text-white/50 block">Humidity</span>
          <span className="text-xs font-bold text-white">{weather.humidity}%</span>
        </div>

        <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-center">
          <div className="flex justify-center text-amber-400 mb-1">
            <Wind className="w-4 h-4" />
          </div>
          <span className="text-[9px] text-white/50 block">Wind</span>
          <span className="text-xs font-bold text-white">{weather.windSpeed} mph</span>
        </div>

        <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-center">
          <div className="flex justify-center text-rose-400 mb-1">
            ☔
          </div>
          <span className="text-[9px] text-white/50 block">Rain %</span>
          <span className="text-xs font-bold text-white">{weather.precipitation}%</span>
        </div>
      </div>

      {/* Rain Alert Banner */}
      {isRainRisk && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[10px] text-white/80 leading-relaxed">
            <span className="font-bold text-amber-400">Rain Warning: </span>
            {weather.condition === 'thunderstorm'
              ? 'Thunderstorm active! MetLife Stadium is open-air, seek covered concourse corridors.'
              : 'Precipitation is currently high. Consider buying a poncho from merchandising booths.'}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(WeatherWidget);
