'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ScripOption, ScripSearchAutocomplete } from './ScripSearchAutocomplete';

export interface OrderPayload {
  scrip: ScripOption;
  quantity: number;
  tradeType: 'BUY' | 'SELL';
  orderDetails?: {
    scrip: string;
    scripFullName: string;
    quantity: number;
    tradeType: 'BUY' | 'SELL';
    estimatedValue: number;
    capitalPercentage: number;
  };
}

interface OrderFormProps {
  challengeId: string;
  selectedScrip: ScripOption | null;
  onSelectScrip: (option: ScripOption | null) => void;
  capitalAvailable: number;
  onPlaceOrder: (payload: OrderPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const OrderForm: React.FC<OrderFormProps> = ({
  selectedScrip,
  onSelectScrip,
  capitalAvailable,
  onPlaceOrder,
  isSubmitting = false,
}) => {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<string>('1');
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!selectedScrip) {
      setError('Select a scrip to place an order.');
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('Enter a valid quantity greater than zero.');
      return;
    }

    setError(null);
    await onPlaceOrder({
      scrip: selectedScrip,
      quantity: Math.floor(parsedQuantity),
      tradeType,
    });
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Place Order
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Available: <Box component="span" sx={{ fontWeight: 600, color: 'success.main' }}>
            {currencyFormatter.format(Math.max(0, capitalAvailable))}
          </Box>
        </Typography>
      </Stack>

      {selectedScrip && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="caption" color="text.secondary">Symbol</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{selectedScrip.scrip}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" color="text.secondary">LTP</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>₹{selectedScrip.ltp.toFixed(2)}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" color="text.secondary">Exchange</Typography>
              <Typography variant="body2">{selectedScrip.exchange}</Typography>
            </Box>
          </Stack>
        </Box>
      )}

      <Stack direction="row" spacing={1.5}>
        <ToggleButtonGroup
          exclusive
          color="primary"
          value={tradeType}
          onChange={(_event, next) => {
            if (next) {
              setTradeType(next);
            }
          }}
          size="small"
          sx={{ flex: 1 }}
        >
          <ToggleButton value="BUY" sx={{ flex: 1 }}>
            Buy
          </ToggleButton>
          <ToggleButton value="SELL" sx={{ flex: 1 }}>
            Sell
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          inputProps={{ min: 1 }}
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      {/* Preset Quantity Buttons */}
      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
        {[10, 25, 50, 100].map((preset) => (
          <Button
            key={preset}
            size="small"
            variant="outlined"
            onClick={() => setQuantity(preset.toString())}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              borderRadius: 1,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 1,
              },
            }}
          >
            {preset}
          </Button>
        ))}
      </Stack>

      {error && (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setQuantity('1');
            setError(null);
          }}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2,
            },
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handlePlaceOrder}
          disabled={!selectedScrip || isSubmitting}
          sx={{ 
            flex: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            tradeType === 'BUY' ? 'Place Buy Order' : 'Place Sell Order'
          )}
        </Button>
      </Stack>
    </Stack>
  );
};
