import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Config } from '@/constants/Config';
import { supabase } from '@/lib/supabase';
import CustomerFooter from '@/components/navigation/CustomerFooter';

export default function DisputeForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const requestId = params.requestId as string;
  const routeId = params.routeId as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          Alert.alert('Error', 'Please log in to submit a dispute.');
          router.back();
          return;
        }
        setCustomerId(user.id);

        // Load request details if available
        if (requestId) {
          try {
            const response = await fetch(`${Config.API_BASE}/parcel-requests/${requestId}`);
            if (response.ok) {
              const data = await response.json();
              setRequestDetails(data);
            }
          } catch (error) {
            console.error('Error loading request details:', error);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load user information.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [requestId, router]);

  const handleSubmitDispute = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of your dispute.');
      return;
    }

    if (!customerId || !requestId) {
      Alert.alert('Error', 'Missing required information. Please try again.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${Config.API_BASE}/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: customerId,
          parcelRequestId: requestId,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit dispute');
      }

      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Dispute Submitted',
          'Your dispute has been submitted successfully. We will review it and get back to you soon.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Failed to submit dispute');
      }

    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      Alert.alert('Error', error.message || 'Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text className="mt-4 text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text className="text-lg font-bold flex-1 text-center -ml-6">Open a Dispute</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Request Details Card */}
        {requestDetails && (
          <View className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <Text className="font-semibold mb-3 text-gray-800">Request Details</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Request ID</Text>
              <Text className="font-medium text-gray-800">{requestId}</Text>
            </View>
            
            {requestDetails.description && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Description</Text>
                <Text className="font-medium text-gray-800">{requestDetails.description}</Text>
              </View>
            )}
            
            {requestDetails.weightKg && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Weight</Text>
                <Text className="font-medium text-gray-800">{requestDetails.weightKg} kg</Text>
              </View>
            )}
            
            {requestDetails.volumeM3 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Volume</Text>
                <Text className="font-medium text-gray-800">{requestDetails.volumeM3} m³</Text>
              </View>
            )}
            
            {requestDetails.status && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Status</Text>
                <Text className={`font-medium ${
                  requestDetails.status === 'MATCHED' ? 'text-green-600' :
                  requestDetails.status === 'OPEN' ? 'text-blue-600' :
                  'text-gray-800'
                }`}>
                  {requestDetails.status}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Dispute Form */}
        <View className="bg-white rounded-xl p-6 border border-gray-200">
          <Text className="font-semibold mb-4 text-lg text-gray-800">Dispute Information</Text>
          
          <Text className="text-gray-600 mb-2">Please describe your dispute in detail:</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 h-32 text-base mb-4"
            placeholder="Describe what happened and why you're disputing this request..."
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
          />
          
          <Text className="text-gray-500 text-sm mb-4">
            {description.length}/1000 characters
          </Text>

          {/* Guidelines */}
          <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <Text className="font-semibold text-blue-800 mb-2">📋 Dispute Guidelines</Text>
            <Text className="text-blue-700 text-sm mb-1">• Be specific about what went wrong</Text>
            <Text className="text-blue-700 text-sm mb-1">• Include relevant dates and times</Text>
            <Text className="text-blue-700 text-sm mb-1">• Provide any supporting evidence</Text>
            <Text className="text-blue-700 text-sm">• We'll review your dispute within 24-48 hours</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg mb-4 ${submitting ? 'bg-gray-400' : 'bg-red-600'}`}
            onPress={handleSubmitDispute}
            disabled={submitting || !description.trim()}
          >
            {submitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center font-semibold text-base ml-2">Submitting...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Submit Dispute
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            className="py-3 rounded-lg border border-gray-300"
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Text className="text-gray-700 text-center font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Footer */}
      <CustomerFooter activeTab="home" />
    </SafeAreaView>
  );
}
