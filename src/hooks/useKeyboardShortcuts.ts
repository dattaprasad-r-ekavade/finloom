// Keyboard shortcut hook for trading terminal
import { useEffect } from 'react';

export type TradingShortcut = 'buy' | 'sell' | 'escape' | 'squareOffAll' | 'refresh';

interface UseKeyboardShortcutsProps {
  onBuy?: () => void;
  onSell?: () => void;
  onEscape?: () => void;
  onSquareOffAll?: () => void;
  onRefresh?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onBuy,
  onSell,
  onEscape,
  onSquareOffAll,
  onRefresh,
  enabled = true,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for Ctrl+Q (Square off all)
      if (event.ctrlKey && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        onSquareOffAll?.();
        return;
      }

      // Simple key presses
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          onBuy?.();
          break;
        case 's':
          event.preventDefault();
          onSell?.();
          break;
        case 'escape':
          event.preventDefault();
          onEscape?.();
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            // Allow browser refresh
            return;
          }
          event.preventDefault();
          onRefresh?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onBuy, onSell, onEscape, onSquareOffAll, onRefresh, enabled]);
};

export default useKeyboardShortcuts;
