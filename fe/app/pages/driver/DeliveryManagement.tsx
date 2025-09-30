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
import { ApiService, formatLocation } from '../../../services/apiService';
import { 
  mapBackendToFrontend, 
  mapFrontendToBackend, 
  getNavigationDestination, 
  getNavigationButtonText, 
  isValidStatusTransition,
  getNextStatus,
  getStatusDisplayText,
  FrontendDeliveryStatus,
  BackendDeliveryStatus 
} from '../../../utils/statusMapping';

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
  
  // Formatted location names
  const [pickupLocationName, setPickupLocationName] = useState<string>('');
  const [dropoffLocationName, setDropoffLocationName] = useState<string>('');

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
          if (deliveryDetails && deliveryDetails.status !== 'delivered' && bidId) {
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
      console.log('📦 Loading delivery details for bidId:', bidId);
      console.log('🔗 API Base URL:', deliveryService);
      
      // Test API connectivity first
      try {
        console.log('🔍 Testing API connectivity...');
        const testResponse = await fetch('https://0be128b6c545.ngrok-free.app/api/health', {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
          }
        });
        console.log('🏥 Health check response:', testResponse.status);
      } catch (healthError) {
        console.warn('⚠️ Health check failed:', healthError);
      }
      
      const details = await deliveryService.getDeliveryDetails(bidId);
      console.log('✅ Delivery details loaded successfully:', details);
      setDeliveryDetails(details);
      
      // Format location names
      await formatLocationNames(details);
    } catch (error) {
      console.error('❌ Error loading delivery details:', error);
      console.error('🆔 BidId was:', bidId);
      
      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to load delivery details. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorMessage = 'Server error occurred. The backend service may be experiencing issues. Please try again in a moment.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Delivery details not found. This delivery may have been cancelled or completed.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Access denied. You may not have permission to view this delivery.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatLocationNames = async (details: DeliveryDetails) => {
    try {
      // Format pickup location
      const pickupFormatted = await formatLocation(`${details.pickupLat}, ${details.pickupLng}`);
      setPickupLocationName(pickupFormatted);
      
      // Format dropoff location
      const dropoffFormatted = await formatLocation(`${details.dropoffLat}, ${details.dropoffLng}`);
      setDropoffLocationName(dropoffFormatted);
    } catch (error) {
      console.error('Error formatting location names:', error);
      // Fallback to addresses
      setPickupLocationName(details.pickupAddress);
      setDropoffLocationName(details.dropoffAddress);
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

  const handleCallPickupContact = () => {
    if (deliveryDetails?.pickupContactPhone) {
      const phoneNumber = deliveryDetails.pickupContactPhone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Pickup contact phone number not available');
    }
  };

  const handleCallDeliveryContact = () => {
    if (deliveryDetails?.deliveryContactPhone) {
      const phoneNumber = deliveryDetails.deliveryContactPhone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Delivery contact phone number not available');
    }
  };

  const handleChatCustomer = async () => {
    // Navigate to chat screen with customer details
    if (!deliveryDetails?.bidId) {
      Alert.alert('Error', 'Bid information not available');
      return;
    }

    try {
      // Look up conversation by bid ID with access validation
      const result = await ApiService.getConversationByBid(deliveryDetails.bidId);
      
      if (result.accessDenied) {
        // Chat access is denied due to conditions not being met
        let alertTitle = 'Chat Not Available';
        let alertMessage = result.message || 'Chat access is currently restricted.';
        
        // Provide specific user-friendly messages based on the reason
        switch (result.reason) {
          case 'BID_NOT_ACCEPTED':
            alertTitle = 'Bid Not Accepted';
            alertMessage = 'Chat is only available after your bid has been accepted by the customer.';
            break;
          case 'PARCEL_NOT_MATCHED':
            alertTitle = 'Parcel Not Matched';
            alertMessage = 'Chat is only available when the parcel request has been matched with your route.';
            break;
          case 'PAYMENT_NOT_COMPLETED':
            alertTitle = 'Payment Pending';
            alertMessage = 'Chat will be available once the customer completes payment for this delivery.';
            break;
        }
        
        Alert.alert(
          alertTitle,
          `${alertMessage}\n\nWould you like to call ${deliveryDetails.customerName} instead?`,
          [
            { text: 'Call Customer', onPress: handleCallCustomer },
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }
      
      if (result.conversation) {
        // Navigate to existing conversation with all necessary data
        router.push({ 
          pathname: '/pages/driver/ChatScreen', 
          params: { 
            conversationId: result.conversation.conversationId,
            customerName: result.conversation.customerName || deliveryDetails.customerName,
            customerId: result.conversation.customerId || deliveryDetails.customerId,
            bidId: deliveryDetails.bidId,
            customerPhone: deliveryDetails.customerPhone,
            profileImage: result.conversation.customerProfileImage || 'profile_placeholder'
          } as any 
        });
      } else {
        // No conversation found - show options
        Alert.alert(
          'No Chat Available',
          `No chat conversation found for this delivery. Would you like to call ${deliveryDetails.customerName} instead?`,
          [
            { text: 'Call Customer', onPress: handleCallCustomer },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error accessing chat:', error);
      Alert.alert(
        'Chat Unavailable',
        `Unable to access chat. Would you like to call ${deliveryDetails.customerName} instead?`,
        [
          { text: 'Call Customer', onPress: handleCallCustomer },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleStartNavigation = () => {
    if (!deliveryDetails) return;

    // Use status directly (now matches frontend)
    const currentStatus = deliveryDetails.status as FrontendDeliveryStatus;
    const destination = getNavigationDestination(currentStatus);
    
    if (!destination) {
      Alert.alert('Navigation Complete', 'Navigation is not needed for the current delivery status.');
      return;
    }

    let coordinates: string;
    let locationName: string;
    
    if (destination === 'pickup') {
      // Navigate to pickup location
      coordinates = `${deliveryDetails.pickupLat},${deliveryDetails.pickupLng}`;
      locationName = pickupLocationName || deliveryDetails.pickupAddress;
    } else {
      // Navigate to delivery location
      coordinates = `${deliveryDetails.dropoffLat},${deliveryDetails.dropoffLng}`;
      locationName = dropoffLocationName || deliveryDetails.dropoffAddress;
    }
    
    // Open Google Maps with navigation to destination
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}&travelmode=driving`;
    
    Alert.alert(
      'Open Navigation',
      `Navigate to ${locationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Maps',
          onPress: () => {
            Linking.openURL(googleMapsUrl).catch((error) => {
              console.error('Error opening Google Maps:', error);
              Alert.alert('Error', 'Could not open navigation. Please install Google Maps.');
            });
          }
        }
      ]
    );
  };

  const updateDeliveryStatus = async (newStatus: FrontendDeliveryStatus) => {
    if (!deliveryDetails || !bidId) {
      Alert.alert('Error', 'Delivery information not available');
      return;
    }

    // Use status directly (now matches backend)
    const currentStatus = deliveryDetails.status as FrontendDeliveryStatus;
    
    // Validate status transitions using the simplified validation logic
    if (currentStatus !== newStatus && !isValidStatusTransition(currentStatus, newStatus)) {
      Alert.alert('Invalid Status Change', 
        `Cannot change status from ${currentStatus} to ${newStatus}. Please follow the proper delivery sequence.`);
      return;
    }

    try {
      setUpdating(true);
      
      // Use status directly (no conversion needed now)
      const update: DeliveryStatusUpdate = {
        status: newStatus, // Use status directly
        currentLat: currentLocation?.lat,
        currentLng: currentLocation?.lng,
        notes: `Status updated to ${newStatus}`,
      };

      if (newStatus === 'delivered') {
        // Complete delivery
        const summary = await deliveryService.completeDelivery(bidId, update);
        
        // Show success message and navigate to summary
        Alert.alert(
          '🎉 Delivery Completed!',
          'Congratulations! The delivery has been successfully completed.',
          [
            {
              text: 'View Summary',
              onPress: () => router.push({
                pathname: '/pages/driver/DeliverySummary',
                params: { summaryData: JSON.stringify(summary) }
              }),
            },
          ]
        );
      } else {
        // Regular status update
        const updatedDetails = await deliveryService.updateDeliveryStatus(bidId, update);
        setDeliveryDetails(updatedDetails);
        
        // Show appropriate message for status
        const statusMessages: Record<FrontendDeliveryStatus, string> = {
          'open': 'Delivery confirmed, ready for pickup',
          'picked_up': 'Parcel picked up successfully!',
          'in_transit': 'En route to delivery location',
          'delivered': 'Delivery completed!',
          'cancelled': 'Delivery cancelled'
        };
        
        Alert.alert('Status Updated', statusMessages[newStatus] || `Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      Alert.alert('Error', 'Failed to update delivery status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getNavigationButtonTextDisplay = () => {
    if (!deliveryDetails) return 'Start Navigation';
    
    // Use status directly (now matches frontend)
    const currentStatus = deliveryDetails.status as FrontendDeliveryStatus;
    return getNavigationButtonText(currentStatus);
  };

  const getStatusButtonClass = (status: FrontendDeliveryStatus) => {
    if (!deliveryDetails) return 'bg-white border-2 border-gray-300';
    
    // Get current status directly from backend (now matches frontend)
    const currentStatus = deliveryDetails.status as FrontendDeliveryStatus;
    
    // Define status progression order for buttons
    const statusOrder: FrontendDeliveryStatus[] = ['picked_up', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const buttonIndex = statusOrder.indexOf(status);
    
    // Handle 'open' status separately since it's not a button
    if (currentStatus === 'open') {
      // All buttons should be inactive when status is open
      return 'bg-white border-2 border-gray-300';
    }
    
    // Determine button state for actual status buttons
    if (buttonIndex < currentIndex) {
      // Completed status - always green to show progression
      return 'bg-green-500 border-green-500';
    } else if (buttonIndex === currentIndex) {
      // Current status - highlighted with appropriate color
      switch (status) {
        case 'picked_up':
          return 'bg-green-500 border-green-500';
        case 'in_transit':
          return 'bg-yellow-500 border-yellow-500';
        case 'delivered':
          return 'bg-red-500 border-red-500';
        default:
          return 'bg-blue-500 border-blue-500';
      }
    } else if (buttonIndex === currentIndex + 1) {
      // Next status - slightly highlighted to show it's next
      return 'bg-gray-100 border-2 border-gray-400';
    } else {
      // Future status - inactive
      return 'bg-white border-2 border-gray-300';
    }
  };

  const getStatusTextClass = (status: FrontendDeliveryStatus) => {
    if (!deliveryDetails) return 'text-gray-600';
    
    // Get current status directly from backend (now matches frontend)
    const currentStatus = deliveryDetails.status as FrontendDeliveryStatus;
    
    // Define status progression order for buttons
    const statusOrder: FrontendDeliveryStatus[] = ['picked_up', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const buttonIndex = statusOrder.indexOf(status);
    
    // Handle 'open' status separately since it's not a button
    if (currentStatus === 'open') {
      // All buttons should have gray text when status is open
      return 'text-gray-600';
    }
    
    // Determine text color based on button state
    if (buttonIndex < currentIndex) {
      // Completed status - white text on green background
      return 'text-white';
    } else if (buttonIndex === currentIndex) {
      // Current status - white text on colored background
      return 'text-white';
    } else if (buttonIndex === currentIndex + 1) {
      // Next status - darker text for better contrast
      return 'text-gray-700';
    } else {
      // Future status - gray text
      return 'text-gray-600';
    }
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
        <PrimaryCard className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
          <View className="flex-row items-center mb-4">
            <View className="bg-orange-500 p-2 rounded-full mr-3">
              <MaterialCommunityIcons name="navigation" size={18} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Navigation</Text>
          </View>
          
          <View className="space-y-3 mb-4">
            <View className="bg-white p-3 rounded-lg border border-blue-200">
              <View className="flex-row items-center mb-1">
                <Ionicons name="arrow-up-circle" size={16} color="#3B82F6" />
                <Text className="text-sm text-blue-600 font-medium ml-2">From (Pickup):</Text>
              </View>
              <Text className="text-gray-800 font-medium">
                {pickupLocationName || 'Loading location...'}
              </Text>
              {pickupLocationName !== deliveryDetails.pickupAddress && (
                <Text className="text-xs text-gray-500 mt-1">
                  {deliveryDetails.pickupAddress}
                </Text>
              )}
            </View>
            
            <View className="bg-white p-3 rounded-lg border border-purple-200">
              <View className="flex-row items-center mb-1">
                <Ionicons name="arrow-down-circle" size={16} color="#8B5CF6" />
                <Text className="text-sm text-purple-600 font-medium ml-2">To (Dropoff):</Text>
              </View>
              <Text className="text-gray-800 font-medium">
                {dropoffLocationName || 'Loading location...'}
              </Text>
              {dropoffLocationName !== deliveryDetails.dropoffAddress && (
                <Text className="text-xs text-gray-500 mt-1">
                  {deliveryDetails.dropoffAddress}
                </Text>
              )}
            </View>
          </View>
          
          <PrimaryButton
            title={getNavigationButtonTextDisplay()}
            onPress={handleStartNavigation}
            icon={<MaterialCommunityIcons name="navigation" size={20} color="white" />}
            disabled={deliveryDetails.status === 'delivered'}
          />
        </PrimaryCard>

        {/* Customer and Bid Details Card */}
        <PrimaryCard className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-500 p-2 rounded-full mr-3">
              <FontAwesome name="user" size={18} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">{deliveryDetails.customerName}</Text>
              <View className="flex-row items-center mt-1">
                <View className={`px-3 py-1 rounded-full ${deliveryDetails.paymentCompleted ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-xs font-semibold ${deliveryDetails.paymentCompleted ? 'text-green-700' : 'text-yellow-700'}`}>
                    {deliveryDetails.paymentCompleted ? '✓ Payment Completed' : '⏳ Payment Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between mb-3 bg-white p-3 rounded-lg border border-orange-200">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="currency-usd" size={20} color="#FF8C00" />
              <Text className="ml-2 text-gray-600">Earning:</Text>
            </View>
            <Text className="text-orange-500 text-2xl font-bold">
              {formatCurrency(deliveryDetails.bidAmount)}
            </Text>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Ionicons name="call" size={18} color="#6B7280" />
              <Text className="ml-2 text-gray-700">{deliveryDetails.deliveryContactPhone}</Text>
            </View>
            
            {deliveryDetails.customerEmail && (
              <View className="flex-row items-center">
                <Ionicons name="mail" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-700">{deliveryDetails.customerEmail}</Text>
              </View>
            )}
            
            {deliveryDetails.specialInstructions && (
              <View className="flex-row items-start mt-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <FontAwesome name="info-circle" size={18} color="#F59E0B" />
                <View className="flex-1 ml-2">
                  <Text className="text-amber-800 font-medium text-sm">Special Instructions:</Text>
                  <Text className="text-amber-700 italic mt-1">
                    "{deliveryDetails.specialInstructions}"
                  </Text>
                </View>
              </View>
            )}
          </View>
        </PrimaryCard>

        {/* Delivery Status Buttons */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2 font-medium">Update Delivery Status:</Text>
          <View className="flex-row justify-around bg-white rounded-xl p-3 shadow-lg border border-gray-200">
            <TouchableOpacity
              className={`flex-1 items-center py-3 px-2 rounded-lg mx-1 ${getStatusButtonClass('picked_up')}`}
              onPress={() => updateDeliveryStatus('picked_up')}
              disabled={updating}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={getStatusTextClass('picked_up') === 'text-white' ? 'white' : (getStatusTextClass('picked_up') === 'text-gray-700' ? '#374151' : '#10B981')} 
              />
              <Text className={`font-semibold text-xs mt-1 ${getStatusTextClass('picked_up')}`}>
                Picked Up
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 items-center py-3 px-2 rounded-lg mx-1 ${getStatusButtonClass('in_transit')}`}
              onPress={() => updateDeliveryStatus('in_transit')}
              disabled={updating}
            >
              <MaterialCommunityIcons 
                name="truck-fast" 
                size={20} 
                color={getStatusTextClass('in_transit') === 'text-white' ? 'white' : (getStatusTextClass('in_transit') === 'text-gray-700' ? '#374151' : '#F59E0B')} 
              />
              <Text className={`font-semibold text-xs mt-1 ${getStatusTextClass('in_transit')}`}>
                In Transit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 items-center py-3 px-2 rounded-lg mx-1 ${getStatusButtonClass('delivered')}`}
              onPress={() => updateDeliveryStatus('delivered')}
              disabled={updating}
            >
              <Ionicons 
                name="trophy" 
                size={20} 
                color={getStatusTextClass('delivered') === 'text-white' ? 'white' : (getStatusTextClass('delivered') === 'text-gray-700' ? '#374151' : '#EF4444')} 
              />
              <Text className={`font-semibold text-xs mt-1 ${getStatusTextClass('delivered')}`}>
                Delivered
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Parcel Details Card */}
        <PrimaryCard className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 p-2 rounded-full mr-3">
              <MaterialCommunityIcons name="package-variant" size={18} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Parcel Details</Text>
          </View>
          
          <View className="bg-white p-3 rounded-lg border border-green-200 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600 font-medium">Description:</Text>
              <Text className="text-gray-800 flex-1 text-right font-medium">{deliveryDetails.description}</Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600 font-medium">Weight:</Text>
              <Text className="text-green-600 font-bold">{deliveryDetails.weightKg} kg</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-medium">Volume:</Text>
              <Text className="text-green-600 font-bold">{deliveryDetails.volumeM3} m³</Text>
            </View>
          </View>

          <View className="space-y-3">
            <TouchableOpacity 
              className="bg-blue-50 p-3 rounded-lg border border-blue-200"
              onPress={handleCallPickupContact}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="arrow-up-circle" size={18} color="#3B82F6" />
                <Text className="ml-2 text-blue-800 font-semibold">Pickup Contact</Text>
                <View className="flex-1" />
                <Ionicons name="call" size={18} color="#3B82F6" />
              </View>
              <Text className="text-blue-700 font-medium">{deliveryDetails.pickupContactName}</Text>
              <Text className="text-blue-600">{deliveryDetails.pickupContactPhone}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-purple-50 p-3 rounded-lg border border-purple-200"
              onPress={handleCallDeliveryContact}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="arrow-down-circle" size={18} color="#8B5CF6" />
                <Text className="ml-2 text-purple-800 font-semibold">Delivery Contact</Text>
                <View className="flex-1" />
                <Ionicons name="call" size={18} color="#8B5CF6" />
              </View>
              <Text className="text-purple-700 font-medium">{deliveryDetails.deliveryContactName}</Text>
              <Text className="text-purple-600">{deliveryDetails.deliveryContactPhone}</Text>
            </TouchableOpacity>
          </View>
        </PrimaryCard>

        {/* Action Buttons */}
        <View className="flex-col mb-8 space-y-4">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 mr-2 bg-white border-2 border-orange-500 py-4 px-6 rounded-xl items-center justify-center flex-row shadow-lg"
            >
              <View className="bg-orange-100 p-2 rounded-full mr-3">
                <Ionicons name="call" size={18} color="#FF8C00" />
              </View>
              <Text className="text-orange-500 text-base font-bold">Call Customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleChatCustomer}
              className="flex-1 mr-2 bg-white border-2 border-orange-500 py-4 px-6 rounded-xl items-center justify-center flex-row shadow-lg"
            >
              <View className="bg-orange-100 p-2 rounded-full mr-3">
                <Ionicons name="chatbox" size={18} color="#FF8C00" />
              </View>
              <Text className="text-orange-500 text-base font-bold">Chat Customer</Text>
            </TouchableOpacity>
          </View>
          
          {/* Cancel Trip Button */}
          <TouchableOpacity
            onPress={() => Alert.alert(
              'Cancel Trip',
              'Are you sure you want to cancel this delivery? This action cannot be undone and may affect your driver rating.',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            )}
            className="w-full bg-white border-2 border-red-500 py-4 px-6 rounded-xl items-center justify-center flex-row shadow-lg"
          >
            <View className="bg-red-100 p-2 rounded-full mr-3">
              <Ionicons name="close-circle-outline" size={18} color="red" />
            </View>
            <Text className="text-red-500 text-base font-bold">Cancel Trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryManagement;
