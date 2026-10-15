import React, { useState } from 'react';
import { BusStop, BusStopArrivalData, BusServiceArrival, NextBusInfo, BusLoad, CommuterAlarm } from '../types/bus';
import { Bookmark, Clock, RefreshCw, Bell, ArrowRight, Bus, AlertCircle } from 'lucide-react';

interface BusArrivalsBoardProps {
  busStop: BusStop;
  arrivalData: BusStopArrivalData | null;
  isLoading: boolean;
  onRefresh: () => void;
  secondsToNextRefresh: number;
  isBookmarked: boolean;
  onToggleBookmark: (stopCode: string) => void;
  onSelectServiceRoute: (serviceNo: string) => void;
  activeAlarms: CommuterAlarm[];
  onSetAlarm: (busStopCode: string, busStopName: string, serviceNo: string, thresholdMin: number) => void;
  onRemoveAlarm: (alarmId: string) => void;
}

export const BusArrivalsBoard: React.FC<BusArrivalsBoardProps> = ({
  busStop,
  arrivalData,
  isLoading,
  onRefresh,
  secondsToNextRefresh,
  isBookmarked,
  onToggleBookmark,
  onSelectServiceRoute,
  activeAlarms,
  onSetAlarm,
  onRemoveAlarm
}) => {
  const [serviceFilter, setServiceFilter] = useState('');
  const [pinnedServices, setPinnedServices] = useState<string[]>([]);
  const [alarmModalService, setAlarmModalService] = useState<string | null>(null);

  const togglePinService = (serviceNo: string) => {
    setPinnedServices(prev =>
      prev.includes(serviceNo) ? prev.filter(s => s !== serviceNo) : [...prev, serviceNo]
    );
  };

  const getLoadBadgeInfo = (load: BusLoad) => {
    switch (load) {
      case 'SEA':
        return {
          label: 'Seats Avail',
          colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      case 'SDA':
        return {
          label: 'Standing Avail',
          colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
          dotColor: 'bg-amber-500'
        };
      case 'LSD':
        return {
          label: 'Limited Standing',
          colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
          dotColor: 'bg-rose-500'
        };
      default:
        return {
          label: 'Seats Avail',
          colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
          dotColor: 'bg-slate-400'
        };
    }
  };

  const renderEtaSlot = (nextBus: NextBusInfo | null, slotName: string, serviceNo: string) => {
    if (!nextBus) {
      return (
        <div className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center min-h-[76px]">
          <span className="text-[11px] font-medium text-slate-400">{slotName}</span>
          <span className="text-xs text-slate-400 font-mono mt-1">-</span>
        </div>
      );
    }

    const { minutesToArrival, secondsToArrival, isArrived, Load, Type, Feature } = nextBus;
    const loadInfo = getLoadBadgeInfo(Load);

    return (
      <div className={`flex-1 p-2.5 rounded-lg border flex flex-col justify-between transition-colors ${
        isArrived
          ? 'bg-emerald-50/70 border-emerald-300'
          : minutesToArrival <= 2
          ? 'bg-amber-50/60 border-amber-200'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>{slotName}</span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            {Type === 'DD' ? (
              <span className="font-bold text-slate-700">DD</span>
            ) : (
              <span className="text-slate-500">SD</span>
            )}
            {Feature === 'WAB' && (
              <span title="Wheelchair Accessible Bus" className="text-blue-600">♿</span>
            )}
          </span>
        </div>

        {/* ETA Number */}
        <div className="my-1">
          {isArrived ? (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-emerald-700">Arrived</span>
              <span className="text-[10px] text-emerald-600 font-mono">({secondsToArrival}s)</span>
            </div>
          ) : minutesToArrival === 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-amber-700">Arr</span>
              <span className="text-[10px] text-amber-600 font-mono">(&lt;1m)</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {minutesToArrival}
              </span>
              <span className="text-xs font-medium text-slate-500">min</span>
            </div>
          )}
        </div>

        {/* Load Crowd Level */}
        <div className="flex items-center gap-1.5 text-[10px] font-medium">
          <span className={`w-2 h-2 rounded-full shrink-0 ${loadInfo.dotColor}`} />
          <span className="truncate text-slate-600">{loadInfo.label}</span>
        </div>
      </div>
    );
  };

  const services = arrivalData?.Services || [];

  // Filter & sort pinned services
  const filteredServices = services
    .filter(s => {
      if (!serviceFilter) return true;
      return s.ServiceNo.toLowerCase().includes(serviceFilter.toLowerCase());
    })
    .sort((a, b) => {
      const aPinned = pinnedServices.includes(a.ServiceNo);
      const bPinned = pinnedServices.includes(b.ServiceNo);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return (a.NextBus?.secondsToArrival ?? 9999) - (b.NextBus?.secondsToArrival ?? 9999);
    });

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Bus Stop Information Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white font-mono text-xs font-bold rounded">
                {busStop.BusStopCode}
              </span>
              <span className="text-xs text-slate-300 font-medium">{busStop.RoadName}</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">
              {busStop.Description}
            </h2>
            {busStop.MrtNearby && (
              <p className="text-xs text-slate-300 mt-0.5">
                Connecting: {busStop.MrtNearby}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bookmark Stop Button */}
            <button
              onClick={() => onToggleBookmark(busStop.BusStopCode)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Stop'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs"
              title="Manual refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sync Countdown indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Next auto-update in</span>
            <span className="font-mono tabular-nums text-slate-200 font-semibold">
              {secondsToNextRefresh}s
            </span>
          </div>
          <span className="text-slate-400">
            {services.length} services calling
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            placeholder="Filter by bus number (e.g. 190, 65)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <Bus className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        {serviceFilter && (
          <button
            onClick={() => setServiceFilter('')}
            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Services Arrival List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 divide-y divide-slate-100">
        {filteredServices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium">No matching services found</p>
            <p className="text-xs text-slate-400 mt-1">Try another bus service number</p>
          </div>
        ) : (
          filteredServices.map(service => {
            const isPinned = pinnedServices.includes(service.ServiceNo);
            const activeAlarm = activeAlarms.find(
              a => a.busStopCode === busStop.BusStopCode && a.serviceNo === service.ServiceNo && a.isActive
            );

            return (
              <div key={service.ServiceNo} className="pt-3 first:pt-0">
                {/* Service Row Top */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectServiceRoute(service.ServiceNo)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white font-mono text-sm font-extrabold rounded-lg shadow-sm transition-colors flex items-center gap-1 group"
                      title="View sequential route"
                    >
                      <span>{service.ServiceNo}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {service.Operator}
                    </span>
                    {isPinned && (
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                        Pinned
                      </span>
                    )}
                  </div>

                  {/* Actions for this service */}
                  <div className="flex items-center gap-1">
                    {/* Commuter Arrival Alarm */}
                    <button
                      onClick={() => {
                        if (activeAlarm) {
                          onRemoveAlarm(activeAlarm.id);
                        } else {
                          setAlarmModalService(service.ServiceNo);
                        }
                      }}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeAlarm
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={activeAlarm ? `Alarm active (${activeAlarm.thresholdMinutes}m)` : 'Set arrival alert'}
                    >
                      <Bell className={`w-3.5 h-3.5 ${activeAlarm ? 'fill-amber-600 text-amber-600' : ''}`} />
                    </button>

                    {/* Pin button */}
                    <button
                      onClick={() => togglePinService(service.ServiceNo)}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        isPinned ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-blue-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 3 Arrival Slots: Next Bus, Next Bus 2, Next Bus 3 */}
                <div className="grid grid-cols-3 gap-2">
                  {renderEtaSlot(service.NextBus, 'Next Bus', service.ServiceNo)}
                  {renderEtaSlot(service.NextBus2, '2nd Bus', service.ServiceNo)}
                  {renderEtaSlot(service.NextBus3, '3rd Bus', service.ServiceNo)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Arrival Alarm Setup Dialog */}
      {alarmModalService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Set Arrival Alert for Bus {alarmModalService}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Receive a chime and browser alert when Bus {alarmModalService} is approaching {busStop.Description}.
            </p>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Alert me when bus is:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 5].map(min => (
                  <button
                    key={min}
                    onClick={() => {
                      onSetAlarm(busStop.BusStopCode, busStop.Description, alarmModalService, min);
                      setAlarmModalService(null);
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 text-xs font-semibold hover:border-blue-500 hover:bg-blue-50 transition-colors text-slate-800"
                  >
                    {min} mins away
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setAlarmModalService(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
