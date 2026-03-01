/**
 * Server-Sent Events endpoint that streams live LTP ticks from AngelOne.
 * Clients connect with: GET /api/angelone-live/stream?symbolToken=X&exchange=Y&tradingSymbol=Z
 *
 * Each event: data: {"ltp":12345.5,"time":1709123456789}\n\n
 * Polls AngelOne getLtpData every ~1 second and forwards the result.
 */

import { NextRequest } from 'next/server';
import { requireOneOfRoles } from '@/lib/apiAuth';
import { getAngelOneSession } from '@/lib/angelone';

export const dynamic = 'force-dynamic';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';
const POLL_INTERVAL_MS = 1000; // 1 second

export async function GET(request: NextRequest) {
  const sessionUser = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
  if (!sessionUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const symbolToken = searchParams.get('symbolToken')?.trim();
  const exchange = searchParams.get('exchange')?.trim();
  const tradingSymbol = searchParams.get('tradingSymbol')?.trim();

  if (!symbolToken || !exchange || !tradingSymbol) {
    return new Response('Missing required params: symbolToken, exchange, tradingSymbol', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let running = true;

      // Send a heartbeat comment every 20s to keep the connection alive through proxies
      const keepAliveTimer = setInterval(() => {
        if (!running) return;
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          // Controller already closed
        }
      }, 20_000);

      const cleanup = () => {
        running = false;
        clearInterval(keepAliveTimer);
        try { controller.close(); } catch { /* already closed */ }
      };

      request.signal.addEventListener('abort', cleanup);

      // Polling loop
      (async () => {
        let consecutiveErrors = 0;
        while (running) {
          const pollStart = Date.now();
          try {
            const session = await getAngelOneSession();
            const response = await fetch(
              `${ANGELONE_BASE_URL}/rest/secure/angelbroking/market/v1/getLtpData`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${session.jwtToken}`,
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-UserType': 'USER',
                  'X-SourceID': 'WEB',
                  'X-ClientLocalIP': '192.168.1.1',
                  'X-ClientPublicIP': '192.168.1.1',
                  'X-MACAddress': '00:00:00:00:00:00',
                  'X-PrivateKey': session.apiKey,
                },
                body: JSON.stringify({ exchange, tradingsymbol: tradingSymbol, symboltoken: symbolToken }),
                signal: AbortSignal.timeout(5000),
              },
            );

            // Use text() first so an HTML error page doesn't throw and spam the logs
            const rawText = await response.text();
            let data: Record<string, unknown> = {};
            try {
              data = rawText ? JSON.parse(rawText) : {};
            } catch {
              // Non-JSON (HTML gateway error, rate limit page, etc.) — treat as transient
              consecutiveErrors++;
              continue;
            }

            if (response.ok && (data as any).data?.ltp != null) {
              const tick = JSON.stringify({ ltp: (data as any).data.ltp, time: Date.now() });
              controller.enqueue(encoder.encode(`data: ${tick}\n\n`));
              consecutiveErrors = 0;
            } else if (
              response.status === 401 ||
              response.status === 403 ||
              data.errorcode === 'AG8001' ||
              data.errorCode === 'AG8001'
            ) {
              // Stale session — force refresh and retry immediately
              await getAngelOneSession({ forceRefresh: true });
              consecutiveErrors++;
            } else {
              consecutiveErrors++;
            }
          } catch (err) {
            if (!running) break;
            console.error('[SSE stream] poll error:', err);
            consecutiveErrors++;
          }

          if (!running) break;

          // Back off if we keep failing, but cap at 5s
          const backoff = Math.min(consecutiveErrors * 500, 5000);
          const elapsed = Date.now() - pollStart;
          const waitMs = Math.max(0, POLL_INTERVAL_MS - elapsed + backoff);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }

        cleanup();
      })();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
