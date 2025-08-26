import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../components/ui/SecondaryButton';
import { deliveryService, DeliveryDetails, DeliveryStatusUpdate } from '../../../services/deliveryService';

const DeliveryManagement = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const route = useRoute();
  const { bidId } = route.params as { bidId?: string };

  // State management
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Location tracking
  const [locationInterval, setLocationInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    requestLocationPermission();
    startLocationTracking();
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [locationInterval]);

  // Load delivery details on component mount
  useEffect(() => {
    console.log('Component mounted, route params:', route.params);
    console.log('BidId from params:', bidId);
    if (bidId) {
      loadDeliveryDetails();
    } else {
      console.error('No bidId found in route params');
      setError('No delivery ID provided. Please select a delivery from your active routes.');
      setLoading(false);
    }
  }, [bidId]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to track delivery progress.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      // Set up background location tracking every 15 minutes
      const interval = setInterval(async () => {
        try {
          const newLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          setCurrentLocation({
            lat: newLocation.coords.latitude,
            lng: newLocation.coords.longitude,
          });

          // Update location on server if delivery is active
          if (deliveryDetails && deliveryDetails.status !== 'DELIVERED' && bidId) {
            updateLocationOnServer(newLocation.coords.latitude, newLocation.coords.longitude);
          }
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }, 15 * 60 * 1000); // 15 minutes

      setLocationInterval(interval);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const updateLocationOnServer = async (lat: number, lng: number) => {
    if (!deliveryDetails || !bidId) return;
    
    try {
      const update: DeliveryStatusUpdate = {
        status: deliveryDetails.status as any,
        currentLat: lat,
        currentLng: lng,
      };
      
      await deliveryService.updateDeliveryStatus(bidId, update);
    } catch (error) {
      console.error('Error updating location on server:', error);
    }
  };

  const loadDeliveryDetails = async () => {
    if (!bidId) {
      setError('No delivery ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading delivery details for bidId:', bidId);
      const details = await deliveryService.getDeliveryDetails(bidId);
      console.log('Delivery details loaded:', details);
      setDeliveryDetails(details);
    } catch (error) {
      console.error('Error loading delivery details:', error);
      console.error('BidId was:', bidId);
      setError('Failed to load delivery details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallCustomer = () => {
    if (deliveryDetails?.deliveryContactPhone) {
      const phoneNumber = deliveryDetails.deliveryContactPhone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Customer phone number not available');
    }
  };

  const handleChatCustomer = () => {
    // Navigate to chat screen with customer details
    if (deliveryDetails?.customerName) {
      // Use Alert instead of navigation for now, since chat might not be implemented
      Alert.alert(
        'Chat Customer',
        `Contact ${deliveryDetails.customerName}`,
        [
          { text: 'Call Instead', onPress: handleCallCustomer },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('Error', 'Customer information not available');
    }
  };

  const handleStartNavigation = () => {
    if (!deliveryDetails) return;

    const { dropoffLat, dropoffLng } = deliveryDetails;
    
    // Open Google Maps with navigation to dropoff location
    const destination = `${dropoffLat},${dropoffLng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    
    Linking.openURL(googleMapsUrl).catch((error) => {
      console.error('Error opening Google Maps:', error);
      Alert.alert('Error', 'Could not open navigation. Please install Google Maps.');
    });
  };

  const updateDeliveryStatus = async (newStatus: 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED') => {
    if (!deliveryDetails || !bidId) {
      Alert.alert('Error', 'Delivery information not available');
      return;
    }

    try {
      setUpdating(true);
      
      const update: DeliveryStatusUpdate = {
        status: newStatus,
        currentLat: currentLocation?.lat,
        currentLng: currentLocation?.lng,
        notes: `Status updated to ${newStatus}`,
      };

      if (newStatus === 'DELIVERED') {
        // Complete delivery
        const summary = await deliveryService.completeDelivery(bidId, update);
        
        // Show success message and navigate to summary
        Alert.alert(
          'Delivery Completed!',
          'Great job! The delivery has been marked as completed.',
          [
            {
              text: 'View Summary',
              onPress: () => router.push(`/pages/driver/DeliverySummary?summaryData=${JSON.stringify(summary)}`),
            },
          ]
        );
      } else {
        // Regular status update
        const updatedDetails = await deliveryService.updateDeliveryStatus(bidId, update);
        setDeliveryDetails(updatedDetails);
        
        Alert.alert('Status Updated', `Delivery status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      Alert.alert('Error', 'Failed to update delivery status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusButtonClass = (status: string) => {
    return deliveryDetails?.status === status ? 'bg-orange-500' : 'bg-white border border-gray-300';
  };

  const getStatusTextClass = (status: string) => {
    return deliveryDetails?.status === status ? 'text-white' : 'text-gray-700';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-lg">Loading delivery details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !deliveryDetails || !bidId) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-4">
        <View className="items-center">
          <MaterialCommunityIcons name="truck-delivery" size={64} color="#9CA3AF" />
          <Text className="text-lg text-red-500 text-center mb-4 mt-4">
            {!bidId 
              ? 'No delivery selected' 
              : error || 'No delivery details found'
            }
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            {!bidId 
              ? 'Please navigate to this page with a valid delivery ID from your routes or accepted bids.'
              : 'Please try again or contact support if the problem persists.'
            }
          </Text>
          <View className="space-y-3 w-full">
            <PrimaryButton 
              title="Go to Dashboard" 
              onPress={() => router.push('/pages/driver/Dashboard')}
            />
            <SecondaryButton 
              title="View My Routes" 
              onPress={() => router.push('/pages/driver/MyRoutes')}
            />
            {bidId && (
              <SecondaryButton 
                title="Retry" 
                onPress={loadDeliveryDetails}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Delivery Management</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Navigation Card */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="navigation" size={20} color="#FF8C00" />
            <Text className="ml-2 text-lg font-bold">Navigation</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-sm text-gray-600 mb-1">From (Pickup):</Text>
            <Text className="text-gray-800">{deliveryDetails.pickupAddress}</Text>
          </View>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">To (Dropoff):</Text>
            <Text className="text-gray-800">{deliveryDetails.dropoffAddress}</Text>
          </View>
          
          <PrimaryButton
            title="Start Navigation"
            onPress={handleStartNavigation}
            icon={<MaterialCommunityIcons name="navigation" size={20} color="white" />}
          />
        </PrimaryCard>

        {/* Customer and Bid Details Card */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-3">
            <FontAwesome name="user-circle-o" size={20} color="#6B7280" />
            <Text className="ml-2 text-lg font-bold">{deliveryDetails.customerName}</Text>
            <View className="ml-auto bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-semibold">
                {deliveryDetails.paymentCompleted ? 'Payment Completed' : 'Payment Pending'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-2">
            <Text className="ml-2 text-orange-500 text-2xl font-bold">
              {formatCurrency(deliveryDetails.bidAmount)}
            </Text>
          </View>
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="call" size={18} color="#6B7280" />
            <Text className="ml-2 text-gray-700">{deliveryDetails.deliveryContactPhone}</Text>
          </View>
          
          {deliveryDetails.specialInstructions && (
            <View className="flex-row items-start">
              <FontAwesome name="info-circle" size={18} color="#6B7280" />
              <Text className="ml-2 text-gray-700 flex-1 italic">
                "{deliveryDetails.specialInstructions}"
              </Text>
            </View>
          )}
        </PrimaryCard>

        {/* Delivery Status Buttons */}
        <View className="flex-row justify-around mb-4 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('PICKED_UP')}`}
            onPress={() => updateDeliveryStatus('PICKED_UP')}
            disabled={updating}
          >
            <Text className={`font-semibold ${getStatusTextClass('PICKED_UP')}`}>Picked Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('IN_TRANSIT')}`}
            onPress={() => updateDeliveryStatus('IN_TRANSIT')}
            disabled={updating}
          >
            <Text className={`font-semibold ${getStatusTextClass('IN_TRANSIT')}`}>In Transit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('DELIVERED')}`}
            onPress={() => updateDeliveryStatus('DELIVERED')}
            disabled={updating}
          >
            <Text className={`font-semibold ${getStatusTextClass('DELIVERED')}`}>Delivered</Text>
          </TouchableOpacity>
        </View>

        {/* Parcel Details Card */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
            <Text className="ml-2 text-lg font-bold">Parcel Details</Text>
          </View>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">Description:</Text>
            <Text className="text-gray-500 flex-1 text-right">{deliveryDetails.description}</Text>
          </View>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">Weight:</Text>
            <Text className="text-gray-500">{deliveryDetails.weightKg} kg</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Volume:</Text>
            <Text className="text-gray-500">{deliveryDetails.volumeM3} m³</Text>
          </View>

          <View className="border-t border-gray-200 pt-3">
            <Text className="text-sm text-gray-600 mb-1">Pickup Contact:</Text>
            <Text className="text-gray-800">{deliveryDetails.pickupContactName}</Text>
            <Text className="text-gray-600">{deliveryDetails.pickupContactPhone}</Text>
            
            <Text className="text-sm text-gray-600 mb-1 mt-2">Delivery Contact:</Text>
            <Text className="text-gray-800">{deliveryDetails.deliveryContactName}</Text>
            <Text className="text-gray-600">{deliveryDetails.deliveryContactPhone}</Text>
          </View>
        </PrimaryCard>

        {/* Action Buttons */}
        <View className="flex-col mb-8">
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 mr-2 bg-white border-2 border-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
            >
              <Ionicons name="call" size={20} color="#FF8C00" />
              <Text className="text-orange-500 text-base font-bold ml-2">Call Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChatCustomer}
              className="flex-1 ml-2 bg-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
            >
              <Ionicons name="chatbox" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Chat Customer</Text>
            </TouchableOpacity>
          </View>
          
          {/* Cancel Trip Button */}
          <TouchableOpacity
            onPress={() => Alert.alert(
              'Cancel Trip',
              'Are you sure you want to cancel this delivery? This action cannot be undone.',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            )}
            className="w-full bg-white border-2 border-red-500 py-3 px-6 rounded-lg items-center justify-center flex-row mb-4"
          >
            <Ionicons name="close-circle-outline" size={20} color="red" />
            <Text className="text-red-500 text-base font-bold ml-2">Cancel Trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryManagement;
