import { useRef, useCallback } from 'react';

/**
 * Custom hook to debounce navigation actions to prevent crashes
 * from rapid successive navigation calls
 */
export const useNavigationDebounce = (delay: number = 300) => {
  const timeoutRef = useRef<number | null>(null);

  const debouncedNavigate = useCallback((action: () => void) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      action();
      timeoutRef.current = null;
    }, delay);
  }, [delay]);

  const cancelNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debouncedNavigate, cancelNavigation };
};
