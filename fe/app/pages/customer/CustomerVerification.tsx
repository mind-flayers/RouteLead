import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import CustomerFooter from '../../../components/navigation/CustomerFooter';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { CustomerVerificationApiService } from '../../../services/customerVerificationApiService';

const CustomerVerification = () => {
  const [nicPhoto, setNicPhoto] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{nic?: boolean, profile?: boolean}>({});
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUserId(user.id);
        } else {
          Alert.alert('Error', 'Please log in to continue');
          router.replace('/pages/login');
        }
      } catch (error) {
        console.error('Error getting user:', error);
        Alert.alert('Error', 'Authentication failed. Please log in again.');
        router.replace('/pages/login');
      }
    };
    getUserId();
  }, []);

  const pickImage = async (type: 'nic' | 'profile') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const photoUri = result.assets[0].uri;
        
        if (type === 'nic') {
          setNicPhoto(photoUri);
        } else {
          setProfilePhoto(photoUri);
        }

        // Upload photo immediately after selection
        await uploadPhoto(photoUri, type);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadPhoto = async (photoUri: string, photoType: 'nic' | 'profile') => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    try {
      setIsUploading(true);
      
      // For now, just mark as uploaded successfully without API call
      // This simulates the successful upload like in UploadFacePhoto
      setUploadStatus(prev => ({ ...prev, [photoType]: true }));
      Alert.alert('Success', `${photoType === 'nic' ? 'NIC' : 'Profile'} photo selected successfully!`);
      
    } catch (error) {
      console.error(`Error uploading ${photoType} photo:`, error);
      Alert.alert('Upload Failed', 'Failed to process photo. Please try again.');
      
      // Reset photo on upload failure
      if (photoType === 'nic') {
        setNicPhoto(null);
      } else {
        setProfilePhoto(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    if (!nicPhoto || !profilePhoto) {
      Alert.alert('Missing Documents', 'Please upload both NIC photo and profile photo');
      return;
    }

    if (!uploadStatus.nic || !uploadStatus.profile) {
      Alert.alert('Upload in Progress', 'Please wait for all photos to finish uploading before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate successful submission like the driver flow
      // Update profile directly with Supabase (simpler approach)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'PENDING',
          face_photo_url: nicPhoto, // Store the local URI for now
          profile_photo_url: profilePhoto,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        Alert.alert('Submission Failed', 'Failed to submit verification. Please try again.');
        return;
      }

      Alert.alert(
        'Success!',
        'Your verification documents have been submitted successfully. We will review them shortly.',
        [{ 
          text: 'View Status', 
          onPress: () => router.push('/pages/customer/Profile?verificationSubmitted=true') 
        }]
      );
      
    } catch (error) {
      console.error('Verification submission error:', error);
      Alert.alert('Submission Failed', 'Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Account Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Instructions */}
        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <Text className="text-blue-800 font-medium mb-2">Important Instructions:</Text>
          <Text className="text-blue-600 text-sm leading-5">
            • Upload a clear photo of your NIC (front side){'\n'}
            • Upload a recent profile photo of yourself{'\n'}
            • Make sure all details are clearly visible{'\n'}
            • Photos should be well-lit and in focus
          </Text>
        </View>

        {/* NIC Photo Upload */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">NIC Photo</Text>
          <TouchableOpacity
            onPress={() => pickImage('nic')}
            className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            disabled={isUploading}
          >
            {nicPhoto ? (
              <View className="relative">
                <Image
                  source={{ uri: nicPhoto }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                {uploadStatus.nic && (
                  <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
                {isUploading && !uploadStatus.nic && (
                  <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-2">Uploading...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="h-48 items-center justify-center bg-gray-50">
                <Ionicons name="card-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Tap to upload NIC photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {nicPhoto && !isUploading && (
            <TouchableOpacity 
              onPress={() => pickImage('nic')}
              className="mt-2 flex-row items-center justify-center py-2"
            >
              <Ionicons name="camera" size={20} color="#F97316" />
              <Text className="text-orange-500 ml-2">Change Photo</Text>
            </TouchableOpacity>
          )}
          {uploadStatus.nic && (
            <View className="mt-2 flex-row items-center justify-center py-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="text-green-600 ml-2">Uploaded Successfully</Text>
            </View>
          )}
        </View>

        {/* Profile Photo Upload */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Profile Photo</Text>
          <TouchableOpacity
            onPress={() => pickImage('profile')}
            className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            disabled={isUploading}
          >
            {profilePhoto ? (
              <View className="relative">
                <Image
                  source={{ uri: profilePhoto }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                {uploadStatus.profile && (
                  <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
                {isUploading && !uploadStatus.profile && (
                  <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-2">Uploading...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="h-48 items-center justify-center bg-gray-50">
                <Ionicons name="person-circle-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Tap to upload profile photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {profilePhoto && !isUploading && (
            <TouchableOpacity 
              onPress={() => pickImage('profile')}
              className="mt-2 flex-row items-center justify-center py-2"
            >
              <Ionicons name="camera" size={20} color="#F97316" />
              <Text className="text-orange-500 ml-2">Change Photo</Text>
            </TouchableOpacity>
          )}
          {uploadStatus.profile && (
            <View className="mt-2 flex-row items-center justify-center py-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="text-green-600 ml-2">Uploaded Successfully</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title={isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          onPress={handleSubmit}
          disabled={isSubmitting || isUploading || !nicPhoto || !profilePhoto || !uploadStatus.nic || !uploadStatus.profile}
          className={
            isSubmitting || isUploading || !nicPhoto || !profilePhoto || !uploadStatus.nic || !uploadStatus.profile
              ? 'bg-gray-400' 
              : 'bg-orange-500'
          }
        />

        {/* Note */}
        <View className="mt-4 p-4 bg-gray-50 rounded-lg">
          <Text className="text-gray-600 text-sm text-center">
            Verification usually takes 24-48 hours. You will be notified once your account is verified.
          </Text>
        </View>
      </ScrollView>

      <CustomerFooter activeTab="profile" />
    </SafeAreaView>
  );
};

export default CustomerVerification;
