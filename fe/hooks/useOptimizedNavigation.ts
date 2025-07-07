import { useRef, useCallback } from 'react';

/**
 * Optimized navigation hook with minimal delay for better UX
 * Reduces navigation delay from 300ms to 100ms
 */
export const useOptimizedNavigation = (delay: number = 100) => {
  const timeoutRef = useRef<number | null>(null);
  const lastNavigationRef = useRef<number>(0);

  const optimizedNavigate = useCallback((action: () => void) => {
    const now = Date.now();
    
    // Prevent rapid successive calls within 100ms
    if (now - lastNavigationRef.current < delay) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Execute immediately for better responsiveness
    action();
    lastNavigationRef.current = now;
  }, [delay]);

  const cancelNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { optimizedNavigate, cancelNavigation };
};
