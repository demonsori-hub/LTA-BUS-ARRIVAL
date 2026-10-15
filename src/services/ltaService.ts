import {
  BusStop,
  BusServiceArrival,
  BusStopArrivalData,
  NextBusInfo,
  LiveBusMarker,
  BusLoad,
  BusType,
  BusFeature
} from '../types/bus';
import { SG_BUS_STOPS, STOP_SERVICE_MAP, OPERATOR_BY_SERVICE, BUS_ROUTES } from '../data/singaporeBuses';

export interface TrafficConditions {
  isPeakHour: boolean;
  weather: 'clear' | 'rain' | 'heavy_rain';
  congestionMultiplier: number;
}

class LTAService {
  private customBackendUrl: string = '/api/busarrival';
  private liveBusCache: Map<string, LiveBusMarker[]> = new Map();
  private traffic: TrafficConditions = {
    isPeakHour: false,
    weather: 'clear',
    congestionMultiplier: 1.0
  };

  constructor() {
    this.checkPeakHour();
  }

  public setCustomBackendUrl(url: string) {
    this.customBackendUrl = url.trim();
  }

  public getCustomBackendUrl(): string {
    return this.customBackendUrl;
  }

  public setTrafficConditions(conditions: Partial<TrafficConditions>) {
    this.traffic = { ...this.traffic, ...conditions };
  }

  public getTrafficConditions(): TrafficConditions {
    return this.traffic;
  }

  private checkPeakHour() {
    const now = new Date();
    const hours = now.getHours();
    // Typical Singapore LTA peak hours: 7:30 - 9:30 AM & 17:30 - 20:00 PM
    const isMorningPeak = hours >= 7 && hours <= 9;
    const isEveningPeak = hours >= 17 && hours <= 20;
    this.traffic.isPeakHour = isMorningPeak || isEveningPeak;
    this.traffic.congestionMultiplier = this.traffic.isPeakHour ? 1.25 : 1.0;
  }

  // Get all registered bus stops
  public getAllBusStops(): BusStop[] {
    return SG_BUS_STOPS;
  }

  // Find stop by code
  public getBusStopByCode(code: string): BusStop | undefined {
    return SG_BUS_STOPS.find(s => s.BusStopCode === code);
  }

  // Search stops by query (5-digit code, description, road name, or service number)
  public searchBusStops(query: string): BusStop[] {
    const q = query.trim().toLowerCase();
    if (!q) return SG_BUS_STOPS;

    return SG_BUS_STOPS.filter(stop => {
      // Direct code match
      if (stop.BusStopCode.includes(q)) return true;
      // Road name match
      if (stop.RoadName.toLowerCase().includes(q)) return true;
      // Description match
      if (stop.Description.toLowerCase().includes(q)) return true;
      // MRT match
      if (stop.MrtNearby && stop.MrtNearby.toLowerCase().includes(q)) return true;
      // Service number match
      const services = STOP_SERVICE_MAP[stop.BusStopCode] || [];
      if (services.some(svc => svc.toLowerCase() === q || svc.toLowerCase().startsWith(q))) return true;

      return false;
    });
  }

