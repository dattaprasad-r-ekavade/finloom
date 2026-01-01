'use client';

import React from 'react';
import { Box, CircularProgress, Typography, keyframes } from '@mui/material';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  return (
    <Box
      sx={{
        position: fullScreen ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fullScreen ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        zIndex: fullScreen ? 9999 : 10,
        animation: `${fadeIn} 0.3s ease-out`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{
              color: 'primary.main',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              opacity: 0.2,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 500,
            color: fullScreen ? 'white' : 'text.primary',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

interface LoadingDotsProps {
  color?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ color = 'primary.main' }) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
            animation: `${pulse} 1.4s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
};

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  count?: number;
  gap?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 1,
  count = 1,
  gap = 1,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '1000px 100%',
            animation: `${shimmer} 2s infinite linear`,
          }}
        />
      ))}
    </Box>
  );
};

export default LoadingOverlay;
