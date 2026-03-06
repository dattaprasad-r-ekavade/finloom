'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface ScripOption {
  scrip: string;
  scripFullName: string;
  ltp: number;
  exchange: string;
  symbolToken?: string;
  scripToken?: string;
}

interface ScripSearchAutocompleteProps {
  value: ScripOption | null;
  onChange: (option: ScripOption | null) => void;
  onOptionsLoaded?: (options: ScripOption[]) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const EXCHANGE_COLORS: Record<string, 'primary' | 'success' | 'secondary' | 'warning' | 'default'> = {
  NSE: 'primary',
  BSE: 'success',
  NFO: 'secondary',
  MCX: 'warning',
};

export const ScripSearchAutocomplete: React.FC<ScripSearchAutocompleteProps> = ({
  value,
  onChange,
  onOptionsLoaded,
  disabled = false,
  size = 'small',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<ScripOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchOptions = useMemo(
    () => async (query: string) => {
      if (!query || query.length < 2) {
        setOptions([]);
        setHasError(false);
        onOptionsLoaded?.([]);
        return;
      }

      try {
        if (controllerRef.current) {
          controllerRef.current.abort();
        }

        const controller = new AbortController();
        controllerRef.current = controller;
        setIsLoading(true);
        setHasError(false);

        const response = await fetch(
          `/api/trading/market-data?search=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setOptions([]);
          setHasError(true);
          onOptionsLoaded?.([]);
          return;
        }

        const data = await response.json();
        const items: ScripOption[] = data?.data?.marketData ?? [];
        setOptions(items);
        onOptionsLoaded?.(items);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setHasError(true);
          setOptions([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onOptionsLoaded],
  );

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchOptions(inputValue);
    }, 350);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [inputValue, fetchOptions]);

  const noOptionsText = hasError
    ? 'Search unavailable — please try again'
    : inputValue.length < 2
    ? 'Type at least 2 characters to search'
    : `No results for "${inputValue}"`;

  return (
    <Autocomplete
      disabled={disabled}
      value={value}
      size={size}
      options={options}
      filterOptions={(opts) => opts}
      getOptionLabel={(option) =>
        option ? `${option.scrip} — ${option.scripFullName}` : ''
      }
      onChange={(_event, option) => onChange(option)}
      inputValue={inputValue}
      onInputChange={(_event, newValue, reason) => {
        if (reason !== 'reset') setInputValue(newValue);
      }}
      isOptionEqualToValue={(option, selected) =>
        option.scrip === selected.scrip && option.exchange === selected.exchange
      }
      loading={isLoading}
      noOptionsText={noOptionsText}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={`${option.exchange}:${option.scrip}`}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                {option.scrip}
              </Typography>
              <Chip
                label={option.exchange}
                size="small"
                color={EXCHANGE_COLORS[option.exchange] ?? 'default'}
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" noWrap>
              {option.scripFullName}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Stock"
          placeholder="e.g. RELIANCE, TCS, INFY…"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start" sx={{ ml: 0.5 }}>
                  <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
