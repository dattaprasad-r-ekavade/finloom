/**
 * Live scrip search — replaces the old mocked market data lookup.
 * Searches AngelOne for matching instruments across NSE, MCX, and NFO.
 */

import { NextRequest } from 'next/server';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import { requireOneOfRoles } from '@/lib/apiAuth';
import { getAngelOneSession } from '@/lib/angelone';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';

async function searchExchange(
  exchange: string,
  searchscrip: string,
  jwtToken: string,
  apiKey: string,
): Promise<any[]> {
  try {
    const res = await fetch(
      `${ANGELONE_BASE_URL}/rest/secure/angelbroking/order/v1/searchScrip`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '192.168.1.1',
          'X-ClientPublicIP': '192.168.1.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'X-PrivateKey': apiKey,
        },
        body: JSON.stringify({ exchange, searchscrip }),
        signal: AbortSignal.timeout(5000),
      },
    );
    const data = await res.json();
    if (!res.ok || data.status === false || !Array.isArray(data.data)) return [];
    return data.data.map((item: any) => ({
      scrip: item.tradingsymbol,
      scripFullName: item.name ?? item.tradingsymbol,
      ltp: 0,
      exchange,
      symbolToken: item.symboltoken,
    }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
    if (!session) {
      return ErrorHandlers.unauthorized('Unauthorized');
    }

    const search = request.nextUrl.searchParams.get('search')?.trim();
    if (!search || search.length < 2) {
      return successResponse({ marketData: [] });
    }

    let angelSession;
    try {
      angelSession = await getAngelOneSession();
    } catch (sessionError) {
      console.error('AngelOne session unavailable for scrip search:', sessionError);
      return successResponse({ marketData: [] });
    }

    const [nseResults, mcxResults, nfoResults] = await Promise.all([
      searchExchange('NSE', search, angelSession.jwtToken, angelSession.apiKey),
      searchExchange('MCX', search, angelSession.jwtToken, angelSession.apiKey),
      searchExchange('NFO', search, angelSession.jwtToken, angelSession.apiKey),
    ]);

    const seen = new Set<string>();
    const marketData: any[] = [];
    for (const item of [...nseResults, ...mcxResults, ...nfoResults]) {
      const key = `${item.exchange}:${item.scrip}`;
      if (!seen.has(key)) {
        seen.add(key);
        marketData.push(item);
      }
    }

    return successResponse({ marketData: marketData.slice(0, 50) });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return successResponse({ marketData: [] });
  }
}
