import { Box, type SxProps, type Theme } from '@mui/material';
import { fontFamily } from '@/theme/tokens';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

interface PriceTextProps {
  value: number;
  /** Colour by sign and prefix ▲/▼. Use for P&L and changes, not for plain prices. */
  signed?: boolean;
  /** Append a percentage in brackets, e.g. (+1.24%). */
  percent?: number;
  format?: (value: number) => string;
  sx?: SxProps<Theme>;
}

/** Money or price in tabular monospace. Signed values never rely on colour alone. */
export default function PriceText({ value, signed, percent, format = (v) => inr.format(v), sx }: PriceTextProps) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const marker = !signed ? '' : direction === 'up' ? '▲ ' : direction === 'down' ? '▼ ' : '';
  const sign = signed && value > 0 ? '+' : '';
  const pct = percent === undefined ? '' : ` (${percent > 0 ? '+' : ''}${percent.toFixed(2)}%)`;
  return (
    <Box
      component="span"
      sx={[
        { fontFamily: fontFamily.mono, fontVariantNumeric: 'tabular-nums', color: signed ? `market.${direction}` : 'inherit' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {marker}
      {sign}
      {format(value)}
      {pct}
    </Box>
  );
}
