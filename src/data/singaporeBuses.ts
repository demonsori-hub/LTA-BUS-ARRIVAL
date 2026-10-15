import { BusStop, BusRouteDetails } from '../types/bus';

// Accurate Singapore LTA bus stops with realistic WGS84 coordinates
export const SG_BUS_STOPS: BusStop[] = [
  // Orchard / Somerset / Dhoby Ghaut
  {
    BusStopCode: '09048',
    RoadName: 'Orchard Rd',
    Description: 'Lucky Plaza',
    Latitude: 1.3045,
    Longitude: 103.8340,
    Region: 'Central',
    MrtNearby: 'Orchard (NS22/TE14)'
  },
  {
    BusStopCode: '09047',
    RoadName: 'Orchard Rd',
    Description: 'Tang Plaza',
    Latitude: 1.3051,
    Longitude: 103.8329,
    Region: 'Central',
    MrtNearby: 'Orchard (NS22/TE14)'
  },
  {
    BusStopCode: '09038',
    RoadName: 'Orchard Blvd',
    Description: 'Opp Orchard Stn Exit 13',
    Latitude: 1.3031,
    Longitude: 103.8315,
    Region: 'Central',
    MrtNearby: 'Orchard Blvd (TE13)'
  },
  {
    BusStopCode: '08138',
    RoadName: 'Somerset Rd',
    Description: 'Somerset Stn',
    Latitude: 1.3005,
    Longitude: 103.8385,
    Region: 'Central',
    MrtNearby: 'Somerset (NS23)'
  },
  {
    BusStopCode: '09059',
    RoadName: 'Penang Rd',
    Description: 'Winsland Hse',
    Latitude: 1.2998,
    Longitude: 103.8402,
    Region: 'Central',
    MrtNearby: 'Somerset (NS23)'
  },
  {
    BusStopCode: '08057',
    RoadName: 'Orchard Rd',
    Description: 'Dhoby Ghaut Stn',
    Latitude: 1.2990,
    Longitude: 103.8458,
    Region: 'Central',
    MrtNearby: 'Dhoby Ghaut (NS24/NE6/CC1)'
  },
  {
    BusStopCode: '04168',
    RoadName: 'Bras Basah Rd',
    Description: 'Dhoby Ghaut Stn Exit B',
    Latitude: 1.2982,
    Longitude: 103.8465,
    Region: 'Central',
    MrtNearby: 'Dhoby Ghaut (NS24/NE6/CC1)'
  },
  {
    BusStopCode: '01012',
    RoadName: 'Bras Basah Rd',
    Description: 'Hotel Rendezvous',
    Latitude: 1.2975,
    Longitude: 103.8504,
    Region: 'Central',
    MrtNearby: 'Bencoolen (DT21)'
  },

  // City Hall / Bugis / Victoria St
  {
    BusStopCode: '04179',
    RoadName: 'Stamford Rd',
    Description: 'City Hall Stn Exit B',
    Latitude: 1.2932,
    Longitude: 103.8523,
    Region: 'Central',
    MrtNearby: 'City Hall (NS25/EW13)'
  },
  {
    BusStopCode: '01019',
    RoadName: 'Victoria St',
    Description: 'Bras Basah Cplx',
    Latitude: 1.2965,
    Longitude: 103.8538,
    Region: 'Central',
    MrtNearby: 'Bras Basah (CC2)'
  },
  {
    BusStopCode: '01112',
    RoadName: 'Victoria St',
    Description: 'Bugis Stn Exit A',
    Latitude: 1.3007,
    Longitude: 103.8562,
    Region: 'Central',
    MrtNearby: 'Bugis (EW12/DT14)'
  },
  {
    BusStopCode: '01113',
    RoadName: 'Victoria St',
    Description: 'Bugis Stn Exit B',
    Latitude: 1.3002,
    Longitude: 103.8558,
    Region: 'Central',
    MrtNearby: 'Bugis (EW12/DT14)'
  },
  {
    BusStopCode: '02049',
    RoadName: 'Bras Basah Rd',
    Description: 'Raffles Hotel',
    Latitude: 1.2948,
    Longitude: 103.8546,
    Region: 'Central',
    MrtNearby: 'Esplanade (CC3)'
  },

  // Downtown / Raffles Place / Marina Bay / CBD
  {
    BusStopCode: '03019',
    RoadName: 'Chulia St',
    Description: 'Opp OCBC Ctr',
    Latitude: 1.2854,
    Longitude: 103.8496,
    Region: 'CBD',
    MrtNearby: 'Raffles Place (NS26/EW14)'
  },
  {
    BusStopCode: '03059',
    RoadName: 'Cecil St',
    Description: 'Prudential Twr',
    Latitude: 1.2831,
    Longitude: 103.8508,
    Region: 'CBD',
    MrtNearby: 'Raffles Place / Telok Ayer'
  },
  {
    BusStopCode: '03071',
    RoadName: 'Robinson Rd',
    Description: 'Opp The Ogilvy Ctr',
    Latitude: 1.2825,
    Longitude: 103.8512,
    Region: 'CBD',
    MrtNearby: 'Telok Ayer (DT18)'
  },
  {
    BusStopCode: '03218',
    RoadName: 'Hill St',
    Description: 'Opp The Treasury',
    Latitude: 1.2905,
    Longitude: 103.8498,
    Region: 'CBD',
    MrtNearby: 'Clarke Quay / City Hall'
  },
  {
    BusStopCode: '03229',
    RoadName: 'Hill St',
    Description: 'The Treasury',
    Latitude: 1.2911,
    Longitude: 103.8504,
    Region: 'CBD',
    MrtNearby: 'City Hall (NS25/EW13)'
  },
  {
    BusStopCode: '03511',
    RoadName: 'Bayfront Ave',
    Description: 'Marina Bay Sands MICE',
    Latitude: 1.2838,
    Longitude: 103.8587,
    Region: 'CBD',
    MrtNearby: 'Bayfront (CE1/DT16)'
  },
  {
    BusStopCode: '03509',
    RoadName: 'Bayfront Ave',
    Description: 'Marina Bay Sands Hotel',
    Latitude: 1.2843,
    Longitude: 103.8601,
    Region: 'CBD',
    MrtNearby: 'Bayfront (CE1/DT16)'
  },
  {
    BusStopCode: '02151',
    RoadName: 'Raffles Ave',
    Description: 'The Float @ Marina Bay',
    Latitude: 1.2892,
    Longitude: 103.8582,
    Region: 'CBD',
    MrtNearby: 'Promenade (CC4/DT15)'
  },

  // Chinatown / Clarke Quay
  {
    BusStopCode: '05019',
    RoadName: 'Eu Tong Sen St',
    Description: 'Clarke Quay Stn',
    Latitude: 1.2886,
    Longitude: 103.8467,
    Region: 'Central',
    MrtNearby: 'Clarke Quay (NE5)'
  },
  {
    BusStopCode: '05022',
    RoadName: 'Eu Tong Sen St',
    Description: 'Chinatown Stn Exit E',
    Latitude: 1.2842,
    Longitude: 103.8443,
    Region: 'Central',
    MrtNearby: 'Chinatown (NE4/DT19)'
  },
  {
    BusStopCode: '05013',
    RoadName: 'South Bridge Rd',
    Description: 'Opp Hong Lim Cpx',
    Latitude: 1.2858,
    Longitude: 103.8469,
    Region: 'Central',
    MrtNearby: 'Chinatown / Telok Ayer'
  },

  // West: Jurong East & Clementi & Buona Vista
  {
    BusStopCode: '28009',
    RoadName: 'Jurong Gateway Rd',
    Description: 'Jurong East Int',
    Latitude: 1.3336,
    Longitude: 103.7423,
    Region: 'West',
    MrtNearby: 'Jurong East (NS1/EW24)'
  },
  {
    BusStopCode: '28249',
    RoadName: 'Jurong Gateway Rd',
    Description: 'Jurong East Stn/Blk 131',
    Latitude: 1.3347,
    Longitude: 103.7431,
    Region: 'West',
    MrtNearby: 'Jurong East (NS1/EW24)'
  },
  {
    BusStopCode: '17179',
    RoadName: 'Commonwealth Ave West',
    Description: 'Clementi Stn Exit B',
    Latitude: 1.3152,
    Longitude: 103.7652,
    Region: 'West',
    MrtNearby: 'Clementi (EW23)'
  },
  {
    BusStopCode: '11369',
    RoadName: 'Commonwealth Ave',
    Description: 'Buona Vista Stn Exit D',
    Latitude: 1.3069,
    Longitude: 103.7904,
    Region: 'West',
    MrtNearby: 'Buona Vista (EW21/CC22)'
  },

  // East: Tampines, Bedok, Changi Airport
  {
    BusStopCode: '76191',
    RoadName: 'Tampines Ave 4',
    Description: 'Tampines Stn/Int',
    Latitude: 1.3533,
    Longitude: 103.9438,
    Region: 'East',
    MrtNearby: 'Tampines (EW2/DT32)'
  },
  {
    BusStopCode: '75009',
    RoadName: 'Tampines Central 1',
    Description: 'Tampines Int',
    Latitude: 1.3541,
    Longitude: 103.9442,
    Region: 'East',
    MrtNearby: 'Tampines (EW2/DT32)'
  },
  {
    BusStopCode: '84009',
    RoadName: 'Bedok North Dr',
    Description: 'Bedok Int',
    Latitude: 1.3242,
    Longitude: 103.9298,
    Region: 'East',
    MrtNearby: 'Bedok (EW5)'
  },
  {
    BusStopCode: '84039',
    RoadName: 'New Upper Changi Rd',
    Description: 'Bedok Stn Exit B',
    Latitude: 1.3236,
    Longitude: 103.9304,
    Region: 'East',
    MrtNearby: 'Bedok (EW5)'
  },
  {
    BusStopCode: '95029',
    RoadName: 'PTB2 Basement',
    Description: 'Changi Airport PTB2',
    Latitude: 1.3571,
    Longitude: 103.9892,
    Region: 'East',
    MrtNearby: 'Changi Airport (CG2)'
  },
  {
    BusStopCode: '95129',
    RoadName: 'PTB1 Basement',
    Description: 'Changi Airport PTB1',
    Latitude: 1.3601,
    Longitude: 103.9898,
    Region: 'East',
    MrtNearby: 'Changi Airport (CG2)'
  },
  {
    BusStopCode: '83139',
    RoadName: 'Marine Parade Rd',
    Description: 'Opp Blk 34',
    Latitude: 1.3032,
    Longitude: 103.9056,
    Region: 'East',
    MrtNearby: 'Marine Parade (TE26)'
  },

  // North / Central: Bishan, Toa Payoh, Ang Mo Kio, Woodlands
  {
    BusStopCode: '53009',
    RoadName: 'Bishan Place',
    Description: 'Bishan Int',
    Latitude: 1.3503,
    Longitude: 103.8497,
    Region: 'North',
    MrtNearby: 'Bishan (NS17/CC15)'
  },
  {
    BusStopCode: '52009',
    RoadName: 'Lor 6 Toa Payoh',
    Description: 'Toa Payoh Int',
    Latitude: 1.3328,
    Longitude: 103.8480,
    Region: 'Central',
    MrtNearby: 'Toa Payoh (NS19)'
  },
  {
    BusStopCode: '54261',
    RoadName: 'Ang Mo Kio Ave 8',
    Description: 'Ang Mo Kio Int',
    Latitude: 1.3698,
    Longitude: 103.8489,
    Region: 'North',
    MrtNearby: 'Ang Mo Kio (NS16)'
  },
  {
    BusStopCode: '46009',
    RoadName: 'Woodlands Sq',
    Description: 'Woodlands Int',
    Latitude: 1.4368,
    Longitude: 103.7865,
    Region: 'North',
    MrtNearby: 'Woodlands (NS9/TE2)'
  }
];

