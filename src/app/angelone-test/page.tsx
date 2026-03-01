'use client';

import { useState } from 'react';
import * as OTPAuth from 'otplib';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AngelOneTestPage() {
  const [tabValue, setTabValue] = useState(0);
  
  // Auth credentials
  const [apiKey, setApiKey] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [mpin, setMpin] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [generatedTotp, setGeneratedTotp] = useState('');
  
  // Token
  const [jwtToken, setJwtToken] = useState('');
  
  // Response
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Market Data params
  const [mode, setMode] = useState('FULL');
  const [exchangeTokens, setExchangeTokens] = useState('');
  
  // Search scrip params
  const [searchExchange, setSearchExchange] = useState('NSE');
  const [searchScrip, setSearchScrip] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Order params
  const [variety, setVariety] = useState('NORMAL');
  const [tradingSymbol, setTradingSymbol] = useState('SBIN-EQ');
  const [symbolToken, setSymbolToken] = useState('3045');
  const [transactionType, setTransactionType] = useState('BUY');
  const [exchange, setExchange] = useState('NSE');
  const [orderType, setOrderType] = useState('MARKET');
  const [productType, setProductType] = useState('INTRADAY');
  const [duration, setDuration] = useState('DAY');
  const [price, setPrice] = useState('0');
  const [quantity, setQuantity] = useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setResponse(null);
  };

  const handleApiCall = async (endpoint: string, method: string, body?: any) => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch(`/api/angelone-test/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          clientCode,
          jwtToken,
          ...body,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'API call failed');
      } else {
        setResponse(data);
        
        // Save tokens if login was successful
        if (endpoint === 'login' && data.data?.jwtToken) {
          setJwtToken(data.data.jwtToken);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Generate TOTP from secret
    let totpCode = '';
    if (totpSecret) {
      try {
        totpCode = OTPAuth.authenticator.generate(totpSecret);
        setGeneratedTotp(totpCode);
      } catch {
        setError('Invalid TOTP secret key');
        return;
      }
    }
    
    handleApiCall('login', 'POST', {
      mpin,
      totp: totpCode,
    });
  };

  const handleGetProfile = () => {
    handleApiCall('profile', 'GET');
  };

  const handleSearchScrip = async () => {
    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const res = await fetch('/api/angelone-test/search-scrip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          jwtToken,
          exchange: searchExchange,
          searchScrip: searchScrip,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Search failed');
      } else {
        setSearchResults(data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMarketData = () => {
    // Parse exchangeTokens input and format correctly for API
    const tokensMap: { [key: string]: string[] } = {};
    
    exchangeTokens.split(',').forEach(item => {
      const [exchange, token] = item.trim().split(':');
      if (exchange && token) {
        if (!tokensMap[exchange]) {
          tokensMap[exchange] = [];
        }
        tokensMap[exchange].push(token);
      }
    });

    handleApiCall('market-data', 'POST', {
      mode,
      exchangeTokens: tokensMap,
    });
  };

  const handlePlaceOrder = () => {
    handleApiCall('place-order', 'POST', {
      variety,
      tradingSymbol,
      symbolToken,
      transactionType,
      exchange,
      orderType,
      productType,
      duration,
      price: parseFloat(price),
      quantity: parseInt(quantity),
    });
  };

  const handleGetOrderBook = () => {
    handleApiCall('order-book', 'GET');
  };

  const handleGetPositions = () => {
    handleApiCall('positions', 'GET');
  };

  const handleGetHoldings = () => {
    handleApiCall('holdings', 'GET');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AngelOne SmartAPI Test Interface
      </Typography>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          API Credentials
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              helperText="Your AngelOne API Key"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Client Code"
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
              helperText="Your AngelOne Client Code"
            />
          </Grid>
        </Grid>

        {jwtToken && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success">
              Session Active - JWT Token: {jwtToken.substring(0, 20)}...
            </Alert>
          </Box>
        )}
      </Paper>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Authentication" />
          <Tab label="Market Data" />
          <Tab label="Orders" />
          <Tab label="Portfolio" />
        </Tabs>

        {/* Authentication Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="MPIN"
                type="password"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                helperText="Your 4-digit AngelOne MPIN"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="TOTP Secret Key"
                value={totpSecret}
                onChange={(e) => setTotpSecret(e.target.value)}
                helperText="Your TOTP secret key (e.g., 4Q64HNKKRN3NXBOUEWDKV...) - will auto-generate 6-digit code"
              />
              {generatedTotp && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Generated TOTP Code: <strong>{generatedTotp}</strong>
                </Alert>
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={loading || !apiKey || !clientCode || !mpin}
              >
                {loading ? 'Logging in...' : 'Login / Generate Session'}
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                onClick={handleGetProfile}
                disabled={loading || !jwtToken}
              >
                Get Profile
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Market Data Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Search Scrip
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Exchange</InputLabel>
                <Select
                  value={searchExchange}
                  label="Exchange"
                  onChange={(e) => setSearchExchange(e.target.value)}
                >
                  <MenuItem value="NSE">NSE</MenuItem>
                  <MenuItem value="BSE">BSE</MenuItem>
                  <MenuItem value="NFO">NFO</MenuItem>
                  <MenuItem value="MCX">MCX</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Search Scrip Name"
                value={searchScrip}
                onChange={(e) => setSearchScrip(e.target.value)}
                placeholder="e.g., SBIN, RELIANCE, INFY"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSearchScrip}
                disabled={loading || !jwtToken || !searchScrip}
                sx={{ height: '56px' }}
              >
                Search
              </Button>
            </Grid>
            {searchResults.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Search Results (Click to use):
                    </Typography>
                    {searchResults.map((result, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1,
                          mb: 1,
                          cursor: 'pointer',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          '&:hover': { backgroundColor: '#e0e0e0' },
                        }}
                        onClick={() => {
                          setTradingSymbol(result.tradingsymbol);
                          setSymbolToken(result.symboltoken);
                          setExchange(result.exchange);
                          setExchangeTokens(`${result.exchange}:${result.symboltoken}`);
                        }}
                      >
                        <Typography variant="body2">
                          <strong>{result.tradingsymbol}</strong> - Token: {result.symboltoken} ({result.exchange})
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Get Market Data
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select
                  value={mode}
                  label="Mode"
                  onChange={(e) => setMode(e.target.value)}
                >
                  <MenuItem value="FULL">FULL</MenuItem>
                  <MenuItem value="OHLC">OHLC</MenuItem>
                  <MenuItem value="LTP">LTP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Exchange Tokens"
                value={exchangeTokens}
                onChange={(e) => setExchangeTokens(e.target.value)}
                helperText="Format: NSE:3045, BSE:532540 (comma-separated)"
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handleGetMarketData}
                disabled={loading || !jwtToken}
              >
                Get Market Data
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Variety</InputLabel>
                <Select
                  value={variety}
                  label="Variety"
                  onChange={(e) => setVariety(e.target.value)}
                >
                  <MenuItem value="NORMAL">NORMAL</MenuItem>
                  <MenuItem value="AMO">AMO</MenuItem>
                  <MenuItem value="STOPLOSS">STOPLOSS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={transactionType}
                  label="Transaction Type"
                  onChange={(e) => setTransactionType(e.target.value)}
                >
                  <MenuItem value="BUY">BUY</MenuItem>
                  <MenuItem value="SELL">SELL</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Trading Symbol"
                value={tradingSymbol}
                onChange={(e) => setTradingSymbol(e.target.value)}
                helperText="e.g., SBIN-EQ"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Symbol Token"
                value={symbolToken}
                onChange={(e) => setSymbolToken(e.target.value)}
                helperText="e.g., 3045"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Exchange</InputLabel>
                <Select
                  value={exchange}
                  label="Exchange"
                  onChange={(e) => setExchange(e.target.value)}
                >
                  <MenuItem value="NSE">NSE</MenuItem>
                  <MenuItem value="BSE">BSE</MenuItem>
                  <MenuItem value="NFO">NFO</MenuItem>
                  <MenuItem value="MCX">MCX</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={orderType}
                  label="Order Type"
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <MenuItem value="MARKET">MARKET</MenuItem>
                  <MenuItem value="LIMIT">LIMIT</MenuItem>
                  <MenuItem value="STOPLOSS_LIMIT">STOPLOSS_LIMIT</MenuItem>
                  <MenuItem value="STOPLOSS_MARKET">STOPLOSS_MARKET</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={productType}
                  label="Product Type"
                  onChange={(e) => setProductType(e.target.value)}
                >
                  <MenuItem value="DELIVERY">DELIVERY</MenuItem>
                  <MenuItem value="INTRADAY">INTRADAY</MenuItem>
                  <MenuItem value="MARGIN">MARGIN</MenuItem>
                  <MenuItem value="BO">BO (Bracket Order)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={duration}
                  label="Duration"
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <MenuItem value="DAY">DAY</MenuItem>
                  <MenuItem value="IOC">IOC (Immediate or Cancel)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                helperText="0 for MARKET orders"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePlaceOrder}
                disabled={loading || !jwtToken}
                sx={{ mr: 2 }}
              >
                Place Order
              </Button>
              <Button
                variant="outlined"
                onClick={handleGetOrderBook}
                disabled={loading || !jwtToken}
              >
                Get Order Book
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Portfolio Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handleGetPositions}
                disabled={loading || !jwtToken}
                sx={{ mr: 2 }}
              >
                Get Positions
              </Button>
              <Button
                variant="contained"
                onClick={handleGetHoldings}
                disabled={loading || !jwtToken}
              >
                Get Holdings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Response Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {response && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Response
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              component="pre"
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '500px',
              }}
            >
              {JSON.stringify(response, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

