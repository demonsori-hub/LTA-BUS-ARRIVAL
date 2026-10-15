/**
 * Serverless Health Check endpoint
 * Route: /api/health
 */

export default async function handler(req: any, res?: any) {
  const ltaKeyConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY || process.env.LTA_API_KEY || process.env.ACCOUNT_KEY
  );

  const payload = {
    status: 'ok',
    service: 'lta-datamall-serverless-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: typeof process.uptime === 'function' ? Math.round(process.uptime()) : 0,
    ltaKeyConfigured,
    endpoints: {
      health: '/api/health',
      busArrival: '/api/busarrival?BusStopCode=83139'
    }
  };

  // Express / Node standard response
  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(payload);
  }

  // Web Standard Response (Vercel / Edge Serverless)
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
