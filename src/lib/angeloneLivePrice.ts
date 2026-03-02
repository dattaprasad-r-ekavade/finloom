/**
 * Server-side utility for fetching live prices from AngelOne.
 * Replaces all mockedMarketData usage in trading API routes.
 */

import { getAngelOneSession } from './angelone';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';

/**
 * AngelOne getCandleData requires dates in IST (UTC+5:30) formatted as "YYYY-MM-DD HH:mm".
 */
function toAngelOneDate(d: Date): string {
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 16).replace('T', ' ');
}

interface TokenCacheEntry {
  symbolToken: string;
  tradingSymbol: string;
  scripFullName: string;
  exchange: string;
}

// Process-level cache for symbol token lookups (avoids repeated search calls)
const tokenCache = new Map<string, TokenCacheEntry>();

function buildHeaders(jwtToken: string, apiKey: string) {
  return {
    Authorization: `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '192.168.1.1',
    'X-ClientPublicIP': '192.168.1.1',
    'X-MACAddress': '00:00:00:00:00:00',
    'X-PrivateKey': apiKey,
  };
}

/**
 * Strip TradingView/display suffixes from a symbol to get a searchable term.
 * e.g. "GOLD1!" → "GOLD", "NIFTY-EQ" → "NIFTY", "RELIANCE-EQ" → "RELIANCE"
 */
function toSearchTerm(scrip: string): string {
  // Remove -EQ, -BE etc suffixes kept for internal tracking
  const noSuffix = scrip.replace(/-[A-Z]+$/, '');
  // Remove TradingView special chars and trailing digits (futures contracts)
  const clean = noSuffix.replace(/[!@#]/g, '').replace(/\d+$/, '');
  return clean || noSuffix.replace(/[!@#]/g, '') || scrip;
}

/**
 * Resolve symbolToken + tradingSymbol for a scrip via AngelOne search.
 * Results are cached in memory for the lifetime of the process.
 */
export async function searchScripToken(
  scrip: string,
  exchange: string,
  forceRefresh = false,
): Promise<TokenCacheEntry | null> {
  const cacheKey = `${exchange}:${scrip.toUpperCase()}`;
  if (!forceRefresh && tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey)!;
  }

  const searchTerm = toSearchTerm(scrip);

  try {
    const session = await getAngelOneSession();
    const response = await fetch(
      `${ANGELONE_BASE_URL}/rest/secure/angelbroking/order/v1/searchScrip`,
      {
        method: 'POST',
        headers: buildHeaders(session.jwtToken, session.apiKey),
        body: JSON.stringify({ exchange, searchscrip: searchTerm }),
      },
    );

    const data = await response.json();

    if (!response.ok || data.status === false || !Array.isArray(data.data) || data.data.length === 0) {
      console.warn(`[angeloneLivePrice] searchScrip failed for ${exchange}:${scrip} (searched "${searchTerm}"):`, data?.message ?? data);
      return null;
    }

    // For NSE prefer -EQ equity; for MCX/NFO take first result (current active contract)
    const pick =
      exchange === 'NSE'
        ? (data.data.find((s: any) => s.tradingsymbol?.endsWith('-EQ')) ?? data.data[0])
        : data.data[0];

    if (!pick?.symboltoken) return null;

    const entry: TokenCacheEntry = {
      symbolToken: pick.symboltoken,
      tradingSymbol: pick.tradingsymbol,
      scripFullName: pick.name ?? pick.tradingsymbol,
      exchange,
    };
    tokenCache.set(cacheKey, entry);
    return entry;
  } catch (err) {
    console.error('[angeloneLivePrice] searchScripToken error:', err);
    return null;
  }
}

/**
 * Fetch live price for a scrip using getCandleData (1-min, last 5 min).
 * getLtpData is WAF-blocked for server-side requests; getCandleData works fine.
 * Returns the close price of the most recent completed/forming candle.
 */
export async function getLivePrice(
  scrip: string,
  exchange: string,
): Promise<{ ltp: number; symbolToken: string; tradingSymbol: string; scripFullName: string } | null> {
  const tokenInfo = await searchScripToken(scrip, exchange);
  if (!tokenInfo) return null;

  try {
    const session = await getAngelOneSession();
    const now = new Date();
    const from = new Date(now.getTime() - 5 * 60 * 1000); // last 5 min
    const response = await fetch(
      `${ANGELONE_BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
      {
        method: 'POST',
        headers: buildHeaders(session.jwtToken, session.apiKey),
        body: JSON.stringify({
          exchange,
          symboltoken: tokenInfo.symbolToken,
          interval: 'ONE_MINUTE',
          fromdate: toAngelOneDate(from),
          todate: toAngelOneDate(now),
        }),
        signal: AbortSignal.timeout(5000),
      },
    );

    const rawText = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.warn(`[angeloneLivePrice] Non-JSON response for ${exchange}:${scrip}`);
      return null;
    }

    if (!response.ok || data.status === false || !Array.isArray(data.data) || (data.data as any[]).length === 0) {
      // Session stale — retry once
      if (response.status === 401 || response.status === 403 || (data as any).errorcode === 'AG8001') {
        const freshSession = await getAngelOneSession({ forceRefresh: true });
        const retryResp = await fetch(
          `${ANGELONE_BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
          {
            method: 'POST',
            headers: buildHeaders(freshSession.jwtToken, freshSession.apiKey),
            body: JSON.stringify({
              exchange,
              symboltoken: tokenInfo.symbolToken,
              interval: 'ONE_MINUTE',
              fromdate: toAngelOneDate(from),
              todate: toAngelOneDate(now),
            }),
            signal: AbortSignal.timeout(5000),
          },
        );
        const retryRaw = await retryResp.text();
        let retryData: Record<string, unknown>;
        try { retryData = JSON.parse(retryRaw); } catch { return null; }
        if (retryResp.ok && Array.isArray(retryData.data) && (retryData.data as any[]).length > 0) {
          const last = (retryData.data as any[])[retryData.data.length - 1];
          return { ltp: last[4], ...tokenInfo };
        }
      }
      console.warn(`[angeloneLivePrice] getCandleData empty for ${exchange}:${scrip}:`, (data as any)?.message ?? data);
      return null;
    }

    const candles = data.data as any[];
    const last = candles[candles.length - 1];
    return { ltp: last[4], ...tokenInfo }; // close price
  } catch (err) {
    console.error('[angeloneLivePrice] getLivePrice error:', err);
    tokenCache.delete(`${exchange}:${scrip.toUpperCase()}`);
    return null;
  }
}

/**
 * Fetch live LTP for multiple scrips in parallel.
 * Returns a map of scrip -> ltp (uses entryPrice as fallback if lookup fails).
 */
export async function getLivePriceMap(
  scrips: Array<{ scrip: string; exchange: string; fallbackPrice: number }>,
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();

  const results = await Promise.allSettled(
    scrips.map(async ({ scrip, exchange, fallbackPrice }) => {
      const result = await getLivePrice(scrip, exchange);
      return { scrip, ltp: result?.ltp ?? fallbackPrice };
    }),
  );

  results.forEach((r) => {
    if (r.status === 'fulfilled') {
      priceMap.set(r.value.scrip, r.value.ltp);
    }
  });

  return priceMap;
}
