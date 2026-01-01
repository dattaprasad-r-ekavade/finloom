'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Divider,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface OrderConfirmationDialogProps {
  open: boolean;
  orderDetails: {
    scrip: string;
    scripFullName: string;
    quantity: number;
    tradeType: 'BUY' | 'SELL';
    estimatedValue: number;
    capitalPercentage: number;
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
  open,
  orderDetails,
  onConfirm,
  onCancel,
}) => {
  if (!orderDetails) return null;

  const isLargeOrder = orderDetails.capitalPercentage > 30;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: isLargeOrder ? '2px solid' : '1px solid',
          borderColor: isLargeOrder ? 'warning.main' : 'divider',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {isLargeOrder && <WarningAmberIcon color="warning" />}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirm Order
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {isLargeOrder && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'warning.light',
                border: '1px solid',
                borderColor: 'warning.main',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                ⚠️ Large Order Warning
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.dark' }}>
                This order represents {orderDetails.capitalPercentage.toFixed(1)}% of your
                available capital.
              </Typography>
            </Box>
          )}

          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Symbol
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {orderDetails.scrip}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {orderDetails.scripFullName}
              </Typography>
            </Box>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: orderDetails.tradeType === 'BUY' ? 'success.main' : 'error.main',
                }}
              >
                {orderDetails.tradeType}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Quantity
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {orderDetails.quantity}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Estimated Value
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(orderDetails.estimatedValue)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Capital Used
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: isLargeOrder ? 'warning.main' : 'text.primary',
                }}
              >
                {orderDetails.capitalPercentage.toFixed(1)}%
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onCancel} variant="outlined" sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={orderDetails.tradeType === 'BUY' ? 'success' : 'error'}
          sx={{ flex: 1, fontWeight: 600 }}
          autoFocus
        >
          Confirm {orderDetails.tradeType}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderConfirmationDialog;
