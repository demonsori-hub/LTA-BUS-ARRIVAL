import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusStop, LiveBusMarker } from '../types/bus';

interface BusMapProps {
  busStops: BusStop[];
  selectedStop: BusStop | null;
  onSelectStop: (stop: BusStop) => void;
  liveBuses: LiveBusMarker[];
  selectedService: string | null;
  routeCoordinates?: [number, number][];
  onSelectBus?: (bus: LiveBusMarker) => void;
}

export const BusMap: React.FC<BusMapProps> = ({
  busStops,
  selectedStop,
  onSelectStop,
  liveBuses,
  selectedService,
  routeCoordinates,
  onSelectBus
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stopMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Singapore center: 1.3045, 103.8340 (Orchard)
    const map = L.map(mapContainerRef.current, {
      center: [1.3045, 103.8340],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Add high-clarity crisp CartoDB Positron / OSM tiles for transit legibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '1, 6'
      }).addTo(map);

      routePolylineRef.current = polyline;
    }
  }, [routeCoordinates]);

  // Update Bus Stop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers not in current list
    const currentStopCodes = new Set(busStops.map(s => s.BusStopCode));
    stopMarkersRef.current.forEach((marker, code) => {
      if (!currentStopCodes.has(code)) {
        map.removeLayer(marker);
        stopMarkersRef.current.delete(code);
      }
    });

    // Add or update markers
    busStops.forEach(stop => {
      const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;
      let marker = stopMarkersRef.current.get(stop.BusStopCode);

      // Create Custom SVG Icon
      const iconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            width: ${isSelected ? '32px' : '22px'};
            height: ${isSelected ? '32px' : '22px'};
            background-color: ${isSelected ? '#dc2626' : '#1e293b'};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <svg width="${isSelected ? '16' : '11'}" height="${isSelected ? '16' : '11'}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"></path>
              <path d="M16 6v6"></path>
              <rect width="18" height="14" x="3" y="3" rx="2"></rect>
              <path d="M4 17h16"></path>
              <path d="M9 21h6"></path>
            </svg>
          </div>
          ${
            isSelected
              ? `<div style="margin-top: 2px; padding: 2px 6px; background-color: #0f172a; color: #ffffff; font-size: 10px; font-weight: 700; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">${stop.BusStopCode}</div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-bus-stop-icon',
        html: iconHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 20]
      });

      if (!marker) {
        marker = L.marker([stop.Latitude, stop.Longitude], { icon: customIcon });
        marker.on('click', () => {
          onSelectStop(stop);
        });
        marker.addTo(map);
        stopMarkersRef.current.set(stop.BusStopCode, marker);
      } else {
        marker.setIcon(customIcon);
        marker.setLatLng([stop.Latitude, stop.Longitude]);
      }
    });
  }, [busStops, selectedStop, onSelectStop]);

  // Update Live Bus Vehicle Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Visible live buses (optionally filtered by selected service)
    const visibleBuses = selectedService
      ? liveBuses.filter(b => b.serviceNo === selectedService)
      : liveBuses;

    const currentBusIds = new Set(visibleBuses.map(b => b.id));
    busMarkersRef.current.forEach((marker, id) => {
      if (!currentBusIds.has(id)) {
        map.removeLayer(marker);
        busMarkersRef.current.delete(id);
      }
    });

    visibleBuses.forEach(bus => {
      let marker = busMarkersRef.current.get(bus.id);

      // Color based on crowd load
      const loadColor = bus.load === 'SEA' ? '#10b981' : bus.load === 'SDA' ? '#f59e0b' : '#ef4444';
      const isDD = bus.type === 'DD';

      const busIconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: #ffffff;
            border: 2px solid ${loadColor};
            border-radius: 8px;
            padding: 2px 5px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 3px;
          ">
            <span style="font-size: 11px; font-weight: 800; color: #0f172a; font-family: monospace;">${bus.serviceNo}</span>
            <span style="font-size: 9px; font-weight: 600; color: #64748b;">${isDD ? 'DD' : 'SD'}</span>
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: ${loadColor};
            "></div>
          </div>
          <!-- Direction Arrow -->
          <div style="
            transform: rotate(${bus.heading}deg);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 7px solid ${loadColor};
            margin-top: 1px;
          "></div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-live-bus-icon',
        html: busIconHtml,
        iconSize: [44, 34],
        iconAnchor: [22, 17]
      });

      if (!marker) {
        marker = L.marker([bus.latitude, bus.longitude], { icon: busIcon });
        marker.on('click', () => {
          if (onSelectBus) onSelectBus(bus);
        });
        marker.addTo(map);
        busMarkersRef.current.set(bus.id, marker);
      } else {
        marker.setIcon(busIcon);
        marker.setLatLng([bus.latitude, bus.longitude]);
      }
    });
  }, [liveBuses, selectedService, onSelectBus]);

  // Pan to selected stop smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStop) return;

    map.flyTo([selectedStop.Latitude, selectedStop.Longitude], 16, {
      duration: 0.8
    });
  }, [selectedStop]);

  const handleCenterUser = () => {
    if (!navigator.geolocation) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([1.3045, 103.8340], 15);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        // Check if within Singapore roughly (Lat 1.15 to 1.48, Lng 103.6 to 104.05)
        const inSg = latitude >= 1.15 && latitude <= 1.48 && longitude >= 103.6 && longitude <= 104.05;
        const targetLat = inSg ? latitude : 1.3045;
        const targetLng = inSg ? longitude : 103.8340;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([targetLat, targetLng], 16);
        }
      },
      () => {
        // Fallback to Orchard
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([1.3045, 103.8340], 15);
        }
      },
      { timeout: 5000 }
    );
  };

  const handleJumpRegion = (lat: number, lng: number, zoom = 15) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] bg-slate-100 overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Floating Controls Top-Left */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 text-xs">
        <button
          onClick={handleCenterUser}
          className="px-2.5 py-1.5 font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded flex items-center gap-1.5 transition-colors"
          title="Center on My Location"
        >
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          <span>My GPS</span>
        </button>

        <span className="text-slate-300">|</span>

        {/* Quick Region Jump */}
        <button
          onClick={() => handleJumpRegion(1.3045, 103.8340)}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-50 transition-colors"
        >
          Orchard
        </button>
        <button
          onClick={() => handleJumpRegion(1.2854, 103.8496)}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-50 transition-colors"
        >
          CBD
        </button>
        <button
          onClick={() => handleJumpRegion(1.2840, 103.8590)}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-50 transition-colors"
        >
          Marina Bay
        </button>
        <button
          onClick={() => handleJumpRegion(1.3005, 103.8560)}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-50 transition-colors"
        >
          Bugis
        </button>
        <button
          onClick={() => handleJumpRegion(1.3336, 103.7423)}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-50 transition-colors"
        >
          Jurong East
        </button>
        <button
          onClick={() => handleJumpRegion(1.3541, 103.9442)}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-50 transition-colors"
        >
          Tampines
        </button>
        <button
          onClick={() => handleJumpRegion(1.3586, 103.9895)}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-50 transition-colors"
        >
          Changi
        </button>
      </div>

      {/* Map Legend Overlay Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-[11px] text-slate-600 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Seats</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Standing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>Limited</span>
        </div>
        <span className="text-slate-300">·</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-700">DD</span>
          <span>Double Deck</span>
        </div>
      </div>
    </div>
  );
};
