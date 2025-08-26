import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import CustomerFooter from '../../../components/navigation/CustomerFooter';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const CustomerVerification = () => {
  const [nicPhoto, setNicPhoto] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (type: 'nic' | 'profile') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        if (type === 'nic') {
          setNicPhoto(result.assets[0].uri);
        } else {
          setProfilePhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!nicPhoto || !profilePhoto) {
      Alert.alert('Missing Documents', 'Please upload both NIC photo and profile photo');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Upload NIC photo
      const nicFileName = `customer-verification/${user.id}/nic-${Date.now()}.jpg`;
      const { error: nicUploadError } = await supabase.storage
        .from('verifications')
        .upload(nicFileName, {
          uri: nicPhoto,
          type: 'image/jpeg',
          name: 'nic.jpg',
        });
      if (nicUploadError) throw nicUploadError;

      // Upload profile photo
      const profileFileName = `customer-verification/${user.id}/profile-${Date.now()}.jpg`;
      const { error: profileUploadError } = await supabase.storage
        .from('verifications')
        .upload(profileFileName, {
          uri: profilePhoto,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      if (profileUploadError) throw profileUploadError;

      // Update user's verification status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          nic_photo_url: nicFileName,
          profile_photo_url: profileFileName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert(
        'Success',
        'Your verification documents have been submitted successfully. We will review them shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Verification submission error:', error);
      Alert.alert('Error', 'Failed to submit verification documents. Please try again.');
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
          >
            {nicPhoto ? (
              <Image
                source={{ uri: nicPhoto }}
                className="w-full h-48"
                resizeMode="cover"
              />
            ) : (
              <View className="h-48 items-center justify-center bg-gray-50">
                <Ionicons name="card-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Tap to upload NIC photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {nicPhoto && (
            <TouchableOpacity 
              onPress={() => pickImage('nic')}
              className="mt-2 flex-row items-center justify-center py-2"
            >
              <Ionicons name="camera" size={20} color="#F97316" />
              <Text className="text-orange-500 ml-2">Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Photo Upload */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Profile Photo</Text>
          <TouchableOpacity
            onPress={() => pickImage('profile')}
            className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                className="w-full h-48"
                resizeMode="cover"
              />
            ) : (
              <View className="h-48 items-center justify-center bg-gray-50">
                <Ionicons name="person-circle-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Tap to upload profile photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {profilePhoto && (
            <TouchableOpacity 
              onPress={() => pickImage('profile')}
              className="mt-2 flex-row items-center justify-center py-2"
            >
              <Ionicons name="camera" size={20} color="#F97316" />
              <Text className="text-orange-500 ml-2">Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title={isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          onPress={handleSubmit}
          disabled={isSubmitting || !nicPhoto || !profilePhoto}
          className={isSubmitting || !nicPhoto || !profilePhoto ? 'bg-gray-400' : 'bg-orange-500'}
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