  // Calculate distance between two GPS coordinates in meters
  public calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  // Get nearby bus stops sorted by distance from given coordinates
  public getNearbyBusStops(lat: number, lon: number, limit = 8): { stop: BusStop; distanceMeters: number }[] {
    return SG_BUS_STOPS.map(stop => ({
      stop,
      distanceMeters: this.calculateDistanceMeters(lat, lon, stop.Latitude, stop.Longitude)
    }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit);
  }

  // Fetch or simulate live arrivals for a given bus stop code
  public async getBusArrivals(busStopCode: string): Promise<BusStopArrivalData> {
    // If user configured a real backend URL, attempt to call it first
    if (this.customBackendUrl) {
      try {
        const fullUrl = this.customBackendUrl.includes('?')
          ? `${this.customBackendUrl}&BusStopCode=${busStopCode}`
          : `${this.customBackendUrl}?BusStopCode=${busStopCode}`;
        
        const response = await fetch(fullUrl, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          // If valid LTA format
          if (data && (data.Services || data.services)) {
            return this.transformLtaResponse(data, busStopCode);
          }
        }
      } catch (err) {
        console.warn('Custom backend fetch failed, using realistic Singapore LTA simulator:', err);
      }
    }

    // Default: High-fidelity Singapore LTA Arrival & Prediction Engine
    return this.simulateLtaArrivals(busStopCode);
  }

  private transformLtaResponse(data: any, busStopCode: string): BusStopArrivalData {
    const servicesRaw = data.Services || data.services || [];
    const now = new Date();

    const services: BusServiceArrival[] = servicesRaw.map((s: any) => {
      const parseNext = (nb: any): NextBusInfo | null => {
        if (!nb || !nb.EstimatedArrival) return null;
        const etaDate = new Date(nb.EstimatedArrival);
        const diffMs = etaDate.getTime() - now.getTime();
        const secondsToArrival = Math.max(0, Math.round(diffMs / 1000));
        const minutesToArrival = Math.floor(secondsToArrival / 60);

        return {
          EstimatedArrival: nb.EstimatedArrival,
          Latitude: parseFloat(nb.Latitude) || 0,
          Longitude: parseFloat(nb.Longitude) || 0,
          VisitNumber: parseInt(nb.VisitNumber, 10) || 1,
          Load: (nb.Load || 'SEA') as BusLoad,
          Feature: (nb.Feature || '') as BusFeature,
          Type: (nb.Type || 'SD') as BusType,
          OriginCode: nb.OriginCode,
          DestinationCode: nb.DestinationCode,
          minutesToArrival,
          secondsToArrival,
          isArrived: minutesToArrival <= 0 && secondsToArrival <= 30
        };
      };

      const serviceNo = s.ServiceNo || s.serviceNo;
      return {
        ServiceNo: serviceNo,
        Operator: s.Operator || OPERATOR_BY_SERVICE[serviceNo] || 'SBST',
        NextBus: parseNext(s.NextBus || s.nextBus),
        NextBus2: parseNext(s.NextBus2 || s.nextBus2),
        NextBus3: parseNext(s.NextBus3 || s.nextBus3)
      };
    });

    return {
      BusStopCode: busStopCode,
      Services: services,
      timestamp: now.toISOString()
    };
  }

  // High-fidelity Singapore arrival time prediction engine
  private simulateLtaArrivals(busStopCode: string): BusStopArrivalData {
    const stop = this.getBusStopByCode(busStopCode);
    const serviceList = STOP_SERVICE_MAP[busStopCode] || ['190', '65', '14'];
    const now = new Date();
    const timeSeed = Math.floor(now.getTime() / 15000); // 15-second deterministic sync window

    const weatherDelayMin = this.traffic.weather === 'rain' ? 2 : this.traffic.weather === 'heavy_rain' ? 5 : 0;
    const congestionFactor = this.traffic.congestionMultiplier;

    const services: BusServiceArrival[] = serviceList.map(serviceNo => {
      const op = OPERATOR_BY_SERVICE[serviceNo] || 'SBST';

      // Generate realistic deterministic seed per service and stop
      const svcSeed = this.hashString(`${busStopCode}-${serviceNo}-${timeSeed}`);
      
      // Calculate realistic arrival intervals: 0 to 18 minutes
      const baseMin1 = (svcSeed % 9); // 0 to 8 min
      const adjustedMin1 = Math.max(0, Math.round(baseMin1 * congestionFactor) + weatherDelayMin);
      const remainingSeconds1 = (adjustedMin1 === 0) ? Math.min(45, (svcSeed % 40) + 10) : ((svcSeed * 7) % 60);

      const baseMin2 = baseMin1 + 7 + ((svcSeed >> 2) % 6); // +7 to 12 min
      const adjustedMin2 = Math.round(baseMin2 * congestionFactor) + weatherDelayMin;
      const remainingSeconds2 = (adjustedMin2 * 60) + ((svcSeed * 13) % 60);

      const baseMin3 = baseMin2 + 8 + ((svcSeed >> 4) % 7); // +8 to 14 min
      const adjustedMin3 = Math.round(baseMin3 * congestionFactor) + weatherDelayMin;
      const remainingSeconds3 = (adjustedMin3 * 60) + ((svcSeed * 17) % 60);

      // Plate generator
      const platePrefix = op === 'SMRT' ? 'SMB' : op === 'TTS' ? 'SG' : op === 'GAS' ? 'SG' : 'SBS';
      const plate1 = `${platePrefix}${1000 + (svcSeed % 8999)}A`;
      const plate2 = `${platePrefix}${1000 + ((svcSeed + 42) % 8999)}B`;
      const plate3 = `${platePrefix}${1000 + ((svcSeed + 84) % 8999)}C`;

      // Crowd load selection
      const loadOptions: BusLoad[] = this.traffic.isPeakHour
        ? ['SDA', 'SDA', 'LSD', 'SEA']
        : ['SEA', 'SEA', 'SEA', 'SDA'];
      const load1 = loadOptions[svcSeed % loadOptions.length];
      const load2 = loadOptions[(svcSeed + 1) % loadOptions.length];
      const load3 = loadOptions[(svcSeed + 2) % loadOptions.length];

      // Vehicle deck type
      const isHeavyRoute = ['190', '65', '14', '147', '106'].includes(serviceNo);
      const type1: BusType = isHeavyRoute ? ((svcSeed % 3 === 0) ? 'SD' : 'DD') : 'SD';
      const type2: BusType = isHeavyRoute ? 'DD' : 'SD';
      const type3: BusType = 'SD';

      // Calculated bus GPS locations
      const stopLat = stop?.Latitude || 1.3045;
      const stopLng = stop?.Longitude || 103.8340;

      // Position bus upstream based on arrival seconds (assuming ~30km/h = 8.3 m/s)
      const distanceM1 = remainingSeconds1 * 7.5;
      const offsetLat1 = (distanceM1 / 111111) * 0.7;
      const offsetLng1 = (distanceM1 / 111111) * 0.7;

      const date1 = new Date(now.getTime() + remainingSeconds1 * 1000);
      const date2 = new Date(now.getTime() + remainingSeconds2 * 1000);
      const date3 = new Date(now.getTime() + remainingSeconds3 * 1000);

      const nextBus1: NextBusInfo = {
        EstimatedArrival: date1.toISOString(),
        Latitude: +(stopLat - offsetLat1).toFixed(6),
        Longitude: +(stopLng - offsetLng1).toFixed(6),
        VisitNumber: 1,
        Load: load1,
        Feature: 'WAB',
        Type: type1,
        minutesToArrival: adjustedMin1,
        secondsToArrival: remainingSeconds1,
        isArrived: adjustedMin1 === 0 && remainingSeconds1 <= 20,
        busPlate: plate1,
        speedKmH: Math.max(15, 36 - Math.round(congestionFactor * 6))
      };

      const nextBus2: NextBusInfo = {
        EstimatedArrival: date2.toISOString(),
        Latitude: +(stopLat - (offsetLat1 * 2.5)).toFixed(6),
        Longitude: +(stopLng - (offsetLng1 * 2.5)).toFixed(6),
        VisitNumber: 1,
        Load: load2,
        Feature: 'WAB',
        Type: type2,
        minutesToArrival: adjustedMin2,
        secondsToArrival: remainingSeconds2,
        isArrived: false,
        busPlate: plate2,
        speedKmH: 34
      };

      const nextBus3: NextBusInfo = {
        EstimatedArrival: date3.toISOString(),
        Latitude: +(stopLat - (offsetLat1 * 4.2)).toFixed(6),
        Longitude: +(stopLng - (offsetLng1 * 4.2)).toFixed(6),
        VisitNumber: 1,
        Load: load3,
        Feature: 'WAB',
        Type: type3,
        minutesToArrival: adjustedMin3,
        secondsToArrival: remainingSeconds3,
        isArrived: false,
        busPlate: plate3,
        speedKmH: 38
      };

      return {
        ServiceNo: serviceNo,
        Operator: op,
        NextBus: nextBus1,
        NextBus2: nextBus2,
        NextBus3: nextBus3
      };
    });

    // Sort: buses arriving sooner first
    services.sort((a, b) => {
      const tA = a.NextBus?.secondsToArrival ?? 9999;
      const tB = b.NextBus?.secondsToArrival ?? 9999;
      return tA - tB;
    });

    return {
      BusStopCode: busStopCode,
      Services: services,
      timestamp: now.toISOString()
    };
  }

  // Get active live bus vehicles across Singapore for real-time map tracking
  public getLiveBusesForService(serviceNo?: string): LiveBusMarker[] {
    const activeServices = serviceNo ? [serviceNo] : ['190', '65', '14', '106', '36', '147'];
    const liveBuses: LiveBusMarker[] = [];
    const now = new Date();
    const timeSec = Math.floor(now.getTime() / 1000);

    activeServices.forEach(svc => {
      const route = BUS_ROUTES[svc];
      if (!route) return;

      const op = OPERATOR_BY_SERVICE[svc] || 'SBST';

      // Create 3-5 vehicles in circulation along the route
      const numBuses = 4;
      for (let i = 0; i < numBuses; i++) {
        // Vehicle cycle progress based on continuous time
        const cyclePeriod = 1200; // 20 min loop
        const offset = (i * (cyclePeriod / numBuses));
        const progress = ((timeSec + offset) % cyclePeriod) / cyclePeriod;

        // Interpolate along route stops
        const stopIndexFloat = progress * (route.stops.length - 1);
        const currIndex = Math.floor(stopIndexFloat);
        const nextIndex = Math.min(route.stops.length - 1, currIndex + 1);
        const segmentProgress = stopIndexFloat - currIndex;

        const currentStopInfo = route.stops[currIndex];
        const nextStopInfo = route.stops[nextIndex];

        const stopA = this.getBusStopByCode(currentStopInfo.busStopCode);
        const stopB = this.getBusStopByCode(nextStopInfo.busStopCode);

        if (!stopA || !stopB) continue;

        const lat = stopA.Latitude + (stopB.Latitude - stopA.Latitude) * segmentProgress;
        const lng = stopA.Longitude + (stopB.Longitude - stopA.Longitude) * segmentProgress;

        // Calculate heading angle in degrees
        const dLng = stopB.Longitude - stopA.Longitude;
        const dLat = stopB.Latitude - stopA.Latitude;
        const heading = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;

        const etaMins = Math.max(1, Math.round((1 - segmentProgress) * 4));
        const loadList: BusLoad[] = ['SEA', 'SDA', 'SEA', 'LSD'];
        const busLoad = loadList[(i + Math.floor(progress * 10)) % loadList.length];

        liveBuses.push({
          id: `SG-BUS-${svc}-${i + 1}`,
          serviceNo: svc,
          operator: op,
          latitude: +lat.toFixed(6),
          longitude: +lng.toFixed(6),
          heading: Math.round(heading),
          speedKmH: Math.round(28 + Math.sin(timeSec / 10 + i) * 12),
          load: busLoad,
          type: (i % 2 === 0 && ['190', '65', '14'].includes(svc)) ? 'DD' : 'SD',
          feature: 'WAB',
          plate: `SG${3800 + i * 110 + parseInt(svc, 10)}X`,
          nextBusStopCode: stopB.BusStopCode,
          nextBusStopName: stopB.Description,
          destinationName: route.destinationName,
          etaMinutes: etaMins
        });
      }
    });

    return liveBuses;
  }

  // Simple string hash for deterministic consistent mock updates
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

export const ltaService = new LTAService();
