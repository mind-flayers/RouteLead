import { useState, useEffect, useCallback } from 'react';
import { ApiService, EarningsSummary, EarningsHistory, PendingBid } from '@/services/apiService';

// Custom hook for earnings data
export const useEarningsData = (driverId: string) => {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [history, setHistory] = useState<EarningsHistory[]>([]);
  const [pendingBids, setPendingBids] = useState<PendingBid[]>([]);
  const [completedRoutes, setCompletedRoutes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch all data
  const fetchEarningsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [summaryData, historyData, routesCount] = await Promise.all([
        ApiService.getEarningsSummary(driverId),
        ApiService.getEarningsHistory(driverId),
        ApiService.getCompletedRoutesCount(driverId),
      ]);

      setSummary(summaryData);
      setHistory(historyData);
      setCompletedRoutes(routesCount);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverId]);

  // Update earnings status
  const updateEarningsStatus = useCallback(async (
    earningsId: string, 
    newStatus: 'PENDING' | 'AVAILABLE' | 'WITHDRAWN'
  ) => {
    try {
      const updatedEarnings = await ApiService.updateEarningsStatus(earningsId, newStatus);
      
      // Update local state
      setHistory(prev => 
        prev.map(item => 
          item.id === earningsId 
            ? { ...item, status: newStatus, earnedAt: updatedEarnings.earnedAt }
            : item
        )
      );

      // Refresh summary to reflect changes
      const updatedSummary = await ApiService.getEarningsSummary(driverId);
      setSummary(updatedSummary);

      return updatedEarnings;
    } catch (err) {
      console.error('Error updating earnings status:', err);
      throw err;
    }
  }, [driverId]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchEarningsData(true);
  }, [fetchEarningsData]);

  // Filter history by status
  const getEarningsByStatus = useCallback((status?: 'PENDING' | 'AVAILABLE' | 'WITHDRAWN') => {
    if (!status) return history;
    return history.filter(item => item.status === status);
  }, [history]);

  // Calculate percentage changes (mock for now)
  const getPercentageChange = useCallback((current: number | undefined, previous: number | undefined) => {
    if (current === undefined || current === null || isNaN(current) || 
        previous === undefined || previous === null || isNaN(previous) || previous === 0) {
      return 0;
    }
    return ((current - previous) / previous) * 100;
  }, []);

  // Initial load
  useEffect(() => {
    if (driverId) {
      fetchEarningsData();
    }
  }, [driverId, fetchEarningsData]);

  return {
    // Data
    summary,
    history,
    pendingBids,
    completedRoutes,
    
    // States
    loading,
    error,
    refreshing,
    
    // Actions
    refreshData,
    updateEarningsStatus,
    getEarningsByStatus,
    getPercentageChange,
  };
};

// Custom hook for driver information
export const useDriverInfo = () => {
  const [driverId, setDriverId] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // For now, we'll use the test driver ID from our API tests
    // In a real app, this would come from authentication/user session
    const testDriverId = 'cdceaa3e-ab91-45d3-a971-efef43624682'; // Mishaf Hasan
    const testDriverName = 'Mishaf Hasan';
    
    setDriverId(testDriverId);
    setDriverName(testDriverName);
    setLoading(false);
  }, []);

  return {
    driverId,
    driverName,
    loading,
  };
};
