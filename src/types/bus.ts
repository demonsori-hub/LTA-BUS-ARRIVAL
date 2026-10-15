export type BusLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing
export type BusFeature = 'WAB' | ''; // Wheelchair Accessible Bus
export type BusType = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy

export interface BusStop {
  BusStopCode: string; // 5-digit code e.g. "09048"
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
  Region?: 'Central' | 'East' | 'West' | 'North' | 'CBD';
  MrtNearby?: string;
}

export interface NextBusInfo {
  EstimatedArrival: string; // ISO 8601 string
  Latitude: number;
  Longitude: number;
  VisitNumber: number;
  Load: BusLoad;
  Feature: BusFeature;
  Type: BusType;
  OriginCode?: string;
  DestinationCode?: string;
  // Computed client-side fields
  minutesToArrival: number;
  secondsToArrival: number;
  isArrived: boolean;
  busPlate?: string;
  speedKmH?: number;
}

export interface BusServiceArrival {
  ServiceNo: string;
  Operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS';
  NextBus: NextBusInfo | null;
  NextBus2: NextBusInfo | null;
  NextBus3: NextBusInfo | null;
}

export interface BusStopArrivalData {
  BusStopCode: string;
  Services: BusServiceArrival[];
  timestamp: string;
}

export interface LiveBusMarker {
  id: string;
  serviceNo: string;
  operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS';
  latitude: number;
  longitude: number;
  heading: number; // 0 to 360 deg
  speedKmH: number;
  load: BusLoad;
  type: BusType;
  feature: BusFeature;
  plate: string;
  nextBusStopCode: string;
  nextBusStopName: string;
  destinationName: string;
  etaMinutes: number;
}

export interface BusRouteStop {
  busStopCode: string;
  sequence: number;
  distanceKm: number;
}

export interface BusRouteDetails {
  serviceNo: string;
  operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS';
  direction: 1 | 2;
  originName: string;
  originCode: string;
  destinationName: string;
  destinationCode: string;
  firstBus: string;
  lastBus: string;
  frequencyRange: string;
  stops: BusRouteStop[];
  waypoints?: [number, number][];
}

export interface CommuterAlarm {
  id: string;
  busStopCode: string;
  busStopName: string;
  serviceNo: string;
  thresholdMinutes: number;
  isActive: boolean;
  createdAt: number;
}
