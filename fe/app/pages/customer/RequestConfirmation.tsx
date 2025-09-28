import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import CustomerFooter from '@/components/navigation/CustomerFooter';
import { RouteDetailsService, RouteDetailsData } from '@/services/routeDetailsService';
import { Config } from '@/constants/Config';
import { supabase } from '@/lib/supabase';

// Interface for ranked bid data
interface RankedBid {
  id: string;
  offeredPrice: number;
  score: number;
  normalizedPrice: number;
  normalizedVolume: number;
  normalizedDistance: number;
  detourPercentage: number;
  createdAt: string;
  customerFirstName?: string;
  customerLastName?: string;
}

// Interface for ranked bids response
interface RankedBidsResponse {
  timestamp: string;
  status: number;
  message: string;
  routeId: string;
  totalBids: number;
  rankingCriteria: {
    priceWeight: number;
    volumeWeight: number;
    distanceWeight: number;
    detourWeight: number;
    vehicleCapacity: number;
  };
  rankedBids: RankedBid[];
}

export default function RequestConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bidPrice, setBidPrice] = useState('');
  
  // State for route and parcel data
  const [routeData, setRouteData] = useState<RouteDetailsData | null>(null);
  const [parcelData, setParcelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState<string | null>(null);

  // New state for ranked bids
  const [rankedBids, setRankedBids] = useState<RankedBid[]>([]);
  const [rankedBidsLoading, setRankedBidsLoading] = useState(false);
  const [rankedBidsError, setRankedBidsError] = useState<string | null>(null);

  // Delete bid state
  const [deletingBids, setDeletingBids] = useState<{[key: string]: boolean}>({});
  
  // Bid creation loading state
  const [isCreatingBid, setIsCreatingBid] = useState(false);

  // Countdown timer state
  const [countdown, setCountdown] = useState<string>('');
  const [winningBid, setWinningBid] = useState<any>(null);
  const [isBiddingClosed, setIsBiddingClosed] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string>('');

  // Route linkage
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(params.routeId as string | undefined);
  const requestId = params.requestId as string | undefined;

  // UI state for collapsible sections
  const [showParcelDetails, setShowParcelDetails] = useState(false);

  // Confetti effect state
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

  // Function to manually trigger confetti (for testing)
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  // Don't auto-populate bid price - let user enter their own amount
  // The max budget is shown as a reference only

  useEffect(() => {
    loadRouteAndParcelData();
  }, [selectedRouteId]);

  // ✅ NEW: Backend status polling for real-time bid updates
  useEffect(() => {
    if (!selectedRouteId) return;

    const pollBidStatus = async () => {
      try {
        // Check if bidding is closed by backend
        const response = await fetch(`${Config.API_BASE}/routes/${selectedRouteId}/ranked-bids`);
        if (response.ok) {
          const data = await response.json();
          
          // Check if any bids are accepted (bidding closed by backend)
          const hasAcceptedBids = data.rankedBids?.some((bid: any) => bid.status === 'ACCEPTED');
          if (hasAcceptedBids && !isBiddingClosed) {
            console.log('Backend has closed bidding - updating frontend state');
            setIsBiddingClosed(true);
            setCountdown('Bidding closed');
            
            // Trigger confetti effect for winning bid
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
            
            // Find the winning bid
            const winningBid = data.rankedBids.find((bid: any) => bid.status === 'ACCEPTED');
            if (winningBid) {
              setWinningBid(winningBid);
              
              // Check if this is the user's winning bid by comparing with their existing bids
              const isUserWinningBid = bids.some(bid => bid.id === winningBid.id);
              if (isUserWinningBid) {
                console.log('🎉 User won the bid! Triggering confetti effect');
                // Confetti is already triggered above, but we can add additional celebration here
              }
            }
          }
          
          // Update ranked bids with latest data
          if (data.rankedBids) {
            setRankedBids(data.rankedBids);
          }
        }
      } catch (error) {
        console.error('Error polling bid status:', error);
      }
    };

    // Poll every 30 seconds for real-time updates
    const interval = setInterval(pollBidStatus, 30000);
    
    // Initial poll
    pollBidStatus();
    
    return () => clearInterval(interval);
  }, [selectedRouteId, isBiddingClosed]);

  // Countdown timer effect - DISPLAY ONLY (backend handles bid closing)
  useEffect(() => {
    console.log('Countdown effect triggered. routeData?.departureTime:', routeData?.departureTime);
    
    if (!routeData?.departureTime) {
      console.log('No departure time available, skipping countdown');
      return;
    }

    const updateCountdown = () => {
      const departureTime = new Date(routeData.departureTime);
      const countdownTime = new Date(departureTime.getTime() - (3 * 60 * 60 * 1000)); // 3 hours earlier
      const now = new Date();
      
      const timeDiff = countdownTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown('Bidding closed');
        setIsBiddingClosed(true);
        // ✅ REMOVED: No more frontend bid closing - backend handles this now
        return;
      }
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      const countdownString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setCountdown(countdownString);
    };

    // Update immediately
    updateCountdown();
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [routeData?.departureTime]); // ✅ REMOVED: rankedBids, winningBid dependencies

  // Helper function to check if countdown is warning (less than 1 hour)
  const isCountdownWarning = () => {
    if (!routeData?.departureTime || countdown === 'Bidding closed') return false;
    
    const departureTime = new Date(routeData.departureTime);
    const countdownTime = new Date(departureTime.getTime() - (3 * 60 * 60 * 1000));
    const now = new Date();
    const timeDiff = countdownTime.getTime() - now.getTime();
    
    return timeDiff > 0 && timeDiff < (60 * 60 * 1000); // Less than 1 hour
  };

  // Function to fetch ranked bids
  const fetchRankedBids = async (routeId: string) => {
    try {
      setRankedBidsLoading(true);
      setRankedBidsError(null);
      
      const response = await fetch(`${Config.API_BASE}/routes/${routeId}/ranked-bids?status=PENDING`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ranked bids: ${response.status}`);
      }
      
             const data: RankedBidsResponse = await response.json();
       setRankedBids(data.rankedBids);
       console.log('Ranked bids loaded:', data.rankedBids.length, 'bids');
       console.log('Ranked bids data:', data.rankedBids.map(b => ({ id: b.id, price: b.offeredPrice, score: b.score })));
    } catch (err) {
      console.error('Error fetching ranked bids:', err);
      setRankedBidsError(err instanceof Error ? err.message : 'Failed to load bid rankings');
    } finally {
      setRankedBidsLoading(false);
    }
  };

  // Function to calculate winning chance percentage
  const calculateWinningChance = (bidScore: number, allBids: RankedBid[]): number => {
    if (allBids.length === 0) return 0;
    
    // Find the highest score
    const maxScore = Math.max(...allBids.map(bid => bid.score));
    if (maxScore === 0) return 0;
    
    // Calculate percentage based on score relative to highest score
    const percentage = (bidScore / maxScore) * 100;
    return Math.round(percentage * 10) / 10; // Round to 1 decimal place
  };

  // Function to get winning chance for a specific bid
  const getWinningChanceForBid = (bidId: string, bidPrice?: number): number => {
    console.log('Looking for bid ID:', bidId, 'with price:', bidPrice);
    console.log('Available ranked bid IDs:', rankedBids.map(b => b.id));
    
    const bid = rankedBids.find(b => b.id === bidId);
    if (!bid) {
      console.log('Bid not found in ranked bids, trying to match by price...');
      // Try to match by price as fallback
      const matchingBid = rankedBids.find(b => b.offeredPrice === (bidPrice || parseFloat(bidId)));
      if (matchingBid) {
        console.log('Found matching bid by price:', matchingBid);
        return calculateWinningChance(matchingBid.score, rankedBids);
      }
      
      // If still not found, this might be a new bid that hasn't been ranked yet
      console.log('Bid not found in ranked bids - might be too new or not yet processed');
      return 0;
    }
    return calculateWinningChance(bid.score, rankedBids);
  };

  // Function to get rank position for a bid
  const getBidRank = (bidId: string): number => {
    let index = rankedBids.findIndex(b => b.id === bidId);
    if (index === -1) {
      // Try to match by price as fallback
      index = rankedBids.findIndex(b => b.offeredPrice === parseFloat(bidId));
    }
    return index >= 0 ? index + 1 : 0;
  };

  const loadRouteAndParcelData = async () => {
    try {
      setLoading(true);
      setError(null);

      // If we have a requestId, load request details from API
      if (requestId) {
        try {
          const res = await fetch(`${Config.API_BASE}/parcel-requests/${requestId}`);
          if (res.ok) {
            const req = await res.json();
            setParcelData({
              weight: req?.weightKg ? `${req.weightKg} kg` : parcelData?.weight,
              volume: req?.volumeM3 ? `${req.volumeM3} m³` : parcelData?.volume,
              description: req?.description ?? parcelData?.description,
              pickupContactName: req?.pickupContactName ?? parcelData?.pickupContactName,
              pickupContactPhone: req?.pickupContactPhone ?? parcelData?.pickupContactPhone,
              deliveryContactName: req?.deliveryContactName ?? parcelData?.deliveryContactName,
              deliveryContactPhone: req?.deliveryContactPhone ?? parcelData?.deliveryContactPhone,
            });
            // Set the request status
            setRequestStatus(req?.status || '');
            console.log('Request status loaded:', req?.status);
          }
        } catch {
          // ignore; we'll still show what we have from params
        }
      }

      // Load all bids for this request (and infer route if not set)
      if (requestId) {
        setBidsLoading(true);
        setBidsError(null);
        try {
          const res = await fetch(`${Config.API_BASE}/customer/bids?parcel_requestid=${requestId}`);
                     if (res.ok) {
             const list = await res.json();
             const safeList = Array.isArray(list) ? list : [];
             setBids(safeList);
             console.log('Regular bids loaded:', safeList.length, 'bids');
             console.log('Regular bids data:', safeList.map(b => ({ id: b.id, price: b.offeredPrice })));
             if (!selectedRouteId && safeList.length > 0 && safeList[0].routeId) {
               setSelectedRouteId(safeList[0].routeId);
             }
           } else {
            const text = await res.text();
            setBidsError(text || `Failed to load bids (${res.status})`);
          }
        } catch (e: any) {
          setBidsError(e?.message || 'Failed to load bids');
        } finally {
          setBidsLoading(false);
        }
      }

      // Load route data with FORCE UPDATE to cache
      if (selectedRouteId) {
        console.log('🔄 Force updating route data cache for routeId:', selectedRouteId);
        
        let routeDataToUse = null;
        
        // Always fetch fresh data from API to force update cache
        try {
          console.log('Fetching fresh route data from API...');
          routeDataToUse = await RouteDetailsService.fetchRouteDetails(selectedRouteId);
          console.log('✅ Successfully fetched fresh route data:', routeDataToUse);
          console.log('✅ Fresh departure time:', routeDataToUse?.departureTime);
          console.log('✅ Departure time type:', typeof routeDataToUse?.departureTime);
        } catch (error) {
          console.error('❌ Failed to fetch fresh route data from service:', error);
          
          // Try direct API call as fallback
          try {
            console.log('🔄 Trying direct API call as fallback...');
            const directResponse = await fetch(`${Config.API_BASE}/routes/${selectedRouteId}/details`);
            if (directResponse.ok) {
              const directData = await directResponse.json();
              console.log('✅ Direct API response:', directData);
              console.log('✅ Direct API departure time:', directData.departureTime);
              
              // Create route data from direct API response
              routeDataToUse = {
                id: directData.id || selectedRouteId,
                originAddress: directData.originAddress || 'Unknown Origin',
                destinationAddress: directData.destinationAddress || 'Unknown Destination',
                status: directData.status || 'UNKNOWN',
                departureTime: directData.departureTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                totalBids: directData.totalBids || 0,
                highestBid: directData.highestBid || 'LKR 0.00',
                driverName: directData.driverName,
                driverRating: directData.driverRating,
                driverReviewCount: directData.driverReviewCount,
                totalDistance: directData.totalDistance,
                estimatedDuration: directData.estimatedDuration,
                routeImage: directData.routeImage,
                routeTags: directData.routeTags,
                originLat: directData.originLat,
                originLng: directData.originLng,
                destinationLat: directData.destinationLat,
                destinationLng: directData.destinationLng,
                biddingEndTime: directData.biddingEndTime,
                createdAt: directData.createdAt,
                updatedAt: directData.updatedAt,
              };
              console.log('✅ Created route data from direct API:', routeDataToUse);
              
                             // Force update the cache with fresh data
               try {
                 await RouteDetailsService.saveRouteDetailsToCache(selectedRouteId, routeDataToUse);
                 console.log('✅ Successfully updated cache with fresh route data');
               } catch (cacheError) {
                 console.error('❌ Failed to update cache:', cacheError);
               }
            }
          } catch (directError) {
            console.error('❌ Direct API call also failed:', directError);
          }
        }
        
        // If we still don't have data, try cache as last resort
        if (!routeDataToUse) {
          console.log('🔄 No fresh data available, trying cache as last resort...');
          routeDataToUse = await RouteDetailsService.getCachedRouteDetails(selectedRouteId);
          if (routeDataToUse) {
            console.log('📦 Loaded route data from cache (fallback):', routeDataToUse);
            console.log('📦 Cached departure time:', routeDataToUse.departureTime);
          }
        }
        
        if (routeDataToUse) {
          console.log('Setting route data with departure time:', routeDataToUse.departureTime);
          setRouteData(routeDataToUse);
        } else {
          console.log('No route data available, creating fallback data...');
          // Create fallback route data with a future departure time
          const fallbackRouteData = {
            id: selectedRouteId,
            originAddress: 'Colombo',
            destinationAddress: 'Badulla',
            status: 'ACTIVE',
            departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            totalBids: 0,
            highestBid: 'LKR 0.00',
            totalDistance: '150 km',
            estimatedDuration: '3 hours',
          };
          console.log('Setting fallback route data:', fallbackRouteData);
          setRouteData(fallbackRouteData);
        }
        
        // Fetch ranked bids for this route
        await fetchRankedBids(selectedRouteId);
      }

      // Get parcel data from navigation params or local storage
      const parcelInfo = {
        weight: params.weight || '5 kg',
        volume: params.volume || '0.125 m³',
        description: params.description || 'Fragile electronics',
        pickupContactName: params.pickupContactName || 'Customer',
        pickupContactPhone: params.pickupContactPhone || '+94 999999999',
        deliveryContactName: params.deliveryContactName || 'Customer',
        deliveryContactPhone: params.deliveryContactPhone || '+94 999999999',
      };
      setParcelData(parcelInfo);

    } catch (err) {
      console.error('Error loading route and parcel data:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBid = async () => {
    if (!bidPrice.trim()) return;
    if (!requestId) {
      console.warn('No requestId found; cannot create bid');
      Alert.alert('Error', 'Request ID not found. Please try again.');
      return;
    }
    if (!selectedRouteId) {
      console.warn('No routeId found; cannot create bid');
      Alert.alert('Cannot place bid', 'This request is not linked to a specific route.');
      return;
    }
    
    // Validate bid amount
    const bidAmount = parseFloat(bidPrice);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bid amount.');
      return;
    }

    setIsCreatingBid(true);
    try {
      const body = {
        routeId: selectedRouteId,
        offeredPrice: bidAmount,
        startIndex: 0,
        endIndex: 0
      };
      
      console.log('Creating bid:', body);
      
      const res = await fetch(`${Config.API_BASE}/parcel-requests/${requestId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Create bid failed:', res.status, errorText);
        Alert.alert('Bid Failed', `Failed to create bid: ${errorText}`);
        return;
      }
      
      const created = await res.json();
      console.log('Created bid successfully:', created);
      
      // Update local state
      const newItem = {
        offeredPrice: created.offeredPrice,
        createdAt: created.createdAt || new Date().toISOString(),
        id: created.id
      };
      setBids(prev => [newItem, ...prev]);
      
      // Clear the input
      setBidPrice('');
      
      // Show success message
      Alert.alert('Bid Placed!', `Your bid of LKR ${bidAmount.toLocaleString()} has been placed successfully.`);
      
      // Refresh ranked bids to include the new bid
      if (selectedRouteId) {
        console.log('Refreshing ranked bids after new bid creation...');
        // Add a small delay to ensure the backend has processed the new bid
        setTimeout(async () => {
          await fetchRankedBids(selectedRouteId);
        }, 1000);
      }
      
    } catch (e) {
      console.error('Error creating bid:', e);
      Alert.alert('Error', 'Failed to place bid. Please check your connection and try again.');
    } finally {
      setIsCreatingBid(false);
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    if (!bidId) {
      console.warn('No bidId provided for deletion');
      return;
    }

    setDeletingBids(prev => ({ ...prev, [bidId]: true }));
    
    try {
      console.log('Deleting bid:', bidId);
      const res = await fetch(`${Config.API_BASE}/bids/${bidId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to delete bid (${res.status})`);
      }
      
      console.log('Bid deleted successfully:', bidId);
      
      // Remove the bid from the local state
      setBids(prev => prev.filter(b => b.id !== bidId));
      
      // Refresh ranked bids to update rankings
      if (selectedRouteId) {
        console.log('Refreshing ranked bids after bid deletion...');
        setTimeout(async () => {
          await fetchRankedBids(selectedRouteId);
        }, 500);
      }
      
    } catch (e: any) {
      console.error('Error deleting bid:', e);
      Alert.alert('Delete Failed', e?.message || 'Unable to delete this bid.');
    } finally {
      setDeletingBids(prev => {
        const next = { ...prev };
        delete next[bidId];
        return next;
      });
    }
  };

  const confirmAndDeleteBid = (bidId: string, bidPrice: number) => {
    Alert.alert(
      'Delete Bid',
      `Are you sure you want to delete your bid of LKR ${bidPrice}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteBid(bidId) }
      ]
    );
  };

  // ✅ REMOVED: handleAutoMatchWinningBid function - backend handles bid closing now

  // Function to handle payment navigation
  const handleProceedToPayment = (amount: number, bidId?: string) => {
    console.log('Navigating to payment with amount:', amount, 'and bidId:', bidId);
    
         // Get current user ID from authentication
     const getCurrentUserId = async () => {
       try {
         // Get current authenticated user from Supabase
         const { data: { user }, error: authError } = await supabase.auth.getUser();
         
         if (authError || !user) {
           throw new Error('User not authenticated');
         }
         
         router.push({
           pathname: '/pages/customer/Payment',
           params: { 
             amount: amount.toString(),
             bidId: bidId || winningBid?.id || '',
             requestId: requestId || '',
             userId: user.id
           }
         });
       } catch (error) {
         console.error('Error getting user ID:', error);
         Alert.alert('Error', 'Unable to get user information. Please try again.');
       }
     };
    
    getCurrentUserId();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text className="mt-4 text-gray-600">Loading request details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity 
            className="bg-[#0D47A1] px-6 py-3 rounded-lg"
            onPress={loadRouteAndParcelData}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bidding Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {routeData ? `${routeData.originAddress} → ${routeData.destinationAddress}` : 'Loading route...'}
          </Text>
        </View>

        {/* Auto-bid notification */}
        {params.maxBudget && (
          <View style={styles.autoBidCard}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.autoBidText}>
              Auto-bid created: LKR {params.maxBudget}
            </Text>
          </View>
        )}

        {/* Bidding Timer */}
        {routeData?.departureTime && (
          <View style={[
            styles.timerCard,
            countdown === 'Bidding closed' ? styles.timerCardClosed : 
            isCountdownWarning() ? styles.timerCardWarning : styles.timerCardActive
          ]}>
            <View style={styles.timerHeader}>
              <Ionicons 
                name={countdown === 'Bidding closed' ? 'close-circle' : 'time'} 
                size={20} 
                color={countdown === 'Bidding closed' ? '#DC2626' : isCountdownWarning() ? '#DC2626' : '#EA580C'} 
              />
              <Text style={[
                styles.timerTitle,
                countdown === 'Bidding closed' ? styles.timerTitleClosed : 
                isCountdownWarning() ? styles.timerTitleWarning : styles.timerTitleActive
              ]}>
                {countdown === 'Bidding closed' ? 'Bidding Closed' : 'Bidding Closes In'}
              </Text>
            </View>
            <Text style={[
              styles.timerValue,
              countdown === 'Bidding closed' ? styles.timerValueClosed : 
              isCountdownWarning() ? styles.timerValueWarning : styles.timerValueActive
            ]}>
              {countdown || 'Loading...'}
            </Text>
            <Text style={[
              styles.timerSubtext,
              countdown === 'Bidding closed' ? styles.timerSubtextClosed : 
              isCountdownWarning() ? styles.timerSubtextWarning : styles.timerSubtextActive
            ]}>
              {countdown === 'Bidding closed' ? 'No more bids can be placed' : '3 hours before departure'}
            </Text>
          </View>
        )}

        {/* Parcel Details Toggle */}
        <TouchableOpacity 
          style={styles.parcelToggle}
          onPress={() => setShowParcelDetails(!showParcelDetails)}
        >
          <View style={styles.parcelToggleContent}>
            <Ionicons name="cube-outline" size={20} color="#6B7280" />
            <Text style={styles.parcelToggleText}>Parcel Details</Text>
            <Ionicons 
              name={showParcelDetails ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#6B7280" 
            />
          </View>
        </TouchableOpacity>

        {/* Collapsible Parcel Details */}
        {showParcelDetails && (
          <View style={styles.parcelDetailsCard}>
            <View style={styles.parcelRow}>
              <Text style={styles.parcelLabel}>Weight</Text>
              <Text style={styles.parcelValue}>{parcelData?.weight || '5 kg'}</Text>
            </View>
            <View style={styles.parcelRow}>
              <Text style={styles.parcelLabel}>Volume</Text>
              <Text style={styles.parcelValue}>{parcelData?.volume || '0.125 m³'}</Text>
            </View>
            <View style={styles.parcelRow}>
              <Text style={styles.parcelLabel}>Description</Text>
              <Text style={styles.parcelValue}>{parcelData?.description || 'Fragile electronics'}</Text>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Pickup Contact</Text>
              <Text style={styles.contactName}>{parcelData?.pickupContactName}</Text>
              <Text style={styles.contactPhone}>{parcelData?.pickupContactPhone}</Text>
            </View>
            
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Delivery Contact</Text>
              <Text style={styles.contactName}>{parcelData?.deliveryContactName}</Text>
              <Text style={styles.contactPhone}>{parcelData?.deliveryContactPhone}</Text>
            </View>
            
            {routeData && (
              <>
                <View style={styles.separator} />
                <View style={styles.routeDetailsSection}>
                  <Text style={styles.routeDetailsTitle}>Route Information</Text>
                  {routeData.totalDistance && (
                    <Text style={styles.routeDetail}>Distance: {routeData.totalDistance}</Text>
                  )}
                  {routeData.estimatedDuration && (
                    <Text style={styles.routeDetail}>Duration: {routeData.estimatedDuration}</Text>
                  )}
                  {routeData.departureTime && (
                    <Text style={styles.routeDetail}>
                      Departure: {new Date(routeData.departureTime).toLocaleString()}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* Bids Section */}
        <View style={styles.bidsSection}>
          <View style={styles.bidsHeader}>
            <Text style={styles.bidsTitle}>Your Bids</Text>
            <View style={styles.bidsHeaderButtons}>
              {/* Test Confetti Button - Remove in production */}
              <TouchableOpacity 
                style={styles.testConfettiButton}
                onPress={triggerConfetti}
              >
                <Ionicons name="sparkles" size={16} color="white" />
                <Text style={styles.testConfettiButtonText}>🎉</Text>
              </TouchableOpacity>
              
              {rankedBids.length > 0 && (
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={() => selectedRouteId && fetchRankedBids(selectedRouteId)}
                  disabled={rankedBidsLoading}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.refreshButtonText}>
                    {rankedBidsLoading ? 'Refreshing...' : 'Refresh'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bid Statistics Summary */}
          {rankedBids.length > 0 && (
            <View style={styles.bidStatsCard}>
              <View style={styles.bidStatsRow}>
                <View style={styles.bidStatItem}>
                  <Text style={styles.bidStatLabel}>Total Bids</Text>
                  <Text style={styles.bidStatValue}>{rankedBids.length}</Text>
                </View>
                <View style={styles.bidStatItem}>
                  <Text style={styles.bidStatLabel}>Price Range</Text>
                  <Text style={styles.bidStatValue}>
                    LKR {Math.min(...rankedBids.map(b => b.offeredPrice))} - {Math.max(...rankedBids.map(b => b.offeredPrice))}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {bidsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Loading bids...</Text>
            </View>
          ) : bidsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{bidsError}</Text>
            </View>
          ) : bids.length === 0 ? (
            <View style={styles.noBidsContainer}>
              <Ionicons name="pricetag-outline" size={32} color="#9CA3AF" />
              <Text style={styles.noBidsText}>No bids yet</Text>
            </View>
          ) : (
            <View style={styles.bidsList}>
              {rankedBidsLoading && (
                <View style={styles.rankingLoadingContainer}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.rankingLoadingText}>Calculating rankings...</Text>
                </View>
              )}
              
              {rankedBidsError && (
                <View style={styles.rankingErrorContainer}>
                  <Text style={styles.rankingErrorText}>⚠️ Unable to calculate winning chances</Text>
                </View>
              )}
              
              {bids.map((b, i) => {
                const winningChance = getWinningChanceForBid(b.id, b.offeredPrice);
                const rank = getBidRank(b.id);
                const isTopBid = rank === 1;
                
                return (
                  <View key={b.id || i} style={styles.bidCard}>
                    <View style={styles.bidHeader}>
                      <View style={styles.bidRankContainer}>
                        {rank > 0 ? (
                          <View style={[styles.rankBadge, isTopBid ? styles.topRankBadge : styles.regularRankBadge]}>
                            <Text style={[styles.rankText, isTopBid ? styles.topRankText : styles.regularRankText]}>
                              {rank}
                            </Text>
                          </View>
                        ) : null}
                        <Text style={styles.bidNumber}>
                          {isTopBid ? '🥇 Top Bid' : rank > 0 ? `Rank #${rank}` : `Bid #${i + 1}`}
                        </Text>
                      </View>
                      
                      <View style={styles.bidActions}>
                        {winningChance > 0 ? (
                          <View style={styles.winningChanceBadge}>
                            <Text style={styles.winningChanceText}>{winningChance}%</Text>
                          </View>
                        ) : rankedBids.length > 0 ? (
                          <View style={styles.processingBadge}>
                            <Text style={styles.processingBadgeText}>Processing...</Text>
                          </View>
                        ) : null}
                        
                        <TouchableOpacity
                          style={[styles.deleteButton, deletingBids[b.id] && styles.deleteButtonDisabled]}
                          onPress={() => confirmAndDeleteBid(b.id, b.offeredPrice)}
                          disabled={deletingBids[b.id]}
                        >
                          {deletingBids[b.id] ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                          ) : (
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.bidDetails}>
                      <View style={styles.bidPriceRow}>
                        <Text style={styles.bidPriceLabel}>Amount</Text>
                        <Text style={styles.bidPriceValue}>LKR {String(b.offeredPrice)}</Text>
                      </View>
                      
                      <View style={styles.bidDateRow}>
                        <Text style={styles.bidDateLabel}>Created</Text>
                        <Text style={styles.bidDateValue}>
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}
                        </Text>
                      </View>
                      
                      {winningChance > 0 && (
                        <View style={styles.winningChanceBar}>
                          <View style={styles.winningChanceBarHeader}>
                            <Text style={styles.winningChanceBarLabel}>Winning Probability</Text>
                            <Text style={styles.winningChanceBarValue}>{winningChance}%</Text>
                          </View>
                          <View style={styles.winningChanceBarBackground}>
                            <View 
                              style={[
                                styles.winningChanceBarFill,
                                { width: `${winningChance}%` },
                                winningChance >= 80 ? styles.winningChanceBarHigh :
                                winningChance >= 60 ? styles.winningChanceBarMedium :
                                winningChance >= 40 ? styles.winningChanceBarLow : styles.winningChanceBarVeryLow
                              ]}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Bidding Section */}
        <View style={styles.biddingSection}>
          <Text style={styles.biddingTitle}>Place New Bid</Text>
          
          {selectedRouteId ? (
            <>
              {countdown === 'Bidding closed' ? (
                <View style={styles.biddingStatusContainer}>
                  <View style={styles.biddingClosedCard}>
                    <Ionicons name="close-circle" size={24} color="#DC2626" />
                    <Text style={styles.biddingClosedTitle}>Bidding Closed</Text>
                    <Text style={styles.biddingClosedText}>
                      The bidding period has ended. No new bids can be placed.
                    </Text>
                  </View>
                  
                  {/* Winning Bid Display */}
                  {winningBid ? (
                    <View style={[styles.winningBidCard, showConfetti && styles.winningBidCardCelebration]}>
                      <Ionicons name="trophy" size={24} color="#059669" />
                      <Text style={styles.winningBidTitle}>
                        {showConfetti ? '🎉🎊 You Won! 🎊🎉' : '🎉 You Won!'}
                      </Text>
                      <Text style={styles.winningBidAmount}>LKR {winningBid.offeredPrice}</Text>
                      <Text style={styles.winningBidText}>
                        {showConfetti ? 'Congratulations! Your bid has been matched successfully!' : 'Your bid has been matched successfully'}
                      </Text>
                    </View>
                  ) : requestStatus === 'MATCHED' ? (
                    <View style={styles.matchedCard}>
                      <Ionicons name="checkmark-circle" size={24} color="#059669" />
                      <Text style={styles.matchedTitle}>✅ Request Matched!</Text>
                      <Text style={styles.matchedText}>Your request has been successfully matched</Text>
                    </View>
                  ) : rankedBids.length > 0 ? (
                    <View style={styles.processingCard}>
                      <Ionicons name="hourglass" size={24} color="#D97706" />
                      <Text style={styles.processingTitle}>⏳ Processing...</Text>
                      <Text style={styles.processingStatusText}>Please wait while we select the winning bid</Text>
                    </View>
                  ) : (
                    <View style={styles.noBidsCard}>
                      <Ionicons name="pricetag-outline" size={24} color="#6B7280" />
                      <Text style={styles.noBidsTitle}>📊 No Bids Available</Text>
                      <Text style={styles.noBidsStatusText}>No bids were placed for this request</Text>
                    </View>
                  )}
                  
                  {/* Go to Payment Button */}
                  {(winningBid || requestStatus === 'MATCHED') && (
                    <TouchableOpacity
                      style={styles.paymentButton}
                      onPress={() => handleProceedToPayment(winningBid?.offeredPrice || 0, winningBid?.id)}
                    >
                      <Ionicons name="card" size={20} color="white" />
                      <Text style={styles.paymentButtonText}>
                        Go to Payment - LKR {winningBid?.offeredPrice || 'Amount to be determined'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.bidInputContainer}>
                  <View style={styles.bidInputHeader}>
                    <Text style={styles.bidInputLabel}>Your Bid Amount (LKR)</Text>
                    {params.maxBudget && (
                      <Text style={styles.budgetHint}>
                        💡 Max budget: LKR {params.maxBudget}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.bidInputRow}>
                    <TextInput
                      style={styles.bidInput}
                      value={bidPrice}
                      onChangeText={setBidPrice}
                      keyboardType="numeric"
                      placeholder="Enter bid amount"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      style={[styles.addBidButton, isCreatingBid && styles.addBidButtonDisabled]}
                      onPress={handleAddBid}
                      disabled={isCreatingBid}
                    >
                      {isCreatingBid ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="add" size={20} color="white" />
                          <Text style={styles.addBidButtonText}>Add</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noRouteContainer}>
              <Ionicons name="warning" size={24} color="#D97706" />
              <Text style={styles.noRouteText}>
                Bidding is unavailable because this request is not linked to a specific route.
              </Text>
            </View>
          )}
        </View>

        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/pages/customer/MyBids')}
          >
            <Ionicons name="list" size={20} color="white" />
            <Text style={styles.actionButtonText}>View All Bids</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.disputeButton]}
            onPress={() => router.push({
              pathname: '/pages/customer/DisputeForm',
              params: { 
                requestId: requestId || '',
                routeId: selectedRouteId || ''
              }
            })}
          >
            <Ionicons name="warning" size={20} color="white" />
            <Text style={styles.actionButtonText}>Open Dispute</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Footer */}
      <CustomerFooter activeTab="home" />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          autoStart={true}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']}
          explosionSpeed={350}
          fallSpeed={2300}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  
  // Header styles
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Auto-bid notification
  autoBidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  autoBidText: {
    marginLeft: 8,
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Timer styles
  timerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  timerCardActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  timerCardWarning: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  timerCardClosed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  timerTitleActive: {
    color: '#D97706',
  },
  timerTitleWarning: {
    color: '#DC2626',
  },
  timerTitleClosed: {
    color: '#DC2626',
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  timerValueActive: {
    color: '#D97706',
  },
  timerValueWarning: {
    color: '#DC2626',
  },
  timerValueClosed: {
    color: '#DC2626',
  },
  timerSubtext: {
    fontSize: 12,
  },
  timerSubtextActive: {
    color: '#B45309',
  },
  timerSubtextWarning: {
    color: '#B91C1C',
  },
  timerSubtextClosed: {
    color: '#B91C1C',
  },
  
  // Parcel details toggle
  parcelToggle: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  parcelToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  parcelToggleText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  
  // Parcel details card
  parcelDetailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  parcelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parcelLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  parcelValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  contactSection: {
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  contactPhone: {
    fontSize: 12,
    color: '#6B7280',
  },
  routeDetailsSection: {
    marginTop: 8,
  },
  routeDetailsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  routeDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  
  // Bids section
  bidsSection: {
    marginBottom: 24,
  },
  bidsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bidsHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bidsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  testConfettiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testConfettiButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // Bid stats
  bidStatsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  bidStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bidStatItem: {
    alignItems: 'center',
  },
  bidStatLabel: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
  bidStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  
  // Loading and error states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  noBidsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noBidsText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 16,
  },
  
  // Ranking states
  rankingLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginBottom: 12,
  },
  rankingLoadingText: {
    marginLeft: 8,
    color: '#3B82F6',
    fontSize: 12,
  },
  rankingErrorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  rankingErrorText: {
    color: '#DC2626',
    fontSize: 12,
  },
  
  // Bids list
  bidsList: {
    gap: 12,
  },
  bidCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  topRankBadge: {
    backgroundColor: '#059669',
  },
  regularRankBadge: {
    backgroundColor: '#D1D5DB',
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  topRankText: {
    color: 'white',
  },
  regularRankText: {
    color: '#374151',
  },
  bidNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  bidActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  winningChanceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  winningChanceText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
  processingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  processingBadgeText: {
    color: '#D97706',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  deleteButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  
  // Bid details
  bidDetails: {
    gap: 8,
  },
  bidPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidPriceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  bidPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bidDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidDateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  bidDateValue: {
    fontSize: 14,
    color: '#374151',
  },
  
  // Winning chance bar
  winningChanceBar: {
    marginTop: 8,
  },
  winningChanceBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  winningChanceBarLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  winningChanceBarValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  winningChanceBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  winningChanceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  winningChanceBarHigh: {
    backgroundColor: '#059669',
  },
  winningChanceBarMedium: {
    backgroundColor: '#D97706',
  },
  winningChanceBarLow: {
    backgroundColor: '#EA580C',
  },
  winningChanceBarVeryLow: {
    backgroundColor: '#DC2626',
  },
  
  // Bidding section
  biddingSection: {
    marginBottom: 24,
  },
  biddingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  
  // Bidding status cards
  biddingStatusContainer: {
    gap: 16,
  },
  biddingClosedCard: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  biddingClosedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 8,
    marginBottom: 4,
  },
  biddingClosedText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
  },
  winningBidCard: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  winningBidTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginTop: 8,
    marginBottom: 4,
  },
  winningBidAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 4,
  },
  winningBidText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
  },
  winningBidCardCelebration: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  matchedCard: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  matchedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginTop: 8,
    marginBottom: 4,
  },
  matchedText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
  },
  processingCard: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 8,
    marginBottom: 4,
  },
  processingStatusText: {
    fontSize: 14,
    color: '#B45309',
    textAlign: 'center',
  },
  noBidsCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noBidsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  noBidsStatusText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Payment button
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Bid input
  bidInputContainer: {
    gap: 12,
  },
  bidInputHeader: {
    gap: 4,
  },
  bidInputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  budgetHint: {
    fontSize: 12,
    color: '#3B82F6',
  },
  bidInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bidInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  addBidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  addBidButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addBidButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // No route
  noRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
  },
  noRouteText: {
    flex: 1,
    fontSize: 14,
    color: '#B45309',
  },
  
  // Action buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disputeButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});