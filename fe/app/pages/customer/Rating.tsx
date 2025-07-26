import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/44.jpg' }}
          className="w-16 h-16 rounded-full mb-2"
        />
        <Text className="font-semibold text-lg">Nimal Perera</Text>
        <Text className="text-gray-500 mb-2">Your Delivery Driver</Text>
        <Text className="text-3xl font-bold text-[#FFA726] mb-1">4.8 <Text className="text-lg text-gray-500">out of 5</Text></Text>
        <View className="flex-row mb-1">
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={20}
              color={i < 5 ? "#FFA726" : "#E0E0E0"}
            />
          ))}
        </View>
        <Text className="text-xs text-gray-400 mb-2">1,200 Ratings</Text>
        {/* Rating Distribution */}
        <View className="w-full mt-2">
          <Text className="font-semibold mb-2">Rating Distribution</Text>
          {ratingDistribution.map(r => (
            <View key={r.stars} className="flex-row items-center mb-1">
              <Text className="w-4 text-xs text-gray-600">{r.stars}</Text>
              <Ionicons name="star" size={14} color="#FFA726" />
              <View className="flex-1 h-2 bg-gray-200 mx-2 rounded">
                <View style={{ width: `${r.percent}%` }} className="h-2 bg-[#FFA726] rounded" />
              </View>
              <Text className="w-10 text-xs text-gray-600">{r.percent}%</Text>
            </View>
          ))}
        </View>
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
            className="bg-[#FFA726] py-4 rounded-md mb-8"
            onPress={() => {
              setSubmitted(true);
              setSubmittedReview({ rating: userRating, feedback });
              // Optionally, call your API here
            }}
          >
            <Text className="text-white text-center font-semibold text-base">Submit Review</Text>
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