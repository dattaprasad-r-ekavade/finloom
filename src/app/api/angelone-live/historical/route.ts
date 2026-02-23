import { NextRequest, NextResponse } from 'next/server';
import { getAngelOneSession } from '@/lib/angelone';
import { requireOneOfRoles } from '@/lib/apiAuth';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exchange, symbolToken, interval, fromDate, toDate } = body;

    if (!exchange || !symbolToken || !interval) {
      return NextResponse.json(
        { error: 'Missing required fields: exchange, symbolToken, interval' },
        { status: 400 }
      );
    }

    async function doFetchCandles(forceRefresh = false) {
      const session = await getAngelOneSession({ forceRefresh });

      const response = await fetch(`${ANGELONE_BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.jwtToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '192.168.1.1',
          'X-ClientPublicIP': '192.168.1.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'X-PrivateKey': session.apiKey,
        },
        body: JSON.stringify({
          exchange,
          symboltoken: symbolToken,
          interval,
          fromdate: fromDate,
          todate: toDate,
        }),
      });

      const responseText = await response.text();
      let data: Record<string, unknown>;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        return { ok: false, parseError: true, raw: responseText };
      }

      return { ok: response.ok, status: response.status, data };
    }

    let result = await doFetchCandles();

    // Retry with a fresh login if session is stale.
    // AngelOne uses both "status: false" and "success: false" depending on endpoint.
    const sessionStale =
      !result.parseError &&
      (
        result.status === 401 ||
        result.status === 403 ||
        (result.ok && result.data?.status === false) ||
        (result.ok && result.data?.success === false) ||
        (result.ok && (result.data?.errorCode === 'AG8001' || result.data?.errorcode === 'AG8001'))
      );

    if (sessionStale) {
      console.log(`AngelOne historical session stale (httpStatus=${result.status}, data.status=${result.data?.status}, data.success=${result.data?.success}, errorCode=${result.data?.errorCode || result.data?.errorcode}) — refreshing and retrying...`);
      result = await doFetchCandles(true);
    }

    if (result.parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON response from AngelOne API',
          details: (result.raw as string)?.substring(0, 500),
        },
        { status: 500 }
      );
    }

    if (!result.ok) {
      return NextResponse.json(
        {
          error: (result.data as Record<string, unknown>)?.message || 'Failed to fetch historical data',
          details: result.data,
        },
        { status: result.status }
      );
    }

    const data = result.data as Record<string, unknown>;

    if (data.status === false) {
      return NextResponse.json(
        {
          error: data.message || 'AngelOne returned no data even after session refresh',
          details: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Historical data error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
