import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService, RankedBidsResponse, OptimalBidsResponse, BiddingStatusResponse, BidSelectionDto } from '../services/apiService';

export interface AutomaticBiddingData {
  biddingStatus: BiddingStatusResponse | null;
  rankedBids: BidSelectionDto[];
  optimalBids: BidSelectionDto[];
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
  biddingActive: boolean;
  biddingEnded: boolean;
  timeUntilEnd: number; // minutes
  countdown: string;
}

export const useAutomaticBidding = (routeId: string) => {
  const [data, setData] = useState<AutomaticBiddingData>({
    biddingStatus: null,
    rankedBids: [],
    optimalBids: [],
    isLoading: true,
    error: null,
    refreshing: false,
    biddingActive: false,
    biddingEnded: false,
    timeUntilEnd: 0,
    countdown: ''
  });

  const intervalRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Format countdown timer
  const formatCountdown = useCallback((minutes: number): string => {
    if (minutes <= 0) return 'Bidding Ended';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else {
      return `${mins}m ${secs}s`;
    }
  }, []);

  // Fetch bidding status
  const fetchBiddingStatus = useCallback(async () => {
    try {
      const status = await ApiService.getBiddingStatus(routeId);
      
      setData(prev => ({
        ...prev,
        biddingStatus: status,
        biddingActive: status.biddingActive,
        biddingEnded: status.biddingEnded,
        timeUntilEnd: status.timeUntilBiddingEnd,
        countdown: formatCountdown(status.timeUntilBiddingEnd),
        error: null
      }));

      return status;
    } catch (error) {
      console.error('Error fetching bidding status:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
      return null;
    }
  }, [routeId, formatCountdown]);

  // Fetch ranked bids
  const fetchRankedBids = useCallback(async () => {
    try {
      const response = await ApiService.getRankedBids(routeId);
      
      setData(prev => ({
        ...prev,
        rankedBids: response.rankedBids || [],
        error: null
      }));

      return response.rankedBids || [];
    } catch (error) {
      // Suppress all error logging for this function to prevent console spam
      setData(prev => ({
        ...prev,
        rankedBids: [],
        error: null // Never show this as an error to the user
      }));
      return [];
    }
  }, [routeId]);

  // Fetch optimal bids (winners)
  const fetchOptimalBids = useCallback(async () => {
    try {
      const response = await ApiService.getOptimalBids(routeId);
      
      setData(prev => ({
        ...prev,
        optimalBids: response.optimalBids || [],
        error: null
      }));

      return response.optimalBids || [];
    } catch (error) {
      // Suppress all error logging for this function to prevent console spam
      setData(prev => ({
        ...prev,
        optimalBids: [],
        error: null // Never show this as an error to the user
      }));
      return [];
    }
  }, [routeId]);

  // Fetch all data
  const fetchAllData = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setData(prev => ({ ...prev, refreshing: true }));
    } else {
      setData(prev => ({ ...prev, isLoading: true }));
    }

    try {
      // First get bidding status
      const status = await fetchBiddingStatus();
      
      if (status) {
        // Check if there are any bids before making API calls
        const totalBids = (status.pendingBids || 0) + (status.acceptedBids || 0);
        
        if (totalBids > 0) {
          // Only fetch bids if there are actually bids available
          console.log(`Found ${totalBids} bids, fetching bid data...`);
          
          // Fetch ranked bids
          try {
            await fetchRankedBids();
          } catch (rankedBidsError) {
            console.log('Expected: No ranked bids available for this route');
            // Silently handle - this is expected for routes without bids
          }
          
          // Fetch bids based on status - only fetch optimal if bidding ended
          if (status.biddingEnded) {
            // If bidding ended, fetch optimal (winning) bids
            try {
              await fetchOptimalBids();
            } catch (optimalBidsError) {
              console.log('Expected: No optimal bids available for this route');
              // Silently handle - this is expected for routes without winners
            }
          } else {
            // Clear optimal bids if bidding is still active
            setData(prev => ({
              ...prev,
              optimalBids: []
            }));
          }
        } else {
          // No bids available - set empty arrays without making API calls
          console.log('No bids available for this route, skipping API calls');
          setData(prev => ({
            ...prev,
            rankedBids: [],
            optimalBids: [],
            error: null
          }));
        }
      }
    } catch (error) {
      console.error('Critical error fetching automatic bidding data:', error);
      // Only set error if it's not related to empty bids or 500 errors
      if (!(error instanceof Error && (error.message.includes('500') || error.message.includes('Failed to fetch')))) {
        setData(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      } else {
        // For 500 errors, just log and continue without showing error to user
        console.log('API returned 500 - this is expected for routes without bids');
      }
    } finally {
      setData(prev => ({
        ...prev,
        isLoading: false,
        refreshing: false
      }));
    }
  }, [fetchBiddingStatus, fetchOptimalBids, fetchRankedBids]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  // Update countdown every second
  const updateCountdown = useCallback(() => {
    setData(prev => {
      if (prev.timeUntilEnd > 0) {
        const newTimeUntilEnd = prev.timeUntilEnd - (1/60); // Subtract 1 second in minutes
        const newCountdown = formatCountdown(newTimeUntilEnd);
        
        // If countdown reaches zero, fetch latest data
        if (newTimeUntilEnd <= 0 && prev.biddingActive) {
          setTimeout(() => fetchAllData(true), 1000); // Refresh data after 1 second
        }
        
        return {
          ...prev,
          timeUntilEnd: Math.max(0, newTimeUntilEnd),
          countdown: newCountdown,
          biddingActive: newTimeUntilEnd > 0,
          biddingEnded: newTimeUntilEnd <= 0
        };
      }
      return prev;
    });
  }, [formatCountdown, fetchAllData]);

  // Initial data fetch
  useEffect(() => {
    if (routeId) {
      fetchAllData();
    }
  }, [routeId, fetchAllData]);

  // Set up auto-refresh interval (every 30 seconds)
  useEffect(() => {
    if (data.biddingActive) {
      intervalRef.current = setInterval(() => {
        fetchAllData(true);
      }, 30000); // 30 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data.biddingActive, fetchAllData]);

  // Set up countdown timer (every second)
  useEffect(() => {
    if (data.biddingActive && data.timeUntilEnd > 0) {
      countdownIntervalRef.current = setInterval(updateCountdown, 1000);
    } else if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [data.biddingActive, data.timeUntilEnd, updateCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return {
    ...data,
    refresh,
    fetchAllData: () => fetchAllData(false)
  };
};

export default useAutomaticBidding;