// Mapping of services calling at each bus stop
export const STOP_SERVICE_MAP: Record<string, string[]> = {
  // Orchard / Lucky Plaza
  '09048': ['190', '65', '14', '7', '106', '174', '36', '124', '167'],
  // Tang Plaza
  '09047': ['190', '65', '14', '7', '106', '174', '36', '105', '143'],
  // Opp Orchard Stn ION
  '09038': ['14', '65', '106', '111', '123', '174'],
  // Somerset Stn
  '08138': ['143', '162', '167', '7', '14', '65', '106'],
  // Winsland Hse
  '09059': ['7', '14', '16', '36', '65', '106', '174', '190'],
  // Dhoby Ghaut Stn
  '08057': ['7', '14', '16', '36', '65', '106', '174', '190', '857'],
  // Dhoby Ghaut Exit B
  '04168': ['7', '14', '16', '36', '65', '111', '174', '857'],
  // Hotel Rendezvous
  '01012': ['7', '14', '16', '36', '111', '131', '147', '166', '857'],
  // City Hall Exit B
  '04179': ['124', '147', '166', '174', '190', '857'],
  // Bras Basah Cplx
  '01019': ['2', '12', '33', '130', '133', '147', '190'],
  // Bugis Stn Exit A
  '01112': ['2', '12', '33', '130', '133', '147', '190', '960'],
  // Bugis Stn Exit B
  '01113': ['2', '12', '33', '130', '133', '147', '190', '960'],
  // Raffles Hotel
  '02049': ['14', '16', '36', '77', '106', '130', '133', '167'],
  // Opp OCBC Ctr
  '03019': ['186', '10', '70', '100', '107', '196', '130'],
  // Prudential Twr
  '03059': ['10', '70', '100', '107', '130', '196'],
  // Opp Ogilvy Ctr
  '03071': ['10', '70', '100', '107', '130', '196'],
  // Opp Treasury
  '03218': ['124', '147', '166', '174', '190'],
  // The Treasury
  '03229': ['124', '147', '166', '174', '190'],
  // MBS MICE
  '03511': ['97', '106', '133', '502', '518'],
  // MBS Hotel
  '03509': ['97', '106', '133', '502', '518'],
  // Float Marina Bay
  '02151': ['36', '56', '77', '97', '106', '195', '960'],
  // Clarke Quay Stn
  '05019': ['2', '12', '33', '54', '147', '190'],
  // Chinatown Exit E
  '05022': ['2', '12', '33', '54', '143', '147', '190'],
  // Opp Hong Lim
  '05013': ['61', '80', '145', '166', '197'],
  // Jurong East Int
  '28009': ['66', '78', '79', '97', '98', '105', '143', '197', '502'],
  // Jurong East Stn/Blk 131
  '28249': ['66', '78', '97', '143', '197', '502'],
  // Clementi Exit B
  '17179': ['7', '14', '96', '105', '106', '147', '156', '166'],
  // Buona Vista Exit D
  '11369': ['74', '91', '95', '100', '105', '106', '111', '147', '200'],
  // Tampines Int
  '75009': ['3', '10', '19', '23', '27', '28', '29', '31', '37', '65'],
  // Tampines Stn
  '76191': ['10', '23', '27', '31', '65'],
  // Bedok Int
  '84009': ['7', '9', '14', '16', '17', '18', '24', '26', '35', '60', '66', '69'],
  // Bedok Stn Exit B
  '84039': ['7', '9', '14', '24', '28', '31'],
  // Changi PTB2
  '95029': ['24', '27', '34', '36', '53', '110', '858'],
  // Changi PTB1
  '95129': ['24', '27', '34', '36', '53', '110', '858'],
  // Marine Parade Opp Blk 34
  '83139': ['15', '36', '43', '48', '134', '135', '196', '197', '966'],
  // Bishan Int
  '53009': ['52', '53', '54', '55', '56', '57', '58', '59', '410G', '410W'],
  // Toa Payoh Int
  '52009': ['8', '26', '28', '31', '73', '88', '90', '139', '141', '142', '143', '145'],
  // Ang Mo Kio Int
  '54261': ['25', '73', '76', '130', '133', '135', '136', '138', '166', '169', '261'],
  // Woodlands Int
  '46009': ['161', '168', '169', '178', '187', '856', '900', '901', '903', '911', '960']
};

