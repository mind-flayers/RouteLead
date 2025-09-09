import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

  // Countdown timer state
  const [countdown, setCountdown] = useState<string>('');
  const [winningBid, setWinningBid] = useState<any>(null);
  const [isBiddingClosed, setIsBiddingClosed] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string>('');

  // Route linkage
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(params.routeId as string | undefined);
  const requestId = params.requestId as string | undefined;

  // Don't auto-populate bid price - let user enter their own amount
  // The max budget is shown as a reference only

  useEffect(() => {
    loadRouteAndParcelData();
  }, [selectedRouteId]);

  // Countdown timer effect
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
         
         // Automatically match the winning bid when countdown reaches zero
         if (!winningBid && rankedBids.length > 0) {
           handleAutoMatchWinningBid();
         }
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
  }, [routeData?.departureTime, rankedBids, winningBid]);

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
        } catch (_) {
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

  const handleAddBid = () => {
    if (!bidPrice.trim()) return;
    if (!requestId) {
      console.warn('No requestId found; cannot create bid');
      return;
    }
    if (!selectedRouteId) {
      console.warn('No routeId found; cannot create bid');
      Alert.alert('Cannot place bid', 'This request is not linked to a specific route.');
      return;
    }
    // Fire-and-forget create bid
    (async () => {
      try {
        const body = {
          routeId: selectedRouteId,
          offeredPrice: parseFloat(bidPrice)
        };
        const res = await fetch(`${Config.API_BASE}/parcel-requests/${requestId}/bids`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('Create bid failed:', text);
        } else {
          const created = await res.json().catch(() => null);
          console.log('Created bid:', created);
          const newItem = created && created.offeredPrice ? created : {
            offeredPrice: body.offeredPrice,
            createdAt: new Date().toISOString(),
          };
          setBids(prev => [newItem, ...prev]);
          
          // Refresh ranked bids to include the new bid
          if (selectedRouteId) {
            console.log('Refreshing ranked bids after new bid creation...');
            // Add a small delay to ensure the backend has processed the new bid
            setTimeout(async () => {
              await fetchRankedBids(selectedRouteId);
            }, 1000);
          }
        }
      } catch (e) {
        console.error('Error creating bid:', e);
      }
    })();
    setBidPrice('');
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

  // Function to automatically match the winning bid
  const handleAutoMatchWinningBid = async () => {
    if (rankedBids.length === 0) {
      console.log('No ranked bids available for auto-matching');
      return;
    }

    try {
      // Get the top-ranked bid (highest score)
      const topBid = rankedBids[0];
      console.log('Auto-matching winning bid:', topBid);

      // Update the bid status to ACCEPTED
      const bidResponse = await fetch(`${Config.API_BASE}/bids/${topBid.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' })
      });

      if (!bidResponse.ok) {
        const errorText = await bidResponse.text();
        console.error('Failed to update bid status:', bidResponse.status, errorText);
        throw new Error(`Failed to update bid status: ${bidResponse.status} - ${errorText}`);
      }

      const updatedBid = await bidResponse.json();
      console.log('Successfully accepted winning bid:', updatedBid);
      
      // Update the parcel request status to MATCHED
      if (requestId) {
        console.log('Updating parcel request status to MATCHED for requestId:', requestId);
        const parcelResponse = await fetch(`${Config.API_BASE}/parcel-requests/${requestId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'MATCHED' })
        });

        if (!parcelResponse.ok) {
          const errorText = await parcelResponse.text();
          console.error('Failed to update parcel request status:', parcelResponse.status, errorText);
          // Don't throw error here - bid was successful, just log the issue
          console.warn('Warning: Bid accepted but failed to update parcel request status');
        } else {
          const updatedParcel = await parcelResponse.json();
          console.log('Successfully updated parcel request status to MATCHED:', updatedParcel);
        }
      }
      
      // Set the winning bid
      setWinningBid(updatedBid);
      
      // Show success message
      Alert.alert(
        'Bidding Complete!',
        `Winning bid selected: LKR ${topBid.offeredPrice}`,
        [
          {
            text: 'Proceed to Payment',
            onPress: () => handleProceedToPayment(topBid.offeredPrice, topBid.id)
          }
        ]
      );

    } catch (error) {
      console.error('Error auto-matching winning bid:', error);
      // Alert.alert('Error', 'Failed to automatically match the winning bid. Please try again.');
    }
  };

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <Text className="text-2xl font-bold mb-4 text-center text-[#0D47A1]">Parcel Request Submitted Successfully</Text>
        <Text className="text-gray-600 mb-8 text-center text-base leading-6">
          Your parcel request has been successfully submitted. Drivers will be notified and can bid on your request.
        </Text>
        {params.maxBudget && (
          <View className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <Text className="text-green-800 text-center font-medium">
              ✓ First bid automatically created with your max budget: LKR {params.maxBudget}
            </Text>
          </View>
        )}

        <View className="mb-8 bg-[#F6F6FA] rounded-xl p-6 border border-[#FF8C00]">
          <Text className="font-semibold mb-4 text-lg">Request Details</Text>
          
          {/* Route Information */}
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Route</Text>
            <Text className="font-semibold text-base">
              {routeData ? `${routeData.originAddress} → ${routeData.destinationAddress}` : 'Loading route...'}
            </Text>
          </View>

          {/* Parcel Information */}
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Weight</Text>
            <Text className="font-semibold text-base">{parcelData?.weight || '5 kg'}</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Volume</Text>
            <Text className="font-semibold text-base">{parcelData?.volume || '0.125 m³'}</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Description</Text>
            <Text className="font-semibold text-base">{parcelData?.description || 'Fragile electronics'}</Text>
          </View>

          {/* Contact Information */}
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="text-gray-500 text-sm mb-2">Pickup Contact</Text>
            <Text className="font-semibold text-base">{parcelData?.pickupContactName}</Text>
            <Text className="text-gray-600 text-sm">{parcelData?.pickupContactPhone}</Text>
          </View>

          <View className="mt-2">
            <Text className="text-gray-500 text-sm mb-2">Delivery Contact</Text>
            <Text className="font-semibold text-base">{parcelData?.deliveryContactName}</Text>
            <Text className="text-gray-600 text-sm">{parcelData?.deliveryContactPhone}</Text>
          </View>

          {/* Route Details (if available) */}
          {routeData && (
            <View className="mt-4 pt-4 border-t border-gray-200">
              <Text className="text-gray-500 text-sm mb-2">Route Details</Text>
              {routeData.totalDistance && (
                <Text className="text-gray-600 text-sm">Distance: {routeData.totalDistance}</Text>
              )}
              {routeData.estimatedDuration && (
                <Text className="text-gray-600 text-sm">Duration: {routeData.estimatedDuration}</Text>
              )}
              {routeData.departureTime && (
                <View className="mt-2">
                  <Text className="text-gray-600 text-sm">
                    Departure: {new Date(routeData.departureTime).toLocaleString()}
                  </Text>
                  
                  {/* Countdown Timer */}
                  <View className={`mt-2 border rounded-lg p-3 ${
                    countdown === 'Bidding closed' 
                      ? 'bg-red-50 border-red-200' 
                      : isCountdownWarning()
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <Text className={`text-sm font-medium mb-1 ${
                      countdown === 'Bidding closed' 
                        ? 'text-red-800' 
                        : isCountdownWarning()
                        ? 'text-red-800'
                        : 'text-orange-800'
                    }`}>
                      {countdown === 'Bidding closed' ? '🚫 Bidding Closed' : '⏰ Bidding Closes In'}
                    </Text>
                    <Text className={`text-lg font-bold font-mono ${
                      countdown === 'Bidding closed' 
                        ? 'text-red-900' 
                        : isCountdownWarning()
                        ? 'text-red-900'
                        : 'text-orange-900'
                    }`}>
                      {countdown || 'Loading...'}
                    </Text>
                    <Text className={`text-xs mt-1 ${
                      countdown === 'Bidding closed' 
                        ? 'text-red-700' 
                        : isCountdownWarning()
                        ? 'text-red-700'
                        : 'text-orange-700'
                    }`}>
                      {countdown === 'Bidding closed' 
                        ? 'No more bids can be placed' 
                        : '(3 hours before departure)'
                      }
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bids Section */}
        <Text className="font-semibold mb-2 text-[#0D47A1] text-lg">Bids</Text>
        
         
         
         {/* Bid Statistics Summary */}
         {rankedBids.length > 0 && (
          <View className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-blue-800 font-semibold">📈 Bid Competition Summary</Text>
              <TouchableOpacity 
                onPress={() => selectedRouteId && fetchRankedBids(selectedRouteId)}
                disabled={rankedBidsLoading}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                <Text className="text-white text-xs font-medium">
                  {rankedBidsLoading ? 'Refreshing...' : '🔄 Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-blue-600 text-sm">Total Bids</Text>
                <Text className="text-blue-800 font-bold">{rankedBids.length}</Text>
              </View>
              <View>
                <Text className="text-blue-600 text-sm">Highest Score</Text>
                <Text className="text-blue-800 font-bold">
                  {Math.max(...rankedBids.map(b => b.score)).toFixed(2)}
                </Text>
              </View>
              <View>
                <Text className="text-blue-600 text-sm">Price Range</Text>
                <Text className="text-blue-800 font-bold">
                  LKR {Math.min(...rankedBids.map(b => b.offeredPrice))} - {Math.max(...rankedBids.map(b => b.offeredPrice))}
                </Text>
              </View>
            </View>
          </View>
        )}
        {bidsLoading ? (
          <View className="mb-6">
            <ActivityIndicator size="small" color="#0D47A1" />
          </View>
        ) : bidsError ? (
          <Text className="text-red-500 mb-6">{bidsError}</Text>
        ) : bids.length === 0 ? (
          <Text className="text-gray-600 mb-6">No bids yet.</Text>
        ) : (
          <View className="mb-6 bg-gray-50 rounded-lg p-4">
            {/* Bid Rankings Header */}
            {rankedBidsLoading ? (
              <View className="mb-4">
                <ActivityIndicator size="small" color="#0D47A1" />
                <Text className="text-gray-600 text-sm mt-2">Calculating bid rankings...</Text>
              </View>
            ) : rankedBidsError ? (
              <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <Text className="text-red-600 text-sm">⚠️ Unable to calculate winning chances: {rankedBidsError}</Text>
              </View>
                         ) : rankedBids.length > 0 ? (
               <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                 <Text className="text-blue-800 text-sm font-medium">📊 Bid Rankings & Winning Chances</Text>
                 <Text className="text-blue-600 text-xs mt-1">
                   Based on price, volume, distance, and detour factors
                 </Text>
                 <Text className="text-blue-600 text-xs mt-1">
                   💡 Tap the 🗑️ icon to delete your bids
                 </Text>
               </View>
             ) : null}
            
                         {bids.map((b, i) => {
               console.log('Processing bid:', b);
               const winningChance = getWinningChanceForBid(b.id, b.offeredPrice);
               const rank = getBidRank(b.id);
               const isTopBid = rank === 1;
               
               console.log(`Bid ${b.id}: rank=${rank}, winningChance=${winningChance}%`);
               
                               return (
                 <View key={b.id || i} className="py-3 border-b border-gray-200 last:border-b-0">
                   {/* Bid Header with Rank */}
                   <View className="flex-row justify-between items-center mb-2">
                     <View className="flex-row items-center">
                       {rank > 0 ? (
                         <>
                           <View className={`w-6 h-6 rounded-full mr-2 items-center justify-center ${
                             isTopBid ? 'bg-green-500' : 'bg-gray-300'
                           }`}>
                             <Text className={`text-xs font-bold ${
                               isTopBid ? 'text-white' : 'text-gray-700'
                             }`}>
                               {rank}
                             </Text>
                           </View>
                           <Text className="text-gray-700 font-medium">
                             {isTopBid ? '🥇 Top Bid' : `Rank #${rank}`}
                           </Text>
                         </>
                       ) : (
                         <Text className="text-gray-700 font-medium">
                           📊 Bid #{i + 1}
                         </Text>
                       )}
                     </View>
                     <View className="flex-row items-center space-x-2">
                       {winningChance > 0 ? (
                         <View className="bg-green-100 px-2 py-1 rounded">
                           <Text className="text-green-800 text-xs font-bold">
                             {winningChance}% chance
                           </Text>
                         </View>
                       ) : rankedBids.length > 0 ? (
                         <View className="bg-yellow-100 px-2 py-1 rounded">
                           <Text className="text-yellow-700 text-xs">
                             Processing...
                           </Text>
                         </View>
                       ) : null}
                       
                       {/* Delete Button */}
                       <TouchableOpacity
                         onPress={() => confirmAndDeleteBid(b.id, b.offeredPrice)}
                         disabled={deletingBids[b.id]}
                         className={`p-1 rounded ${
                           deletingBids[b.id] ? 'bg-gray-300' : 'bg-red-100'
                         }`}
                       >
                         {deletingBids[b.id] ? (
                           <ActivityIndicator size="small" color="#EF4444" />
                         ) : (
                           <Text className="text-red-600 text-xs font-bold">🗑️</Text>
                         )}
                       </TouchableOpacity>
                     </View>
                   </View>
                   
                   {/* Bid Details */}
                   <View className="flex-row justify-between mb-1">
                     <Text className="text-gray-600">Price</Text>
                     <Text className="font-semibold text-lg">LKR {String(b.offeredPrice)}</Text>
                   </View>
                   
                   <View className="flex-row justify-between mb-1">
                     <Text className="text-gray-600">Created</Text>
                     <Text className="text-gray-700">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</Text>
                   </View>
                  
                                     {/* Winning Chance Bar */}
                   {winningChance > 0 ? (
                     <View className="mt-2">
                       <View className="flex-row justify-between mb-1">
                         <Text className="text-gray-600 text-xs">Winning Probability</Text>
                         <Text className="text-gray-600 text-xs">{winningChance}%</Text>
                       </View>
                       <View className="w-full bg-gray-200 rounded-full h-2">
                         <View 
                           className={`h-2 rounded-full ${
                             winningChance >= 80 ? 'bg-green-500' :
                             winningChance >= 60 ? 'bg-yellow-500' :
                             winningChance >= 40 ? 'bg-orange-500' : 'bg-red-500'
                           }`}
                           style={{ width: `${winningChance}%` }}
                         />
                       </View>
                     </View>
                   ) : rankedBids.length > 0 ? (
                     <View className="mt-2">
                       <View className="flex-row justify-between mb-1">
                         <Text className="text-gray-600 text-xs">Winning Probability</Text>
                         <Text className="text-yellow-600 text-xs">Processing...</Text>
                       </View>
                       <View className="w-full bg-gray-200 rounded-full h-2">
                         <View className="h-2 bg-yellow-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                       </View>
                     </View>
                   ) : null}
                </View>
              );
            })}
          </View>
        )}

                 <Text className="font-semibold mb-4 text-[#0D47A1] text-lg">Next Steps</Text>
         {selectedRouteId ? (
           <View className="mb-4">
             {/* Bidding Status */}
             {countdown === 'Bidding closed' ? (
               <View className="mb-4">
                 <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                   <Text className="text-red-800 text-center font-medium">
                     🚫 Bidding is now closed for this route
                   </Text>
                   <Text className="text-red-600 text-center text-sm mt-1">
                     The bidding period has ended. No new bids can be placed.
                   </Text>
                 </View>
                 
                                   {/* Winning Bid Display */}
                  {winningBid ? (
                    <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <Text className="text-green-800 text-center font-medium mb-2">
                        🎉 Winning Bid Selected!
                      </Text>
                      <Text className="text-green-700 text-center text-lg font-bold">
                        LKR {winningBid.offeredPrice}
                      </Text>
                      <Text className="text-green-600 text-center text-sm mt-1">
                        Your bid has been matched successfully
                      </Text>
                    </View>
                  ) : requestStatus === 'MATCHED' ? (
                    <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <Text className="text-green-800 text-center font-medium mb-2">
                        ✅ Request Already Matched!
                      </Text>
                      <Text className="text-green-700 text-center text-lg font-bold">
                        Your request has been successfully matched
                      </Text>
                      <Text className="text-green-600 text-center text-sm mt-1">
                        You can proceed to payment to complete the booking
                      </Text>
                    </View>
                  ) : rankedBids.length > 0 ? (
                    <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <Text className="text-yellow-800 text-center font-medium">
                        ⏳ Processing Winning Bid...
                      </Text>
                      <Text className="text-yellow-600 text-center text-sm mt-1">
                        Please wait while we select the winning bid
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <Text className="text-gray-800 text-center font-medium">
                        📊 No Bids Available
                      </Text>
                      <Text className="text-gray-600 text-center text-sm mt-1">
                        No bids were placed for this request
                      </Text>
                    </View>
                  )}
                 
                                   {/* Go to Payment Button */}
                  {(winningBid || requestStatus === 'MATCHED') && (
                    <TouchableOpacity
                      className="bg-green-600 py-4 rounded-lg mb-4"
                      onPress={() => handleProceedToPayment(winningBid?.offeredPrice || 0, winningBid?.id)}
                    >
                      <Text className="text-white text-center font-semibold text-lg">
                        💳 Go to Payment - LKR {winningBid?.offeredPrice || 'Amount to be determined'}
                      </Text>
                    </TouchableOpacity>
                  )}
               </View>
             ) : (
               <>
                 <Text className="text-gray-700 mb-2 text-base font-medium">Your Bid Amount (LKR)</Text>
                 {params.maxBudget && (
                   <Text className="text-blue-600 mb-2 text-sm">💡 Your max budget: LKR {params.maxBudget} (you can bid any amount up to this)</Text>
                 )}
                 <View className="flex-row space-x-2">
                   <TextInput
                     value={bidPrice}
                     onChangeText={setBidPrice}
                     keyboardType="numeric"
                     placeholder="Enter your maximum bid amount"
                     placeholderTextColor="#9CA3AF"
                     className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                   />
                   <TouchableOpacity
                     onPress={handleAddBid}
                     className="bg-[#FF8C00] px-4 py-3 rounded-lg justify-center"
                   >
                     <Text className="text-white font-semibold">Add</Text>
                   </TouchableOpacity>
                 </View>
               </>
             )}
           </View>
         ) : (
           <View className="mb-4">
             <Text className="text-gray-600">Bidding is unavailable because this request is not linked to a specific route.</Text>
           </View>
         )}

        
        
        <View className="flex-row space-x-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-[#0D47A1] py-4 rounded-lg"
            onPress={() => router.push('/pages/customer/MyBids')}
          >
            <Text className="text-white text-center font-semibold text-lg">View Bids</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 bg-red-600 py-4 rounded-lg"
            onPress={() => router.push({
              pathname: '/pages/customer/DisputeForm',
              params: { 
                requestId: requestId || '',
                routeId: selectedRouteId || ''
              }
            })}
          >
            <Text className="text-white text-center font-semibold text-lg">Open Dispute</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Footer */}
      <CustomerFooter activeTab="home" />
    </SafeAreaView>
  );
}