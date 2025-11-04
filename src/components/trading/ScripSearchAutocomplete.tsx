'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

export interface ScripOption {
  scrip: string;
  scripFullName: string;
  ltp: number;
  exchange: string;
}

interface ScripSearchAutocompleteProps {
  value: ScripOption | null;
  onChange: (option: ScripOption | null) => void;
  onOptionsLoaded?: (options: ScripOption[]) => void;
  disabled?: boolean;
}

export const ScripSearchAutocomplete: React.FC<ScripSearchAutocompleteProps> = ({
  value,
  onChange,
  onOptionsLoaded,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<ScripOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchOptions = useMemo(
    () => async (query: string) => {
      if (!query || query.length < 2) {
        setOptions([]);
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

        const response = await fetch(
          `/api/trading/market-data?search=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }

        const data = await response.json();
        const items: ScripOption[] = data?.data?.marketData ?? [];
        setOptions(items);
        onOptionsLoaded?.(items);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Scrip search error:', error);
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
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [inputValue, fetchOptions]);

  return (
    <Autocomplete
      disabled={disabled}
      value={value}
      options={options}
      getOptionLabel={(option) =>
        option ? `${option.scrip} • ${option.scripFullName}` : ''
      }
      onChange={(_event, option) => onChange(option)}
      inputValue={inputValue}
      onInputChange={(_event, newValue) => setInputValue(newValue)}
      isOptionEqualToValue={(option, selected) => option.scrip === selected.scrip}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Scrip"
          placeholder="Type to search NSE symbols"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
