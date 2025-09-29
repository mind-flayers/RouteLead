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
  is_verified: boolean;
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
        setProfileData(data);
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditProfilePicture = () => {
    // Logic to open gallery and update profile photo
    Alert.alert(
      'Update Profile Photo',
      'This feature will be implemented soon. You can update your profile photo through the app settings.',
      [{ text: 'OK' }]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    Alert.alert(
      'Edit Profile',
      'This feature will be implemented soon. You can edit your profile information through the app settings.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error logging out:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              } else {
                router.replace('/pages/login');
              }
            } catch (error) {
              console.error('Unexpected error during logout:', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom', 'left', 'right']}>
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold">Profile</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom', 'left', 'right']}>
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold">Profile</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-red-500 text-lg font-semibold mt-4 text-center">Error Loading Profile</Text>
          <Text className="text-gray-600 mt-2 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={fetchUserProfile}
            className="bg-orange-500 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Profile data not found
  if (!profileData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom', 'left', 'right']}>
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold">Profile</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="person" size={64} color="#6b7280" />
          <Text className="text-gray-600 text-lg font-semibold mt-4 text-center">Profile Not Found</Text>
          <Text className="text-gray-500 mt-2 text-center">Your profile information could not be loaded.</Text>
          <TouchableOpacity 
            onPress={fetchUserProfile}
            className="bg-orange-500 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format display name
  const displayName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'No Name Set';
  
  // Format phone number
  const displayPhone = profileData.phone_number || 'Not provided';
  
  // Format NIC number
  const displayNIC = profileData.nic_number || 'Not provided';
  
  // Format address
  const displayAddress = [
    profileData.address_line_1,
    profileData.address_line_2,
    profileData.city
  ].filter(Boolean).join(', ') || 'No address provided';

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom', 'left', 'right']}>
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Profile</Text>
        <TouchableOpacity onPress={handleEditProfile} className="p-2">
          <Ionicons name="create-outline" size={24} color="#f97316" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Profile Card */}
        <PrimaryCard className="mb-4 p-4 items-center relative">
          <TouchableOpacity onPress={handleEditProfilePicture} className="absolute top-4 right-4 p-2">
            <FontAwesome5 name="edit" size={20} color="#f97316" />
          </TouchableOpacity>
          <View className="relative mb-3">
            {profileData.profile_photo_url ? (
              <Image
                source={{ uri: profileData.profile_photo_url }}
                className="w-24 h-24 rounded-full"
                defaultSource={require('../../../assets/images/profile_placeholder.jpg')}
              />
            ) : (
              <Image
                source={require('../../../assets/images/profile_placeholder.jpg')}
                className="w-24 h-24 rounded-full"
              />
            )}
            {/* Verification Badge */}
            {profileData.is_verified && (
              <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white">
                <Ionicons name="checkmark-sharp" size={16} color="white" />
              </View>
            )}
          </View>
          <Text className="text-xl font-bold text-gray-800 text-center">{displayName}</Text>
          <Text className="text-gray-500 text-sm">{profileData.email}</Text>
          {profileData.role && (
            <View className="mt-2 bg-orange-100 px-3 py-1 rounded-full">
              <Text className="text-orange-700 text-xs font-medium capitalize">{profileData.role}</Text>
            </View>
          )}
        </PrimaryCard>

        {/* Personal Information Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Personal Information</Text>
        <PrimaryCard className="mb-4 p-0">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Phone Number</Text>
            </View>
            <Text className="text-gray-500 text-sm">{displayPhone}</Text>
          </View>
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="card-account-details" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">NIC Number</Text>
            </View>
            <Text className="text-gray-500 text-sm">{displayNIC}</Text>
          </View>
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="home-outline" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Address</Text>
            </View>
            <Text className="text-gray-500 text-sm text-right flex-1 ml-4">{displayAddress}</Text>
          </View>
          {profileData.date_of_birth && (
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#f97316" />
                <Text className="ml-3 text-base text-gray-700">Date of Birth</Text>
              </View>
              <Text className="text-gray-500 text-sm">{profileData.date_of_birth}</Text>
            </View>
          )}
          {profileData.gender && (
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#f97316" />
                <Text className="ml-3 text-base text-gray-700">Gender</Text>
              </View>
              <Text className="text-gray-500 text-sm capitalize">{profileData.gender}</Text>
            </View>
          )}
        </PrimaryCard>

        {/* Account Information Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Account Information</Text>
        <PrimaryCard className="mb-4 p-0">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark" size={20} color="#f97316" />
                <Text className="ml-3 text-base text-gray-700">Verification Status</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full mr-2 bg-red-500" />
                <Text className="text-sm font-medium text-red-600">
                  Not Verified
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/pages/customer/CustomerVerification')} 
              className="bg-orange-500 py-2 rounded-lg mt-2 w-full"
            >
              <Text className="text-white text-sm font-medium text-center">Get Verified</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Member Since</Text>
            </View>
            <Text className="text-gray-500 text-sm">
              {new Date(profileData.created_at).toLocaleDateString()}
            </Text>
          </View>
        </PrimaryCard>



        {/* App Preferences Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">App Preferences</Text>
        <PrimaryCard className="mb-4 p-0">
          <TouchableOpacity onPress={() => console.log('Notifications')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="notifications" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Theme Settings')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="color-palette" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Theme Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Change Language')} className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="language" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Change Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        </PrimaryCard>

        {/* Support & Security Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Support & Security</Text>
        <PrimaryCard className="mb-4 p-0">
          <TouchableOpacity onPress={() => console.log('Change Password')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="lock-closed" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Help & Support')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lifebuoy" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Delete Account')} className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="trash-alt" size={20} color="#EF4444" />
              <Text className="text-red-500 text-base">Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        </PrimaryCard>

        {/* Logout Button */}
        <PrimaryButton title="Logout" onPress={handleLogout} className="bg-red-500 mb-20" />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <CustomerFooter activeTab="profile" />
    </SafeAreaView>
  );
};

export default Profile;
