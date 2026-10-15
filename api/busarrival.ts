/**
 * Serverless Bus Arrival endpoint for LTA DataMall v3
 * Route: /api/busarrival
 *
 * Example:
 * GET /api/busarrival?BusStopCode=83139
 * GET /api/busarrival?BusStopCode=83139&ServiceNo=15
 */

const LTA_BUS_ARRIVAL_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

export default async function handler(req: any, res?: any) {
  // Support CORS preflight
  const method = req.method || (req instanceof Request ? req.method : 'GET');
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');
      return res.status(204).end();
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, AccountKey'
      }
    });
  }

  // Parse query parameters from Node req or Web standard Request
  let busStopCode = '83139'; // Default sample code requested
  let serviceNo: string | undefined = undefined;

  if (req.query) {
    busStopCode = req.query.BusStopCode || req.query.busStopCode || busStopCode;
    serviceNo = req.query.ServiceNo || req.query.serviceNo;
  } else if (req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      busStopCode = parsedUrl.searchParams.get('BusStopCode') || parsedUrl.searchParams.get('busStopCode') || busStopCode;
      serviceNo = parsedUrl.searchParams.get('ServiceNo') || parsedUrl.searchParams.get('serviceNo') || undefined;
    } catch {
      // fallback
    }
  }

  // Fetch LTA Account Key from environment variables without hardcoding
  const ltaAccountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY ||
    (req.headers && (req.headers['accountkey'] || req.headers['AccountKey']));

  // If no API key is provided, return an informative response explaining how to configure it
  if (!ltaAccountKey) {
    const missingKeyResponse = {
      error: 'LTA_ACCOUNT_KEY is not configured',
      message: 'Please set the LTA_ACCOUNT_KEY environment variable with your LTA DataMall AccountKey.',
      documentation: 'https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html',
      BusStopCode: busStopCode,
      Services: []
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(503).json(missingKeyResponse);
    }

    return new Response(JSON.stringify(missingKeyResponse, null, 2), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const ltaUrl = new URL(LTA_BUS_ARRIVAL_ENDPOINT);
    ltaUrl.searchParams.set('BusStopCode', busStopCode);
    if (serviceNo) {
      ltaUrl.searchParams.set('ServiceNo', serviceNo);
    }

    const response = await fetch(ltaUrl.toString(), {
      method: 'GET',
      headers: {
        'AccountKey': ltaAccountKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorPayload = {
        error: 'LTA DataMall API request failed',
        statusCode: response.status,
        statusText: response.statusText,
        details: errorText,
        BusStopCode: busStopCode,
        Services: []
      };

      if (res && typeof res.status === 'function') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(response.status).json(errorPayload);
      }

      return new Response(JSON.stringify(errorPayload, null, 2), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const data = await response.json();

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=15');
      return res.status(200).json(data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=15, s-maxage=15'
      }
    });
  } catch (error: any) {
    const failurePayload = {
      error: 'Internal server error while connecting to LTA DataMall',
      message: error?.message || 'Unknown network error',
      BusStopCode: busStopCode,
      Services: []
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json(failurePayload);
    }

    return new Response(JSON.stringify(failurePayload, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
