import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomerFooter from '../../../components/navigation/CustomerFooter';

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('🎉 PaymentSuccess page loaded with params:', params);
  
  // Get payment details from navigation params
  const amount = params.amount ? parseFloat(params.amount as string) : 0;
  const bidId = params.bidId as string || '';
  const requestId = params.requestId as string || '';
  const paymentStatus = params.paymentStatus as string || 'COMPLETED';
  const transactionId = params.transactionId as string || '';
  const orderId = params.orderId as string || '';
  
  console.log('📊 Payment details:', {
    amount,
    bidId,
    requestId,
    paymentStatus,
    transactionId,
    orderId
  });

  // Animation values
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate the success icon and content
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatAmount = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView className="flex-1 bg-gradient-to-b from-green-50 to-white px-4 pt-10">
        {/* Header */}
        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-base font-semibold text-gray-800">Payment Success</Text>
        </View>

        {/* Animated Success Icon */}
        <Animated.View 
          className="items-center mb-6"
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }}
        >
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text className="text-3xl font-bold text-center mb-3 text-gray-800">
            Payment Successful!
          </Text>
          <Text className="text-gray-600 text-center mb-8 text-base leading-6">
            Your payment has been processed successfully. Your delivery booking is now confirmed and ready to go!
          </Text>
        </Animated.View>

        {/* Payment Details Card */}
        <Animated.View 
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-green-100"
          style={{ opacity: fadeAnim }}
        >
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="credit-card-check" size={24} color="#10B981" />
            <Text className="ml-2 text-lg font-bold text-gray-800">Payment Details</Text>
          </View>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Amount Paid</Text>
              <Text className="text-2xl font-bold text-green-600">{formatAmount(amount)}</Text>
            </View>
            
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Payment Status</Text>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-semibold text-sm">{paymentStatus}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Transaction ID</Text>
                <Text className="text-gray-800 font-mono text-sm">{transactionId}</Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Order ID</Text>
                <Text className="text-gray-800 font-mono text-sm">{orderId}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Date & Time</Text>
                <Text className="text-gray-800 text-sm">{getCurrentDateTime()}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Next Steps Card */}
        <Animated.View 
          className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100"
          style={{ opacity: fadeAnim }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <Text className="ml-2 text-lg font-bold text-gray-800">What's Next?</Text>
          </View>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
              <Text className="text-gray-700 flex-1">Your driver will be notified and will contact you shortly</Text>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
              <Text className="text-gray-700 flex-1">You can track your delivery in real-time from your dashboard</Text>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
              <Text className="text-gray-700 flex-1">Chat with your driver for any special instructions</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-xl mb-4 shadow-lg"
            onPress={() => router.push('/pages/customer/MyBids')}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="list" size={20} color="white" />
              <Text className="text-white text-center font-bold text-lg ml-2">View My Bids</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-xl mb-4 shadow-lg"
            onPress={() => router.push('/pages/customer/TrackingDelivery')}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="location" size={20} color="white" />
              <Text className="text-white text-center font-bold text-lg ml-2">Track Delivery</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-gray-100 py-4 rounded-xl mb-8 border border-gray-200"
            onPress={() => router.push('/pages/customer/Dashboard')}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="home" size={20} color="#374151" />
              <Text className="text-gray-700 text-center font-semibold text-lg ml-2">Back to Home</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <CustomerFooter activeTab="home" />
    </View>
  );
}
