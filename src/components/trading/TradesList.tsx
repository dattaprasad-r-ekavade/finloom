'use client';

import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { formatDateTime } from '@/lib/dateFormat';

export interface TradeRecord {
  id: string;
  challengeId: string;
  scrip: string;
  scripFullName: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  tradeType: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED';
  pnl: number;
  entryTime: string;
  exitTime: string | null;
  autoSquaredOff: boolean;
}

interface TradesListProps {
  trades: TradeRecord[];
  onSquareOff: (tradeId: string) => Promise<void>;
  processingTrades: Set<string>;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const TradesList: React.FC<TradesListProps> = ({
  trades,
  onSquareOff,
  processingTrades,
}) => {
  const hasTrades = trades.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Trade History
        </Typography>
        <Chip
          label={`${trades.filter((trade) => trade.status === 'OPEN').length} open`}
          color="primary"
          size="small"
          variant="outlined"
        />
      </Box>

      {hasTrades ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Entry</TableCell>
                <TableCell align="right">Exit</TableCell>
                <TableCell align="right">P&L</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Times</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.map((trade) => {
                const isOpen = trade.status === 'OPEN';
                const pnlTone = trade.pnl >= 0 ? 'success.main' : 'error.main';
                const isProcessing = processingTrades.has(trade.id);
                return (
                  <TableRow hover key={trade.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {trade.scrip}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {trade.scripFullName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={trade.tradeType}
                        color={trade.tradeType === 'BUY' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{trade.quantity}</TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(trade.entryPrice)}
                    </TableCell>
                    <TableCell align="right">
                      {trade.exitPrice
                        ? currencyFormatter.format(trade.exitPrice)
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: pnlTone, fontWeight: 600 }}>
                        {currencyFormatter.format(trade.pnl)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={trade.status}
                          size="small"
                          color={isOpen ? 'warning' : 'default'}
                        />
                        {!isOpen && trade.autoSquaredOff && (
                          <Tooltip title="Auto square-off">
                            <AutoModeIcon fontSize="small" color="info" />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Entry: {formatDateTime(trade.entryTime)}
                      </Typography>
                      {trade.exitTime && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Exit: {formatDateTime(trade.exitTime)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isOpen ? (
                        <Tooltip title="Square off">
                          <span>
                            <IconButton
                              color="primary"
                              disabled={isProcessing}
                              onClick={() => onSquareOff(trade.id)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No trades have been placed yet. Use the order form to execute your first
            demo trade.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
