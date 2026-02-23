'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AngelOneChart } from '@/components/trading/AngelOneChart';
import Navbar from '@/components/Navbar';
import { Container } from '@mui/material';

interface MarketData {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function LiveTradingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('SBIN-EQ');
  const [selectedExchange, setSelectedExchange] = useState('NSE');
  const [symbolToken, setSymbolToken] = useState('3045');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<CandleData[]>([]);
  const [chartInterval, setChartInterval] = useState('FIVE_MINUTE');
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const isInitialChartLoadRef = useRef(true);

  const wsRef = useRef<WebSocket | null>(null);
  const sessionRef = useRef<any>(null);

  // Initialize connection on mount
  useEffect(() => {
    initializeConnection();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Fetch historical data when symbol or interval changes
  useEffect(() => {
    if (isConnected && symbolToken) {
      isInitialChartLoadRef.current = true;
      fetchHistoricalData();
    }
  }, [symbolToken, selectedExchange, chartInterval, isConnected]);

  // Auto-refresh chart data every 5 seconds (silent, no loader)
  useEffect(() => {
    if (!isConnected || !symbolToken) return;

    const intervalId = setInterval(() => {
      fetchHistoricalData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isConnected, symbolToken, selectedExchange, chartInterval]);

  const fetchHistoricalData = async () => {
    // Only show loading on initial load or when no data exists
    if (isInitialChartLoadRef.current) {
      setIsLoadingChart(true);
    }

    try {
      // Calculate date range based on interval
      const now = new Date();
      const toDate = now.toISOString().slice(0, 16).replace('T', ' ');

      let daysBack = 1;
      switch (chartInterval) {
        case 'ONE_MINUTE': daysBack = 1; break;
        case 'THREE_MINUTE': daysBack = 2; break;
        case 'FIVE_MINUTE': daysBack = 3; break;
        case 'FIFTEEN_MINUTE': daysBack = 7; break;
        case 'THIRTY_MINUTE': daysBack = 15; break;
        case 'ONE_HOUR': daysBack = 30; break;
        case 'ONE_DAY': daysBack = 365; break;
      }

      const fromDateObj = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const fromDate = fromDateObj.toISOString().slice(0, 16).replace('T', ' ');

      const res = await fetch('/api/angelone-live/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: selectedExchange,
          symbolToken: symbolToken,
          interval: chartInterval,
          fromDate: fromDate,
          toDate: toDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        // Transform data: [timestamp, open, high, low, close, volume]
        const candleData = data.data.map((candle: any[]) => ({
          time: Math.floor(new Date(candle[0]).getTime() / 1000),
          open: candle[1],
          high: candle[2],
          low: candle[3],
          close: candle[4],
          volume: candle[5],
        }));
        setHistoricalData(candleData);
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
    } finally {
      setIsLoadingChart(false);
      isInitialChartLoadRef.current = false;
    }
  };

  const initializeConnection = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get session from server
      const sessionRes = await fetch('/api/angelone-live/session');
      const sessionData = await sessionRes.json();

      if (!sessionRes.ok) {
        throw new Error(sessionData.error || 'Failed to initialize session');
      }

      sessionRef.current = sessionData.data;
      setIsConnected(true);

      // Connect to WebSocket
      connectWebSocket(sessionData.data);
    } catch (err: any) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = (session: any) => {
    const wsUrl = `wss://smartapisocket.angelone.in/smart-stream?clientCode=${session.clientCode}&feedToken=${session.feedToken}&apiKey=${session.apiKey}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to initial symbol
      subscribeToSymbol(selectedExchange, symbolToken);

      // Start heartbeat
      const heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 30000);

      ws.addEventListener('close', () => {
        clearInterval(heartbeatInterval);
      });
    };

    ws.onmessage = async (event) => {
      if (event.data === 'pong') {
        return; // Heartbeat response
      }

      if (typeof event.data === 'string') {
        try {
          const errorData = JSON.parse(event.data);
          console.error('WebSocket error:', errorData);
          setError(errorData.errorMessage || 'WebSocket error');
        } catch (e) {
          console.log('WebSocket text message:', event.data);
        }
      } else if (event.data instanceof Blob) {
        // Binary data as Blob - convert to ArrayBuffer
        const arrayBuffer = await event.data.arrayBuffer();
        parseMarketData(arrayBuffer);
      } else if (event.data instanceof ArrayBuffer) {
        // Binary data as ArrayBuffer
        parseMarketData(event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
  };

  const subscribeToSymbol = (exchange: string, token: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const exchangeTypeMap: { [key: string]: number } = {
      'NSE': 1,
      'NFO': 2,
      'BSE': 3,
      'BFO': 4,
      'MCX': 5,
      'NCX': 7,
      'CDS': 13,
    };

    const subscriptionMessage = {
      correlationID: `sub_${Date.now()}`,
      action: 1, // Subscribe
      params: {
        mode: 2, // Quote mode (LTP=1, Quote=2, SnapQuote=3)
        tokenList: [
          {
            exchangeType: exchangeTypeMap[exchange] || 1,
            tokens: [token],
          },
        ],
      },
    };

    wsRef.current.send(JSON.stringify(subscriptionMessage));
    console.log('Subscribed to:', exchange, token);
  };

  const parseMarketData = (buffer: ArrayBuffer) => {
    try {
      const view = new DataView(buffer);

      // Parse according to WebSocket 2.0 specification
      const mode = view.getUint8(0);
      const exchangeType = view.getUint8(1);

      // Skip token parsing for simplicity
      const ltp = view.getInt32(43, true) / 100; // Convert from paise
      const ltq = Number(view.getBigInt64(51, true));
      const avgPrice = Number(view.getBigInt64(59, true)) / 100;
      const volume = Number(view.getBigInt64(67, true));
      const open = Number(view.getBigInt64(91, true)) / 100;
      const high = Number(view.getBigInt64(99, true)) / 100;
      const low = Number(view.getBigInt64(107, true)) / 100;
      const close = Number(view.getBigInt64(115, true)) / 100;

      const change = ltp - close;
      const changePercent = close !== 0 ? (change / close) * 100 : 0;

      setMarketData({
        ltp,
        open,
        high,
        low,
        close,
        volume,
        change,
        changePercent,
      });
    } catch (err) {
      console.error('Error parsing market data:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !sessionRef.current) return;

    try {
      const res = await fetch('/api/angelone-live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: selectedExchange,
          searchScrip: searchQuery,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSymbolSelect = (result: any) => {
    setSelectedSymbol(result.tradingsymbol);
    setSymbolToken(result.symboltoken);
    setSelectedExchange(result.exchange);
    setSearchResults([]);
    setSearchQuery('');

    // Subscribe to new symbol
    subscribeToSymbol(result.exchange, result.symboltoken);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Live Market Data - {selectedSymbol}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Search Scrip"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Exchange</InputLabel>
            <Select
              value={selectedExchange}
              label="Exchange"
              onChange={(e) => setSelectedExchange(e.target.value)}
            >
              <MenuItem value="NSE">NSE</MenuItem>
              <MenuItem value="BSE">BSE</MenuItem>
              <MenuItem value="NFO">NFO</MenuItem>
              <MenuItem value="MCX">MCX</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Button fullWidth variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Interval</InputLabel>
            <Select
              value={chartInterval}
              label="Interval"
              onChange={(e) => setChartInterval(e.target.value)}
            >
              <MenuItem value="ONE_MINUTE">1 Minute</MenuItem>
              <MenuItem value="THREE_MINUTE">3 Minutes</MenuItem>
              <MenuItem value="FIVE_MINUTE">5 Minutes</MenuItem>
              <MenuItem value="FIFTEEN_MINUTE">15 Minutes</MenuItem>
              <MenuItem value="THIRTY_MINUTE">30 Minutes</MenuItem>
              <MenuItem value="ONE_HOUR">1 Hour</MenuItem>
              <MenuItem value="ONE_DAY">1 Day</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            sx={{ mr: 2 }}
          />
          {!isConnected && (
            <Button size="small" variant="outlined" onClick={initializeConnection}>
              Reconnect
            </Button>
          )}
        </Grid>
      </Grid>

      {searchResults.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Search Results:
          </Typography>
          {searchResults.map((result, index) => (
            <Chip
              key={index}
              label={`${result.tradingsymbol} (${result.symboltoken})`}
              onClick={() => handleSymbolSelect(result)}
              sx={{ m: 0.5, cursor: 'pointer' }}
            />
          ))}
        </Paper>
      )}

      {marketData && (
        <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Typography color="text.secondary" variant="caption">
                  LTP
                </Typography>
                <Typography variant="h6">₹{marketData.ltp.toFixed(2)}</Typography>
                <Typography
                  variant="body2"
                  color={marketData.change >= 0 ? 'success.main' : 'error.main'}
                >
                  {marketData.change >= 0 ? '+' : ''}
                  {marketData.change.toFixed(2)} ({marketData.changePercent.toFixed(2)}%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Typography color="text.secondary" variant="caption">
                  Open
                </Typography>
                <Typography variant="h6">₹{marketData.open.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Typography color="text.secondary" variant="caption">
                  High
                </Typography>
                <Typography variant="h6" color="success.main">
                  ₹{marketData.high.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Typography color="text.secondary" variant="caption">
                  Low
                </Typography>
                <Typography variant="h6" color="error.main">
                  ₹{marketData.low.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Typography color="text.secondary" variant="caption">
                  Prev Close
                </Typography>
                <Typography variant="h6">₹{marketData.close.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Typography color="text.secondary" variant="caption">
                  Volume
                </Typography>
                <Typography variant="h6">{marketData.volume.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 2 }}>
        {isLoadingChart && historicalData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 300, md: 450, lg: 600 } }}>
            <CircularProgress />
          </Box>
        ) : historicalData.length > 0 ? (
          <Box sx={{ height: { xs: 300, md: 450, lg: 600 } }}>
            <AngelOneChart data={historicalData} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 300, md: 450, lg: 600 } }}>
            <Typography color="text.secondary">No chart data available</Typography>
          </Box>
        )}
      </Paper>
      </Container>
    </Box>
  );
}
