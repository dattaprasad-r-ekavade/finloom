'use client';

import React from 'react';
import {
  Box,
  Chip,
  Divider,
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
  useMediaQuery,
  useTheme,
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
  currentPrice?: number;
  livePnl?: number;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        isMobile ? (
          // ── Mobile: compact cards ──────────────────────────────────────────
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
            {trades.map((trade) => {
              const isOpen = trade.status === 'OPEN';
              const displayedPnl = isOpen ? (trade.livePnl ?? trade.pnl) : trade.pnl;
              const pnlTone = displayedPnl >= 0 ? 'success.main' : 'error.main';
              const isProcessing = processingTrades.has(trade.id);
              return (
                <Paper
                  key={trade.id}
                  variant="outlined"
                  sx={{ p: 1.25, borderRadius: 2 }}
                >
                  {/* Header row: symbol + type chip + square-off */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                        {trade.scrip}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {trade.scripFullName}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0} ml={1}>
                      <Chip
                        label={trade.tradeType}
                        color={trade.tradeType === 'BUY' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={trade.status}
                        size="small"
                        color={isOpen ? 'warning' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      {isOpen && (
                        <Tooltip title="Square off">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={isProcessing}
                              onClick={() => onSquareOff(trade.id)}
                              sx={{ p: 0.25 }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Data row */}
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Qty</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{trade.quantity}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Entry</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currencyFormatter.format(trade.entryPrice)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Exit</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {trade.exitPrice ? currencyFormatter.format(trade.exitPrice) : '—'}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="caption" color="text.secondary">P&amp;L</Typography>
                      <Typography variant="body2" sx={{ color: pnlTone, fontWeight: 700 }}>
                        {currencyFormatter.format(displayedPnl)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {formatDateTime(trade.entryTime)}
                    {trade.exitTime && ` → ${formatDateTime(trade.exitTime)}`}
                    {!isOpen && trade.autoSquaredOff && ' · Auto sq-off'}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        ) : (
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
                const displayedPnl = isOpen ? (trade.livePnl ?? trade.pnl) : trade.pnl;
                const pnlTone = displayedPnl >= 0 ? 'success.main' : 'error.main';
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
                        {currencyFormatter.format(displayedPnl)}
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
        )
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No trades have been placed yet. Use the order form to execute your first trade.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
