import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { DeliverySummary } from '../../../services/deliveryService';

const { width, height } = Dimensions.get('window');

const DeliverySummaryScreen = () => {
  const router = useRouter();
  const { summaryData } = useLocalSearchParams();
  const [summary, setSummary] = useState<DeliverySummary | null>(null);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [confettiAnims] = useState(
    Array.from({ length: 10 }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-100),
      rotation: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    // Parse summary data
    if (summaryData && typeof summaryData === 'string') {
      try {
        const parsedSummary = JSON.parse(summaryData);
        setSummary(parsedSummary);
      } catch (error) {
        console.error('Error parsing summary data:', error);
      }
    }

    // Start celebration animation
    startCelebrationAnimation();
  }, [summaryData]);

  const startCelebrationAnimation = () => {
    // Main content animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti animation
    const confettiAnimations = confettiAnims.map((confetti, index) => {
      return Animated.parallel([
        Animated.timing(confetti.y, {
          toValue: height + 100,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(confetti.rotation, {
          toValue: 360 * (2 + Math.random() * 3),
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(200, confettiAnimations).start();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDonePress = () => {
    // Navigate back to dashboard
    router.push('/pages/driver/Dashboard');
  };

  if (!summary) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading delivery summary...</Text>
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-blue-50">
      {/* Confetti Animation */}
      {confettiAnims.map((confetti, index) => (
        <Animated.View
          key={index}
          className="absolute w-3 h-3 bg-yellow-400 rounded-full"
          style={[
            {
              transform: [
                { translateX: confetti.x },
                { translateY: confetti.y },
                { 
                  rotate: confetti.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView className="flex-1 px-4 py-6">
          {/* Success Header */}
          <Animated.View
            className="items-center mb-8"
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Ionicons name="checkmark" size={50} color="white" />
            </View>
            <Text className="text-3xl font-bold text-green-600 text-center mb-2">
              🎉 Delivery Completed!
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Great job! You've successfully completed this delivery.
            </Text>
          </Animated.View>

          {/* Summary Cards */}
          <PrimaryCard className="mb-4 p-6">
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons name="truck-delivery" size={24} color="#10B981" />
              <Text className="ml-3 text-xl font-bold text-gray-800">Delivery Summary</Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Customer:</Text>
                <Text className="font-semibold text-gray-800">{summary.customerName}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Delivery ID:</Text>
                <Text className="font-mono text-sm text-gray-800">
                  {summary.bidId.slice(0, 8)}...
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Earnings:</Text>
                <Text className="font-bold text-green-600 text-lg">
                  LKR {summary.bidAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </PrimaryCard>

          {/* Timing Information */}
          <PrimaryCard className="mb-4 p-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
              <Text className="ml-3 text-xl font-bold text-gray-800">Timing Details</Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Started At:</Text>
                <Text className="font-semibold text-gray-800">
                  {formatDateTime(summary.deliveryStartedAt)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Completed At:</Text>
                <Text className="font-semibold text-gray-800">
                  {formatDateTime(summary.deliveryCompletedAt)}
                </Text>
              </View>
              
              <View className="flex-row justify-between border-t border-gray-200 pt-3">
                <Text className="text-gray-600">Total Time:</Text>
                <Text className="font-bold text-blue-600 text-lg">
                  {formatDuration(summary.totalDeliveryTimeMinutes)}
                </Text>
              </View>
            </View>
          </PrimaryCard>

          {/* Location Information */}
          <PrimaryCard className="mb-4 p-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location-outline" size={24} color="#8B5CF6" />
              <Text className="ml-3 text-xl font-bold text-gray-800">Route Details</Text>
            </View>

            <View className="space-y-4">
              <View>
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                  <Text className="font-semibold text-gray-700">Pickup Location</Text>
                </View>
                <Text className="text-gray-600 ml-5">{summary.pickupAddress}</Text>
              </View>
              
              <View>
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  <Text className="font-semibold text-gray-700">Delivery Location</Text>
                </View>
                <Text className="text-gray-600 ml-5">{summary.dropoffAddress}</Text>
              </View>
            </View>
          </PrimaryCard>

          {/* Parcel Information */}
          <PrimaryCard className="mb-4 p-6">
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons name="package-variant" size={24} color="#F59E0B" />
              <Text className="ml-3 text-xl font-bold text-gray-800">Parcel Information</Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Description:</Text>
                <Text className="font-semibold text-gray-800 flex-1 text-right">
                  {summary.parcelDescription}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Weight:</Text>
                <Text className="font-semibold text-gray-800">{summary.weightKg} kg</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Volume:</Text>
                <Text className="font-semibold text-gray-800">{summary.volumeM3} m³</Text>
              </View>
            </View>
          </PrimaryCard>

          {/* Statistics */}
          {summary.totalLocationUpdates && (
            <PrimaryCard className="mb-6 p-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="analytics-outline" size={24} color="#6366F1" />
                <Text className="ml-3 text-xl font-bold text-gray-800">Delivery Statistics</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Location Updates:</Text>
                <Text className="font-semibold text-gray-800">{summary.totalLocationUpdates}</Text>
              </View>
            </PrimaryCard>
          )}

          {/* Action Button */}
          <PrimaryButton
            title="🏠 Back to Dashboard"
            onPress={handleDonePress}
            className="mb-6"
          />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default DeliverySummaryScreen;
