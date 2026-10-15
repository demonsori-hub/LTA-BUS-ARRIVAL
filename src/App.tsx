import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BusStop, BusStopArrivalData, LiveBusMarker, CommuterAlarm } from './types/bus';
import { ltaService, TrafficConditions } from './services/ltaService';
import { SG_BUS_STOPS, BUS_ROUTES } from './data/singaporeBuses';
import { BusMap } from './components/BusMap';
import { BusArrivalsBoard } from './components/BusArrivalsBoard';
import { StopSelector } from './components/StopSelector';
import { RouteExplorer } from './components/RouteExplorer';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { BusVehicleInspector } from './components/BusVehicleInspector';
import { CommuterAlarmsBanner } from './components/CommuterAlarmsBanner';
import { TrafficDelayBar } from './components/TrafficDelayBar';
import { playArrivalChime } from './utils/audioAlert';
import { Map, List, Search, Server, RefreshCw, FileText, Download } from 'lucide-react';

export default function App() {
  // Current user GPS or default Singapore focal point (Orchard Road)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 1.3045,
    lng: 103.8340
  });

  // Selected stop (default to Lucky Plaza 09048)
  const [selectedStop, setSelectedStop] = useState<BusStop>(SG_BUS_STOPS[0]);
  const [arrivalData, setArrivalData] = useState<BusStopArrivalData | null>(null);
  const [isLoadingArrivals, setIsLoadingArrivals] = useState<boolean>(false);
  const [secondsToNextRefresh, setSecondsToNextRefresh] = useState<number>(15);

  // Bookmarks
  const [bookmarkedCodes, setBookmarkedCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_bookmarks');
      return saved ? JSON.parse(saved) : ['09048', '08057', '03019'];
    } catch {
      return ['09048', '08057', '03019'];
    }
  });

  // Live Buses
  const [liveBuses, setLiveBuses] = useState<LiveBusMarker[]>([]);
  const [inspectedBus, setInspectedBus] = useState<LiveBusMarker | null>(null);

  // Active Route Explorer modal
  const [activeRouteService, setActiveRouteService] = useState<string | null>(null);

  // Backend connector modal
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [backendEndpoint, setBackendEndpoint] = useState<string>(ltaService.getCustomBackendUrl());

  // Traffic & weather conditions
  const [traffic, setTraffic] = useState<TrafficConditions>(ltaService.getTrafficConditions());

  // Commuter arrival alarms
  const [activeAlarms, setActiveAlarms] = useState<CommuterAlarm[]>([]);

  // Mobile navigation active tab
  const [mobileTab, setMobileTab] = useState<'arrivals' | 'map' | 'stops'>('arrivals');

  // Request browser geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          if (latitude >= 1.15 && latitude <= 1.48 && longitude >= 103.6 && longitude <= 104.05) {
            setUserLocation({ lat: latitude, lng: longitude });
          }
        },
        () => {
          // Keep default Orchard
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Compute nearby stops
  const nearbyStops = useMemo(() => {
    return ltaService.getNearbyBusStops(userLocation.lat, userLocation.lng, 10);
  }, [userLocation]);

  // Load arrivals for selected stop
  const loadArrivals = useCallback(async () => {
    if (!selectedStop) return;
    setIsLoadingArrivals(true);
    try {
      const data = await ltaService.getBusArrivals(selectedStop.BusStopCode);
      setArrivalData(data);
      setSecondsToNextRefresh(15);
    } catch (err) {
      console.error('Error fetching arrivals:', err);
    } finally {
      setIsLoadingArrivals(false);
    }
  }, [selectedStop]);

  // Initial fetch and on selected stop change
  useEffect(() => {
    loadArrivals();
  }, [loadArrivals]);

  // Update live bus vehicles moving across Singapore
  useEffect(() => {
    const updateBuses = () => {
      const buses = ltaService.getLiveBusesForService();
      setLiveBuses(buses);
    };

    updateBuses();
    const busInterval = setInterval(updateBuses, 2000);
    return () => clearInterval(busInterval);
  }, []);

  // Countdown timer for auto-refresh and second-by-second countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNextRefresh(prev => {
        if (prev <= 1) {
          loadArrivals();
          return 15;
        }
        return prev - 1;
      });

      // Update seconds on current arrival data locally
      setArrivalData(prev => {
        if (!prev) return prev;
        const updatedServices = prev.Services.map(s => {
          const decrement = (nb: any) => {
            if (!nb) return null;
            const newSeconds = Math.max(0, nb.secondsToArrival - 1);
            const newMins = Math.floor(newSeconds / 60);
            return {
              ...nb,
              secondsToArrival: newSeconds,
              minutesToArrival: newMins,
              isArrived: newMins === 0 && newSeconds <= 25
            };
          };
          return {
            ...s,
            NextBus: decrement(s.NextBus),
            NextBus2: decrement(s.NextBus2),
            NextBus3: decrement(s.NextBus3)
          };
        });
        return { ...prev, Services: updatedServices };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadArrivals]);

  // Check Commuter Alarms
  useEffect(() => {
    if (!arrivalData || activeAlarms.length === 0) return;

    activeAlarms.forEach(alarm => {
      if (alarm.busStopCode === arrivalData.BusStopCode) {
        const service = arrivalData.Services.find(s => s.ServiceNo === alarm.serviceNo);
        if (service?.NextBus) {
          const { minutesToArrival } = service.NextBus;
          if (minutesToArrival <= alarm.thresholdMinutes) {
            playArrivalChime();
            // Remove alarm once triggered
            setActiveAlarms(prev => prev.filter(a => a.id !== alarm.id));
          }
        }
      }
    });
  }, [arrivalData, activeAlarms]);

  // Bookmark toggle
  const handleToggleBookmark = (code: string) => {
    setBookmarkedCodes(prev => {
      const updated = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      try {
        localStorage.setItem('sg_bus_bookmarks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Add Commuter Alarm
  const handleSetAlarm = (
    busStopCode: string,
    busStopName: string,
    serviceNo: string,
    thresholdMin: number
  ) => {
    const newAlarm: CommuterAlarm = {
      id: `ALARM-${Date.now()}`,
      busStopCode,
      busStopName,
      serviceNo,
      thresholdMinutes: thresholdMin,
      isActive: true,
      createdAt: Date.now()
    };
    setActiveAlarms(prev => [...prev, newAlarm]);
  };

  const handleRemoveAlarm = (alarmId: string) => {
    setActiveAlarms(prev => prev.filter(a => a.id !== alarmId));
  };

  // Route coordinates for currently inspected bus or selected route
  const currentRouteCoordinates = useMemo<[number, number][] | undefined>(() => {
    const svc = activeRouteService || inspectedBus?.serviceNo;
    if (!svc) return undefined;
    const route = BUS_ROUTES[svc];
    if (!route) return undefined;

    return route.stops
      .map(s => {
        const stop = SG_BUS_STOPS.find(item => item.BusStopCode === s.busStopCode);
        return stop ? [stop.Latitude, stop.Longitude] as [number, number] : null;
      })
      .filter((coord): coord is [number, number] => coord !== null);
  }, [activeRouteService, inspectedBus]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Bar adhering to Top Bar Contract:
          Zone 1: Single text element wordmark
          Zone 2: 4-5 concise single-line nav links
          Zone 3: 1 primary action */}
      <header className="flex items-center justify-between gap-8 px-4 lg:px-8 py-3.5 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            SG
          </div>
          <span className="text-base lg:text-lg font-bold tracking-tight text-slate-900">
            SG Bus Arrival
          </span>
        </div>

        {/* Zone 2: Concise Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setMobileTab('arrivals')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              mobileTab === 'arrivals' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Arrivals
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              mobileTab === 'map' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => setMobileTab('stops')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              mobileTab === 'stops' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Bus Stops
          </button>
          <button
            onClick={() => setActiveRouteService('190')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Route Explorer
          </button>
          <button
            onClick={() => setIsBackendModalOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>API Connector</span>
          </button>
          <a
            href="/prompt.md"
            download="prompt.md"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            title="Download session prompts as prompt.md"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Prompts</span>
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadArrivals}
            disabled={isLoadingArrivals}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingArrivals ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Timings</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </header>

      {/* Traffic Delay Bar & Alarms */}
      <TrafficDelayBar
        traffic={traffic}
        onUpdateTraffic={updates => {
          ltaService.setTrafficConditions(updates);
          setTraffic(ltaService.getTrafficConditions());
          loadArrivals();
        }}
      />
      <CommuterAlarmsBanner alarms={activeAlarms} onRemoveAlarm={handleRemoveAlarm} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 lg:p-6 flex flex-col">
        {/* Desktop Split View: 1440px baseline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[620px]">
          {/* Left Column: Stops & Arrivals */}
          <div className={`lg:col-span-5 flex flex-col gap-4 order-2 lg:order-1 ${
            mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Bus Stop Selector (Nearby / Search / Bookmarks) */}
            <div className={`h-[240px] shrink-0 ${mobileTab === 'arrivals' ? 'hidden lg:block' : 'block'}`}>
              <StopSelector
                busStops={SG_BUS_STOPS}
                selectedStop={selectedStop}
                onSelectStop={stop => {
                  setSelectedStop(stop);
                  setInspectedBus(null);
                  setMobileTab('arrivals');
                }}
                nearbyStops={nearbyStops}
                bookmarkedCodes={bookmarkedCodes}
                onToggleBookmark={handleToggleBookmark}
              />
            </div>

            {/* Live Arrivals Board */}
            <div className={`flex-1 min-h-[380px] ${mobileTab === 'stops' ? 'hidden lg:block' : 'block'}`}>
              <BusArrivalsBoard
                busStop={selectedStop}
                arrivalData={arrivalData}
                isLoading={isLoadingArrivals}
                onRefresh={loadArrivals}
                secondsToNextRefresh={secondsToNextRefresh}
                isBookmarked={bookmarkedCodes.includes(selectedStop.BusStopCode)}
                onToggleBookmark={handleToggleBookmark}
                onSelectServiceRoute={svc => setActiveRouteService(svc)}
                activeAlarms={activeAlarms}
                onSetAlarm={handleSetAlarm}
                onRemoveAlarm={handleRemoveAlarm}
              />
            </div>
          </div>

          {/* Right Column: Live Interactive Singapore Map */}
          <div className={`lg:col-span-7 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm order-1 lg:order-2 min-h-[400px] lg:min-h-full relative ${
            mobileTab !== 'map' ? 'hidden lg:flex' : 'flex h-[calc(100vh-190px)]'
          }`}>
            <BusMap
              busStops={SG_BUS_STOPS}
              selectedStop={selectedStop}
              onSelectStop={stop => {
                setSelectedStop(stop);
                setInspectedBus(null);
                setMobileTab('arrivals');
              }}
              liveBuses={liveBuses}
              selectedService={activeRouteService || inspectedBus?.serviceNo || null}
              routeCoordinates={currentRouteCoordinates}
              onSelectBus={bus => setInspectedBus(bus)}
            />

            {/* Live Bus Vehicle Inspector Popover */}
            <BusVehicleInspector
              bus={inspectedBus}
              onClose={() => setInspectedBus(null)}
              onFocusNextStop={stopCode => {
                const stop = ltaService.getBusStopByCode(stopCode);
                if (stop) setSelectedStop(stop);
              }}
              onOpenRoute={svc => setActiveRouteService(svc)}
            />
          </div>
        </div>
      </main>

      {/* Route Explorer Modal */}
      {activeRouteService && (
        <RouteExplorer
          serviceNo={activeRouteService}
          onClose={() => setActiveRouteService(null)}
          onSelectStop={stop => {
            setSelectedStop(stop);
            setInspectedBus(null);
          }}
          currentStopCode={selectedStop.BusStopCode}
          liveBuses={liveBuses}
        />
      )}

      {/* Backend Integration / LTA DataMall Connector Modal */}
      <BackendIntegrationModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onEndpointUpdated={url => {
          setBackendEndpoint(url);
          loadArrivals();
        }}
      />

      {/* Mobile Floating Bottom Tab Bar (<15% mobile viewport cap) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="grid grid-cols-3 h-14 items-center max-w-md mx-auto">
          <button
            onClick={() => setMobileTab('arrivals')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              mobileTab === 'arrivals' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-[11px] font-medium mt-0.5">Arrivals</span>
          </button>

          <button
            onClick={() => setMobileTab('map')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              mobileTab === 'map' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Map className="w-4 h-4" />
            <span className="text-[11px] font-medium mt-0.5">Live Map</span>
          </button>

          <button
            onClick={() => setMobileTab('stops')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              mobileTab === 'stops' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="text-[11px] font-medium mt-0.5">Stops</span>
          </button>
        </div>
      </div>
    </div>
  );
}
