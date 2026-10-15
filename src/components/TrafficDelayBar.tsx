import React from 'react';
import { TrafficConditions } from '../services/ltaService';
import { CloudRain, Sun, Zap, CloudLightning } from 'lucide-react';

interface TrafficDelayBarProps {
  traffic: TrafficConditions;
  onUpdateTraffic: (updates: Partial<TrafficConditions>) => void;
}

export const TrafficDelayBar: React.FC<TrafficDelayBarProps> = ({
  traffic,
  onUpdateTraffic
}) => {
  return (
    <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-800">Commute Conditions:</span>
          <span>Predictions factor in real-time Singapore road traffic</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Peak hour toggle */}
          <button
            onClick={() => {
              const nextPeak = !traffic.isPeakHour;
              onUpdateTraffic({
                isPeakHour: nextPeak,
                congestionMultiplier: nextPeak ? 1.25 : 1.0
              });
            }}
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors flex items-center gap-1.5 border ${
              traffic.isPeakHour
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Zap className={`w-3 h-3 ${traffic.isPeakHour ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Peak Hour ({traffic.isPeakHour ? '+25% Delay' : 'Off-Peak'})</span>
          </button>

          {/* Weather condition buttons */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 text-[11px]">
            <button
              onClick={() => onUpdateTraffic({ weather: 'clear' })}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                traffic.weather === 'clear' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Clear Weather"
            >
              <Sun className="w-3 h-3" />
              <span>Clear</span>
            </button>
            <button
              onClick={() => onUpdateTraffic({ weather: 'rain' })}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                traffic.weather === 'rain' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Rain Delay (+2 min)"
            >
              <CloudRain className="w-3 h-3" />
              <span>Rain</span>
            </button>
            <button
              onClick={() => onUpdateTraffic({ weather: 'heavy_rain' })}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                traffic.weather === 'heavy_rain' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Heavy Rain (+5 min)"
            >
              <CloudLightning className="w-3 h-3" />
              <span>Heavy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