export const OPERATOR_BY_SERVICE: Record<string, 'SBST' | 'SMRT' | 'TTS' | 'GAS'> = {
  '190': 'SMRT',
  '65': 'SBST',
  '14': 'SBST',
  '7': 'SBST',
  '106': 'TTS',
  '147': 'SBST',
  '36': 'GAS',
  '960': 'SMRT',
  '174': 'SBST',
  '10': 'SBST',
  '502': 'SBST',
  '857': 'TTS',
  '12': 'GAS',
  '2': 'GAS',
  '33': 'SBST',
  '130': 'SBST',
  '133': 'SBST',
  '124': 'SBST',
  '143': 'TTS',
  '166': 'SBST',
  '167': 'TTS',
  '97': 'TTS',
  '105': 'SBST',
  '24': 'SBST',
  '27': 'SBST'
};

// Detailed Singapore Bus Routes with ordered stop sequences
export const BUS_ROUTES: Record<string, BusRouteDetails> = {
  '190': {
    serviceNo: '190',
    operator: 'SMRT',
    direction: 1,
    originName: 'Choa Chu Kang Int',
    originCode: '44009',
    destinationName: 'Kampong Bahru Ter',
    destinationCode: '10049',
    firstBus: '05:30',
    lastBus: '23:30',
    frequencyRange: '4 - 8 mins',
    stops: [
      { busStopCode: '09047', sequence: 18, distanceKm: 14.2 }, // Tang Plaza
      { busStopCode: '09048', sequence: 19, distanceKm: 14.6 }, // Lucky Plaza
      { busStopCode: '09059', sequence: 20, distanceKm: 15.3 }, // Winsland Hse
      { busStopCode: '08057', sequence: 21, distanceKm: 15.8 }, // Dhoby Ghaut
      { busStopCode: '04179', sequence: 22, distanceKm: 16.5 }, // City Hall Exit B
      { busStopCode: '03218', sequence: 23, distanceKm: 17.1 }, // Opp The Treasury
      { busStopCode: '05019', sequence: 24, distanceKm: 17.6 }, // Clarke Quay
      { busStopCode: '05022', sequence: 25, distanceKm: 18.2 }  // Chinatown Exit E
    ]
  },
  '65': {
    serviceNo: '65',
    operator: 'SBST',
    direction: 1,
    originName: 'Tampines Int',
    originCode: '75009',
    destinationName: 'HarbourFront Int',
    destinationCode: '14009',
    firstBus: '05:30',
    lastBus: '23:45',
    frequencyRange: '5 - 10 mins',
    stops: [
      { busStopCode: '75009', sequence: 1, distanceKm: 0.0 },
      { busStopCode: '76191', sequence: 2, distanceKm: 0.6 },
      { busStopCode: '09048', sequence: 28, distanceKm: 18.4 },
      { busStopCode: '08138', sequence: 29, distanceKm: 19.1 },
      { busStopCode: '08057', sequence: 30, distanceKm: 19.8 }
    ]
  },
  '14': {
    serviceNo: '14',
    operator: 'SBST',
    direction: 1,
    originName: 'Bedok Int',
    originCode: '84009',
    destinationName: 'Clementi Int',
    destinationCode: '17009',
    firstBus: '05:30',
    lastBus: '23:50',
    frequencyRange: '6 - 11 mins',
    stops: [
      { busStopCode: '84009', sequence: 1, distanceKm: 0.0 },
      { busStopCode: '84039', sequence: 2, distanceKm: 0.8 },
      { busStopCode: '02049', sequence: 22, distanceKm: 13.9 },
      { busStopCode: '01012', sequence: 23, distanceKm: 14.5 },
      { busStopCode: '08057', sequence: 24, distanceKm: 15.1 },
      { busStopCode: '09048', sequence: 25, distanceKm: 16.0 },
      { busStopCode: '17179', sequence: 42, distanceKm: 26.3 }
    ]
  },
  '106': {
    serviceNo: '106',
    operator: 'TTS',
    direction: 1,
    originName: 'Bukit Batok Int',
    originCode: '43009',
    destinationName: 'Shenton Way Ter',
    destinationCode: '03239',
    firstBus: '05:30',
    lastBus: '23:45',
    frequencyRange: '5 - 9 mins',
    stops: [
      { busStopCode: '17179', sequence: 12, distanceKm: 7.2 },
      { busStopCode: '11369', sequence: 16, distanceKm: 10.4 },
      { busStopCode: '09047', sequence: 24, distanceKm: 15.6 },
      { busStopCode: '09048', sequence: 25, distanceKm: 16.0 },
      { busStopCode: '08138', sequence: 26, distanceKm: 16.7 },
      { busStopCode: '02151', sequence: 29, distanceKm: 18.5 },
      { busStopCode: '03511', sequence: 31, distanceKm: 19.8 },
      { busStopCode: '03059', sequence: 33, distanceKm: 21.2 }
    ]
  },
  '36': {
    serviceNo: '36',
    operator: 'GAS',
    direction: 1,
    originName: 'Changi Airport PTB2',
    originCode: '95029',
    destinationName: 'Tomlinson Rd (Loop)',
    destinationCode: '09191',
    firstBus: '05:45',
    lastBus: '23:58',
    frequencyRange: '7 - 12 mins',
    stops: [
      { busStopCode: '95029', sequence: 1, distanceKm: 0.0 },
      { busStopCode: '95129', sequence: 2, distanceKm: 0.9 },
      { busStopCode: '02151', sequence: 19, distanceKm: 21.0 },
      { busStopCode: '02049', sequence: 20, distanceKm: 21.8 },
      { busStopCode: '01012', sequence: 21, distanceKm: 22.4 },
      { busStopCode: '08057', sequence: 22, distanceKm: 23.0 },
      { busStopCode: '09048', sequence: 23, distanceKm: 23.9 }
    ]
  },
  '147': {
    serviceNo: '147',
    operator: 'SBST',
    direction: 1,
    originName: 'Hougang Central Int',
    originCode: '64009',
    destinationName: 'Jurong East Int',
    destinationCode: '28009',
    firstBus: '05:30',
    lastBus: '23:30',
    frequencyRange: '6 - 10 mins',
    stops: [
      { busStopCode: '01112', sequence: 20, distanceKm: 13.5 },
      { busStopCode: '01019', sequence: 21, distanceKm: 14.1 },
      { busStopCode: '01012', sequence: 22, distanceKm: 14.8 },
      { busStopCode: '04179', sequence: 23, distanceKm: 15.4 },
      { busStopCode: '03218', sequence: 24, distanceKm: 15.9 },
      { busStopCode: '05019', sequence: 25, distanceKm: 16.5 },
      { busStopCode: '05022', sequence: 26, distanceKm: 17.2 },
      { busStopCode: '11369', sequence: 34, distanceKm: 22.8 },
      { busStopCode: '17179', sequence: 38, distanceKm: 25.5 },
      { busStopCode: '28009', sequence: 42, distanceKm: 28.6 }
    ]
  }
};
