import React from 'react';
import { BusStop, LiveBusMarker } from '../types/bus';
import { BUS_ROUTES } from '../data/singaporeBuses';
import { ltaService } from '../services/ltaService';
import { X, Clock, MapPin, ArrowRight } from 'lucide-react';

interface RouteExplorerProps {
  serviceNo: string;
  onClose: () => void;
  onSelectStop: (stop: BusStop) => void;
  currentStopCode?: string;
  liveBuses: LiveBusMarker[];
}

export const RouteExplorer: React.FC<RouteExplorerProps> = ({
  serviceNo,
  onClose,
  onSelectStop,
  currentStopCode,
  liveBuses
}) => {
  const route = BUS_ROUTES[serviceNo];
  const serviceBuses = liveBuses.filter(b => b.serviceNo === serviceNo);

  if (!route) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Route {serviceNo}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500">Route topology for Service {serviceNo} is currently being mapped.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-600 text-white font-mono text-base font-extrabold rounded-lg">
              {route.serviceNo}
            </span>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>{route.originName}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>{route.destinationName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>Operator: {route.operator}</span>
                <span>·</span>
                <span>Freq: {route.frequencyRange}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operating Hours Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>First Bus: <strong className="text-slate-800">{route.firstBus}</strong></span>
            <span className="mx-1">·</span>
            <span>Last Bus: <strong className="text-slate-800">{route.lastBus}</strong></span>
          </div>
          <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {serviceBuses.length} active buses tracked
          </div>
        </div>

        {/* Sequential Route Stop Diagram */}
        <div className="flex-1 overflow-y-auto p-4 space-y-0">
          <div className="relative pl-6">
            {/* Continuous vertical transit line */}
            <div className="absolute left-[35px] top-4 bottom-4 w-1 bg-blue-200 rounded" />

            {route.stops.map((stopItem, idx) => {
              const stopData = ltaService.getBusStopByCode(stopItem.busStopCode);
              const isCurrent = currentStopCode === stopItem.busStopCode;
              const busesAtOrNext = serviceBuses.filter(
                b => b.nextBusStopCode === stopItem.busStopCode
              );

              return (
                <div key={stopItem.busStopCode} className="relative flex items-start gap-4 py-3 group">
                  {/* Sequence number */}
                  <span className="w-6 text-right font-mono text-[11px] text-slate-400 font-medium shrink-0 pt-0.5">
                    {idx + 1}
                  </span>

                  {/* Node icon */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 bg-white shrink-0 z-10 transition-colors mt-0.5 ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-600 ring-4 ring-blue-100'
                        : 'border-blue-400 group-hover:border-blue-600'
                    }`}
                  />

                  {/* Stop Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <button
                        onClick={() => {
                          if (stopData) {
                            onSelectStop(stopData);
                            onClose();
                          }
                        }}
                        className={`text-sm font-semibold text-left transition-colors truncate ${
                          isCurrent
                            ? 'text-blue-700 underline font-bold'
                            : 'text-slate-800 hover:text-blue-600'
                        }`}
                      >
                        {stopData?.Description || `Stop ${stopItem.busStopCode}`}
                      </button>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
                        {stopItem.distanceKm.toFixed(1)} km
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                        {stopItem.busStopCode}
                      </span>
                      <span>{stopData?.RoadName}</span>
                    </div>

                    {/* Active Bus approaching this stop */}
                    {busesAtOrNext.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {busesAtOrNext.map(bus => (
                          <div
                            key={bus.id}
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium animate-pulse"
                          >
                            <span className="font-bold">🚍 Bus {bus.plate}</span>
                            <span>approaching ({bus.speedKmH} km/h)</span>
                            <span className="font-mono text-amber-700">~{bus.etaMinutes}m</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
