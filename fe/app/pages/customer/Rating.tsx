import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Config } from '@/constants/Config';
import { supabase } from '@/lib/supabase';

const ratingDistribution = [
  { stars: 5, percent: 70 },
  { stars: 4, percent: 20 },
  { stars: 3, percent: 7 },
  { stars: 2, percent: 2 },
  { stars: 1, percent: 1 },
];

export default function Rating() {
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<{rating: number, feedback: string}>({rating: 0, feedback: ''});
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get driver data from params
  const requestId = params.requestId as string;
  const driverId = params.driverId as string;
  const driverName = params.driverName as string || 'Driver';
  const driverPhoto = params.driverPhoto as string;
  const vehicleMake = params.vehicleMake as string;
  const vehicleModel = params.vehicleModel as string;
  const vehiclePlate = params.vehiclePlate as string;
  const offeredPrice = params.offeredPrice as string;
  const bidId = params.bidId as string;
  const tripId = params.tripId as string;

  // State for driver stats
  const [driverStats, setDriverStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch driver stats and get current user
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          Alert.alert('Error', 'Please log in to submit a review.');
          return;
        }
        setCustomerId(user.id);

        // Fetch driver stats
        if (driverId) {
          const response = await fetch(`${Config.API_BASE}/reviews/driver/${driverId}/stats`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setDriverStats(data.stats);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadData();
  }, [driverId]);

  // Submit review function
  const submitReview = async () => {
    if (!userRating || !customerId || !tripId || !driverId) {
      Alert.alert('Error', 'Please provide a rating and ensure you are logged in.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${Config.API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: tripId,
          reviewerId: customerId,
          revieweeId: driverId,
          role: 'DRIVER',
          rating: userRating,
          comment: feedback.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        setSubmittedReview({ rating: userRating, feedback });
        Alert.alert('Success', 'Thank you for your review!');
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }

    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F6F6FA] px-4 pt-10">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center -ml-6">Rate Your Driver</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Driver Card */}
      <View className="bg-white rounded-xl p-6 mb-4 items-center border border-gray-100">
        {driverPhoto ? (
          <Image
            source={{ uri: driverPhoto }}
            className="w-16 h-16 rounded-full mb-2"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-300 items-center justify-center mb-2">
            <Text className="text-2xl font-bold text-gray-600">
              {driverName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="font-semibold text-lg">{driverName}</Text>
        <Text className="text-gray-500 mb-2">Your Delivery Driver</Text>
        {vehicleMake && vehicleModel && (
          <Text className="text-sm text-gray-600 mb-1">{vehicleMake} {vehicleModel}</Text>
        )}
        {vehiclePlate && (
          <Text className="text-sm text-gray-600 mb-2">Plate: {vehiclePlate}</Text>
        )}
        {offeredPrice && (
          <Text className="text-lg font-semibold text-[#FFA726] mb-2">Delivered for LKR {Number(offeredPrice).toLocaleString()}</Text>
        )}
        {loadingStats ? (
          <ActivityIndicator size="small" color="#FFA726" />
                 ) : driverStats?.totalReviews === 0 ? (
           <>
             <Text className="text-3xl font-bold text-[#FFA726] mb-1">
               No reviews yet
             </Text>
             <View className="flex-row mb-1">
               {[...Array(5)].map((_, i) => (
                 <Ionicons
                   key={i}
                   name="star-outline"
                   size={20}
                   color="#E0E0E0"
                 />
               ))}
             </View>
             <Text className="text-xs text-gray-400 mb-2">
               Be the first to review this driver
             </Text>
           </>
        ) : (
          <>
                         <Text className="text-3xl font-bold text-[#FFA726] mb-1">
               {driverStats?.averageRating ? driverStats.averageRating.toFixed(1) : '0.0'}
             </Text>
             <Text className="text-lg text-gray-500 mb-1">Average Rating</Text>
            <View className="flex-row mb-1">
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={20}
                  color={i < Math.round(driverStats?.averageRating || 0) ? "#FFA726" : "#E0E0E0"}
                />
              ))}
            </View>
                         <Text className="text-sm text-gray-600 mb-2">
               Based on {driverStats?.totalReviews || 0} {driverStats?.totalReviews === 1 ? 'review' : 'reviews'}
             </Text>
          </>
        )}
        {/* Rating Distribution */}
        {driverStats && driverStats.totalReviews > 0 && (
          <View className="w-full mt-2">
            <Text className="font-semibold mb-2">Rating Distribution</Text>
            {[5, 4, 3, 2, 1].map(stars => {
              const count = driverStats.ratingDistribution[stars] || 0;
              const total = driverStats.totalReviews || 1;
              const percent = Math.round((count / total) * 100);
              
              return (
                <View key={stars} className="flex-row items-center mb-1">
                  <Text className="w-4 text-xs text-gray-600">{stars}</Text>
                  <Ionicons name="star" size={14} color="#FFA726" />
                  <View className="flex-1 h-2 bg-gray-200 mx-2 rounded">
                    <View style={{ width: `${percent}%` }} className="h-2 bg-[#FFA726] rounded" />
                  </View>
                  <Text className="w-10 text-xs text-gray-600">{count}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Only show the form if not submitted */}
      {!submitted && (
        <>
          {/* User Rating */}
          <View className="bg-white rounded-xl p-4 mb-4 items-center border border-gray-100">
            <Text className="font-semibold mb-2">How was your experience?</Text>
            <View className="flex-row mb-1">
              {[1,2,3,4,5].map(i => (
                <TouchableOpacity key={i} onPress={() => setUserRating(i)}>
                  <Ionicons
                    name={userRating >= i ? "star" : "star-outline"}
                    size={32}
                    color="#FFA726"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-xs text-gray-400">Tap to rate</Text>
          </View>

          {/* Feedback */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
            <Text className="font-semibold mb-2">Share your feedback</Text>
            <TextInput
              className="bg-gray-100 rounded-md px-3 py-2 h-20 text-base"
              placeholder="Write your review here... (Optional)"
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-4 rounded-md mb-8 ${submitting ? 'bg-gray-400' : 'bg-[#FFA726]'}`}
            onPress={submitReview}
            disabled={submitting || !userRating}
          >
            {submitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center font-semibold text-base ml-2">Submitting...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                {userRating ? 'Submit Review' : 'Please select a rating'}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Show thank you and review after submission */}
      {submitted && (
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 items-center">
          <Text className="text-lg font-bold text-[#FFA726] mb-2">Thank you for your feedback</Text>
          <Text className="mb-1">Your Rating: {submittedReview.rating} <Ionicons name="star" size={16} color="#FFA726" /></Text>
          {submittedReview.feedback ? (
            <Text className="italic text-gray-600">"{submittedReview.feedback}"</Text>
          ) : (
            <Text className="italic text-gray-400">No written feedback.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}