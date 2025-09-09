import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import CustomerFooter from '../../../components/navigation/CustomerFooter';

// Define the profile data structure based on database schema
interface ProfileData {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  nic_number: string | null;
  profile_photo_url: string | null;
  verification_status: 'unverified' | 'pending' | 'verified';
  date_of_birth: string | null;
  gender: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch profile data from profiles table
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Failed to fetch profile data');
      }

      if (data) {
        setProfileData({
          ...data,
          verification_status: data.verification_status || 'unverified'
        });
      } else {
        throw new Error('Profile not found');
      }

    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = () => {
    if (!profileData?.first_name || !profileData?.last_name) {
      Alert.alert('Incomplete Profile', 'Please update your profile with your name before proceeding with verification.');
      return;
    }
    router.push('/pages/customer/CustomerVerification');
  };

  // Rest of your component code...

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Account Information Section */}
      <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Account Information</Text>
      <PrimaryCard className="mb-4 p-0">
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Verification Status</Text>
            </View>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${
                !profileData?.verification_status || profileData.verification_status === 'unverified' ? 'bg-red-500' :
                profileData.verification_status === 'pending' ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              <Text className={`text-sm font-medium ${
                !profileData?.verification_status || profileData.verification_status === 'unverified' ? 'text-red-600' :
                profileData.verification_status === 'pending' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {!profileData?.verification_status || profileData.verification_status === 'unverified' ? 'Not Verified' :
                 profileData.verification_status === 'pending' ? 'Pending' :
                 'Verified'}
              </Text>
            </View>
          </View>
          {(!profileData?.verification_status || profileData.verification_status === 'unverified') && (
            <TouchableOpacity
              onPress={handleVerification}
              className="bg-orange-500 py-2 px-4 rounded-lg mt-2"
            >
              <Text className="text-white text-center font-semibold">Get Verified</Text>
            </TouchableOpacity>
          )}
        </View>
      </PrimaryCard>

      {/* Rest of your component JSX... */}
    </SafeAreaView>
  );
};

export default Profile;
