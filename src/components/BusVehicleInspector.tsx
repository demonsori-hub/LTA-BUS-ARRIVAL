import React from 'react';
import { LiveBusMarker } from '../types/bus';
import { X, Navigation, Gauge, Users, Bus, ArrowRight } from 'lucide-react';

interface BusVehicleInspectorProps {
  bus: LiveBusMarker | null;
  onClose: () => void;
  onFocusNextStop: (stopCode: string) => void;
  onOpenRoute: (serviceNo: string) => void;
}

export const BusVehicleInspector: React.FC<BusVehicleInspectorProps> = ({
  bus,
  onClose,
  onFocusNextStop,
  onOpenRoute
}) => {
  if (!bus) return null;

  const loadColor = bus.load === 'SEA' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    bus.load === 'SDA' ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-rose-700 bg-rose-50 border-rose-200';

  const loadText = bus.load === 'SEA' ? 'Seats Available' :
    bus.load === 'SDA' ? 'Standing Available' :
    'Limited Standing';

  return (
    <div className="absolute bottom-4 right-4 z-30 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 bg-slate-900 text-white font-mono font-black text-lg rounded-xl">
            {bus.serviceNo}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-800">{bus.plate}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">{bus.operator}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              To: <strong className="text-slate-800 font-semibold">{bus.destinationName}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100">
        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Gauge className="w-3 h-3" />
            <span>Speed</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            {bus.speedKmH} <span className="text-[10px] font-normal text-slate-500">km/h</span>
          </div>
        </div>

        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Bus className="w-3 h-3" />
            <span>Deck</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            {bus.type === 'DD' ? 'Double' : 'Single'}
          </div>
        </div>

        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Navigation className="w-3 h-3" />
            <span>Heading</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            {bus.heading}°
          </div>
        </div>
      </div>

      {/* Next Stop approaching */}
      <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl">
        <div className="text-[10px] font-semibold text-blue-800 uppercase tracking-wide">
          Next Approaching Stop
        </div>
        <div className="flex items-center justify-between mt-1">
          <div>
            <div className="text-xs font-bold text-slate-900">{bus.nextBusStopName}</div>
            <div className="font-mono text-[10px] text-slate-500">Stop {bus.nextBusStopCode}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-extrabold font-mono text-blue-700">~{bus.etaMinutes} min</div>
            <button
              onClick={() => onFocusNextStop(bus.nextBusStopCode)}
              className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 justify-end"
            >
              <span>View Stop</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Crowd Level & Route Link */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${loadColor}`}>
          {loadText}
        </span>

        <button
          onClick={() => onOpenRoute(bus.serviceNo)}
          className="text-slate-600 hover:text-slate-900 font-medium underline text-[11px]"
        >
          View Full Route
        </button>
      </div>
    </div>
  );
};
