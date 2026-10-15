import React, { useState } from 'react';
import { BusStop } from '../types/bus';
import { Search, MapPin, Bookmark, Compass } from 'lucide-react';
import { STOP_SERVICE_MAP } from '../data/singaporeBuses';

interface StopSelectorProps {
  busStops: BusStop[];
  selectedStop: BusStop | null;
  onSelectStop: (stop: BusStop) => void;
  nearbyStops: { stop: BusStop; distanceMeters: number }[];
  bookmarkedCodes: string[];
  onToggleBookmark: (stopCode: string) => void;
}

export const StopSelector: React.FC<StopSelectorProps> = ({
  busStops,
  selectedStop,
  onSelectStop,
  nearbyStops,
  bookmarkedCodes,
  onToggleBookmark
}) => {
  const [activeTab, setActiveTab] = useState<'nearby' | 'search' | 'bookmarks'>('nearby');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStops = busStops.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (s.BusStopCode.includes(q)) return true;
    if (s.Description.toLowerCase().includes(q)) return true;
    if (s.RoadName.toLowerCase().includes(q)) return true;
    const services = STOP_SERVICE_MAP[s.BusStopCode] || [];
    return services.some(svc => svc.toLowerCase() === q);
  });

  const bookmarkedStops = busStops.filter(s => bookmarkedCodes.includes(s.BusStopCode));

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="flex items-center p-1 bg-slate-100 border-b border-slate-200 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'nearby'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Nearby</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'search'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({bookmarkedCodes.length})</span>
        </button>
      </div>

      {/* Search Input when in Search tab */}
      {activeTab === 'search' && (
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search stop code, road, or bus service..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
        {/* Nearby Tab */}
        {activeTab === 'nearby' && (
          <div>
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Stops Near You
            </div>
            {nearbyStops.map(({ stop, distanceMeters }) => {
              const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;
              const services = STOP_SERVICE_MAP[stop.BusStopCode] || [];

              return (
                <div
                  key={stop.BusStopCode}
                  onClick={() => onSelectStop(stop)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {stop.BusStopCode}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {stop.RoadName}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                        {stop.Description}
                      </h4>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                      {distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`}
                    </span>
                  </div>

                  {/* Calling services preview */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {services.slice(0, 6).map(svc => (
                      <span
                        key={svc}
                        className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                      >
                        {svc}
                      </span>
                    ))}
                    {services.length > 6 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{services.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {filteredStops.length} Bus Stops Found
            </div>
            {filteredStops.slice(0, 20).map(stop => {
              const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;
              const services = STOP_SERVICE_MAP[stop.BusStopCode] || [];

              return (
                <div
                  key={stop.BusStopCode}
                  onClick={() => onSelectStop(stop)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {stop.BusStopCode}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {stop.RoadName}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                        {stop.Description}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {services.slice(0, 8).map(svc => (
                      <span
                        key={svc}
                        className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedStops.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                <Bookmark className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium">No saved bus stops</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click the bookmark icon on any bus stop to save it here for fast daily access.
                </p>
              </div>
            ) : (
              <div>
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Your Pinned Commute Stops
                </div>
                {bookmarkedStops.map(stop => {
                  const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;
                  const services = STOP_SERVICE_MAP[stop.BusStopCode] || [];

                  return (
                    <div
                      key={stop.BusStopCode}
                      onClick={() => onSelectStop(stop)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                        isSelected
                          ? 'bg-blue-50/80 border border-blue-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {stop.BusStopCode}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-xs text-slate-500 font-medium">
                              {stop.RoadName}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                            {stop.Description}
                          </h4>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onToggleBookmark(stop.BusStopCode);
                          }}
                          className="p-1 text-amber-500 hover:text-amber-700"
                        >
                          <Bookmark className="w-4 h-4 fill-amber-400" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {services.map(svc => (
                          <span
                            key={svc}
                            className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
