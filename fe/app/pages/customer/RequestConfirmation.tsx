import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomerFooter from '@/components/navigation/CustomerFooter';
import { RouteDetailsService, RouteDetailsData } from '@/services/routeDetailsService';
import { Config } from '@/constants/Config';

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

  // Route linkage
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(params.routeId as string | undefined);
  const requestId = params.requestId as string | undefined;

  useEffect(() => {
    loadRouteAndParcelData();
  }, [selectedRouteId]);

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

      // Load route data from cache
      if (selectedRouteId) {
        const cachedRouteData = await RouteDetailsService.getCachedRouteDetails(selectedRouteId);
        if (cachedRouteData) {
          setRouteData(cachedRouteData);
          console.log('Loaded route data from cache:', cachedRouteData);
        } else {
          console.log('No cached route data found for routeId:', selectedRouteId);
        }
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
          requestId: requestId,
          routeId: selectedRouteId,
          startIndex: 0,
          endIndex: 0,
          offeredPrice: parseFloat(bidPrice)
        };
        const res = await fetch(`${Config.API_BASE}/bids`, {
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
        }
      } catch (e) {
        console.error('Error creating bid:', e);
      }
    })();
    setBidPrice('');
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
                <Text className="text-gray-600 text-sm">
                  Departure: {new Date(routeData.departureTime).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Bids Section */}
        <Text className="font-semibold mb-2 text-[#0D47A1] text-lg">Bids</Text>
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
            {bids.map((b, i) => (
              <View key={b.id || i} className="py-2 border-b border-gray-200 last:border-b-0">
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">Price</Text>
                  <Text className="font-semibold">LKR {String(b.offeredPrice)}</Text>
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-700">Created</Text>
                  <Text className="font-semibold">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text className="font-semibold mb-4 text-[#0D47A1] text-lg">Next Steps</Text>
        {selectedRouteId ? (
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 text-base font-medium">Your Maximum Bid Price (LKR)</Text>
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
          </View>
        ) : (
          <View className="mb-4">
            <Text className="text-gray-600">Bidding is unavailable because this request is not linked to a specific route.</Text>
          </View>
        )}

        
        
        <TouchableOpacity
          className="bg-[#0D47A1] py-4 rounded-lg mb-6"
          onPress={() => router.push('/pages/customer/MyBids')}
        >
          <Text className="text-white text-center font-semibold text-lg">View Bids</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Bottom Navigation Footer */}
      <CustomerFooter activeTab="home" />
    </SafeAreaView>
  );
}