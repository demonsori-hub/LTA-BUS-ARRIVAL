import React from 'react';
import { CommuterAlarm } from '../types/bus';
import { Bell, X } from 'lucide-react';

interface CommuterAlarmsBannerProps {
  alarms: CommuterAlarm[];
  onRemoveAlarm: (id: string) => void;
}

export const CommuterAlarmsBanner: React.FC<CommuterAlarmsBannerProps> = ({
  alarms,
  onRemoveAlarm
}) => {
  if (alarms.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-200/80 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
          <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
          <span>Active Arrival Alerts:</span>
          <div className="flex flex-wrap items-center gap-2">
            {alarms.map(alarm => (
              <div
                key={alarm.id}
                className="inline-flex items-center gap-1.5 bg-white border border-amber-300 px-2 py-0.5 rounded text-[11px] text-amber-900"
              >
                <span>
                  Bus <strong>{alarm.serviceNo}</strong> at {alarm.busStopName} (&le; {alarm.thresholdMinutes}m)
                </span>
                <button
                  onClick={() => onRemoveAlarm(alarm.id)}
                  className="text-amber-500 hover:text-amber-800 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
