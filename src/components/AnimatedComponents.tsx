'use client';

import React from 'react';
import { Box, Snackbar, Alert, AlertColor, keyframes } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

interface ToastNotificationProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  open,
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 3000,
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          animation: open ? `${slideIn} 0.3s ease-out` : `${slideOut} 0.3s ease-in`,
        },
      }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        icon={getIcon()}
        sx={{
          width: '100%',
          boxShadow: 3,
          borderRadius: 2,
          animation: open ? `${slideIn} 0.3s ease-out` : `${slideOut} 0.3s ease-in`,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

const priceFlash = (color: string) => keyframes`
  0% {
    background-color: transparent;
  }
  50% {
    background-color: ${color};
  }
  100% {
    background-color: transparent;
  }
`;

interface PriceUpdateFlashProps {
  children: React.ReactNode;
  isPositive?: boolean;
  trigger?: any;
}

export const PriceUpdateFlash: React.FC<PriceUpdateFlashProps> = ({ 
  children, 
  isPositive = true,
  trigger 
}) => {
  const [flash, setFlash] = React.useState(false);

  React.useEffect(() => {
    if (trigger !== undefined) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const flashColor = isPositive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';

  return (
    <Box
      sx={{
        animation: flash ? `${priceFlash(flashColor)} 0.6s ease-in-out` : 'none',
        borderRadius: 1,
        transition: 'background-color 0.3s ease',
      }}
    >
      {children}
    </Box>
  );
};

export default ToastNotification;
